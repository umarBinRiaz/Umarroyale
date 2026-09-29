'use strict';

/*
 * Orders + sales reporting.
 * Prices, totals and stock are always recomputed server side from the database
 * so a tampered client cart can never dictate what an order is worth.
 */

const { q, getSetting, setSetting } = require('./db');
const { toInt, toText, nowIso } = require('./util');
const { ORDER_STATUSES } = require('./products');

const PAYMENT_METHODS = {
  cod: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
  easypaisa: 'Easypaisa',
  jazzcash: 'JazzCash'
};

function isValidPayment(method) {
  return Object.prototype.hasOwnProperty.call(PAYMENT_METHODS, method);
}

function shippingFee(subtotal) {
  const freeOver = toInt(getSetting('free_shipping_over', 5000), 5000);
  const flat = toInt(getSetting('shipping_flat_rate', 250), 250);
  if (freeOver > 0 && subtotal >= freeOver) return 0;
  return flat;
}

function discountFor(subtotal, promoCode) {
  const code = toText(promoCode, '').trim().toUpperCase();
  if (!code) return 0;
  const percent = toInt(getSetting('promo_percent', 0), 0);
  if (!percent) return 0;
  if (code !== toText(getSetting('promo_code', ''), '').trim().toUpperCase()) return 0;
  return Math.round((subtotal * percent) / 100);
}

function newOrderCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let attempt = 0; attempt < 12; attempt += 1) {
    let suffix = '';
    for (let i = 0; i < 5; i += 1) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
    const code = `UR-${suffix}`;
    if (!q.get('SELECT 1 AS x FROM orders WHERE order_code = ? LIMIT 1', [code])) return code;
  }
  return `UR-${Date.now().toString(36).toUpperCase()}`;
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */
function createOrder(input) {
  const name = toText(input.customerName || input.name, '');
  const phone = toText(input.phone, '');
  const address = toText(input.address, '');
  const paymentMethod = toText(input.paymentMethod, 'cod');

  const errors = {};
  if (!name) errors.customerName = 'Full name is required';
  if (!/^[0-9+\-\s()]{7,20}$/.test(phone)) errors.phone = 'Enter a valid phone number';
  if (address.length < 8) errors.address = 'Enter your complete address';
  if (!isValidPayment(paymentMethod)) errors.paymentMethod = 'Choose a valid payment method';
  if (!Array.isArray(input.items) || !input.items.length) errors.items = 'Your bag is empty';
  if (Object.keys(errors).length) {
    throw Object.assign(new Error('Please correct the highlighted fields'), { status: 422, fields: errors });
  }

  // Resolve every line against live product data.
  const lines = [];
  for (const raw of input.items) {
    const product = q.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [toInt(raw.productId || raw.id, 0)]);
    if (!product) {
      throw Object.assign(new Error('A fragrance in your bag is no longer available'), { status: 409 });
    }
    const qty = Math.max(1, toInt(raw.qty, 1));

    const sizeRow = raw.sizeId
      ? q.get('SELECT * FROM product_sizes WHERE id = ? AND product_id = ?', [toInt(raw.sizeId, 0), product.id])
      : null;
    const sizeLabel = sizeRow ? sizeRow.label : toText(raw.size, '');

    const available = sizeRow && sizeRow.stock !== null ? toInt(sizeRow.stock) : toInt(product.stock);
    if (available <= 0) {
      throw Object.assign(new Error(`${product.name} is out of stock`), { status: 409 });
    }
    if (qty > available) {
      throw Object.assign(
        new Error(`Only ${available} × ${product.name} left in stock`),
        { status: 409 }
      );
    }

    let unitPrice = toInt(product.price);
    if (sizeRow && sizeRow.price !== null) unitPrice = toInt(sizeRow.price);
    if (product.sale_price !== null && product.sale_price < toInt(product.price)) unitPrice = toInt(product.sale_price);
    if (sizeRow && sizeRow.sale_price !== null && sizeRow.sale_price < unitPrice) unitPrice = toInt(sizeRow.sale_price);

    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      size: sizeLabel,
      image: product.image,
      unitPrice,
      costPrice: toInt(product.cost_price),
      qty,
      available
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const shipping = shippingFee(subtotal);
  const discount = Math.min(subtotal, discountFor(subtotal, input.promoCode));
  const total = Math.max(0, subtotal + shipping - discount);
  const costTotal = lines.reduce((sum, l) => sum + l.costPrice * l.qty, 0);
  const ts = nowIso();
  const orderCode = newOrderCode();

  const orderId = q.tx(() => {
    const res = q.run(
      `INSERT INTO orders (order_code, customer_name, phone, email, address, city, postal_code, notes,
        payment_method, payment_reference, subtotal, shipping, discount, total, cost_total, status, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [orderCode, name, phone, toText(input.email, '') || null, address, toText(input.city, '') || null,
        toText(input.postalCode, '') || null, toText(input.notes, '') || null, paymentMethod,
        toText(input.paymentReference, '') || null, subtotal, shipping, discount, total, costTotal,
        'Pending', ts, ts]
    );
    const id = Number(res.lastInsertRowid);

    for (const line of lines) {
      q.run(
        `INSERT INTO order_items (order_id, product_id, name, slug, sku, size, image, unit_price, cost_price, qty)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, line.productId, line.name, line.slug, line.sku, line.size, line.image, line.unitPrice, line.costPrice, line.qty]
      );
      q.run('UPDATE products SET stock = MAX(0, stock - ?), updated_at = ? WHERE id = ?', [line.qty, ts, line.productId]);
    }
    return id;
  });

  return getOrderById(orderId);
}

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */
function shapeOrder(row, items) {
  return {
    id: row.id,
    orderCode: row.order_code,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email || '',
    address: row.address,
    city: row.city || '',
    postalCode: row.postal_code || '',
    notes: row.notes || '',
    paymentMethod: row.payment_method,
    paymentMethodLabel: PAYMENT_METHODS[row.payment_method] || row.payment_method,
    paymentReference: row.payment_reference || '',
    subtotal: toInt(row.subtotal),
    shipping: toInt(row.shipping),
    discount: toInt(row.discount),
    total: toInt(row.total),
    costTotal: toInt(row.cost_total),
    profit: toInt(row.total) - toInt(row.shipping) - toInt(row.cost_total),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (items || []).map((i) => ({
      id: i.id,
      productId: i.product_id,
      name: i.name,
      slug: i.slug,
      sku: i.sku || '',
      size: i.size || '',
      image: i.image || '',
      unitPrice: toInt(i.unit_price),
      qty: toInt(i.qty),
      lineTotal: toInt(i.unit_price) * toInt(i.qty)
    }))
  };
}

