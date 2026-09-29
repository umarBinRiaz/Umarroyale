'use strict';

/*
 * Product repository — all reads/writes go through here so the storefront,
 * the product pages and the admin panel share one source of truth.
 */

const { q } = require('./db');
const { slugify, uniqueSlug, toInt, toNum, toText, clamp, nowIso } = require('./util');

const GENDERS = ['Men', 'Women', 'Unisex'];
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const PUBLIC_COLUMNS = `id, slug, name, sku, tagline, description, price, sale_price, cost_price,
  stock, category, gender, fragrance_family, concentration, top_notes, heart_notes, base_notes,
  longevity, sillage, ingredients, how_to_use, shipping_info, return_policy, image,
  rating, review_count, is_featured, is_bestseller, is_new_arrival, is_active,
  sort_order, created_at, updated_at`;

const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, cost_price`;

/* ------------------------------------------------------------------ */
/* Shaping                                                             */
/* ------------------------------------------------------------------ */
function listImages(productId) {
  return q
    .all('SELECT url FROM product_images WHERE product_id = ? ORDER BY position, id', [productId])
    .map((r) => r.url);
}

function listSizes(productId) {
  return q.all(
    `SELECT id, label, ml, price, sale_price, stock, position
     FROM product_sizes WHERE product_id = ? ORDER BY position, id`,
    [productId]
  );
}

/** Turn a DB row into the JSON shape the frontend consumes. */
function shape(row, { includeCost = false } = {}) {
  if (!row) return null;
  const images = listImages(row.id);
  const price = toInt(row.price);
  const salePrice = row.sale_price === null || row.sale_price === undefined ? null : toInt(row.sale_price);
  const effective = salePrice !== null && salePrice < price ? salePrice : price;
  const out = {
    id: row.id,
    slug: row.slug,
    url: `/products/${row.slug}`,
    name: row.name,
    sku: row.sku,
    tagline: row.tagline || '',
    description: row.description || '',
    price,
    salePrice,
    effectivePrice: effective,
    discountPercent: salePrice !== null && price > 0 && salePrice < price
      ? Math.round(((price - salePrice) / price) * 100)
      : 0,
    onSale: salePrice !== null && salePrice < price,
    stock: toInt(row.stock),
    inStock: toInt(row.stock) > 0,
    lowStock: toInt(row.stock) > 0 && toInt(row.stock) <= 5,
    category: row.category || '',
    gender: row.gender || 'Unisex',
    fragranceFamily: row.fragrance_family || '',
    concentration: row.concentration || '',
    topNotes: row.top_notes || '',
    heartNotes: row.heart_notes || '',
    baseNotes: row.base_notes || '',
    longevity: row.longevity || '',
    sillage: row.sillage || '',
    ingredients: row.ingredients || '',
    howToUse: row.how_to_use || '',
    shippingInfo: row.shipping_info || '',
    returnPolicy: row.return_policy || '',
    image: row.image || images[0] || '',
    images: images.length ? images : (row.image ? [row.image] : []),
    sizes: listSizes(row.id).map((s) => ({
      id: s.id,
      label: s.label,
      ml: s.ml,
      price: s.price === null ? null : toInt(s.price),
      salePrice: s.sale_price === null ? null : toInt(s.sale_price),
      stock: s.stock === null ? null : toInt(s.stock)
    })),
    rating: Number(row.rating || 0),
    reviewCount: toInt(row.review_count),
    isFeatured: !!row.is_featured,
    isBestseller: !!row.is_bestseller,
    isNewArrival: !!row.is_new_arrival,
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  if (includeCost) out.costPrice = toInt(row.cost_price);
  return out;
}

/** Compact card payload — omits long copy to keep list responses small. */
function shapeCard(row) {
  const full = shape(row);
  return {
    id: full.id,
    slug: full.slug,
    url: full.url,
    name: full.name,
    tagline: full.tagline,
    price: full.price,
    salePrice: full.salePrice,
    effectivePrice: full.effectivePrice,
    discountPercent: full.discountPercent,
    onSale: full.onSale,
    stock: full.stock,
    inStock: full.inStock,
    lowStock: full.lowStock,
    gender: full.gender,
    category: full.category,
    fragranceFamily: full.fragranceFamily,
    concentration: full.concentration,
    image: full.image,
    images: full.images,
    rating: full.rating,
    reviewCount: full.reviewCount,
    isFeatured: full.isFeatured,
    isBestseller: full.isBestseller,
    isNewArrival: full.isNewArrival,
    sizes: full.sizes
  };
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */
function listProducts(opts = {}) {
  const where = [];
  const params = [];

  if (!opts.includeInactive) where.push('is_active = 1');
  if (opts.gender && opts.gender !== 'All') {
    where.push('gender = ?');
    params.push(opts.gender);
  }
  if (opts.family && opts.family !== 'All') {
    where.push('fragrance_family = ?');
    params.push(opts.family);
  }
  if (opts.category && opts.category !== 'All') {
    where.push('category = ?');
    params.push(opts.category);
  }
  if (opts.featured) where.push('is_featured = 1');
  if (opts.bestseller) where.push('is_bestseller = 1');
  if (opts.newArrival) where.push('is_new_arrival = 1');
  if (opts.onSale) where.push('sale_price IS NOT NULL AND sale_price < price');
  if (opts.inStock) where.push('stock > 0');

  if (opts.minPrice !== undefined && opts.minPrice !== null && opts.minPrice !== '') {
    where.push('COALESCE(NULLIF(sale_price, 0), price) >= ?');
    params.push(toInt(opts.minPrice));
  }
  if (opts.maxPrice !== undefined && opts.maxPrice !== null && opts.maxPrice !== '') {
    where.push('COALESCE(NULLIF(sale_price, 0), price) <= ?');
    params.push(toInt(opts.maxPrice));
  }

  if (opts.q) {
    const term = `%${String(opts.q).trim().toLowerCase()}%`;
    where.push(`(
      LOWER(name) LIKE ? OR LOWER(COALESCE(tagline,'')) LIKE ? OR
      LOWER(COALESCE(fragrance_family,'')) LIKE ? OR LOWER(COALESCE(category,'')) LIKE ? OR
      LOWER(COALESCE(gender,'')) LIKE ? OR LOWER(COALESCE(concentration,'')) LIKE ? OR
      LOWER(COALESCE(top_notes,'')) LIKE ? OR LOWER(COALESCE(heart_notes,'')) LIKE ? OR
      LOWER(COALESCE(base_notes,'')) LIKE ? OR LOWER(COALESCE(sku,'')) LIKE ?
    )`);
    params.push(term, term, term, term, term, term, term, term, term, term);
  }

  const sorts = {
    newest: 'created_at DESC, id DESC',
    oldest: 'created_at ASC, id ASC',
    price_asc: 'COALESCE(NULLIF(sale_price,0), price) ASC',
    price_desc: 'COALESCE(NULLIF(sale_price,0), price) DESC',
    rating: 'rating DESC, review_count DESC',
    name: 'name ASC',
    manual: 'sort_order ASC, created_at DESC'
  };
  const orderBy = sorts[opts.sort] || sorts.manual;

  const sql = `SELECT ${PUBLIC_COLUMNS} FROM products
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY ${orderBy}`;
  const rows = q.all(sql, params);
  return opts.detail ? rows.map((r) => shape(r)) : rows.map(shapeCard);
}

function getProductBySlug(slug, { includeInactive = false } = {}) {
  const row = q.get(
    `SELECT ${ADMIN_COLUMNS} FROM products WHERE slug = ? ${includeInactive ? '' : 'AND is_active = 1'}`,
    [slug]
  );
  return row ? shape(row, { includeCost: true }) : null;
}

function getProductById(id, { includeInactive = true } = {}) {
  const row = q.get(
    `SELECT ${ADMIN_COLUMNS} FROM products WHERE id = ? ${includeInactive ? '' : 'AND is_active = 1'}`,
    [id]
  );
  return row ? shape(row, { includeCost: true }) : null;
}

function relatedProducts(product, limit = 8) {
  const rows = q.all(
    `SELECT ${PUBLIC_COLUMNS} FROM products
     WHERE is_active = 1 AND id <> ?
     ORDER BY
       (CASE WHEN fragrance_family = ? AND fragrance_family IS NOT NULL THEN 0
             WHEN gender = ? THEN 1
             WHEN category = ? THEN 2 ELSE 3 END),
       is_bestseller DESC, rating DESC
     LIMIT ?`,
    [product.id, product.fragranceFamily || null, product.gender || null, product.category || null, limit]
  );
  return rows.map(shapeCard);
}

function facets() {
  const distinct = (column) =>
    q.all(`SELECT DISTINCT ${column} AS v FROM products WHERE is_active = 1 AND ${column} IS NOT NULL AND ${column} <> '' ORDER BY v`)
      .map((r) => r.v);

  return {
    genders: GENDERS.filter((g) => q.get('SELECT 1 AS x FROM products WHERE is_active = 1 AND gender = ? LIMIT 1', [g])),
    families: distinct('fragrance_family'),
    categories: distinct('category'),
    concentrations: distinct('concentration'),
    priceRange: q.get(
      `SELECT MIN(COALESCE(NULLIF(sale_price,0), price)) AS min,
              MAX(COALESCE(NULLIF(sale_price,0), price)) AS max
       FROM products WHERE is_active = 1`
    ) || { min: 0, max: 0 }
  };
}

function allSlugs() {
  return q.all('SELECT slug FROM products WHERE is_active = 1').map((r) => r.slug);
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */
function normaliseProductInput(input, existing = null) {
  const price = Math.max(0, toInt(input.price, existing ? existing.price : 0));
  let salePrice = input.salePrice === '' || input.salePrice === undefined || input.salePrice === null
    ? null
    : Math.max(0, toInt(input.salePrice));
  if (salePrice !== null && salePrice >= price && price > 0) salePrice = null;

  return {
    name: toText(input.name, existing ? existing.name : ''),
    slug: uniqueSlugInput(input.slug, input.name, existing),
    sku: toText(input.sku, '') || null,
    tagline: toText(input.tagline, ''),
    description: toText(input.description, ''),
    price,
    sale_price: salePrice,
    cost_price: Math.max(0, toInt(input.costPrice, existing ? toInt(existing.costPrice) : 0)),
    stock: Math.max(0, toInt(input.stock, 0)),
    category: toText(input.category, ''),
    gender: GENDERS.includes(input.gender) ? input.gender : 'Unisex',
    fragrance_family: toText(input.fragranceFamily, ''),
    concentration: toText(input.concentration, ''),
    top_notes: toText(input.topNotes, ''),
    heart_notes: toText(input.heartNotes, ''),
    base_notes: toText(input.baseNotes, ''),
    longevity: toText(input.longevity, ''),
    sillage: toText(input.sillage, ''),
    ingredients: toText(input.ingredients, ''),
    how_to_use: toText(input.howToUse, ''),
    shipping_info: toText(input.shippingInfo, ''),
    return_policy: toText(input.returnPolicy, ''),
    image: toText(input.image, ''),
    is_featured: input.isFeatured ? 1 : 0,
    is_bestseller: input.isBestseller ? 1 : 0,
    is_new_arrival: input.isNewArrival ? 1 : 0,
    is_active: input.isActive === false ? 0 : 1
  };
}

function uniqueSlugInput(slugInput, name, existing) {
  const base = slugify(slugInput || name);
  return uniqueSlug(q, 'products', base, existing ? existing.id : null);
}

function replaceImages(productId, images) {
  q.run('DELETE FROM product_images WHERE product_id = ?', [productId]);
  const list = (Array.isArray(images) ? images : [])
    .map((u) => toText(u, ''))
    .filter(Boolean);
  list.forEach((url, i) => {
    q.run('INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)', [productId, url, i]);
  });
  if (list.length) {
    q.run('UPDATE products SET image = COALESCE(NULLIF(image, \'\'), ?) WHERE id = ?', [list[0], productId]);
  }
}

function replaceSizes(productId, sizes) {
  q.run('DELETE FROM product_sizes WHERE product_id = ?', [productId]);
  const list = Array.isArray(sizes) ? sizes : [];
  list.forEach((size, i) => {
    const label = toText(size.label, '');
    if (!label) return;
    const price = size.price === '' || size.price === undefined || size.price === null ? null : Math.max(0, toInt(size.price));
    let salePrice = size.salePrice === '' || size.salePrice === undefined || size.salePrice === null
      ? null
      : Math.max(0, toInt(size.salePrice));
    if (salePrice !== null && price !== null && salePrice >= price) salePrice = null;
    const ml = toInt(size.ml, parseInt(String(label).replace(/\D+/g, ''), 10) || 0) || null;
    const stock = size.stock === '' || size.stock === undefined || size.stock === null ? null : Math.max(0, toInt(size.stock));
    q.run(
      `INSERT INTO product_sizes (product_id, label, ml, price, sale_price, stock, position)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productId, label, ml, price, salePrice, stock, i]
    );
  });
}

