# NexDesk OCR Service

Python microservice for Document AI Sprint 3.

## Features

- **PaddleOCR** for scanned images and image-only PDFs
- **PDF text extraction** via PyMuPDF when a text layer exists
- **Image preprocessing** (grayscale, autocontrast, denoise, threshold)

## Setup

Requires **Python 3.10–3.12** (PaddleOCR does not support 3.13+). On macOS with Homebrew:

```bash
brew install python@3.12
cd ocr-service
/usr/local/bin/python3.12 -m venv .venv   # Apple Silicon: $(brew --prefix python@3.12)/bin/python3.12
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
# Install PaddlePaddle CPU for your platform first:
python -m pip install paddlepaddle==3.0.0 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/
pip install -r requirements.txt
```

## Run

```bash
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 5100
```

Set on the Node API:

```bash
OCR_SERVICE_URL=http://127.0.0.1:5100
```

## Render

- Root Directory: `ocr-service`
- `runtime.txt` pins Python **3.12.8** (required for PaddleOCR)
- **Instance RAM:** use **at least 1 GB**. Free 512 MB often returns empty HTTP 502 (OOM) during OCR.
- Env (recommended):

```env
OCR_LOW_MEMORY=true
```

- Build Command:

```bash
pip install --upgrade pip setuptools wheel && pip install paddlepaddle==3.0.0 -i https://www.paddlepaddle.org.cn/packages/stable/cpu/ && pip install -r requirements.txt
```

- Start Command:

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT --workers 1
```

- Health check: `GET /health` (expect `"paddleocr": true`)

## Endpoints

- `GET /health` — service + PaddleOCR readiness
- `POST /ocr` — multipart `file`, optional `mimeType`, `preprocess`
