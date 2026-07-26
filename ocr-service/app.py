"""
NexDesk Document AI OCR service.

Provides:
- Image preprocessing (grayscale, denoise, contrast, binarize)
- PDF digital text extraction
- PaddleOCR for scanned PDFs and images
"""

from __future__ import annotations

import io
import os
import tempfile
import threading
from typing import Any

import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageFilter, ImageOps

app = FastAPI(title="NexDesk OCR Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_ocr_engine = None
_ocr_load_error: str | None = None
_ocr_lock = threading.Lock()


def _lazy_ocr():
    global _ocr_engine, _ocr_load_error

    if _ocr_engine is not None:
        return _ocr_engine

    if _ocr_load_error:
        raise RuntimeError(_ocr_load_error)

    try:
        from paddleocr import PaddleOCR

        # PaddleOCR 3.x style; fall back to 2.x kwargs if needed.
        try:
            _ocr_engine = PaddleOCR(
                use_doc_orientation_classify=False,
                use_doc_unwarping=False,
                use_textline_orientation=False,
                lang="en",
            )
        except TypeError:
            _ocr_engine = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)

        return _ocr_engine
    except Exception as exc:  # noqa: BLE001
        _ocr_load_error = (
            "PaddleOCR is not available. Install dependencies from "
            f"ocr-service/requirements.txt ({exc})"
        )
        raise RuntimeError(_ocr_load_error) from exc


def _order_points(pts: np.ndarray) -> np.ndarray:
    """Order corner points as top-left, top-right, bottom-right, bottom-left."""
    rect = np.zeros((4, 2), dtype="float32")
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect


def _perspective_warp(image_bgr: np.ndarray, approx: np.ndarray) -> np.ndarray | None:
    try:
        import cv2
    except ImportError:
        return None

    pts = approx.reshape(4, 2).astype("float32")
    rect = _order_points(pts)
    (tl, tr, br, bl) = rect

    width_a = np.linalg.norm(br - bl)
    width_b = np.linalg.norm(tr - tl)
    height_a = np.linalg.norm(tr - br)
    height_b = np.linalg.norm(tl - bl)
    max_width = int(max(width_a, width_b))
    max_height = int(max(height_a, height_b))

    if max_width < 80 or max_height < 80:
        return None

    # Reject warped results that shrink too aggressively (false contour).
    src_area = float(image_bgr.shape[0] * image_bgr.shape[1])
    dst_area = float(max_width * max_height)
    if dst_area < src_area * 0.25:
        return None

    destination = np.array(
        [
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1],
        ],
        dtype="float32",
    )
    matrix = cv2.getPerspectiveTransform(rect, destination)
    return cv2.warpPerspective(image_bgr, matrix, (max_width, max_height))