function createProduct(input) {
  const data = normaliseProductInput(input, null);
  if (!data.name) throw Object.assign(new Error('Product name is required'), { status: 400 });
  const ts = nowIso();
  const nextOrder = toInt(q.get('SELECT COALESCE(MAX(sort_order), 0) AS m FROM products').m, 0) + 1;

  return q.tx(() => {
    const res = q.run(
      `INSERT INTO products (slug, name, sku, tagline, description, price, sale_price, cost_price, stock,
        category, gender, fragrance_family, concentration, top_notes, heart_notes, base_notes,
        longevity, sillage, ingredients, how_to_use, shipping_info, return_policy, image,
        is_featured, is_bestseller, is_new_arrival, is_active, sort_order, rating, review_count, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0,0,?,?)`,
      [data.slug, data.name, data.sku, data.tagline, data.description, data.price, data.sale_price,
        data.cost_price, data.stock, data.category, data.gender, data.fragrance_family, data.concentration,
        data.top_notes, data.heart_notes, data.base_notes, data.longevity, data.sillage, data.ingredients,
        data.how_to_use, data.shipping_info, data.return_policy, data.image, data.is_featured,
        data.is_bestseller, data.is_new_arrival, data.is_active, nextOrder, ts, ts]
    );
    const id = Number(res.lastInsertRowid);
    replaceImages(id, input.images);
    replaceSizes(id, input.sizes);
    return getProductById(id);
  });
}

