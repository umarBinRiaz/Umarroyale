'use strict';

/*
 * JSON API. Public routes serve the storefront; /api/admin/* requires a
 * server-issued session token. Product copy, prices, stock and order maths
 * are all resolved here so the frontend never holds authoritative data.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { q, allSettings } = require('./db');
const { ok, fail, readJson, toInt, toText } = require('./util');
const auth = require('./auth');
const products = require('./products');
const orders = require('./orders');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif'
};
const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */
const routes = [];

function route(method, pattern, handler, { auth: needsAuth = false } = {}) {
  const keys = [];
  const regexSource = pattern.replace(/:[A-Za-z_]+/g, (m) => {
    keys.push(m.slice(1));
    return '([^/]+)';
  });
  routes.push({ method, regex: new RegExp(`^${regexSource}$`), keys, handler, auth: needsAuth });
}

function match(method, pathname) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = r.regex.exec(pathname);
    if (!m) continue;
    const params = {};
    r.keys.forEach((key, i) => { params[key] = decodeURIComponent(m[i + 1]); });
    return { r, params };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Public                                                              */
/* ------------------------------------------------------------------ */
route('GET', '/api/bootstrap', (req, res) => {
  const all = products.listProducts({ sort: 'manual' });
  ok(res, {
    settings: orders.publicSettings(),
    facets: products.facets(),
    counts: {
      total: all.length,
      featured: all.filter((p) => p.isFeatured).length,
      bestsellers: all.filter((p) => p.isBestseller).length,
      newArrivals: all.filter((p) => p.isNewArrival).length,
      onSale: all.filter((p) => p.onSale).length
    },
    products: all
  });
});

route('GET', '/api/settings', (req, res) => ok(res, orders.publicSettings()));

route('GET', '/api/products', (req, res, { query }) => {
  const list = products.listProducts({
    q: query.get('q'),
    gender: query.get('gender'),
    family: query.get('family'),
    category: query.get('category'),
    minPrice: query.get('minPrice'),
    maxPrice: query.get('maxPrice'),
    featured: query.get('featured') === '1',
    bestseller: query.get('bestseller') === '1',
    newArrival: query.get('newArrival') === '1',
    onSale: query.get('onSale') === '1',
    inStock: query.get('inStock') === '1',
    sort: query.get('sort'),
    limit: query.get('limit'),
    detail: query.get('detail') === '1'
  });
  ok(res, { products: list, total: list.length });
});

route('GET', '/api/search', (req, res, { query }) => {
  const term = toText(query.get('q'), '').trim();
  if (term.length < 1) return ok(res, { products: [], total: 0, query: term });
  const list = products.listProducts({ q: term, sort: 'rating' });
  ok(res, { products: list, total: list.length, query: term });
});

route('GET', '/api/products/:slug', (req, res, { params }) => {
  const product = products.getProductBySlug(params.slug);
  if (!product) return fail(res, 404, 'Fragrance not found');
  ok(res, {
    product,
    related: products.relatedProducts(product, 8),
    reviews: products.listReviews(product.id)
  });
});

route('GET', '/api/products/:slug/reviews', (req, res, { params }) => {
  const product = products.getProductBySlug(params.slug);
  if (!product) return fail(res, 404, 'Fragrance not found');
  ok(res, { reviews: products.listReviews(product.id), rating: product.rating, reviewCount: product.reviewCount });
});

route('POST', '/api/products/:slug/reviews', async (req, res, { params }) => {
  const product = products.getProductBySlug(params.slug);
  if (!product) return fail(res, 404, 'Fragrance not found');
  const body = await readJson(req, 8192);
  if (!toText(body.author, '')) return fail(res, 422, 'Please add your name');
  if (!toText(body.body, '')) return fail(res, 422, 'Please write a short review');
  const created = products.createReview(product.id, {
    author: body.author,
    rating: body.rating,
    title: body.title,
    body: body.body
  });
  const fresh = products.getProductBySlug(params.slug);
  ok(res, { id: created.id, reviews: products.listReviews(product.id), product: fresh });
});

route('POST', '/api/orders', async (req, res) => {
  const body = await readJson(req, 128 * 1024);
  const order = orders.createOrder(body);
  ok(res, { order });
});

route('GET', '/api/orders/:code', (req, res, { params }) => {
  const order = orders.getOrderByCode(params.code);
  if (!order) return fail(res, 404, 'Order not found');
  ok(res, { order });
});

/* ------------------------------------------------------------------ */
/* Admin — session                                                     */
/* ------------------------------------------------------------------ */
route('POST', '/api/admin/login', async (req, res) => {
  const body = await readJson(req, 4096);
  const result = auth.login(toText(body.username, ''), String(body.password || ''));
  if (!result) return fail(res, 401, 'Incorrect username or password');
  ok(res, { token: result.token, admin: result.admin, expiresAt: result.expiresAt });
});

route('POST', '/api/admin/logout', (req, res) => {
  auth.logout(auth.readToken(req));
  ok(res);
});

route('GET', '/api/admin/session', (req, res) => {
  if (!req.admin) return fail(res, 401, 'Not signed in');
  ok(res, { admin: req.admin });
});

route('POST', '/api/admin/password', async (req, res) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, 4096);
  if (String(body.newPassword || '').length < 8) {
    return fail(res, 422, 'New password must be at least 8 characters');
  }
  auth.setPassword(req.admin.id, body.newPassword);
  ok(res, { message: 'Password updated — please sign in again' });
});

