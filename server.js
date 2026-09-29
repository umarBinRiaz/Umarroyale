'use strict';

/*
 * UMAR ROYALE — application server.
 *   • serves the static storefront from public/
 *   • serves the JSON API from src/api.js
 *   • falls back to the app shell for client-side routes such as
 *     /products/black-silver so shared links work on a cold load
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const api = require('./src/api');
const { seed } = require('./src/seed');
const { ensureAdmin } = require('./src/auth');
const { q } = require('./src/db');
const { toInt } = require('./src/util');

const PORT = toPort(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

function toPort(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 0;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
};

const IMMUTABLE = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.woff', '.woff2', '.ttf', '.otf']);

/* Client-side routes that must resolve to the app shell. */
const APP_ROUTES = [
  /^\/$/,
  /^\/index\.html$/,
  /^\/shop$/,
  /^\/products$/,
  /^\/products\/[^/]+$/,
  /^\/cart$/,
  /^\/checkout$/,
  /^\/wishlist$/,
  /^\/search$/,
  /^\/offers$/,
  /^\/new-arrivals$/,
  /^\/best-sellers$/,
  /^\/men$/,
  /^\/women$/,
  /^\/unisex$/,
  /^\/about$/,
  /^\/contact$/,
  /^\/order-confirmed\/[^/]+$/
];

function sendFile(res, filePath, { status = 200, cache } = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(err.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    res.writeHead(status, {
      'Content-Type': type,
      'Content-Length': data.length,
      'Cache-Control': cache || (IMMUTABLE.has(ext) ? 'public, max-age=604800' : 'no-cache')
    });
    res.end(data);
  });
}

function sendApp(res, status = 200) {
  sendFile(res, path.join(PUBLIC_DIR, 'index.html'), { status, cache: 'no-cache' });
}

function sendAdmin(res) {
  sendFile(res, path.join(PUBLIC_DIR, 'admin.html'), { cache: 'no-store' });
}

/** Resolve a URL path to a file inside PUBLIC_DIR, or null if it escapes. */
function resolveStatic(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  if (decoded === '/admin' || decoded === '/admin/' || decoded === '/admin.html') return { admin: true };

  const target = path.resolve(PUBLIC_DIR, `.${path.posix.normalize(decoded)}`);
  const root = path.resolve(PUBLIC_DIR);
  if (target !== root && !target.startsWith(root + path.sep)) return null;

  try {
    const stat = fs.statSync(target);
    if (stat.isFile()) return { file: target };
    if (stat.isDirectory()) {
      const indexFile = path.join(target, 'index.html');
      if (fs.existsSync(indexFile)) return { file: indexFile };
    }
  } catch {
    return null;
  }
  return null;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'GET, POST, PUT, DELETE' });
    res.end('Method not allowed');
    return;
  }

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    api.handle(req, res, pathname, url.searchParams);
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method not allowed');
    return;
  }

  const resolved = resolveStatic(pathname);
  if (resolved) {
    if (resolved.admin) sendAdmin(res);
    else sendFile(res, resolved.file);
    return;
  }

  if (APP_ROUTES.some((re) => re.test(pathname))) {
    sendApp(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<!doctype html><meta charset="utf-8"><title>404 — UMAR ROYALE</title>'
    + '<body style="font:16px/1.6 system-ui;padding:15vh 6vw;background:#0b0b0e;color:#f5f2ec">'
    + '<p style="letter-spacing:.3em;font-size:11px;opacity:.6">UMAR ROYALE</p>'
    + '<h1 style="font-weight:400;font-size:34px">404</h1>'
    + '<p style="opacity:.7">This page does not exist.</p>'
    + '<a href="/" style="color:inherit">Return home</a></body>');
});

function bootstrap() {
  const result = seed();
  if (result.seeded) {
    console.log(`  seeded ${result.products} fragrances into the database`);
  }
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD;
  if (adminPass) {
    ensureAdmin(adminUser, adminPass);
    console.log('  admin account synced from ADMIN_PASSWORD');
  } else if (toInt(q.get('SELECT COUNT(*) AS n FROM admins').n) === 0) {
    ensureAdmin(adminUser, 'royale2026');
    console.log('  default admin created — user "admin", password "royale2026" (change it after first login)');
  }
}

bootstrap();

server.listen(PORT, HOST, () => {
  console.log('=============================================');
  console.log('  UMAR ROYALE — server running');
  console.log(`  storefront  http://localhost:${PORT}`);
  console.log(`  admin       http://localhost:${PORT}/admin`);
  console.log('=============================================');
});

module.exports = server;