def correct_document_geometry(image: Image.Image) -> Image.Image:
    """
    Detect a document page in a phone photo, apply perspective correction,
    then lightly deskew residual rotation. Falls back to the original image
    when OpenCV is unavailable or no confident page contour is found.
    """
    try:
        import cv2
    except ImportError:
        return image

    image = ImageOps.exif_transpose(image)
    bgr = _pil_to_bgr(image)
    height, width = bgr.shape[:2]
    if height < 100 or width < 100:
        return image

    # Work on a downscaled copy for contour detection speed/stability.
    scale = 1000.0 / max(height, width)
    if scale < 1.0:
        small = cv2.resize(bgr, (int(width * scale), int(height * scale)))
    else:
        small = bgr.copy()
        scale = 1.0

    gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(gray, 50, 150)
    edged = cv2.dilate(edged, np.ones((3, 3), np.uint8), iterations=1)

    contours, _ = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:8]

    page = None
    image_area = float(small.shape[0] * small.shape[1])
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < image_area * 0.18:
            continue
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
        if len(approx) == 4:
            page = approx
            break

    warped = None
    if page is not None:
        # Scale contour back to original resolution before warping.
        page_full = (page.astype("float32") / scale).astype("float32")
        warped = _perspective_warp(bgr, page_full)

    working = warped if warped is not None else bgr

    # Residual deskew via min-area rectangle of strong edges.
    work_gray = cv2.cvtColor(working, cv2.COLOR_BGR2GRAY)
    work_edges = cv2.Canny(work_gray, 50, 150)
    coords = np.column_stack(np.where(work_edges > 0))
    if coords.shape[0] > 200:
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # Only correct modest skew; large angles usually mean detection failure.
        if 0.5 <= abs(angle) <= 15:
            (h, w) = working.shape[:2]
            center = (w // 2, h // 2)
            matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            working = cv2.warpAffine(
                working,
                matrix,
                (w, h),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE,
            )

    rgb = working[:, :, ::-1]
    return Image.fromarray(rgb)


def soft_enhance(image: Image.Image) -> Image.Image:
    """Gentle enhancement for phone photos — avoid harsh global binarization."""
    image = ImageOps.exif_transpose(image)
    gray = ImageOps.autocontrast(image.convert("L"))
    gray = gray.filter(ImageFilter.MedianFilter(size=3))
    return gray.convert("RGB")


def hard_binarize(image: Image.Image) -> Image.Image:
    """Legacy high-contrast path useful for clean scans."""
    image = ImageOps.exif_transpose(image)
    gray = ImageOps.autocontrast(image.convert("L"))
    gray = gray.filter(ImageFilter.MedianFilter(size=3))
    arr = np.asarray(gray, dtype=np.uint8)
    threshold = max(90, min(180, int(arr.mean())))
    binary = np.where(arr > threshold, 255, 0).astype(np.uint8)
    return Image.fromarray(binary, mode="L").convert("RGB")


def preprocess_image(image: Image.Image) -> Image.Image:
    """Deskew/perspective-correct, then soft-enhance for OCR."""
    return soft_enhance(correct_document_geometry(image))


def _pil_to_bgr(image: Image.Image) -> np.ndarray:
    rgb = np.asarray(image.convert("RGB"))
    return rgb[:, :, ::-1].copy()


def extract_pdf_text(pdf_bytes: bytes) -> tuple[str, int]:
    import fitz  # PyMuPDF

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    try:
        parts: list[str] = []
        for page in doc:
            parts.append(page.get_text("text") or "")
        text = "\n".join(parts).strip()
        return text, doc.page_count
    finally:
        doc.close()


def pdf_pages_to_images(pdf_bytes: bytes, max_pages: int = 20) -> list[Image.Image]:
    import fitz

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    images: list[Image.Image] = []
    try:
        page_count = min(doc.page_count, max_pages)
        zoom = 2.0
        matrix = fitz.Matrix(zoom, zoom)
        for index in range(page_count):
            page = doc.load_page(index)
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            image = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            images.append(image)
        return images
    finally:
        doc.close()


def run_paddle_ocr(image: Image.Image) -> tuple[str, float | None]:
    engine = _lazy_ocr()
    array = _pil_to_bgr(image)

    texts: list[str] = []
    confidences: list[float] = []

    # PaddleOCR is not reliably thread-safe under concurrent CPU inference.
    with _ocr_lock:
        # PaddleOCR 3.x
        if hasattr(engine, "predict"):
            results = engine.predict(array)
            for item in results or []:
                if isinstance(item, dict):
                    rec_texts = item.get("rec_texts") or item.get("texts") or []
                    rec_scores = item.get("rec_scores") or item.get("scores") or []
                    texts.extend([str(t) for t in rec_texts if t])
                    confidences.extend([float(s) for s in rec_scores if s is not None])
                    continue

                # Result objects with attributes
                rec_texts = getattr(item, "rec_texts", None) or getattr(item, "texts", None)
                rec_scores = getattr(item, "rec_scores", None) or getattr(item, "scores", None)
                if rec_texts:
                    texts.extend([str(t) for t in rec_texts if t])
                if rec_scores:
                    confidences.extend([float(s) for s in rec_scores if s is not None])

                # Fallback: print()/json style dict
                data = getattr(item, "json", None) or getattr(item, "res", None)
                if isinstance(data, dict):
                    rec_texts = data.get("rec_texts") or []
                    rec_scores = data.get("rec_scores") or []
                    texts.extend([str(t) for t in rec_texts if t])
                    confidences.extend([float(s) for s in rec_scores if s is not None])

        else:
            # PaddleOCR 2.x: ocr.ocr(img, cls=True) -> list of [box, (text, conf)]
            results = engine.ocr(array, cls=True)
            pages = results or []
            for page in pages:
                if not page:
                    continue
                for line in page:
                    if not line or len(line) < 2:
                        continue
                    text_info = line[1]
                    if isinstance(text_info, (list, tuple)) and text_info:
                        texts.append(str(text_info[0]))
                        if len(text_info) > 1 and text_info[1] is not None:
                            confidences.append(float(text_info[1]))

    joined = "\n".join(t.strip() for t in texts if t and str(t).strip())
    avg_conf = sum(confidences) / len(confidences) if confidences else None
    return joined, avg_conf


def _score_ocr(text: str, confidence: float | None) -> float:
    length = len((text or "").strip())
    conf = confidence if confidence is not None else 0.0
    return length * (0.35 + conf)


def process_image_bytes(content: bytes, preprocess: bool = True) -> dict[str, Any]:
    image = Image.open(io.BytesIO(content))

    if not preprocess:
        text, confidence = run_paddle_ocr(image.convert("RGB"))
        return {
            "text": text,
            "confidence": confidence,
            "pageCount": 1,
            "source": "paddleocr",
            "preprocessed": False,
        }

    # Dual-pass: geometry-corrected soft enhance vs soft enhance only.
    # Pick the higher-scoring result so aggressive warps cannot regress quality.
    candidates: list[tuple[str, str, float | None]] = []
    try:
        corrected = soft_enhance(correct_document_geometry(image))
        text, confidence = run_paddle_ocr(corrected)
        candidates.append(("geometry+soft", text, confidence))
    except Exception:  # noqa: BLE001
        pass

    try:
        soft = soft_enhance(image)
        text, confidence = run_paddle_ocr(soft)
        candidates.append(("soft", text, confidence))
    except Exception:  # noqa: BLE001
        pass

    if not candidates:
        # Last resort: original RGB
        text, confidence = run_paddle_ocr(ImageOps.exif_transpose(image).convert("RGB"))
        candidates.append(("raw", text, confidence))

    best_label, best_text, best_conf = max(
        candidates, key=lambda item: _score_ocr(item[1], item[2])
    )

    return {
        "text": best_text,
        "confidence": best_conf,
        "pageCount": 1,
        "source": f"paddleocr:{best_label}",
        "preprocessed": True,
    }


def process_pdf_bytes(content: bytes, preprocess: bool = True) -> dict[str, Any]:
    digital_text, page_count = extract_pdf_text(content)

    # Prefer embedded text when the PDF already has a usable text layer.
    if len(digital_text) >= 40:
        return {
            "text": digital_text,
            "confidence": 1.0,
            "pageCount": page_count,
            "source": "pdf_text",
            "preprocessed": False,
        }

    page_images = pdf_pages_to_images(content)
    page_texts: list[str] = []
    confidences: list[float] = []

    for page_image in page_images:
        prepared = preprocess_image(page_image) if preprocess else page_image.convert("RGB")
        text, confidence = run_paddle_ocr(prepared)
        if text:
            page_texts.append(text)
        if confidence is not None:
            confidences.append(confidence)

    return {
        "text": "\n\n".join(page_texts).strip(),
        "confidence": (sum(confidences) / len(confidences)) if confidences else None,
        "pageCount": page_count,
        "source": "paddleocr",
        "preprocessed": preprocess,
    }


@app.get("/")
def root() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "nexdesk-ocr",
        "health": "/health",
        "ocr": "POST /ocr",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    paddle_ready = False
    paddle_error = _ocr_load_error
    try:
        _lazy_ocr()
        paddle_ready = True
        paddle_error = None
    except Exception as exc:  # noqa: BLE001
        paddle_error = str(exc)

    return {
        "ok": True,
        "paddleocr": paddle_ready,
        "error": paddle_error,
    }


@app.post("/ocr")
async def ocr(
    file: UploadFile = File(...),
    mimeType: str = Form(default=""),
    preprocess: bool = Form(default=True),
) -> dict[str, Any]:
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    mime = (mimeType or file.content_type or "").lower()
    filename = (file.filename or "").lower()

    try:
        if mime == "application/pdf" or filename.endswith(".pdf"):
            result = process_pdf_bytes(content, preprocess=preprocess)
        elif mime.startswith("image/") or any(
            filename.endswith(ext) for ext in (".png", ".jpg", ".jpeg", ".webp", ".gif")
        ):
            result = process_image_bytes(content, preprocess=preprocess)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type for OCR")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "success": True,
        "engine": "paddleocr",
        "extractedText": result["text"],
        "confidence": result["confidence"],
        "pageCount": result["pageCount"],
        "source": result["source"],
        "preprocessed": result["preprocessed"],
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("OCR_SERVICE_PORT", "5100"))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)
