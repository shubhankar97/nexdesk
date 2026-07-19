import { createEmptyInvoiceJson, PARSE_STATUS } from '../constants/invoice.js';

const MONEY_TOKEN = /(?:(?:INR|USD|EUR|GBP|Rs\.?|₹|\$)\s*)?([\d,]+(?:\.\d{1,2})?)/i;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Characters OCR commonly confuses. Used to build label patterns that still
// match when the engine mis-reads a heading (e.g. "Invoice" -> "involce").
const OCR_AMBIGUOUS = {
  a: 'a4@',
  b: 'b8',
  e: 'e3',
  g: 'g9',
  i: 'il1|',
  l: 'l1i|',
  o: 'o0',
  s: 's5$',
  t: 't7',
  z: 'z2',
  0: '0o',
  1: '1il|',
  2: '2z',
  5: '5s',
  8: '8b',
};

const fuzzyChar = (char) => {
  if (char === ' ') {
    return '\\s*';
  }
  const lower = char.toLowerCase();
  if (OCR_AMBIGUOUS[lower]) {
    return `[${OCR_AMBIGUOUS[lower]}]`;
  }
  if (/[a-z0-9]/i.test(char)) {
    return char;
  }
  return escapeRegex(char);
};

// Turns a plain label (e.g. "invoice number") into an OCR-tolerant regex source.
const fuzzyLabel = (label) =>
  label
    .split('')
    .map(fuzzyChar)
    .join('');

