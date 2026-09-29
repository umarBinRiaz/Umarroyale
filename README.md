# UMAR ROYALE — Haute Parfumerie

A fully static luxury perfume storefront. One file, no server, no build step, no dependencies.

## Structure

```
.
├── index.html   ← the entire site (HTML + CSS + JS + product data)
└── assets/      ← product images (01–05.png), u.png favicon, optional hero.mp4
```

Open `index.html` directly in any browser, or host the folder on GitHub Pages / Netlify / any static CDN.

## Managing products (no admin panel)

Everything lives in one editable array in `index.html`:

1. Open `index.html`, search for `var CATALOG = [`.
2. Each entry is one product:

```js
{
    name: "Black and Silver",
    tagline: "Eau de Parfum",
    description: "…",
    price: 5000,        // 50ml reference price
    salePrice: 4250,    // set null to remove the offer
    stock: 25,          // 0 makes it "Sold Out"
    category: "Signature",   // Signature | Rare | Fresh
    gender: "Men",           // Men | Women | Unisex
    family: "Amber Woody",
    concentration: "Eau de Parfum",
    top: "…", heart: "…", base: "…",
    longevity: "8–10 hours",
    sillage: "Heavy",
    ingredients: "…",
    howToUse: "…",
    image: "assets/01.png",
    images: ["assets/01.png", "assets/02.png"],
    bestseller: true,   // used by Bestsellers + suggestion scoring
    featured: true,
    new: false,          // shows the "New" flag
    reviews: [ { a: "Bilal R.", r: 5, t: "Worth every rupee", b: "…" } ]
}
```

- Sizes (30ml / 50ml / 100ml) are derived automatically from the price above.
- `bestseller: true` and `on sale` items are scored into the **"Complete the Ritual"** suggestion rail inside the bag, so the cart suggests related scents based on what is already in it.

## Site settings

At the top of the script, `var STORE = {…}` holds currency, WhatsApp number, phone, email, address,
shipping rates (`shippingFlat`, `freeShippingOver`) and available payment methods.

## Hero video (optional)

Drop a file named `hero.mp4` into `assets/` and it will play behind the hero. If the file is absent,
the hero falls back to an animated Ken-Burns image sequence — the page always looks alive either way.

## Order flow

- Bag + wishlist persist in the browser's `localStorage`.
- Checkout records the order locally and offers a one-tap **Send to WhatsApp** message with the full
  order summary on the confirmation page.
- No customer data leaves the browser except through the WhatsApp link the customer chooses to open.