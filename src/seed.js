'use strict';

/*
 * Seeds the database from the catalogue that previously lived hard-coded in
 * store.js, so nothing from the live site is lost. Runs only when the products
 * table is empty — safe to call on every boot.
 */

const { q, getSetting, setSetting } = require('./db');
const { slugify, toInt } = require('./util');
const { createProduct, createReview } = require('./products');

/* Every fragrance ships with the same trio of travel/standard sizes.
   `price` on the product is the price of the reference (50ml) size. */
const SIZE_PLAN = [
  { label: '30ml', factor: 0.68 },
  { label: '50ml', factor: 1 },
  { label: '100ml', factor: 1.72 }
];

function buildSizes(price) {
  return SIZE_PLAN.map((size) => ({
    label: size.label,
    ml: parseInt(size.label, 10),
    price: Math.round((price * size.factor) / 10) * 10,
    salePrice: null,
    stock: null
  }));
}

const SHIPPING = 'Dispatched within 24 hours from Karachi. Flat rate Rs. 250 nationwide, free on orders above Rs. 5,000. Cash on Delivery, bank transfer, Easypaisa and JazzCash accepted. Delivery in 2–4 working days.';
const RETURNS = 'Unopened, unused bottles may be returned within 7 days of delivery for a full refund. For hygiene reasons, opened testers and used packaging cannot be accepted. Fragrance batches are hand-filled, so minor variation in fill level may occur.';