function updateProduct(id, input) {
  const existing = q.get(`SELECT ${ADMIN_COLUMNS} FROM products WHERE id = ?`, [id]);
  if (!existing) return null;
  const data = normaliseProductInput(input, existing);
  if (!data.name) throw Object.assign(new Error('Product name is required'), { status: 400 });

  return q.tx(() => {
    q.run(
      `UPDATE products SET slug=?, name=?, sku=?, tagline=?, description=?, price=?, sale_price=?,
        cost_price=?, stock=?, category=?, gender=?, fragrance_family=?, concentration=?, top_notes=?,
        heart_notes=?, base_notes=?, longevity=?, sillage=?, ingredients=?, how_to_use=?,
        shipping_info=?, return_policy=?, image=?, is_featured=?, is_bestseller=?, is_new_arrival=?,
        is_active=?, updated_at=?
       WHERE id=?`,
      [data.slug, data.name, data.sku, data.tagline, data.description, data.price, data.sale_price,
        data.cost_price, data.stock, data.category, data.gender, data.fragrance_family, data.concentration,
        data.top_notes, data.heart_notes, data.base_notes, data.longevity, data.sillage, data.ingredients,
        data.how_to_use, data.shipping_info, data.return_policy, data.image, data.is_featured,
        data.is_bestseller, data.is_new_arrival, data.is_active, nowIso(), id]
    );
    if (Array.isArray(input.images)) replaceImages(id, input.images);
    if (Array.isArray(input.sizes)) replaceSizes(id, input.sizes);
    return getProductById(id);
  });
}