function itemsFor(orderIds) {
  if (!orderIds.length) return new Map();
  const placeholders = orderIds.map(() => '?').join(',');
  const rows = q.all(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds);
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.order_id)) map.set(row.order_id, []);
    map.get(row.order_id).push(row);
  }
  return map;
}

function getOrderById(id) {
  const row = q.get('SELECT * FROM orders WHERE id = ?', [id]);
  if (!row) return null;
  return shapeOrder(row, itemsFor([row.id]).get(row.id) || []);
}

function getOrderByCode(code) {
  const row = q.get('SELECT * FROM orders WHERE order_code = ?', [toText(code, '')]);
  if (!row) return null;
  return shapeOrder(row, itemsFor([row.id]).get(row.id) || []);
}

function listOrders({ status, search, limit = 100, offset = 0 } = {}) {
  const where = [];
  const params = [];
  if (status && status !== 'All' && ORDER_STATUSES.includes(status)) {
    where.push('status = ?');
    params.push(status);
  }
  if (search) {
    const term = `%${toText(search, '').trim()}%`;
    where.push('(order_code LIKE ? OR customer_name LIKE ? OR phone LIKE ?)');
    params.push(term, term, term);
  }
  const sql = `SELECT * FROM orders ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
               ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`;
  const rows = q.all(sql, [...params, toInt(limit, 100), toInt(offset, 0)]);
  const map = itemsFor(rows.map((r) => r.id));
  return rows.map((row) => shapeOrder(row, map.get(row.id) || []));
}

function setStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw Object.assign(new Error('Unknown order status'), { status: 400 });
  }
  const row = q.get('SELECT * FROM orders WHERE id = ?', [id]);
  if (!row) return null;
  const previous = row.status;

  q.tx(() => {
    q.run('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?', [status, nowIso(), id]);
    // Cancelling puts the reserved units back on the shelf; un-cancelling takes them out again.
    if (previous !== 'Cancelled' && status === 'Cancelled') {
      for (const item of q.all('SELECT product_id, qty FROM order_items WHERE order_id = ?', [id])) {
        if (item.product_id) {
          q.run('UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?', [toInt(item.qty), nowIso(), item.product_id]);
        }
      }
    } else if (previous === 'Cancelled' && status !== 'Cancelled') {
      for (const item of q.all('SELECT product_id, qty FROM order_items WHERE order_id = ?', [id])) {
        if (item.product_id) {
          q.run('UPDATE products SET stock = MAX(0, stock - ?), updated_at = ? WHERE id = ?', [toInt(item.qty), nowIso(), item.product_id]);
        }
      }
    }
  });

  return getOrderById(id);
}

function deleteOrder(id) {
  const row = q.get('SELECT status FROM orders WHERE id = ?', [id]);
  if (!row) return false;
  if (row.status !== 'Cancelled') setStatus(id, 'Cancelled');
  return q.run('DELETE FROM orders WHERE id = ?', [id]).changes > 0;
}