/* The eight fragrances carried over from the original store.js catalogue. */
const LEGACY_CATALOGUE = [
  {
    name: 'Black and Silver',
    tagline: 'Eau de Parfum',
    description: 'Smoked oud layered over dark amber and a whisper of leather — a nocturnal masterpiece cut for the hours after midnight.',
    price: 5000,
    salePrice: 4250,
    costPrice: 2450,
    stock: 25,
    category: 'Signature',
    gender: 'Men',
    fragranceFamily: 'Amber Woody',
    concentration: 'Eau de Parfum',
    topNotes: 'Black Pepper, Bergamot, Cardamom',
    heartNotes: 'Smoked Oud, Leather, Rose Absolute',
    baseNotes: 'Dark Amber, Labdanum, Vetiver, Tonka Bean',
    longevity: '8–10 hours',
    sillage: 'Heavy — fills a room',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Coumarin',
    howToUse: 'Spray 15–20cm from the skin onto pulse points — wrists, neck, chest and behind the ears. Avoid rubbing to preserve the top-note progression.',
    images: ['/assets/01.png', '/assets/02.png', '/assets/03.png', '/assets/04.png'],
    image: '/assets/01.png',
    isBestseller: true,
    isFeatured: true,
    reviews: [
      { author: 'Bilal R.', rating: 5, title: 'Worth every rupee', body: 'The oud is smooth rather than sharp, and it lasts well past midnight. Received in two days.' },
      { author: 'Ahmed K.', rating: 5, title: 'My signature now', body: 'Three bottles in. Smells expensive and the longevity is genuinely 8 hours on my skin.' },
      { author: 'Zain M.', rating: 4, title: 'Strong projector', body: 'Beautiful scent but it is loud. Give it a light hand in the office.' }
    ]
  },
  {
    name: 'CK One',
    tagline: 'Extrait de Parfum',
    description: 'Damask rose and warm amber woven into an imperial bouquet of rare French elegance.',
    price: 32000,
    salePrice: null,
    costPrice: 19500,
    stock: 18,
    category: 'Signature',
    gender: 'Unisex',
    fragranceFamily: 'Floral Amber',
    concentration: 'Extrait de Parfum',
    topNotes: 'Bergamot, Pink Pepper, Green Notes',
    heartNotes: 'Damask Rose, Jasmine Sambac, Orris',
    baseNotes: 'Amber, Sandalwood, White Musk, Vanilla',
    longevity: '10–12 hours',
    sillage: 'Moderate to heavy',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Benzyl Salicylate, Limonene, Linalool',
    howToUse: 'Apply to the collarbone and behind the knees. An extrait needs only two or three sprays — it develops for hours.',
    images: ['/assets/05.png', '/assets/02.png', '/assets/03.png'],
    image: '/assets/05.png',
    isBestseller: true,
    isFeatured: true,
    reviews: [
      { author: 'Fahad T.', rating: 5, title: 'Elegant', body: 'Proper extrait strength. My partner borrowed it and bought her own bottle.' },
      { author: 'Sana L.', rating: 5, title: 'Beautiful', body: 'The rose is the real thing, not synthetic. Beautiful on women too.' }
    ]
  },
  {
    name: 'Cool Water',
    tagline: 'Eau de Toilette',
    description: 'A crisp, airy eau de toilette kissed with bergamot, musk and cool silver florals.',
    price: 15000,
    salePrice: 12750,
    costPrice: 8200,
    stock: 40,
    category: 'Fresh',
    gender: 'Men',
    fragranceFamily: 'Aromatic Fresh',
    concentration: 'Eau de Toilette',
    topNotes: 'Bergamot, Lemon, Mint, Sea Breeze',
    heartNotes: 'Lavender, Water Lily, Rosemary',
    baseNotes: 'Amber, Musk, Sandalwood',
    longevity: '4–6 hours',
    sillage: 'Light to moderate',
    ingredients: 'Alcohol Denat., Aqua, Parfum (Fragrance), Limonene, Linalool, Butylphenyl Methylpropional',
    howToUse: 'Spray generously after a shower. Best suited to daytime and warmer months; reapply mid-afternoon.',
    images: ['/assets/03.png', '/assets/04.png', '/assets/01.png'],
    image: '/assets/03.png',
    isBestseller: false,
    isFeatured: true,
    reviews: [
      { author: 'Usman S.', rating: 4, title: 'Great everyday scent', body: 'Clean and easy. Lasts about four hours in Karachi heat, which is fair for an EDT.' },
      { author: 'Hamza A.', rating: 4, title: 'Perfect for office', body: 'Nobody minds when you wear this. Very professional.' }
    ]
  },
  {
    name: 'White Oud',
    tagline: 'Oud',
    description: 'Sun-drenched amber, saffron and vanilla — the warmth of a desert dusk in a single flacon.',
    price: 27000,
    salePrice: null,
    costPrice: 16000,
    stock: 15,
    category: 'Signature',
    gender: 'Unisex',
    fragranceFamily: 'Amber Woody',
    concentration: 'Extrait de Parfum',
    topNotes: 'Saffron, Cardamom, Bergamot',
    heartNotes: 'White Oud, Taif Rose, Frankincense',
    baseNotes: 'Amber, Vanilla, Sandalwood, Benzoin',
    longevity: '10+ hours',
    sillage: 'Heavy',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Benzyl Benzoate, Limonene, Coumarin, Linalool',
    howToUse: 'Two sprays on the chest and one behind each ear. The white oud reads sweet in the opening and woody for hours.',
    images: ['/assets/02.png', '/assets/01.png', '/assets/05.png'],
    image: '/assets/02.png',
    isBestseller: true,
    isFeatured: true,
    reviews: [
      { author: 'Imran S.', rating: 5, title: 'Incredible', body: 'The most wearable oud I have tried. Sweet but not a dessert scent.' },
      { author: 'Kiran A.', rating: 5, title: 'Unisex indeed', body: 'My husband and I share this bottle. It genuinely is not gendered.' },
      { author: 'Talha N.', rating: 5, title: 'Gift that landed', body: 'Bought this as a gift and ended up ordering two more.' }
    ]
  },
  {
    name: 'Aventus Absolu',
    tagline: 'Eau de Parfum',
    description: 'Velvety amber fused with tonka and incense — a soft, persistent trail of pure warmth.',
    price: 18500,
    salePrice: null,
    costPrice: 10800,
    stock: 32,
    category: 'Signature',
    gender: 'Men',
    fragranceFamily: 'Amber Woody',
    concentration: 'Eau de Parfum',
    topNotes: 'Pineapple, Birch, Bergamot',
    heartNotes: 'Ambergris, Jasmine, Incense',
    baseNotes: 'Amber, Tonka Bean, Oakmoss, Musk',
    longevity: '7–9 hours',
    sillage: 'Moderate to heavy',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Alpha-Isomethyl Ionone',
    howToUse: 'Spray at the collar and forearms. The pineapple note fades after 20 minutes, leaving a warm amber trail.',
    images: ['/assets/04.png', '/assets/05.png', '/assets/02.png'],
    image: '/assets/04.png',
    isBestseller: false,
    isFeatured: true,
    reviews: [
      { author: 'Danish A.', rating: 4, title: 'Smoky and warm', body: 'Great winter scent. A little sweet for me but well made.' }
    ]
  },
  {
    name: 'Nishane Hacivat',
    tagline: 'Perfume Oil',
    description: 'Hand-harvested Taif roses deepened with black agarwood — romantic, mysterious, rare.',
    price: 15000,
    salePrice: null,
    costPrice: 8900,
    stock: 30,
    category: 'Rare',
    gender: 'Unisex',
    fragranceFamily: 'Floral Woody',
    concentration: 'Perfume Oil',
    topNotes: 'Green Fig, Taif Rose, Saffron',
    heartNotes: 'Black Agarwood, Patchouli, Rose Absolute',
    baseNotes: 'Amber, Benzoin, Sandalwood',
    longevity: '12+ hours',
    sillage: 'Moderate — a close trail',
    ingredients: 'Perfume Oil Base, Parfum (Fragrance), Natural Essential Oils',
    howToUse: 'Apply one drop to the pulse points and rub gently. Oils sit closer to the skin than spray, so use less than you think.',
    images: ['/assets/01.png', '/assets/03.png', '/assets/05.png'],
    image: '/assets/01.png',
    isBestseller: false,
    isFeatured: true,
    reviews: [
      { author: 'Hina R.', rating: 5, title: 'Magnetic', body: 'The Taif rose is the real deal. Small bottle, serious presence.' }
    ]
  },
  {
    name: 'Office for Men',
    tagline: 'Perfume Oil',
    description: 'A crisp, confident office scent with notes of bergamot, lavender and clean musk.',
    price: 17500,
    salePrice: 14900,
    costPrice: 9600,
    stock: 40,
    category: 'Fresh',
    gender: 'Men',
    fragranceFamily: 'Aromatic Fresh',
    concentration: 'Perfume Oil',
    topNotes: 'Bergamot, Grapefruit, Peppermint',
    heartNotes: 'Lavender, Geranium, Cypress',
    baseNotes: 'White Musk, Cedar, Vetiver',
    longevity: '6–8 hours',
    sillage: 'Light — office appropriate',
    ingredients: 'Perfume Oil Base, Parfum (Fragrance), Natural Essential Oils',
    howToUse: 'One drop behind the ears at the start of the day. It stays close to the skin and never enters a conversation.',
    images: ['/assets/05.png', '/assets/04.png', '/assets/01.png'],
    image: '/assets/05.png',
    isBestseller: true,
    isFeatured: false,
    reviews: [
      { author: 'Waqar H.', rating: 5, title: 'Exactly what I needed', body: 'Client-facing job, needed something that lasts but never overpowers. This nails it.' },
      { author: 'Adnan B.', rating: 4, title: 'Clean and light', body: 'Not a scent you will remember in a week, but that is the point at work.' }
    ]
  },
  {
    name: 'Locatose White',
    tagline: 'Perfume Oil · 50ml',
    description: 'A fresh, clean fragrance with notes of white flowers and a hint of vanilla.',
    price: 18000,
    salePrice: null,
    costPrice: 10200,
    stock: 40,
    category: 'Fresh',
    gender: 'Women',
    fragranceFamily: 'Floral Fresh',
    concentration: 'Perfume Oil',
    topNotes: 'Bergamot, Green Tea, Pear',
    heartNotes: 'White Peony, Jasmine, Lily of the Valley',
    baseNotes: 'White Musk, Vanilla, Soft Woods',
    longevity: '6–8 hours',
    sillage: 'Light to moderate',
    ingredients: 'Perfume Oil Base, Parfum (Fragrance), Natural Essential Oils',
    howToUse: 'Apply to the wrists and the base of the throat. Best over moisturiser, which holds the notes longer.',
    images: ['/assets/03.png', '/assets/05.png', '/assets/02.png'],
    image: '/assets/03.png',
    isBestseller: false,
    isFeatured: false,
    reviews: [
      { author: 'Mariam D.', rating: 5, title: 'My daily scent', body: 'Clean, feminine, not overpowering. I have repurchased twice.' }
    ]
  },

  /* Added so the Men / Women / Unisex categories and the offers rail have real depth. */
  {
    name: 'Rosewood Dusk',
    tagline: 'Eau de Parfum',
    description: 'Australian rosewood laid over cool cedar and a soft amber — a composed, modern evening scent.',
    price: 19500,
    salePrice: 15500,
    costPrice: 11200,
    stock: 22,
    category: 'Rare',
    gender: 'Unisex',
    fragranceFamily: 'Woody Amber',
    concentration: 'Eau de Parfum',
    topNotes: 'Pink Pepper, Mandarin, Aldehydes',
    heartNotes: 'Rosewood, Cedar, Iris',
    baseNotes: 'Amber, Vetiver, Cashmere Wood',
    longevity: '7–9 hours',
    sillage: 'Moderate',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Alpha-Isomethyl Ionone',
    howToUse: 'Two sprays to the chest and one to each wrist. A little on the forearms keeps the cedar note present.',
    images: ['/assets/04.png', '/assets/01.png', '/assets/03.png'],
    image: '/assets/04.png',
    isBestseller: true,
    isNewArrival: true,
    isFeatured: true,
    reviews: [
      { author: 'Naveen P.', rating: 5, title: 'Modern and expensive-smelling', body: 'The cedar is beautiful. Best thing I have bought this year.' },
      { author: 'Areeba J.', rating: 4, title: 'Very versatile', body: 'My husband wears it more than I do. The amber is subtle, not sweet.' },
      { author: 'Farhan I.', rating: 5, title: 'Great value at this price', body: 'Beats several designer bottles I have tried.' }
    ]
  },
  {
    name: 'Velvet Noir',
    tagline: 'Extrait de Parfum',
    description: 'Black plum, leather and smoked vanilla. Restrained darkness with a velvet finish.',
    price: 27500,
    salePrice: null,
    costPrice: 16200,
    stock: 14,
    category: 'Rare',
    gender: 'Men',
    fragranceFamily: 'Leather Oriental',
    concentration: 'Extrait de Parfum',
    topNotes: 'Black Plum, Pink Pepper, Violet Leaf',
    heartNotes: 'Leather, Osmanthus, Incense',
    baseNotes: 'Smoked Vanilla, Labdanum, Benzoin, Ambrette',
    longevity: '10–12 hours',
    sillage: 'Heavy',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Benzyl Salicylate, Coumarin, Linalool',
    howToUse: 'Two sprays only. Extraits are dense — start light and let the wearer come to you.',
    images: ['/assets/02.png', '/assets/05.png', '/assets/04.png'],
    image: '/assets/02.png',
    isBestseller: true,
    isNewArrival: true,
    isFeatured: false,
    reviews: [
      { author: 'Shahid M.', rating: 5, title: 'Restrained darkness', body: 'Exactly the description. Smells expensive without being a room stealer.' }
    ]
  },
  {
    name: 'Oud Royale',
    tagline: 'Eau de Parfum',
    description: 'Cambodian oud wrapped in rose and saffron — the house signature, rebalanced for daily wear.',
    price: 22000,
    salePrice: null,
    costPrice: 12800,
    stock: 26,
    category: 'Signature',
    gender: 'Men',
    fragranceFamily: 'Amber Woody',
    concentration: 'Eau de Parfum',
    topNotes: 'Saffron, Thyme, Bergamot',
    heartNotes: 'Cambodian Oud, Taif Rose, Geranium',
    baseNotes: 'Amber, Sandalwood, Musk, Vanilla',
    longevity: '8–10 hours',
    sillage: 'Heavy',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Coumarin',
    howToUse: 'Spray onto the chest, neck and behind the ears. For office use, one spray on the forearms is enough.',
    images: ['/assets/01.png', '/assets/04.png', '/assets/02.png'],
    image: '/assets/01.png',
    isBestseller: true,
    isNewArrival: true,
    isFeatured: true,
    reviews: [
      { author: 'Omar Z.', rating: 5, title: 'The house scent', body: 'Proper oud without the barnyard. This is the one I recommend to friends.' },
      { author: 'Raheel N.', rating: 5, title: 'Beautiful sillage', body: 'Received compliments every single time I wear it.' },
      { author: 'Bilal A.', rating: 4, title: 'Strong', body: 'Gorgeous but genuinely loud. Four sprays is plenty.' }
    ]
  },
  {
    name: 'Amber Silk',
    tagline: 'Eau de Parfum',
    description: 'Golden amber, sandalwood and a whisper of vanilla — soft, enveloping, quietly addictive.',
    price: 16500,
    salePrice: 13500,
    costPrice: 9400,
    stock: 34,
    category: 'Fresh',
    gender: 'Women',
    fragranceFamily: 'Amber Floral',
    concentration: 'Eau de Parfum',
    topNotes: 'Pear, Bergamot, Orange Blossom',
    heartNotes: 'Jasmine, Tuberose, Sandalwood',
    baseNotes: 'Amber, Vanilla, Cashmere Musk',
    longevity: '7–8 hours',
    sillage: 'Moderate',
    ingredients: 'Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Benzyl Benzoate',
    howToUse: 'Spray at the collarbone and behind the knees. Over a moisturiser it will hold beautifully through the day.',
    images: ['/assets/05.png', '/assets/03.png', '/assets/01.png'],
    image: '/assets/05.png',
    isBestseller: true,
    isNewArrival: true,
    isFeatured: true,
    reviews: [
      { author: 'Sadia R.', rating: 5, title: 'Beautiful and soft', body: 'Warm without being heavy. Perfect for a winter wedding.' },
      { author: 'Zainab M.', rating: 5, title: 'My signature', body: 'The vanilla is subtle, not synthetic. I get compliments every time.' },
      { author: 'Ayesha K.', rating: 4, title: 'Lovely', body: 'Great scent, packaging arrived safely and well packed.' }
    ]
  }
];