const toNumber = (value) => {
  if (value == null || value === '') {
    return null;
  }

  const normalized = String(value).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const isPlausibleDate = (year, month, day) => {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return false;
  }
  if (y < 2000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    return false;
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
};

const toIsoDate = (year, month, day) => {
  if (!isPlausibleDate(year, month, day)) {
    return null;
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const normalizeDate = (raw) => {
  if (!raw) {
    return null;
  }

  const text = String(raw).trim();

  // Compact YYYYMMDD (common OCR collapse of ISO dates)
  const compact = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) {
    return toIsoDate(compact[1], compact[2], compact[3]);
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (dmy) {
    let year = dmy[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return toIsoDate(year, dmy[2], dmy[1]);
  }

  // YYYY-MM-DD
  const ymd = text.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (ymd) {
    return toIsoDate(ymd[1], ymd[2], ymd[3]);
  }

  // 13 Mar 2024 / March 13, 2024
  const parsed = Date.parse(text);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }

  return null;
};

/**
 * When labeled date extraction fails, pick a standalone date from OCR text.
 * Prefers ISO-style dates; avoids due-date neighborhoods when possible.
 */
const findStandaloneDate = (text) => {
  const candidates = [];

  for (const match of text.matchAll(
    /\b(20\d{2})[\/\-.](0?[1-9]|1[0-2])[\/\-.](0?[1-9]|[12]\d|3[01])\b/g
  )) {
    const iso = toIsoDate(match[1], match[2], match[3]);
    if (iso) {
      candidates.push({ iso, index: match.index ?? 0, raw: match[0] });
    }
  }

  for (const match of text.matchAll(/\b(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b/g)) {
    const iso = toIsoDate(match[1], match[2], match[3]);
    if (iso) {
      candidates.push({ iso, index: match.index ?? 0, raw: match[0] });
    }
  }

  if (!candidates.length) {
    return null;
  }

  const scored = candidates.map((candidate) => {
    const window = text.slice(Math.max(0, candidate.index - 40), candidate.index + 40);
    let score = 0;
    if (/\binvoice\b|\binv\b|\bbill\b/i.test(window)) {
      score += 3;
    }
    if (/\bdue\b|\bexpir|\bvalid\b/i.test(window)) {
      score -= 2;
    }
    if (/[\/\-.]/.test(candidate.raw)) {
      score += 1;
    }
    return { ...candidate, score };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored[0].iso;
};

const firstMatch = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const extractLabeledBlock = (lines, startLabels, endLabels = []) => {
  const startIndex = lines.findIndex((line) =>
    startLabels.some((label) => new RegExp(label, 'i').test(line))
  );

  if (startIndex === -1) {
    return null;
  }

  const block = [];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) {
      if (block.length) {
        break;
      }
      continue;
    }

    if (endLabels.some((label) => new RegExp(label, 'i').test(line))) {
      break;
    }

    block.push(line);
    if (block.length >= 4) {
      break;
    }
  }

  if (!block.length) {
    return null;
  }

  return {
    name: block[0] || null,
    address: block.slice(1).join(', ') || null,
  };
};

const extractCurrency = (text) => {
  const match = text.match(/\b(INR|USD|EUR|GBP)\b|₹|Rs\.?/i);
  if (!match) {
    return null;
  }

  const token = match[0].toUpperCase();
  if (token.includes('RS') || token === '₹') {
    return 'INR';
  }
  if (token === '$') {
    return 'USD';
  }
  return token;
};

const extractLineItems = (text) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const items = [];

  // description ... qty ... unitPrice ... amount
  const rowPattern =
    /^(.+?)\s+(\d+(?:\.\d+)?)\s+[xX*]?\s*([\d,]+(?:\.\d{1,2})?)\s+([\d,]+(?:\.\d{1,2})?)$/;

  // description .... amount (fallback)
  const simplePattern = /^(.+?)\s{2,}([\d,]+(?:\.\d{1,2})?)$/;

  for (const line of lines) {
    if (/sub\s*total|tax|total|invoice|bill to|ship to|date|qty|amount|description/i.test(line)) {
      continue;
    }

    const row = line.match(rowPattern);
    if (row) {
      items.push({
        description: row[1].trim(),
        quantity: toNumber(row[2]),
        unitPrice: toNumber(row[3]),
        amount: toNumber(row[4]),
      });
      continue;
    }

    const simple = line.match(simplePattern);
    if (simple && simple[1].length > 3) {
      items.push({
        description: simple[1].trim(),
        quantity: null,
        unitPrice: null,
        amount: toNumber(simple[2]),
      });
    }
  }

  return items.slice(0, 50);
};

// Finds a money amount associated with a label. Tolerant of OCR label typos
// and of layouts where the amount sits after the label OR on a following line
// (common once a photo is deskewed/warped and columns collapse).
const extractLabeledMoney = (lines, labels) => {
  for (const label of labels) {
    const labelRe = new RegExp(`\\b${fuzzyLabel(label)}\\b`, 'i');

    for (let i = 0; i < lines.length; i += 1) {
      const match = lines[i].match(labelRe);
      if (!match) {
        continue;
      }

      const afterLabel = lines[i].slice(match.index + match[0].length);
      const windowText = [afterLabel, lines[i + 1] || '', lines[i + 2] || ''].join('\n');
      const money = windowText.match(MONEY_TOKEN);
      if (money?.[1]) {
        return toNumber(money[1]);
      }
    }
  }
  return null;
};

/**
 * Rule-based invoice parser.
 * Returns canonical invoice JSON (not yet validated).
 */
export const parseInvoiceText = (rawText = '') => {
  const text = String(rawText || '').replace(/\u00a0/g, ' ').trim();
  const invoice = createEmptyInvoiceJson();

  if (!text) {
    return invoice;
  }

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  const DATE_VALUE =
    '([0-9]{1,2}[\\/\\-.][0-9]{1,2}[\\/\\-.][0-9]{2,4}|[0-9]{4}[\\/\\-.][0-9]{1,2}[\\/\\-.][0-9]{1,2}|[A-Za-z]{3,9}\\s+\\d{1,2},?\\s+\\d{2,4}|\\d{1,2}\\s+[A-Za-z]{3,9}\\s+\\d{2,4})';
  const idPart = '[:.#\\-]?\\s*([A-Za-z0-9][A-Za-z0-9\\-\\/]{2,})';

  invoice.invoiceNumber = firstMatch(text, [
    new RegExp(`${fuzzyLabel('invoice')}\\s*(?:${fuzzyLabel('no')}|${fuzzyLabel('number')}|#)\\s*${idPart}`, 'i'),
    new RegExp(`${fuzzyLabel('inv')}\\s*(?:${fuzzyLabel('no')}|#)\\s*${idPart}`, 'i'),
    new RegExp(`${fuzzyLabel('bill')}\\s*(?:${fuzzyLabel('no')}|${fuzzyLabel('number')}|#)\\s*${idPart}`, 'i'),
  ]);

  const invoiceDateRaw = firstMatch(text, [
    new RegExp(`${fuzzyLabel('invoice date')}\\s*[:\\-]?\\s*${DATE_VALUE}`, 'i'),
    new RegExp(`\\b${fuzzyLabel('date')}\\s*[:\\-]?\\s*${DATE_VALUE}`, 'i'),
  ]);
  invoice.invoiceDate = normalizeDate(invoiceDateRaw) || findStandaloneDate(text);

  const dueDateRaw = firstMatch(text, [
    new RegExp(`${fuzzyLabel('due date')}\\s*[:\\-]?\\s*${DATE_VALUE}`, 'i'),
    new RegExp(`${fuzzyLabel('payment due')}\\s*[:\\-]?\\s*${DATE_VALUE}`, 'i'),
  ]);
  invoice.dueDate = normalizeDate(dueDateRaw);

  invoice.currency = extractCurrency(text);

  const vendor = extractLabeledBlock(
    lines,
    ['^from\\b', '^seller\\b', '^vendor\\b', '^supplier\\b', '^billed\\s*by\\b'],
    ['^bill\\s*to\\b', '^sold\\s*to\\b', '^customer\\b', '^ship\\s*to\\b', '^invoice\\b']
  );
  if (vendor) {
    invoice.vendor.name = vendor.name;
    invoice.vendor.address = vendor.address;
  } else if (lines[0] && !/invoice|tax|total/i.test(lines[0])) {
    invoice.vendor.name = lines[0];
  }

  const customer = extractLabeledBlock(
    lines,
    ['^bill\\s*to\\b', '^sold\\s*to\\b', '^customer\\b', '^buyer\\b', '^ship\\s*to\\b'],
    ['^item\\b', '^description\\b', '^qty\\b', '^sub\\s*total\\b', '^invoice\\b', '^from\\b']
  );
  if (customer) {
    invoice.customer.name = customer.name;
    invoice.customer.address = customer.address;
  }

  invoice.vendor.taxId = firstMatch(text, [
    /(?:GSTIN|GST\s*No\.?|VAT\s*No\.?|Tax\s*ID)\s*[:\-]?\s*([A-Z0-9\-]+)/i,
  ]);
  invoice.customer.taxId = firstMatch(text, [
    /(?:customer|buyer|bill\s*to)[\s\S]{0,80}(?:GSTIN|GST\s*No\.?|VAT\s*No\.?|Tax\s*ID)\s*[:\-]?\s*([A-Z0-9\-]+)/i,
  ]);

  invoice.vendor.email = firstMatch(text, [/\b([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})\b/i]);
  invoice.vendor.phone = firstMatch(text, [
    /(?:phone|tel|mobile|mob)\s*[:\-]?\s*(\+?[\d][\d\s\-()]{7,}\d)/i,
  ]);

  invoice.lineItems = extractLineItems(text);

  invoice.subtotal = extractLabeledMoney(lines, [
    'sub total',
    'subtotal',
    'net amount',
    'taxable amount',
  ]);
  invoice.taxAmount = extractLabeledMoney(lines, [
    'tax amount',
    'gst amount',
    'vat amount',
    'taxes',
    'tax',
    'gst',
    'vat',
  ]);
  invoice.total = extractLabeledMoney(lines, [
    'grand total',
    'amount due',
    'balance due',
    'total amount',
    'invoice total',
    'total',
  ]);

  const taxRateRaw = firstMatch(text, [
    /(?:gst|vat|tax)\s*(?:rate)?\s*[:\-]?\s*(\d{1,2}(?:\.\d+)?)\s*%/i,
  ]);
  invoice.taxRate = taxRateRaw != null ? toNumber(taxRateRaw) : null;

  invoice.paymentTerms = firstMatch(text, [
    /payment\s*terms?\s*[:\-]?\s*(.+)/i,
    /(?:net\s*\d{1,3})\b/i,
  ]);

  const notes = firstMatch(text, [/notes?\s*[:\-]?\s*(.+)/i, /remarks?\s*[:\-]?\s*(.+)/i]);
  invoice.notes = notes;

  return invoice;
};