/* ------------------------------------------------------------------ */
/* Reporting                                                           */
/* ------------------------------------------------------------------ */
/** Cancelled orders are excluded everywhere so revenue/profit stay honest. */
function dashboard() {
  const revenueRow = q.get(
    `SELECT COALESCE(SUM(total), 0) AS revenue,
            COALESCE(SUM(shipping), 0) AS shipping,
            COALESCE(SUM(cost_total), 0) AS cost,
            COUNT(*) AS orders
     FROM orders WHERE status <> 'Cancelled'`
  ) || {};

  const statusCounts = {};
  for (const status of ORDER_STATUSES) {
    statusCounts[status] = toInt(q.get('SELECT COUNT(*) AS n FROM orders WHERE status = ?', [status]).n);
  }

  const inventory = q.get(
    `SELECT COUNT(*) AS products,
            COALESCE(SUM(stock), 0) AS units,
            COALESCE(SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END), 0) AS low,
            COALESCE(SUM(CASE WHEN stock <= 0 THEN 1 ELSE 0 END), 0) AS out
     FROM products WHERE is_active = 1`
  ) || {};

  const best = q.all(
    `SELECT oi.name, oi.slug, oi.image, SUM(oi.qty) AS units, SUM(oi.qty * oi.unit_price) AS revenue
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE o.status <> 'Cancelled'
     GROUP BY oi.name, oi.slug, oi.image
     ORDER BY units DESC LIMIT 5`
  );

  const trend = q.all(
    `SELECT substr(created_at, 1, 10) AS day,
            COALESCE(SUM(total), 0) AS revenue,
            COALESCE(SUM(cost_total), 0) AS cost,
            COUNT(*) AS orders
     FROM orders WHERE status <> 'Cancelled' AND created_at >= datetime('now', '-29 days')
     GROUP BY day ORDER BY day`
  );

  const revenue = toInt(revenueRow.revenue);
  const shipping = toInt(revenueRow.shipping);
  const cost = toInt(revenueRow.cost);
  const orders = toInt(revenueRow.orders);

  return {
    totals: {
      revenue,
      shipping,
      cost,
      profit: revenue - shipping - cost,
      orders,
      avgOrderValue: orders ? Math.round(revenue / orders) : 0,
      delivered: statusCounts.Delivered,
      pending: statusCounts.Pending
    },
    statusCounts,
    inventory: {
      products: toInt(inventory.products),
      units: toInt(inventory.units),
      lowStock: toInt(inventory.low),
      outOfStock: toInt(inventory.out)
    },
    bestSellers: best.map((b) => ({
      name: b.name,
      slug: b.slug,
      image: b.image,
      units: toInt(b.units),
      revenue: toInt(b.revenue)
    })),
    trend: trend.map((t) => ({
      day: t.day,
      revenue: toInt(t.revenue),
      cost: toInt(t.cost),
      profit: toInt(t.revenue) - toInt(t.cost),
      orders: toInt(t.orders)
    })),
    paymentMethods: Object.entries(PAYMENT_METHODS).map(([key, label]) => ({
      key,
      label,
      orders: toInt(q.get('SELECT COUNT(*) AS n FROM orders WHERE payment_method = ? AND status <> ?', [key, 'Cancelled']).n)
    }))
  };
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */
function publicSettings() {
  return {
    storeName: getSetting('store_name', 'UMAR ROYALE'),
    tagline: getSetting('tagline', 'Haute Parfumerie'),
    email: getSetting('contact_email', 'maison@umarroyale.com'),
    phone: getSetting('contact_phone', '+92 300 0085347'),
    whatsapp: getSetting('whatsapp', '923092230740'),
    address: getSetting('contact_address', 'Studio 4, Shahrah-e-Faisal, Karachi, Pakistan'),
    instagram: getSetting('instagram', 'umarroyale'),
    facebook: getSetting('facebook', ''),
    tiktok: getSetting('tiktok', ''),
    shippingFlatRate: toInt(getSetting('shipping_flat_rate', 250), 250),
    freeShippingOver: toInt(getSetting('free_shipping_over', 5000), 5000),
    currency: getSetting('currency', 'Rs.'),
    codEnabled: getSetting('cod_enabled', '1') === '1',
    bankTransferEnabled: getSetting('bank_transfer_enabled', '1') === '1',
    easypaisaEnabled: getSetting('easypaisa_enabled', '0') === '1',
    jazzcashEnabled: getSetting('jazzcash_enabled', '0') === '1',
    bankName: getSetting('bank_name', ''),
    bankAccountTitle: getSetting('bank_account_title', ''),
    bankAccountNumber: getSetting('bank_account_number', ''),
    easypaisaNumber: getSetting('easypaisa_number', ''),
    jazzcashNumber: getSetting('jazzcash_number', '')
  };
}

function saveSettings(patch) {
  const allowed = [
    'store_name', 'tagline', 'contact_email', 'contact_phone', 'whatsapp', 'contact_address',
    'instagram', 'facebook', 'tiktok', 'shipping_flat_rate', 'free_shipping_over', 'currency',
    'cod_enabled', 'bank_transfer_enabled', 'easypaisa_enabled', 'jazzcash_enabled',
    'bank_name', 'bank_account_title', 'bank_account_number', 'easypaisa_number', 'jazzcash_number'
  ];
  for (const key of allowed) {
    if (patch[key] !== undefined) setSetting(key, patch[key] === null ? '' : String(patch[key]));
  }
  return publicSettings();
}

module.exports = {
  PAYMENT_METHODS,
  createOrder,
  getOrderById,
  getOrderByCode,
  listOrders,
  setStatus,
  deleteOrder,
  dashboard,
  publicSettings,
  saveSettings,
  shippingFee
};
