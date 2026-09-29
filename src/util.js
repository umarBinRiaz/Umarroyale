'use strict';

/* Small shared helpers. No dependencies. */

/** node:sqlite only binds null/number/bigint/string/Buffer. */
function bind(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' || Buffer.isBuffer(value)) return value;
  return String(value);
}

function bindAll(params) {
  return params.map(bind);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product';
}

/** Ensure a slug is unique inside `table`, appending -2, -3 ... when needed. `store` is the db query helper. */
function uniqueSlug(store, table, slug, excludeId) {
  let candidate = slug;
  let n = 1;
  for (;;) {
    const row = excludeId
      ? store.get(`SELECT id FROM ${table} WHERE slug = ? AND id <> ? LIMIT 1`, [candidate, excludeId])
      : store.get(`SELECT id FROM ${table} WHERE slug = ? LIMIT 1`, [candidate]);
    if (!row) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function toInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toNum(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toText(value, fallback = '') {
  if (value === undefined || value === null) return fallback;
  const s = String(value).trim();
  return s === '' ? fallback : s;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function ok(res, payload) {
  json(res, 200, payload === undefined ? { ok: true } : payload);
}

function fail(res, status, message, extra) {
  json(res, status, Object.assign({ ok: false, error: message }, extra || {}));
}

/** Read a JSON request body with a hard size cap. */
function readJson(req, limitBytes = 1024 * 512) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(Object.assign(new Error('Invalid JSON body'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

module.exports = {
  bind,
  bindAll,
  slugify,
  uniqueSlug,
  nowIso,
  toInt,
  toNum,
  toText,
  clamp,
  json,
  ok,
  fail,
  readJson
};