/* ------------------------------------------------------------------ */
/* Admin — catalogue                                                   */
/* ------------------------------------------------------------------ */
route('GET', '/api/admin/products', (req, res, { query }) => {
  if (!auth.requireAdmin(req, res)) return;
  const list = products.listProducts({
    includeInactive: true,
    q: query.get('q'),
    detail: true,
    sort: query.get('sort')
  });
  ok(res, { products: list, total: list.length });
});

route('POST', '/api/admin/products', async (req, res) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, 1024 * 1024);
  ok(res, { product: products.createProduct(body) });
});

route('PUT', '/api/admin/products/:id', async (req, res, { params }) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, 1024 * 1024);
  const updated = products.updateProduct(toInt(params.id, 0), body);
  if (!updated) return fail(res, 404, 'Fragrance not found');
  ok(res, { product: updated });
});

route('DELETE', '/api/admin/products/:id', (req, res, { params }) => {
  if (!auth.requireAdmin(req, res)) return;
  const id = toInt(params.id, 0);
  if (!products.deleteProduct(id)) return fail(res, 404, 'Fragrance not found');
  ok(res);
});

route('POST', '/api/admin/products/:id/stock', async (req, res, { params }) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, 4096);
  const id = toInt(params.id, 0);
  if (!products.adjustStock(id, toInt(body.delta, 0))) return fail(res, 404, 'Fragrance not found');
  ok(res, { product: products.getProductById(id) });
});

/* ------------------------------------------------------------------ */
/* Admin — image upload (base64 in, file on disk out)                  */
/* ------------------------------------------------------------------ */
route('POST', '/api/admin/upload', async (req, res) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, MAX_UPLOAD_BYTES + 1024 * 64);
  const dataUrl = toText(body.data, '');
  const match = /^data:([\w/+.-]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return fail(res, 422, 'Send the image as a base64 data URL');

  const [, mime, payload] = match;
  const ext = IMAGE_TYPES[mime.toLowerCase()];
  if (!ext) return fail(res, 422, 'Only JPG, PNG, WebP, AVIF or GIF images are supported');

  const buffer = Buffer.from(payload, 'base64');
  if (!buffer.length) return fail(res, 422, 'That file appears to be empty');
  if (buffer.length > MAX_UPLOAD_BYTES) return fail(res, 413, 'Images must be under 6 MB');

  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  ok(res, { url: `/uploads/${name}`, bytes: buffer.length });
});

/* ------------------------------------------------------------------ */
/* Admin — orders, reviews, dashboard, settings                       */
/* ------------------------------------------------------------------ */
route('GET', '/api/admin/orders', (req, res, { query }) => {
  if (!auth.requireAdmin(req, res)) return;
  const list = orders.listOrders({
    status: query.get('status'),
    search: query.get('q'),
    limit: query.get('limit') || 200
  });
  ok(res, { orders: list, total: list.length });
});

route('PUT', '/api/admin/orders/:id/status', async (req, res, { params }) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, 4096);
  const order = orders.setStatus(toInt(params.id, 0), toText(body.status, ''));
  if (!order) return fail(res, 404, 'Order not found');
  ok(res, { order });
});

route('DELETE', '/api/admin/orders/:id', (req, res, { params }) => {
  if (!auth.requireAdmin(req, res)) return;
  if (!orders.deleteOrder(toInt(params.id, 0))) return fail(res, 404, 'Order not found');
  ok(res);
});

route('GET', '/api/admin/dashboard', (req, res) => {
  if (!auth.requireAdmin(req, res)) return;
  ok(res, orders.dashboard());
});

route('GET', '/api/admin/reviews', (req, res) => {
  if (!auth.requireAdmin(req, res)) return;
  ok(res, { reviews: products.listAllReviews() });
});

route('PUT', '/api/admin/reviews/:id', async (req, res, { params }) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, 8192);
  if (!products.updateReview(toInt(params.id, 0), body)) return fail(res, 404, 'Review not found');
  ok(res);
});

route('DELETE', '/api/admin/reviews/:id', (req, res, { params }) => {
  if (!auth.requireAdmin(req, res)) return;
  if (!products.deleteReview(toInt(params.id, 0))) return fail(res, 404, 'Review not found');
  ok(res);
});

route('GET', '/api/admin/settings', (req, res) => {
  if (!auth.requireAdmin(req, res)) return;
  ok(res, allSettings());
});

route('PUT', '/api/admin/settings', async (req, res) => {
  if (!auth.requireAdmin(req, res)) return;
  const body = await readJson(req, 64 * 1024);
  ok(res, { settings: orders.saveSettings(body) });
});

/* ------------------------------------------------------------------ */
/* Dispatcher                                                          */
/* ------------------------------------------------------------------ */
async function handle(req, res, pathname, query) {
  const hit = match(req.method, pathname);
  if (!hit) return fail(res, 404, 'Unknown API endpoint');

  auth.attachAdmin(req);
  if (hit.r.auth && !req.admin) {
    return fail(res, 401, 'Authentication required');
  }

  try {
    await hit.r.handler(req, res, { params: hit.params, query });
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error('[api]', pathname, err);
    if (res.headersSent) return;
    fail(res, status, err.message || 'Something went wrong', err.fields ? { fields: err.fields } : undefined);
  }
}

module.exports = { handle, UPLOAD_DIR };
