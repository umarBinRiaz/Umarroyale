'use strict';

/*
 * Admin authentication: scrypt password hashing + server-side session tokens.
 * Plain passcodes and localStorage-only checks are intentionally gone — the
 * admin API now guards cost prices and profit figures server side.
 */

const crypto = require('crypto');
const { q } = require('./db');
const { nowIso } = require('./util');

const SESSION_DAYS = 7;
const SCRYPT_KEYLEN = 64;

function hashPassword(password, salt) {
  const useSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), useSalt, SCRYPT_KEYLEN).toString('hex');
  return `scrypt$${useSalt}$${derived}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const candidate = Buffer.from(hashPassword(password, parts[1]), 'utf8');
  const expected = Buffer.from(`${parts[0]}$${parts[1]}$${parts[2]}`, 'utf8');
  if (candidate.length !== expected.length) return false;
  return crypto.timingSafeEqual(candidate, expected);
}

function ensureAdmin(username, password) {
  const existing = q.get('SELECT id FROM admins WHERE username = ?', [username]);
  if (existing) return existing.id;
  q.run('INSERT INTO admins (username, password_hash, created_at) VALUES (?, ?, ?)', [
    username,
    hashPassword(password),
    nowIso()
  ]);
  return q.get('SELECT id FROM admins WHERE username = ?', [username]).id;
}

function login(username, password) {
  const admin = q.get('SELECT * FROM admins WHERE username = ?', [username]);
  if (!admin) return null;
  if (!verifyPassword(password, admin.password_hash)) return null;
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  q.run('INSERT INTO sessions (token, admin_id, created_at, expires_at) VALUES (?, ?, ?, ?)', [
    token,
    admin.id,
    nowIso(),
    expires
  ]);
  q.run("DELETE FROM sessions WHERE expires_at < datetime('now')");
  return { token, admin: { id: admin.id, username: admin.username }, expiresAt: expires };
}

function logout(token) {
  if (token) q.run('DELETE FROM sessions WHERE token = ?', [token]);
}

function sessionFromToken(token) {
  if (!token) return null;
  const row = q.get('SELECT * FROM sessions WHERE token = ?', [token]);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    q.run('DELETE FROM sessions WHERE token = ?', [token]);
    return null;
  }
  const admin = q.get('SELECT id, username FROM admins WHERE id = ?', [row.admin_id]);
  return admin || null;
}

function setPassword(adminId, password) {
  q.run('UPDATE admins SET password_hash = ? WHERE id = ?', [hashPassword(password), adminId]);
  q.run('DELETE FROM sessions WHERE admin_id = ?', [adminId]);
}

function readToken(req) {
  const header = req.headers['authorization'];
  if (header && /^Bearer\s+/i.test(header)) return header.replace(/^Bearer\s+/i, '').trim();
  const cookie = req.headers.cookie;
  if (cookie) {
    const match = /(?:^|;\s*)ur_admin=([a-f0-9]+)/.exec(cookie);
    if (match) return match[1];
  }
  return null;
}

/** Attach req.admin when a valid session token is present. Never throws. */
function attachAdmin(req) {
  try {
    req.admin = sessionFromToken(readToken(req));
  } catch {
    req.admin = null;
  }
  return req.admin;
}

function requireAdmin(req, res) {
  if (!req.admin) {
    res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'Authentication required' }));
    return false;
  }
  return true;
}

module.exports = {
  hashPassword,
  verifyPassword,
  ensureAdmin,
  login,
  logout,
  sessionFromToken,
  setPassword,
  readToken,
  attachAdmin,
  requireAdmin
};