const DEFAULT_SETTINGS = {
  store_name: 'UMAR ROYALE',
  tagline: 'Haute Parfumerie',
  contact_email: 'maison@umarroyale.com',
  contact_phone: '+92 300 0085347',
  whatsapp: '923092230740',
  contact_address: 'Studio 4, Shahrah-e-Faisal, Karachi, Pakistan',
  instagram: 'umarroyale',
  facebook: '',
  tiktok: '',
  currency: 'Rs.',
  shipping_flat_rate: '250',
  free_shipping_over: '5000',
  cod_enabled: '1',
  bank_transfer_enabled: '1',
  easypaisa_enabled: '0',
  jazzcash_enabled: '0',
  bank_name: 'Bank Alfalah — Karachi Main Branch',
  bank_account_title: 'Umar Royale',
  bank_account_number: '0102 7654 3210',
  easypaisa_number: '',
  jazzcash_number: ''
};

function seed() {
  // Settings are always topped up so a fresh clone matches production.
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (getSetting(key) === null) setSetting(key, value);
  }

  const existing = toInt(q.get('SELECT COUNT(*) AS n FROM products').n);
  if (existing > 0) return { seeded: false, products: existing };

  let created = 0;
  LEGACY_CATALOGUE.forEach((item, index) => {
    const product = createProduct({
      name: item.name,
      slug: slugify(item.name),
      sku: `UR-${String(index + 1).padStart(4, '0')}`,
      tagline: item.tagline,
      description: item.description,
      price: item.price,
      salePrice: item.salePrice,
      costPrice: item.costPrice,
      stock: item.stock,
      category: item.category,
      gender: item.gender,
      fragranceFamily: item.fragranceFamily,
      concentration: item.concentration,
      topNotes: item.topNotes,
      heartNotes: item.heartNotes,
      baseNotes: item.baseNotes,
      longevity: item.longevity,
      sillage: item.sillage,
      ingredients: item.ingredients,
      howToUse: item.howToUse,
      shippingInfo: SHIPPING,
      returnPolicy: RETURNS,
      image: item.image,
      images: item.images,
      sizes: buildSizes(item.price),
      isFeatured: !!item.isFeatured,
      isBestseller: !!item.isBestseller,
      isNewArrival: !!item.isNewArrival,
      isActive: true
    });
    (item.reviews || []).forEach((review) => createReview(product.id, review));
    created += 1;
  });

  return { seeded: true, products: created };
}

module.exports = { seed, DEFAULT_SETTINGS, LEGACY_CATALOGUE };