function deleteProduct(id) {
  return q.run('DELETE FROM products WHERE id = ?', [id]).changes > 0;
}

function adjustStock(id, delta) {
  return q.run(
    'UPDATE products SET stock = MAX(0, stock + ?), updated_at = ? WHERE id = ?',
    [toInt(delta), nowIso(), id]
  ).changes > 0;
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */
function listReviews(productId, { approvedOnly = true } = {}) {
  return q.all(
    `SELECT id, product_id, author, rating, title, body, is_approved, created_at
     FROM reviews WHERE product_id = ? ${approvedOnly ? 'AND is_approved = 1' : ''}
     ORDER BY created_at DESC, id DESC`,
    [productId]
  ).map((r) => ({
    id: r.id,
    productId: r.product_id,
    author: r.author,
    rating: toInt(r.rating),
    title: r.title || '',
    body: r.body || '',
    isApproved: !!r.is_approved,
    createdAt: r.created_at
  }));
}

function recomputeRating(productId) {
  const agg = q.get(
    'SELECT COALESCE(AVG(rating), 0) AS avg, COUNT(*) AS n FROM reviews WHERE product_id = ? AND is_approved = 1',
    [productId]
  );
  const rating = toNum(agg.avg, 0);
  const count = toInt(agg.n, 0);
  q.run('UPDATE products SET rating = ?, review_count = ? WHERE id = ?', [
    Math.round(rating * 10) / 10,
    count,
    productId
  ]);
  return { rating: Math.round(rating * 10) / 10, count };
}

function createReview(productId, input) {
  const product = q.get('SELECT id FROM products WHERE id = ?', [productId]);
  if (!product) return null;
  const rating = clamp(toInt(input.rating, 5), 1, 5);
  const res = q.run(
    `INSERT INTO reviews (product_id, author, rating, title, body, is_approved, created_at)
     VALUES (?,?,?,?,?,?,?)`,
    [productId, toText(input.author, 'Anonymous'), rating, toText(input.title, ''), toText(input.body, ''),
      input.isApproved === false ? 0 : 1, nowIso()]
  );
  recomputeRating(productId);
  return { id: Number(res.lastInsertRowid) };
}

function updateReview(id, patch) {
  const fields = [];
  const params = [];
  if (patch.author !== undefined) { fields.push('author = ?'); params.push(toText(patch.author, 'Anonymous')); }
  if (patch.rating !== undefined) { fields.push('rating = ?'); params.push(clamp(toInt(patch.rating, 5), 1, 5)); }
  if (patch.title !== undefined) { fields.push('title = ?'); params.push(toText(patch.title, '')); }
  if (patch.body !== undefined) { fields.push('body = ?'); params.push(toText(patch.body, '')); }
  if (patch.isApproved !== undefined) { fields.push('is_approved = ?'); params.push(patch.isApproved ? 1 : 0); }
  if (!fields.length) return false;
  const row = q.get('SELECT product_id FROM reviews WHERE id = ?', [id]);
  if (!row) return false;
  params.push(id);
  q.run(`UPDATE reviews SET ${fields.join(', ')} WHERE id = ?`, params);
  recomputeRating(row.product_id);
  return true;
}

function deleteReview(id) {
  const row = q.get('SELECT product_id FROM reviews WHERE id = ?', [id]);
  if (!row) return false;
  q.run('DELETE FROM reviews WHERE id = ?', [id]);
  recomputeRating(row.product_id);
  return true;
}

function listAllReviews({ limit = 200 } = {}) {
  return q.all(
    `SELECT r.id, r.product_id, r.author, r.rating, r.title, r.body, r.is_approved, r.created_at,
            p.name AS product_name, p.slug AS product_slug
     FROM reviews r JOIN products p ON p.id = r.product_id
     ORDER BY r.created_at DESC, r.id DESC LIMIT ?`,
    [toInt(limit, 200)]
  ).map((r) => ({
    id: r.id,
    productId: r.product_id,
    productName: r.product_name,
    productSlug: r.product_slug,
    author: r.author,
    rating: toInt(r.rating),
    title: r.title || '',
    body: r.body || '',
    isApproved: !!r.is_approved,
    createdAt: r.created_at
  }));
}

module.exports = {
  GENDERS,
  ORDER_STATUSES,
  listProducts,
  getProductBySlug,
  getProductById,
  relatedProducts,
  facets,
  allSlugs,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  listReviews,
  listAllReviews,
  createReview,
  updateReview,
  deleteReview,
  recomputeRating,
  shape
};
