"""One-shot PaddleOCR worker (fresh process — avoids Place(undefined) poisoning)."""

from __future__ import annotations

import json
import os
import sys
import tempfile

os.environ["CUDA_VISIBLE_DEVICES"] = ""
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_allocator_strategy"] = "naive_best_fit"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"

import numpy as np
from PIL import Image, ImageOps


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "usage: ocr_worker.py <image_path> [max_side]"}))
        return 2

    path = sys.argv[1]
    max_side = int(sys.argv[2]) if len(sys.argv) > 2 else 320

    try:
        import paddle
        from paddleocr import PaddleOCR

        try:
            paddle.set_device("cpu")
        except Exception:
            pass

        image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        width, height = image.size
        longest = max(width, height)
        if longest > max_side:
            scale = max_side / float(longest)
            image = image.resize(
                (max(1, int(width * scale)), max(1, int(height * scale))),
                Image.Resampling.LANCZOS,
            )

        rgb = np.asarray(image, dtype=np.uint8)
        bgr = np.ascontiguousarray(rgb[:, :, ::-1])

        engine = PaddleOCR(
            lang="en",
            use_angle_cls=False,
            use_gpu=False,
            enable_mkldnn=False,
            cpu_threads=1,
            rec_batch_num=1,
            cls_batch_num=1,
            max_batch_size=1,
            det_limit_side_len=min(720, max_side),
            det_db_thresh=0.45,
            det_db_box_thresh=0.65,
            show_log=False,
        )

        try:
            results = engine.ocr(bgr, cls=False)
        except TypeError:
            results = engine.ocr(bgr)

        texts: list[str] = []
        confidences: list[float] = []
        for page in results or []:
            if not page:
                continue
            for line in page:
                if not line or len(line) < 2:
                    continue
                info = line[1]
                if isinstance(info, (list, tuple)) and info:
                    texts.append(str(info[0]))
                    if len(info) > 1 and info[1] is not None:
                        confidences.append(float(info[1]))

        text = "\n".join(t.strip() for t in texts if t and str(t).strip())
        conf = sum(confidences) / len(confidences) if confidences else None
        print(json.dumps({"ok": True, "text": text, "confidence": conf}))
        return 0
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"ok": False, "error": str(exc)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
