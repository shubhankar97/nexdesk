import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const DEFAULT_TIMEOUT_MS = 120000;

const truncate = (value, max = 300) => {
  const text = String(value || '').trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}…`;
};

const parseJsonResponse = async (response) => {
  const raw = await response.text();

  if (!raw) {
    throw new ApiError(
      502,
      `OCR service returned an empty response (HTTP ${response.status})`
    );
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(
      502,
      `OCR service returned an invalid response (HTTP ${response.status}): ${truncate(raw)}`
    );
  }
};

export const isOcrServiceConfigured = () => Boolean(env.ocrServiceUrl);

export const checkOcrHealth = async () => {
  if (!env.ocrServiceUrl) {
    return { ok: false, error: 'OCR_SERVICE_URL is not configured' };
  }

  try {
    const response = await fetch(`${env.ocrServiceUrl}/health`, {
      signal: AbortSignal.timeout(15000),
    });
    return await parseJsonResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: error.message || 'OCR service unreachable' };
  }
};

export const runOcrOnFile = async ({ buffer, filename, mimeType, preprocess = true }) => {
  if (!env.ocrServiceUrl) {
    throw new ApiError(503, 'OCR service is not configured (set OCR_SERVICE_URL)');
  }

  const health = await checkOcrHealth();
  if (!health?.ok) {
    throw new ApiError(503, `OCR service unhealthy: ${health?.error || 'unknown error'}`);
  }
  if (health.paddleocr === false) {
    throw new ApiError(
      503,
      `PaddleOCR is not ready on OCR service: ${health.error || 'check OCR deploy logs'}`
    );
  }

  const form = new FormData();
  const type = mimeType || 'application/octet-stream';
  const name = filename || 'document';
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const filePart =
    typeof File !== 'undefined'
      ? new File([bytes], name, { type })
      : new Blob([bytes], { type });

  form.append('file', filePart, name);
  form.append('mimeType', mimeType || '');
  form.append('preprocess', String(Boolean(preprocess)));

  let response;
  try {
    response = await fetch(`${env.ocrServiceUrl}/ocr`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });
  } catch (error) {
    throw new ApiError(503, `OCR service unreachable: ${error.message}`);
  }

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    const detail = payload?.detail || payload?.message || 'OCR processing failed';
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail);
    throw new ApiError(response.status >= 400 && response.status < 600 ? response.status : 502, message);
  }

  return {
    extractedText: payload.extractedText || '',
    confidence: payload.confidence ?? null,
    pageCount: payload.pageCount ?? null,
    source: payload.source || 'paddleocr',
    preprocessed: Boolean(payload.preprocessed),
    engine: payload.engine || 'paddleocr',
  };
};
