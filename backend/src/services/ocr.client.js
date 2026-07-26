import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Render free tier cold-starts + first PaddleOCR model load can exceed a minute.
const HEALTH_TIMEOUT_MS = 90000;
const HEALTH_RETRIES = 3;
const HEALTH_RETRY_DELAY_MS = 5000;
const OCR_TIMEOUT_MS = 180000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const truncate = (value, max = 300) => {
  const text = String(value || '').trim();
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}…`;
};

const isTimeoutError = (error) => {
  const message = String(error?.message || error || '');
  return (
    error?.name === 'TimeoutError' ||
    error?.name === 'AbortError' ||
    /aborted due to timeout|timeout|timed out/i.test(message)
  );
};

const parseJsonResponse = async (response) => {
  const raw = await response.text();

  if (!raw) {
    throw new ApiError(
      502,
      response.status === 502
        ? 'OCR service crashed or ran out of memory (HTTP 502). Use a larger Render instance (1GB+) or retry with a smaller image/PDF.'
        : `OCR service returned an empty response (HTTP ${response.status})`
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

const buildOcrFormData = ({ buffer, filename, mimeType, preprocess }) => {
  const form = new FormData();
  const type = mimeType || 'application/octet-stream';
  const name = filename || 'document';
  const bytes = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

  // Prefer Blob + filename so python-multipart reliably receives content from Node fetch.
  const blob = new Blob([bytes], { type });
  form.append('file', blob, name);
  form.append('mimeType', mimeType || '');
  form.append('preprocess', preprocess ? 'true' : 'false');

  return { form, byteLength: bytes.length };
};

const fetchOcrHealthOnce = async (timeoutMs = HEALTH_TIMEOUT_MS) => {
  const response = await fetch(`${env.ocrServiceUrl}/health`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  return parseJsonResponse(response);
};

export const isOcrServiceConfigured = () => Boolean(env.ocrServiceUrl);

export const checkOcrHealth = async ({
  timeoutMs = HEALTH_TIMEOUT_MS,
  retries = 1,
  retryDelayMs = HEALTH_RETRY_DELAY_MS,
} = {}) => {
  if (!env.ocrServiceUrl) {
    return { ok: false, error: 'OCR_SERVICE_URL is not configured' };
  }

  let lastError = 'OCR service unreachable';

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await fetchOcrHealthOnce(timeoutMs);
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error.message;
      } else {
        lastError = error.message || 'OCR service unreachable';
      }

      const shouldRetry = attempt < retries && isTimeoutError(error);
      if (!shouldRetry) {
        break;
      }

      await sleep(retryDelayMs);
    }
  }

  return { ok: false, error: lastError };
};

const waitForOcrReady = async () => {
  const health = await checkOcrHealth({
    timeoutMs: HEALTH_TIMEOUT_MS,
    retries: HEALTH_RETRIES,
    retryDelayMs: HEALTH_RETRY_DELAY_MS,
  });

  if (!health?.ok) {
    throw new ApiError(
      503,
      `OCR service unhealthy: ${health?.error || 'unknown error'}. If the service just woke from sleep, wait ~1 minute and retry.`
    );
  }

  if (health.paddleocr === false) {
    throw new ApiError(
      503,
      `PaddleOCR is not ready on OCR service: ${health.error || 'check OCR deploy logs'}`
    );
  }

  return health;
};

export const runOcrOnFile = async ({ buffer, filename, mimeType, preprocess = true }) => {
  if (!env.ocrServiceUrl) {
    throw new ApiError(503, 'OCR service is not configured (set OCR_SERVICE_URL)');
  }

  if (!buffer || !buffer.length) {
    throw new ApiError(400, 'Stored document file is empty');
  }

  await waitForOcrReady();

  const { form, byteLength } = buildOcrFormData({ buffer, filename, mimeType, preprocess });

  let response;
  try {
    response = await fetch(`${env.ocrServiceUrl}/ocr`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(OCR_TIMEOUT_MS),
    });
  } catch (error) {
    if (isTimeoutError(error)) {
      throw new ApiError(
        503,
        'OCR request timed out. The OCR service may still be loading models — retry in a minute.'
      );
    }
    throw new ApiError(503, `OCR service unreachable: ${error.message}`);
  }

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    const detail = payload?.detail || payload?.message || 'OCR processing failed';
    const message = typeof detail === 'string' ? detail : JSON.stringify(detail);

    if (response.status === 400) {
      throw new ApiError(
        400,
        `OCR rejected the file (${byteLength} bytes sent): ${message}`
      );
    }

    throw new ApiError(
      response.status >= 400 && response.status < 600 ? response.status : 502,
      message
    );
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
