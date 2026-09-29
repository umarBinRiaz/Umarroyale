'use strict';

/*
 * Database layer — built on Node's bundled `node:sqlite` (no npm dependencies).
 * Owns schema creation, migrations and small query helpers.
 */

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const { bindAll, nowIso } = require('./util');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'umar-royale.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT
);

CREATE TABLE IF NOT EXISTS admins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  admin_id   INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  sku              TEXT UNIQUE,
  tagline          TEXT,
  description      TEXT,
  price            INTEGER NOT NULL DEFAULT 0,
  sale_price       INTEGER,
  cost_price       INTEGER NOT NULL DEFAULT 0,
  stock            INTEGER NOT NULL DEFAULT 0,
  category         TEXT,
  gender           TEXT,
  fragrance_family TEXT,
  concentration    TEXT,
  top_notes        TEXT,
  heart_notes      TEXT,
  base_notes       TEXT,
  longevity        TEXT,
  sillage          TEXT,
  ingredients      TEXT,
  how_to_use       TEXT,
  shipping_info    TEXT,
  return_policy    TEXT,
  image            TEXT,
  rating           REAL NOT NULL DEFAULT 0,
  review_count     INTEGER NOT NULL DEFAULT 0,
  is_featured      INTEGER NOT NULL DEFAULT 0,
  is_bestseller    INTEGER NOT NULL DEFAULT 0,
  is_new_arrival   INTEGER NOT NULL DEFAULT 0,
  is_active        INTEGER NOT NULL DEFAULT 1,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  ml         INTEGER,
  price      INTEGER,
  sale_price INTEGER,
  stock      INTEGER,
  position   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author     TEXT NOT NULL,
  rating     INTEGER NOT NULL,
  title      TEXT,
  body       TEXT,
  is_approved INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_code        TEXT UNIQUE NOT NULL,
  customer_name     TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  address           TEXT NOT NULL,
  city              TEXT,
  postal_code       TEXT,
  notes             TEXT,
  payment_method    TEXT NOT NULL,
  payment_reference TEXT,
  subtotal          INTEGER NOT NULL DEFAULT 0,
  shipping          INTEGER NOT NULL DEFAULT 0,
  discount          INTEGER NOT NULL DEFAULT 0,
  total             INTEGER NOT NULL DEFAULT 0,
  cost_total        INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'Pending',
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER,
  name        TEXT NOT NULL,
  slug        TEXT,
  sku         TEXT,
  size        TEXT,
  image       TEXT,
  unit_price  INTEGER NOT NULL DEFAULT 0,
  cost_price  INTEGER NOT NULL DEFAULT 0,
  qty         INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_images_product    ON product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_sizes_product     ON product_sizes(product_id, position);
CREATE INDEX IF NOT EXISTS idx_reviews_product   ON reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_items_order       ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
`;

db.exec(SCHEMA);

/* ------------------------------------------------------------------ */
/* Query helpers                                                       */
/* ------------------------------------------------------------------ */
const q = {
  all(sql, params = []) {
    return db.prepare(sql).all(...bindAll(params));
  },
  get(sql, params = []) {
    return db.prepare(sql).get(...bindAll(params)) || null;
  },
  run(sql, params = []) {
    return db.prepare(sql).run(...bindAll(params));
  },
  /** Synchronous transaction helper. */
  tx(fn) {
    db.exec('BEGIN');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (err) {
      try { db.exec('ROLLBACK'); } catch { /* already rolled back */ }
      throw err;
    }
  }
};

function getSetting(key, fallback = null) {
  const row = q.get('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : fallback;
}

function setSetting(key, value) {
  q.run(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value === null || value === undefined ? null : String(value)]
  );
}

function allSettings() {
  const out = {};
  for (const row of q.all('SELECT key, value FROM settings')) out[row.key] = row.value;
  return out;
}

function tableExists(name) {
  return !!q.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [name]);
}

function touchUpdatedAt(table, id) {
  q.run(`UPDATE ${table} SET updated_at = ? WHERE id = ?`, [nowIso(), id]);
}

module.exports = { db, q, getSetting, setSetting, allSettings, tableExists, touchUpdatedAt, DB_PATH, DATA_DIR };
