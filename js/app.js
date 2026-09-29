
        (function () {
            "use strict";

            /* ==========================================================
               1. STORE SETTINGS â€” edit here
               ========================================================== */
            var STORE = {
                name: "UMAR ROYALE",
                currency: "Rs.",
                email: "maison@umarroyale.com",
                phone: "+92 309 2230740",
                address: "E-Store",
                whatsapp: "923092230740",
                instagram: "https://instagram.com/umar.royale",
                shippingFlat: 250,
                freeShippingOver: 5000,
                payments: [
                    { id: "cod", label: "Cash on Delivery", note: "Pay the courier when your parcel arrives.", enabled: true },
                    // { id: "bank", label: "Bank Transfer â€” Advance", note: "Bank Alfalah â€” Karachi Main Â· 0102 7654 3210 Â· Umar Royale", enabled: true },
                    { id: "easypaisa/jazzcash", label: "Easypaisa â€” Advance", note: "Send to 0300-0085347 and enter the transaction ID.", enabled: true }
                ]
            };

            /* Delivered in these three sizes. Price is set on the 50ml
               reference and the rest scale automatically. */
            var SIZE_PLAN = [
                { label: "30ml", factor: 0.68 },
                { label: "50ml", factor: 1 },
                { label: "100ml", factor: 1.72 }
            ];

            /* ==========================================================
               2. CATALOGUE â€” this is the whole product list.
                  Add / edit / remove products here. No admin panel needed.
               ========================================================== */
            var CATALOG = [
                {
                    name: "Black and Silver",
                    tagline: "Eau de Parfum",
                    description: "Smoked oud layered over dark amber and a whisper of leather â€” a nocturnal masterpiece cut for the hours after midnight.",
                    price: 5000, salePrice: 4250, stock: 25,
                    category: "Signature", gender: "Men", family: "Amber Woody", concentration: "Eau de Parfum",
                    top: "Black Pepper, Bergamot, Cardamom",
                    heart: "Smoked Oud, Leather, Rose Absolute",
                    base: "Dark Amber, Labdanum, Vetiver, Tonka Bean",
                    longevity: "8â€“10 hours", sillage: "Heavy â€” fills a room",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Coumarin",
                    howToUse: "Spray 15â€“20cm from the skin onto pulse points â€” wrists, neck, chest and behind the ears. Avoid rubbing to preserve the top-note progression.",
                    image: "assets/01.png", images: ["assets/01.png", "assets/02.png", "assets/03.png", "assets/04.png"],
                    bestseller: true, featured: true, new: false,
                    reviews: [
                        { a: "Bilal R.", r: 5, t: "Worth every rupee", b: "The oud is smooth rather than sharp, and it lasts well past midnight. Received in two days." },
                        { a: "Ahmed K.", r: 5, t: "My signature now", b: "Three bottles in. Smells expensive and the longevity is genuinely 8 hours on my skin." },
                        { a: "Zain M.", r: 4, t: "Strong projector", b: "Beautiful scent but it is loud. Give it a light hand in the office." }
                    ]
                },
                {
                    name: "CK One",
                    tagline: "Extrait de Parfum",
                    description: "Damask rose and warm amber woven into an imperial bouquet of rare French elegance.",
                    price: 32000, salePrice: null, stock: 18,
                    category: "Signature", gender: "Unisex", family: "Floral Amber", concentration: "Extrait de Parfum",
                    top: "Bergamot, Pink Pepper, Green Notes",
                    heart: "Damask Rose, Jasmine Sambac, Orris",
                    base: "Amber, Sandalwood, White Musk, Vanilla",
                    longevity: "10â€“12 hours", sillage: "Moderate to heavy",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Benzyl Salicylate, Limonene, Linalool",
                    howToUse: "Apply to the collarbone and behind the knees. An extrait needs only two or three sprays â€” it develops for hours.",
                    image: "assets/05.png", images: ["assets/05.png", "assets/02.png", "assets/03.png"],
                    bestseller: true, featured: true, new: false,
                    reviews: [
                        { a: "Fahad T.", r: 5, t: "Elegant", b: "Proper extrait strength. My partner borrowed it and bought her own bottle." },
                        { a: "Sana L.", r: 5, t: "Beautiful", b: "The rose is the real thing, not synthetic. Beautiful on women too." }
                    ]
                },
                {
                    name: "Cool Water",
                    tagline: "Eau de Toilette",
                    description: "A crisp, airy eau de toilette kissed with bergamot, musk and cool silver florals.",
                    price: 15000, salePrice: 12750, stock: 40,
                    category: "Fresh", gender: "Men", family: "Aromatic Fresh", concentration: "Eau de Toilette",
                    top: "Bergamot, Lemon, Mint, Sea Breeze",
                    heart: "Lavender, Water Lily, Rosemary",
                    base: "Amber, Musk, Sandalwood",
                    longevity: "4â€“6 hours", sillage: "Light to moderate",
                    ingredients: "Alcohol Denat., Aqua, Parfum (Fragrance), Limonene, Linalool, Butylphenyl Methylpropional",
                    howToUse: "Spray generously after a shower. Best suited to daytime and warmer months; reapply mid-afternoon.",
                    image: "assets/03.png", images: ["assets/03.png", "assets/04.png", "assets/01.png"],
                    bestseller: false, featured: true, new: false,
                    reviews: [
                        { a: "Usman S.", r: 4, t: "Great everyday scent", b: "Clean and easy. Lasts about four hours in Karachi heat, which is fair for an EDT." },
                        { a: "Hamza A.", r: 4, t: "Perfect for office", b: "Nobody minds when you wear this. Very professional." }
                    ]
                },
                {
                    name: "White Oud",
                    tagline: "Oud",
                    description: "Sun-drenched amber, saffron and vanilla â€” the warmth of a desert dusk in a single flacon.",
                    price: 27000, salePrice: null, stock: 15,
                    category: "Signature", gender: "Unisex", family: "Amber Woody", concentration: "Extrait de Parfum",
                    top: "Saffron, Cardamom, Bergamot",
                    heart: "White Oud, Taif Rose, Frankincense",
                    base: "Amber, Vanilla, Sandalwood, Benzoin",
                    longevity: "10+ hours", sillage: "Heavy",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Benzyl Benzoate, Limonene, Coumarin, Linalool",
                    howToUse: "Two sprays on the chest and one behind each ear. The white oud reads sweet in the opening and woody for hours.",
                    image: "assets/02.png", images: ["assets/02.png", "assets/01.png", "assets/05.png"],
                    bestseller: true, featured: true, new: false,
                    reviews: [
                        { a: "Imran S.", r: 5, t: "Incredible", b: "The most wearable oud I have tried. Sweet but not a dessert scent." },
                        { a: "Kiran A.", r: 5, t: "Unisex indeed", b: "My husband and I share this bottle. It genuinely is not gendered." },
                        { a: "Talha N.", r: 5, t: "Gift that landed", b: "Bought this as a gift and ended up ordering two more." }
                    ]
                },
                {
                    name: "Aventus Absolu",
                    tagline: "Eau de Parfum",
                    description: "Velvety amber fused with tonka and incense â€” a soft, persistent trail of pure warmth.",
                    price: 18500, salePrice: null, stock: 32,
                    category: "Signature", gender: "Men", family: "Amber Woody", concentration: "Eau de Parfum",
                    top: "Pineapple, Birch, Bergamot",
                    heart: "Ambergris, Jasmine, Incense",
                    base: "Amber, Tonka Bean, Oakmoss, Musk",
                    longevity: "7â€“9 hours", sillage: "Moderate to heavy",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Alpha-Isomethyl Ionone",
                    howToUse: "Spray at the collar and forearms. The pineapple note fades after 20 minutes, leaving a warm amber trail.",
                    image: "assets/04.png", images: ["assets/04.png", "assets/05.png", "assets/02.png"],
                    bestseller: false, featured: true, new: false,
                    reviews: [{ a: "Danish A.", r: 4, t: "Smoky and warm", b: "Great winter scent. A little sweet for me but well made." }]
                },
                {
                    name: "Nishane Hacivat",
                    tagline: "Perfume Oil",
                    description: "Hand-harvested Taif roses deepened with black agarwood â€” romantic, mysterious, rare.",
                    price: 15000, salePrice: null, stock: 30,
                    category: "Rare", gender: "Unisex", family: "Floral Woody", concentration: "Perfume Oil",
                    top: "Green Fig, Taif Rose, Saffron",
                    heart: "Black Agarwood, Patchouli, Rose Absolute",
                    base: "Amber, Benzoin, Sandalwood",
                    longevity: "12+ hours", sillage: "Moderate â€” a close trail",
                    ingredients: "Perfume Oil Base, Parfum (Fragrance), Natural Essential Oils",
                    howToUse: "Apply one drop to the pulse points and rub gently. Oils sit closer to the skin than spray, so use less than you think.",
                    image: "assets/01.png", images: ["assets/01.png", "assets/03.png", "assets/05.png"],
                    bestseller: false, featured: true, new: false,
                    reviews: [{ a: "Hina R.", r: 5, t: "Magnetic", b: "The Taif rose is the real deal. Small bottle, serious presence." }]
                },
                {
                    name: "Office for Men",
                    tagline: "Perfume Oil",
                    description: "A crisp, confident office scent with notes of bergamot, lavender and clean musk.",
                    price: 17500, salePrice: 14900, stock: 40,
                    category: "Fresh", gender: "Men", family: "Aromatic Fresh", concentration: "Perfume Oil",
                    top: "Bergamot, Grapefruit, Peppermint",
                    heart: "Lavender, Geranium, Cypress",
                    base: "White Musk, Cedar, Vetiver",
                    longevity: "6â€“8 hours", sillage: "Light â€” office appropriate",
                    ingredients: "Perfume Oil Base, Parfum (Fragrance), Natural Essential Oils",
                    howToUse: "One drop behind the ears at the start of the day. It stays close to the skin and never enters a conversation.",
                    image: "assets/05.png", images: ["assets/05.png", "assets/04.png", "assets/01.png"],
                    bestseller: true, featured: false, new: false,
                    reviews: [
                        { a: "Waqar H.", r: 5, t: "Exactly what I needed", b: "Client-facing job, needed something that lasts but never overpowers. This nails it." },
                        { a: "Adnan B.", r: 4, t: "Clean and light", b: "Not a scent you will remember in a week, but that is the point at work." }
                    ]
                },
                {
                    name: "Locatose White",
                    tagline: "Perfume Oil",
                    description: "A fresh, clean fragrance with notes of white flowers and a hint of vanilla.",
                    price: 18000, salePrice: null, stock: 40,
                    category: "Fresh", gender: "Women", family: "Floral Fresh", concentration: "Perfume Oil",
                    top: "Bergamot, Green Tea, Pear",
                    heart: "White Peony, Jasmine, Lily of the Valley",
                    base: "White Musk, Vanilla, Soft Woods",
                    longevity: "6â€“8 hours", sillage: "Light to moderate",
                    ingredients: "Perfume Oil Base, Parfum (Fragrance), Natural Essential Oils",
                    howToUse: "Apply to the wrists and the base of the throat. Best over moisturiser, which holds the notes longer.",
                    image: "assets/03.png", images: ["assets/03.png", "assets/05.png", "assets/02.png"],
                    bestseller: false, featured: false, new: false,
                    reviews: [{ a: "Mariam D.", r: 5, t: "My daily scent", b: "Clean, feminine, not overpowering. I have repurchased twice." }]
                },
                {
                    name: "Rosewood Dusk",
                    tagline: "Eau de Parfum",
                    description: "Australian rosewood laid over cool cedar and a soft amber â€” a composed, modern evening scent.",
                    price: 19500, salePrice: 15500, stock: 22,
                    category: "Rare", gender: "Unisex", family: "Woody Amber", concentration: "Eau de Parfum",
                    top: "Pink Pepper, Mandarin, Aldehydes",
                    heart: "Rosewood, Cedar, Iris",
                    base: "Amber, Vetiver, Cashmere Wood",
                    longevity: "7â€“9 hours", sillage: "Moderate",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Alpha-Isomethyl Ionone",
                    howToUse: "Two sprays to the chest and one to each wrist. A little on the forearms keeps the cedar note present.",
                    image: "assets/04.png", images: ["assets/04.png", "assets/01.png", "assets/03.png"],
                    bestseller: true, featured: true, new: true,
                    reviews: [
                        { a: "Naveen P.", r: 5, t: "Modern and expensive-smelling", b: "The cedar is beautiful. Best thing I have bought this year." },
                        { a: "Areeba J.", r: 4, t: "Very versatile", b: "My husband wears it more than I do. The amber is subtle, not sweet." },
                        { a: "Farhan I.", r: 5, t: "Great value at this price", b: "Beats several designer bottles I have tried." }
                    ]
                },
                {
                    name: "Velvet Noir",
                    tagline: "Extrait de Parfum",
                    description: "Black plum, leather and smoked vanilla. Restrained darkness with a velvet finish.",
                    price: 27500, salePrice: null, stock: 14,
                    category: "Rare", gender: "Men", family: "Leather Oriental", concentration: "Extrait de Parfum",
                    top: "Black Plum, Pink Pepper, Violet Leaf",
                    heart: "Leather, Osmanthus, Incense",
                    base: "Smoked Vanilla, Labdanum, Benzoin, Ambrette",
                    longevity: "10â€“12 hours", sillage: "Heavy",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Benzyl Salicylate, Coumarin, Linalool",
                    howToUse: "Two sprays only. Extraits are dense â€” start light and let the wearer come to you.",
                    image: "assets/02.png", images: ["assets/02.png", "assets/05.png", "assets/04.png"],
                    bestseller: true, featured: false, new: true,
                    reviews: [{ a: "Shahid M.", r: 5, t: "Restrained darkness", b: "Exactly the description. Smells expensive without being a room stealer." }]
                },
                {
                    name: "Oud Royale",
                    tagline: "Eau de Parfum",
                    description: "Cambodian oud wrapped in rose and saffron â€” the house signature, rebalanced for daily wear.",
                    price: 22000, salePrice: null, stock: 26,
                    category: "Signature", gender: "Men", family: "Amber Woody", concentration: "Eau de Parfum",
                    top: "Saffron, Thyme, Bergamot",
                    heart: "Cambodian Oud, Taif Rose, Geranium",
                    base: "Amber, Sandalwood, Musk, Vanilla",
                    longevity: "8â€“10 hours", sillage: "Heavy",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Coumarin",
                    howToUse: "Spray onto the chest, neck and behind the ears. For office use, one spray on the forearms is enough.",
                    image: "assets/01.png", images: ["assets/01.png", "assets/04.png", "assets/02.png"],
                    bestseller: true, featured: true, new: true,
                    reviews: [
                        { a: "Omar Z.", r: 5, t: "The house scent", b: "Proper oud without the barnyard. This is the one I recommend to friends." },
                        { a: "Raheel N.", r: 5, t: "Beautiful sillage", b: "Received compliments every single time I wear it." },
                        { a: "Bilal A.", r: 4, t: "Strong", b: "Gorgeous but genuinely loud. Four sprays is plenty." }
                    ]
                },
                {
                    name: "Amber Silk",
                    tagline: "Eau de Parfum",
                    description: "Golden amber, sandalwood and a whisper of vanilla â€” soft, enveloping, quietly addictive.",
                    price: 16500, salePrice: 13500, stock: 34,
                    category: "Fresh", gender: "Women", family: "Amber Floral", concentration: "Eau de Parfum",
                    top: "Pear, Bergamot, Orange Blossom",
                    heart: "Jasmine, Tuberose, Sandalwood",
                    base: "Amber, Vanilla, Cashmere Musk",
                    longevity: "7â€“8 hours", sillage: "Moderate",
                    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool, Benzyl Benzoate",
                    howToUse: "Spray at the collarbone and behind the knees. Over a moisturiser it will hold beautifully through the day.",
                    image: "assets/05.png", images: ["assets/05.png", "assets/03.png", "assets/01.png"],
                    bestseller: true, featured: true, new: true,
                    reviews: [
                        { a: "Sadia R.", r: 5, t: "Beautiful and soft", b: "Warm without being heavy. Perfect for a winter wedding." },
                        { a: "Zainab M.", r: 5, t: "My signature", b: "The vanilla is subtle, not synthetic. I get compliments every time." },
                        { a: "Ayesha K.", r: 4, t: "Lovely", b: "Great scent, packaging arrived safely and well packed." }
                    ]
                }
            ];

            /* ==========================================================
               3. STATE + HELPERS
               ========================================================== */
            var KEY_CART = "royale_cart";
            var KEY_WISH = "royale_wishlist";
            var KEY_ORDERS = "royale_orders";

            var state = {
                cart: read(KEY_CART, []),
                wish: read(KEY_WISH, []),
                orders: read(KEY_ORDERS, []),
                homeFilter: "All",
                shop: { family: "All", gender: "All", sort: "featured" }
            };

            function read(k, fb) {
                try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; }
            }
            function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

            function esc(v) {
                return String(v === null || v === undefined ? "" : v)
                    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
            }

            function slug(s) {
                return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
            }

            function num(n) { return (Number(n) || 0).toLocaleString("en-US"); }
            function cash(n) { return STORE.currency + " " + num(n); }

            function buildSizes(price) {
                return SIZE_PLAN.map(function (s) {
                    return { id: s.label, label: s.label, price: Math.round(price * s.factor / 10) * 10 };
                });
            }

            /* enrich every catalogue entry once at boot */
            var ALL = CATALOG.map(function (p, i) {
                var price = Number(p.price) || 0;
                var sale = p.salePrice ? Number(p.salePrice) : null;
                var reviews = p.reviews || [];
                var sum = reviews.reduce(function (a, r) { return a + (Number(r.r) || 0); }, 0);
                return Object.assign({}, p, {
                    id: slug(p.name),
                    sku: "UR-" + String(i + 1).padStart(4, "0"),
                    price: price,
                    salePrice: sale,
                    effective: sale && sale < price ? sale : price,
                    onSale: !!(sale && sale < price),
                    save: sale && sale < price ? Math.round((1 - sale / price) * 100) : 0,
                    stock: p.stock === undefined ? 99 : Number(p.stock),
                    inStock: p.stock === undefined || Number(p.stock) > 0,
                    sizes: buildSizes(sale && sale < price ? sale : price),
                    images: p.images && p.images.length ? p.images : [p.image],
                    rating: reviews.length ? sum / reviews.length : 0,
                    reviews: reviews,
                    bestseller: !!p.bestseller,
                    featured: !!p.featured,
                    isNew: !!p.new
                });
            });

            var BY = {};
            ALL.forEach(function (p) { BY[p.id] = p; });

            function get(id) { return BY[id]; }

            function stars(r) {
                var full = Math.round(Math.max(0, Math.min(5, r || 0)));
                return "â˜…".repeat(full) + "â˜†".repeat(5 - full);
            }

            function fam(p) { return p.family || p.category || "Signature"; }

            function tags(p) {
                return (p.tagline || "") + " " + (p.name || "") + " " + (p.family || "") + " " +
                    (p.category || "") + " " + (p.gender || "") + " " + (p.concentration || "") + " " +
                    (p.top || "") + " " + (p.heart || "") + " " + (p.base || "") + " " + (p.description || "");
            }

            /* ==========================================================
               4. TOASTS
               ========================================================== */
            var ICON_OK = '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>';

            function toast(title, sub, img) {
                var box = document.createElement("div");
                box.className = "toast";
                box.innerHTML = (img ? '<span class="thumb"><img src="' + esc(img) + '" alt=""></span>' : ICON_OK)
                    + "<div><b>" + esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</div>";
                document.getElementById("toasts").appendChild(box);
                setTimeout(function () {
                    box.classList.add("out");
                    setTimeout(function () { box.remove(); }, 400);
                }, 2600);
            }

            /* ==========================================================
               5. PRODUCT CARD
               ========================================================== */
            function priceHTML(p) {
                return p.onSale
                    ? '<span class="price">' + cash(p.effective) + " <s>" + cash(p.price) + "</s></span>"
                    : '<span class="price">' + cash(p.effective) + "</span>";
            }

            function card(p) {
                var alt = p.images[1] || p.images[0];
                var flag = !p.inStock ? '<span class="flag dark">Sold Out</span>'
                    : p.isNew ? '<span class="flag">New</span>'
                        : p.onSale ? '<span class="flag">âˆ’' + p.save + "%</span>"
                            : p.bestseller ? '<span class="flag dark">Bestseller</span>' : "";
                return ''
                    + '<article class="card rv' + (p.inStock ? "" : " out") + '" data-id="' + esc(p.id) + '">'
                    + '<div class="card-media">' + flag
                    + '<button class="wish' + (state.wish.indexOf(p.id) > -1 ? " on" : "") + '" data-wish="' + esc(p.id) + '" aria-label="Save ' + esc(p.name) + '"><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.6 12 20 12 20z"/></svg></button>'
                    + '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
                    + '<img class="alt" src="' + esc(alt) + '" alt="" loading="lazy" aria-hidden="true">'
                    + '<a class="quick" href="#/product/' + esc(p.id) + '">Quick View</a>'
                    + "</div>"
                    + '<div class="card-body">'
                    + '<span class="card-cat">' + esc(p.tagline || p.concentration) + " Â· " + esc(p.gender) + "</span>"
                    + '<h3 class="card-name"><a href="#/product/' + esc(p.id) + '">' + esc(p.name) + "</a></h3>"
                    + '<span class="card-note">' + esc(p.description) + "</span>"
                    + '<div class="card-row">' + priceHTML(p)
                    + '<span class="rate"><span class="stars" title="' + Number(p.rating).toFixed(1) + ' out of 5">' + stars(p.rating) + "</span></span></div>"
                    + '<button class="add" data-add="' + esc(p.id) + '"' + (p.inStock ? "" : " disabled") + ">"
                    + (p.inStock ? "Add to Bag" : "Sold Out") + "</button>"
                    + "</div></article>";
            }

            var revealIO = null;
            function observeReveals(root) {
                var nodes = (root || document).querySelectorAll(".rv:not(.in)");
                if (!("IntersectionObserver" in window)) {
                    Array.prototype.forEach.call(nodes, function (n) { n.classList.add("in"); });
                    return;
                }
                if (!revealIO) {
                    revealIO = new IntersectionObserver(function (entries) {
                        entries.forEach(function (e) {
                            if (e.isIntersecting) {
                                e.target.classList.add("in");
                                revealIO.unobserve(e.target);
                            }
                        });
                    }, { rootMargin: "0px 0px -6% 0px", threshold: .08 });
                }
                Array.prototype.forEach.call(nodes, function (n) { revealIO.observe(n); });
            }

            /* ==========================================================
               6. CART
               ========================================================== */
            function lineKey(pid, sid) { return pid + "::" + (sid || ""); }

            function sizePrice(p, sid) {
                for (var i = 0; i < p.sizes.length; i++) if (p.sizes[i].id === sid) return p.sizes[i].price;
                return p.effective;
            }

            function cartLines() {
                return state.cart.map(function (l) {
                    var p = get(l.pid);
                    if (!p) return null;
                    var unit = sizePrice(p, l.sid);
                    return { key: lineKey(l.pid, l.sid), pid: p.id, sid: l.sid, qty: Number(l.qty) || 1, p: p, unit: unit, total: unit * (Number(l.qty) || 1) };
                }).filter(Boolean);
            }

            function cartTotals() {
                var lines = cartLines();
                var subtotal = lines.reduce(function (a, l) { return a + l.total; }, 0);
                var count = lines.reduce(function (a, l) { return a + l.qty; }, 0);
                var ship = subtotal === 0 ? 0 : (subtotal >= STORE.freeShippingOver ? 0 : STORE.shippingFlat);
                return { lines: lines, subtotal: subtotal, count: count, shipping: ship, total: subtotal + ship };
            }

            function addToCart(pid, sid, qty, silent) {
                var p = get(pid);
                if (!p || !p.inStock) return;
                qty = qty || 1;
                if (!sid) sid = p.sizes[Math.min(1, p.sizes.length - 1)].id;
                var key = lineKey(pid, sid);
                var found = null;
                state.cart.forEach(function (l) { if (lineKey(l.pid, l.sid) === key) found = l; });
                if (found) found.qty = Math.min(99, found.qty + qty);
                else state.cart.push({ pid: pid, sid: sid, qty: Math.min(99, qty) });
                write(KEY_CART, state.cart);
                paintCart();
                if (!silent) toast("Added to bag", p.name + " Â· " + sid, p.image);
            }

            function setQty(key, delta) {
                state.cart.forEach(function (l) {
                    if (lineKey(l.pid, l.sid) === key) l.qty = Math.max(0, Math.min(99, (Number(l.qty) || 1) + delta));
                });
                state.cart = state.cart.filter(function (l) { return l.qty > 0; });
                write(KEY_CART, state.cart);
                paintCart();
            }

            function removeLine(key) {
                state.cart = state.cart.filter(function (l) { return lineKey(l.pid, l.sid) !== key; });
                write(KEY_CART, state.cart);
                paintCart();
            }

            /* ------------------------------------------------------------
               SUGGESTED PRODUCTS
               Scores every product not already in the bag against what is:
               same family +5, same gender +3, same category +2, bestseller
               +1, on sale +1. The top matches appear in the bag.
               ------------------------------------------------------------ */
            function suggest(limit) {
                var lines = cartLines();
                if (!lines.length) return [];
                var inBag = {};
                lines.forEach(function (l) { inBag[l.pid] = true; });

                var famScore = {}, genScore = {}, catScore = {};
                lines.forEach(function (l) {
                    famScore[fam(l.p)] = (famScore[fam(l.p)] || 0) + 1;
                    genScore[l.p.gender] = (genScore[l.p.gender] || 0) + 1;
                    catScore[l.p.category] = (catScore[l.p.category] || 0) + 1;
                });

                var scored = ALL.filter(function (p) { return !inBag[p.id] && p.inStock; }).map(function (p) {
                    var s = 0, why = null;
                    if (famScore[fam(p)]) { s += 5 * famScore[fam(p)]; if (!why) why = "Pairs with your " + fam(p); }
                    if (genScore[p.gender]) {
                        s += 3 * genScore[p.gender];
                        if (!why) why = p.gender === "Unisex" ? "Unisex â€” more in " + fam(p) : "Also " + p.gender;
                    }
                    if (catScore[p.category]) { s += 2 * catScore[p.category]; if (!why) why = "Also in " + p.category; }
                    if (p.bestseller) s += 1;
                    if (p.onSale) s += 1;
                    return { p: p, score: s, why: why || (p.bestseller ? "House bestseller" : "Popular with our clients") };
                });

                scored.sort(function (a, b) { return b.score - a.score || b.p.rating - a.p.rating; });
                var related = scored.filter(function (s) { return s.score >= 2; });
                return (related.length ? related : scored.slice(0, 4)).slice(0, limit || 6);
            }

            function paintSugg() {
                var panel = document.getElementById("sugg");
                var row = document.getElementById("suggRow");
                var list = suggest(6);
                if (!list.length) { panel.hidden = true; return; }
                panel.hidden = false;
                document.getElementById("suggCount").textContent = list.length + " picks";
                document.getElementById("suggWhy").textContent = "Chosen for what is already in your bag.";
                row.innerHTML = list.map(function (s) {
                    var p = s.p;
                    return ''
                        + '<button class="sg" data-add="' + esc(p.id) + '" data-key="' + esc(lineKey(p.id, p.sizes[Math.min(1, p.sizes.length - 1)].id)) + '" title="' + esc(s.why) + '">'
                        + '<span class="sg-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy">'
                        + '<span class="sg-plus">+</span></span>'
                        + '<span class="sg-body">'
                        + "<small>" + esc(s.why) + "</small>"
                        + "<b>" + esc(p.name) + "</b>"
                        + "<i>" + cash(p.effective) + (p.onSale ? " Â· âˆ’" + p.save + "%" : "") + "</i>"
                        + "</span></button>";
                }).join("");
            }

            function paintCart() {
                var t = cartTotals();

                var cc = document.getElementById("cartCount");
                cc.textContent = t.count;
                cc.classList.toggle("show", t.count > 0);
                bump(cc);

                var wc = document.getElementById("wishCount");
                wc.textContent = state.wish.length;
                wc.classList.toggle("show", state.wish.length > 0);

                document.getElementById("bagCount").textContent = "(" + t.count + ")";

                var list = document.getElementById("cartList");
                if (!t.lines.length) {
                    list.innerHTML = '<div class="empty">'
                        + '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12H6.2L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>'
                        + "<p>Your bag awaits its first treasure.</p></div>";
                } else {
                    list.innerHTML = t.lines.map(function (l, i) {
                        return ''
                            + '<div class="ci" style="animation-delay:' + (i * 60) + 'ms">'
                            + '<a class="ci-img" href="#/product/' + esc(l.pid) + '"><img src="' + esc(l.p.image) + '" alt="' + esc(l.p.name) + '"></a>'
                            + "<div>"
                            + '<a class="ci-name" href="#/product/' + esc(l.pid) + '"><small>' + esc(l.sid) + "</small>" + esc(l.p.name) + "</a>"
                            + '<div class="ci-bot">'
                            + '<span class="qty"><button data-step="-1" data-key="' + esc(l.key) + '" aria-label="Decrease">âˆ’</button>'
                            + "<b>" + l.qty + "</b>"
                            + '<button data-step="1" data-key="' + esc(l.key) + '" aria-label="Increase">+</button></span>'
                            + '<span class="ci-price">' + cash(l.total) + "</span>"
                            + "</div>"
                            + '<button class="ci-del" data-rm="' + esc(l.key) + '">Remove</button>'
                            + "</div></div>";
                    }).join("");
                }

                var msg = document.getElementById("shipMsg");
                var track = document.getElementById("shipTrack");
                if (!t.subtotal) {
                    msg.textContent = "Add a fragrance to begin.";
                    track.style.width = "0%";
                } else if (t.shipping === 0) {
                    msg.innerHTML = "Shipping is on us â€” your order qualifies for <b>free delivery</b>.";
                    track.style.width = "100%";
                } else {
                    msg.innerHTML = "Add <b>" + cash(STORE.freeShippingOver - t.subtotal) + "</b> more for free shipping.";
                    track.style.width = Math.min(100, (t.subtotal / STORE.freeShippingOver) * 100) + "%";
                }

                document.getElementById("cartSubtotal").textContent = cash(t.subtotal);
                document.getElementById("cartShip").textContent = t.subtotal === 0 ? "â€”" : (t.shipping ? cash(t.shipping) : "Free");
                document.getElementById("cartTotal").textContent = cash(t.total);
                document.getElementById("checkoutBtn").style.display = t.count ? "" : "none";

                paintSugg();

                if (location.hash.indexOf("#/checkout") === 0) renderCheckout();
            }

            function bump(el) {
                el.classList.remove("bump");
                void el.offsetWidth;
                el.classList.add("bump");
            }

            /* ==========================================================
               7. OVERLAYS
               ========================================================== */
            function openCart() {
                document.getElementById("cart").classList.add("on");
                document.getElementById("veil").classList.add("on");
                document.body.classList.add("locked");
                paintSugg();
            }

            function closeAll() {
                document.getElementById("cart").classList.remove("on");
                document.getElementById("veil").classList.remove("on");
                document.getElementById("searchP").classList.remove("on");
                document.getElementById("drawerNav").classList.remove("open");
                document.body.classList.remove("locked");
            }

            function openSearch() {
                var s = document.getElementById("searchP");
                s.classList.add("on");
                document.body.classList.add("locked");
                var i = document.getElementById("searchIn");
                i.value = "";
                document.getElementById("searchRes").innerHTML = "";
                setTimeout(function () { i.focus(); }, 120);
            }

            /* ==========================================================
               8. WISHLIST
               ========================================================== */
            function toggleWish(pid) {
                var p = get(pid);
                var x = state.wish.indexOf(pid);
                if (x > -1) { state.wish.splice(x, 1); toast("Removed from wishlist", p.name, p.image); }
                else { state.wish.push(pid); toast("Saved to wishlist", p.name, p.image); }
                write(KEY_WISH, state.wish);
                document.querySelectorAll('[data-wish="' + pid + '"]').forEach(function (b) { b.classList.toggle("on"); });
                paintCart();
                if (location.hash.indexOf("#/wishlist") === 0) route();
            }

            /* ==========================================================
               9. HOME RENDER
               ========================================================== */
            var FAMILIES = ["All", "Signature", "Rare", "Fresh"];

            function paintHome() {
                document.getElementById("homeFilters").innerHTML =
                    FAMILIES.map(function (f) {
                        return '<button class="chip' + (state.homeFilter === f ? " on" : "") + '" data-hf="' + esc(f) + '">' + esc(f) + "</button>";
                    }).join("") + '<span class="count">' + ALL.length + " fragrances in the house</span>";

                var grid = document.getElementById("homeGrid");
                var list = ALL.slice();
                if (state.homeFilter !== "All") list = list.filter(function (p) { return p.category === state.homeFilter; });
                grid.innerHTML = list.slice(0, 8).map(card).join("");
                observeReveals(grid);

                var icons = ALL.filter(function (p) { return p.bestseller; }).slice(0, 3);
                if (icons.length < 3) icons = ALL.slice(0, 3);
                document.getElementById("showcase").innerHTML = icons.map(function (p, i) {
                    return ''
                        + '<div class="sc">'
                        + '<span class="sc-img"><img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy"></span>'
                        + '<div class="sc-in">'
                        + '<span class="eyebrow">NÂº 0' + (i + 1) + " Â· " + esc(fam(p)) + "</span>"
                        + "<h3>" + esc(p.name) + "</h3>"
                        + "<p>" + esc(p.description) + "</p>"
                        + '<div class="sc-meta">' + priceHTML(p)
                        + '<a class="btn ghost" href="#/product/' + esc(p.id) + '">Discover</a></div>'
                        + "</div></div>";
                }).join("");

                var seq = ALL.map(function (p) { return p.name; });
                var half = seq.map(function (n) { return "<span>" + esc(n) + "</span><b>âœ¦</b>"; }).join("");
                document.getElementById("marquee").innerHTML = half + half;

                document.getElementById("hs1").textContent = ALL.length;

                var fA = document.getElementById("fAddress");
                var fP = document.getElementById("fPhone");
                var fE = document.getElementById("fEmail");
                var fW = document.getElementById("fWa");
                if (fA) fA.textContent = STORE.address;
                if (fP) fP.textContent = STORE.phone;
                if (fE) fE.textContent = STORE.email;
                if (fW) fW.href = "https://wa.me/" + STORE.whatsapp;
                var fIg = document.getElementById("footIg");
                if (fIg) fIg.href = STORE.instagram;
                var fWa = document.getElementById("footWa");
                if (fWa) fWa.href = "https://wa.me/" + STORE.whatsapp;

                observeReveals(document);
            }

            /* ==========================================================
               10. ROUTED VIEWS
               ========================================================== */
            function showRoute(html) {
                var home = document.getElementById("homeView");
                var rv = document.getElementById("routeView");
                home.hidden = true;
                rv.hidden = false;
                rv.innerHTML = html;
                observeReveals(rv);
                window.scrollTo({ top: 0, behavior: "auto" });
            }

            function facade(no, eyebrow, title, sub) {
                return '<div class="wrap page">'
                    + '<span class="sec-no">' + esc(no) + "</span>"
                    + '<span class="eyebrow">' + esc(eyebrow) + "</span>"
                    + '<h2 class="sec-title" style="margin-bottom:1.6rem">' + title + "</h2>"
                    + (sub ? '<p class="sec-sub" style="margin-bottom:2.4rem">' + esc(sub) + "</p>" : "")
                    + "</div>";
            }

            function shell(no, eyebrow, title, sub, body) {
                return facade(no, eyebrow, title, sub) + '<div class="wrap" style="padding-top:0">' + body + "</div>";
            }

            /* ---- Shop ---- */
            function renderShop(qs) {
                var tag = qs.get("tag") || "";
                var family = qs.get("family") || state.shop.family;
                if (qs.get("family")) state.shop.family = family;
                else if (!tag) state.shop.family = state.shop.family;

                var GENDERS = ["All", "Men", "Women", "Unisex"];
                var FAMILIES_ALL = ["All"].concat(ALL.map(function (p) { return p.family; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort());

                var list = ALL.slice();
                if (tag === "bestseller") list = list.filter(function (p) { return p.bestseller; });
                else if (tag === "new") list = list.filter(function (p) { return p.isNew; });
                else if (tag === "sale") list = list.filter(function (p) { return p.onSale; });
                else {
                    if (state.shop.family !== "All") list = list.filter(function (p) { return fam(p) === state.shop.family; });
                    if (state.shop.gender !== "All") list = list.filter(function (p) { return p.gender === state.shop.gender; });
                }

                var sort = state.shop.sort;
                if (sort === "price-asc") list.sort(function (a, b) { return a.effective - b.effective; });
                else if (sort === "price-desc") list.sort(function (a, b) { return b.effective - a.effective; });
                else if (sort === "name") list.sort(function (a, b) { return a.name.localeCompare(b.name); });
                else list.sort(function (a, b) { return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0) || (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); });

                var heading = tag === "bestseller" ? "The <em>Bestsellers</em>" :
                    tag === "new" ? "New <em>Arrivals</em>" :
                        tag === "sale" ? "Current <em>Offers</em>" : "The Full <em>Collection</em>";

                showRoute(shell("07", tag ? (tag === "bestseller" ? "Most Loved" : tag === "new" ? "Just Landed" : "Offers") : "Curated Selection",
                    heading, list.length + " fragrances",
                    '<div class="filters" style="margin-bottom:1.2rem">'
                    + GENDERS.map(function (g) {
                        return '<button class="chip' + (state.shop.gender === g ? " on" : "") + '" data-gender="' + esc(g) + '">' + esc(g) + "</button>";
                    }).join("")
                    + '<span class="sel"' + (tag ? " hidden" : "") + '><select id="shopFamily">'
                    + FAMILIES_ALL.map(function (f) {
                        return '<option value="' + esc(f) + '"' + (state.shop.family === f ? " selected" : "") + ">" + esc(f) + "</option>";
                    }).join("")
                    + "</select></span>"
                    + '<span class="sel"><select id="shopSort">'
                    + [["featured", "Featured"], ["price-asc", "Price: Low to High"], ["price-desc", "Price: High to Low"], ["name", "Name Aâ€“Z"]].map(function (s) {
                        return '<option value="' + s[0] + '"' + (state.shop.sort === s[0] ? " selected" : "") + ">" + s[1] + "</option>";
                    }).join("")
                    + "</select></span>"
                    + '<span class="count">' + list.length + " of " + ALL.length + "</span>"
                    + "</div>"
                    + (list.length ? '<div class="grid" id="shopGrid"></div>' : '<p class="empty-note">Nothing matches that selection yet.</p>')));

                var grid = document.getElementById("shopGrid");
                if (grid) { grid.innerHTML = list.map(card).join(""); observeReveals(grid); }

                var famSel = document.getElementById("shopFamily");
                if (famSel) famSel.addEventListener("change", function () {
                    state.shop.family = famSel.value;
                    location.hash = "#/shop";
                });
                var sortSel = document.getElementById("shopSort");
                if (sortSel) sortSel.addEventListener("change", function () {
                    state.shop.sort = sortSel.value;
                    location.hash = "#/shop";
                });
            }

            /* ---- Product detail ---- */
            function renderProduct(id) {
                var p = get(id);
                if (!p) {
                    showRoute(shell("â€”", "Not found", "This <em>flacon</em> does not exist", "It may have been discontinued.", '<a class="btn" href="#/shop">Back to the collection</a>'));
                    return;
                }
                var qty = 1;
                var pick = p.sizes[Math.min(1, p.sizes.length - 1)].id;

                function row(k, v) {
                    return '<div class="spec-row"><dt>' + esc(k) + "</dt><dd>" + v + "</dd></div>";
                }

                function specHTML() {
                    return '<div class="spec">'
                        + row("Category", p.category)
                        + row("Gender", p.gender)
                        + row("Family", fam(p))
                        + row("Concentration", p.concentration)
                        + row("Longevity", p.longevity)
                        + row("Sillage", p.sillage)
                        + row("Notes",
                            '<div class="pyramid">'
                            + "<div><span style=\"color:var(--gold-lt)\">TOP</span></div><div>"
                            + p.top.split(",").map(function (n) { return "<span>" + esc(n.trim()) + "</span>"; }).join("") + "</div>"
                            + "<div><span style=\"color:var(--gold-lt)\">HEART</span></div><div>"
                            + p.heart.split(",").map(function (n) { return "<span>" + esc(n.trim()) + "</span>"; }).join("") + "</div>"
                            + "<div><span style=\"color:var(--gold-lt)\">BASE</span></div><div>"
                            + p.base.split(",").map(function (n) { return "<span>" + esc(n.trim()) + "</span>"; }).join("") + "</div>"
                            + "</div>")
                        + row("Ingredients", p.ingredients)
                        + row("How to wear", p.howToUse)
                        + row("Sizes", p.sizes.map(function (s) { return s.label + " â€” " + cash(s.price); }).join(" Â· "))
                        + "</div>";
                }

                function notesHTML() {
                    if (!p.reviews.length) return "";
                    var avg = p.reviews.reduce(function (a, r) { return a + r.r; }, 0) / p.reviews.length;
                    return '<div class="spec"><div class="spec-row"><dt>Rating</dt><dd><span class="stars">' + stars(avg)
                        + "</span> <span style=\"color:var(--muted)\">" + Number(avg).toFixed(1) + " Â· " + p.reviews.length + " reviews</span></dd></div></div>"
                        + '<div class="reviews">' + p.reviews.map(function (r) {
                            return '<div class="rev"><span class="stars">' + stars(r.r) + "</span> <b>" + esc(r.t) + "</b> <small>â€” " + esc(r.a) + "</small><p>" + esc(r.b) + "</p></div>";
                        }).join("") + "</div>";
                }

                function suggHTML() {
                    var recs = suggest(3);
                    if (!recs.length) return "";
                    return '<div style="margin-top:4rem"><div class="sec-head" style="margin-bottom:1.6rem">'
                        + '<span class="sec-no">08</span><span class="eyebrow">Pairs beautifully with</span>'
                        + '<h2 class="sec-title">You may also <em>like</em></h2></div>'
                        + '<div class="grid">' + recs.map(function (r) { return card(r.p); }).join("") + "</div></div>";
                }

                function priceNow() {
                    var s = null;
                    for (var i = 0; i < p.sizes.length; i++) if (p.sizes[i].id === pick) s = p.sizes[i];
                    return cash(s ? s.price : p.effective) + " Ã— " + qty;
                }

                var home = document.getElementById("homeView");
                var rv = document.getElementById("routeView");
                home.hidden = true;
                rv.hidden = false;
                rv.innerHTML = '<div class="wrap" style="padding-top:8.5rem;padding-bottom:0">'
                    + '<a class="crumb" href="#/shop">â† The Collection Â· ' + esc(p.name) + "</a>"
                    + '<div class="pdp">'
                    + '<div class="pdp-gal"><div class="pdp-main"><img id="pdpMain" src="' + esc(p.image) + '" alt="' + esc(p.name) + '"></div>'
                    + '<div class="thumbs">' + p.images.map(function (s, i) {
                        return '<button class="thumb' + (i === 0 ? " on" : "") + '" data-src="' + esc(s) + '"><img src="' + esc(s) + '" alt=""></button>';
                    }).join("") + "</div></div>"
                    + '<div>'
                    + '<span class="eyebrow">' + esc(p.tagline || p.concentration) + " Â· SKU " + esc(p.sku) + "</span>"
                    + "<h1>" + esc(p.name) + "</h1>"
                    + '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-top:1rem">'
                    + '<b style="font-family:var(--serif);font-size:1.7rem;color:var(--gold-lt)">' + cash(p.effective) + "</b>"
                    + (p.onSale ? '<s style="color:var(--muted);font-size:.9rem">' + cash(p.price) + "</s><span class=\"flag\">âˆ’" + p.save + "%</span>" : "")
                    + '<span class="rate"><span class="stars">' + stars(p.rating) + "</span></span>"
                    + "</div>"
                    + '<p class="pdp-desc">' + esc(p.description) + "</p>"
                    + '<div class="sizes" id="pdpSizes">'
                    + p.sizes.map(function (s) {
                        return '<button class="size' + (s.id === pick ? " on" : "") + '" data-size="' + esc(s.id) + '"><small>Size</small><b>' + esc(s.label) + "</b></button>";
                    }).join("")
                    + "</div>"
                    + '<div class="pdp-buy">'
                    + '<span class="qty"><button id="qMinus" aria-label="Decrease">âˆ’</button><b id="qNum">1</b><button id="qPlus" aria-label="Increase">+</button></span>'
                    + '<button class="btn" id="pdpAdd" style="flex:1;min-width:210px"' + (p.inStock ? "" : " disabled") + ">"
                    + (p.inStock ? "Add to Bag â€” " + priceNow() : "Sold Out") + "</button>"
                    + '<button class="btn ghost" id="pdpWish">' + (state.wish.indexOf(p.id) > -1 ? "â™¥ Saved" : "Save") + "</button>"
                    + "</div>"
                    + specHTML() + notesHTML()
                    + "</div></div>" + suggHTML() + "</div>";

                window.scrollTo({ top: 0, behavior: "auto" });
                observeReveals(rv);

                rv.querySelectorAll(".thumb").forEach(function (t) {
                    t.addEventListener("click", function () {
                        rv.querySelectorAll(".thumb").forEach(function (x) { x.classList.remove("on"); });
                        t.classList.add("on");
                        rv.querySelector("#pdpMain").src = t.getAttribute("data-src");
                    });
                });
                rv.querySelectorAll("#pdpSizes .size").forEach(function (t) {
                    t.addEventListener("click", function () {
                        rv.querySelectorAll("#pdpSizes .size").forEach(function (x) { x.classList.remove("on"); });
                        t.classList.add("on");
                        pick = t.getAttribute("data-size");
                        rv.querySelector("#pdpAdd").textContent = "Add to Bag â€” " + priceNow();
                    });
                });
                rv.querySelector("#qPlus").addEventListener("click", function () {
                    qty = Math.min(99, qty + 1);
                    rv.querySelector("#qNum").textContent = qty;
                    rv.querySelector("#pdpAdd").textContent = "Add to Bag â€” " + priceNow();
                });
                rv.querySelector("#qMinus").addEventListener("click", function () {
                    qty = Math.max(1, qty - 1);
                    rv.querySelector("#qNum").textContent = qty;
                    rv.querySelector("#pdpAdd").textContent = "Add to Bag â€” " + priceNow();
                });
                rv.querySelector("#pdpAdd").addEventListener("click", function () {
                    if (p.inStock) { addToCart(p.id, pick, qty); }
                });
                rv.querySelector("#pdpWish").addEventListener("click", function () { toggleWish(p.id); });
            }

            /* ---- Checkout ---- */
            function renderCheckout() {
                var t = cartTotals();
                if (!t.lines.length) {
                    showRoute(shell("09", "Final step", "Your bag is <em>empty</em>",
                        "Add a fragrance before checking out.",
                        '<a class="btn" href="#/shop">Explore the collection â†’</a>'));
                    return;
                }

                var enabled = STORE.payments.filter(function (m) { return m.enabled; });
                if (!enabled.length) enabled = [STORE.payments[0]];
                var method = enabled[0].id;

                showRoute(shell("09", "Final step", "Complete Your <em>Order</em>", "We confirm every order by WhatsApp.", "")
                    + '<div class="wrap co" style="padding-top:0"><form class="co-box f" id="coForm" style="width:100%" novalidate>'
                    + '<div class="f-row"><div><label for="coName">Full Name</label><input id="coName" name="name" required placeholder="FULL NAME"></div>'
                    + '<div><label for="coPhone">Phone / Mobile</label><input id="coPhone" name="phone" type="tel" required placeholder="03XX XXXXXXX"></div></div>'
                    + '<div><label for="coEmail">Email (optional)</label><input id="coEmail" name="email" type="email" placeholder="YOUR EMAIL"></div>'
                    + '<div><label for="coAddress">Shipping Address</label><textarea id="coAddress" name="address" rows="2" required placeholder="HOUSE, STREET, AREA"></textarea></div>'
                    + '<div class="f-row"><div><label for="coCity">City</label><input id="coCity" name="city" required placeholder="CITY"></div>'
                    + '<div><label for="coPostal">Postal Code</label><input id="coPostal" name="postal" placeholder="POSTAL CODE"></div></div>'
                    + '<div><label>Payment Method</label><div class="methods">'
                    + enabled.map(function (m) {
                        return '<label class="method"><input type="radio" name="method" value="' + esc(m.id) + '"' + (m.id === method ? " checked" : "") + ">"
                            + "<span><b>" + esc(m.label) + "</b><small>" + esc(m.note) + "</small></span></label>";
                    }).join("")
                    + "</div></div>"
                    + '<div class="pay-note" id="payNote"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg><span>' + esc(enabled[0].note) + "</span></div>"
                    + '<div><label for="coNotes">Order Notes (optional)</label><textarea id="coNotes" name="notes" rows="2" placeholder="ANY SPECIAL INSTRUCTIONS"></textarea></div>'
                    + '<p class="err" id="coErr" hidden></p>'
                    + '<button class="btn full" type="submit" id="coSubmit">Confirm Order <span class="i">â†’</span></button>'
                    + "</form>"
                    + '<div class="co-box" style="position:sticky;top:100px">'
                    + '<span class="eyebrow">Order Summary</span>'
                    + t.lines.map(function (l) {
                        return '<div class="summary-line"><span>' + esc(l.p.name) + ' <small>' + esc(l.sid) + " Ã— " + l.qty + "</small></span><b>" + cash(l.total) + "</b></div>";
                    }).join("")
                    + '<div class="summary-line"><span>Subtotal</span><b>' + cash(t.subtotal) + "</b></div>"
                    + '<div class="summary-line"><span>Shipping</span><b>' + (t.shipping === 0 ? "Free" : cash(t.shipping)) + "</b></div>"
                    + '<div class="summary-line"><span>Total</span><b style="font-family:var(--serif);font-size:1.25rem;color:var(--gold-lt)">' + cash(t.total) + "</b></div>"
                    + "</div></div>");

                document.querySelectorAll('input[name="method"]').forEach(function (r) {
                    r.addEventListener("change", function () {
                        var m = STORE.payments.filter(function (p) { return p.id === r.value; })[0];
                        if (m) document.getElementById("payNote").querySelector("span").textContent = m.note;
                    });
                });

                document.getElementById("coForm").addEventListener("submit", function (e) {
                    e.preventDefault();
                    var err = document.getElementById("coErr");
                    err.hidden = true;
                    var name = document.getElementById("coName").value.trim();
                    var phone = document.getElementById("coPhone").value.trim();
                    var address = document.getElementById("coAddress").value.trim();
                    var city = document.getElementById("coCity").value.trim();
                    if (!name || !phone || !address || !city) {
                        err.textContent = "Name, phone, address and city are required.";
                        err.hidden = false;
                        return;
                    }
                    if (!/^\+?[0-9\s\-]{7,16}$/.test(phone)) {
                        err.textContent = "That phone number does not look right.";
                        err.hidden = false;
                        return;
                    }
                    var chosen = document.querySelector('input[name="method"]:checked');
                    var mId = chosen ? chosen.value : method;
                    var pay = STORE.payments.filter(function (p) { return p.id === mId; })[0] || STORE.payments[0];

                    var code = "UR-" + Date.now().toString(36).toUpperCase().slice(-6);
                    var order = {
                        code: code,
                        at: new Date().toISOString(),
                        customer: name,
                        phone: phone,
                        email: document.getElementById("coEmail").value.trim(),
                        address: address + ", " + city + (document.getElementById("coPostal").value.trim() ? ", " + document.getElementById("coPostal").value.trim() : ""),
                        payment: pay.label,
                        notes: document.getElementById("coNotes").value.trim(),
                        lines: t.lines.map(function (l) {
                            return { name: l.p.name, size: l.sid, qty: l.qty, unit: l.unit, total: l.total };
                        }),
                        subtotal: t.subtotal,
                        shipping: t.shipping,
                        total: t.total
                    };
                    state.orders.unshift(order);
                    write(KEY_ORDERS, state.orders);
                    state.cart = [];
                    write(KEY_CART, state.cart);
                    toast("Order placed", "We have your details â€” thank you.");
                    location.hash = "#/order/" + code;
                });
            }

            /* ---- Order confirmation ---- */
            function renderOrder(code) {
                var order = state.orders.filter(function (o) { return o.code === code; })[0];
                if (!order) {
                    showRoute(shell("â€”", "Not found", "Order <em>not found</em>", "It lives on this device only.", '<a class="btn" href="#/shop">Back to the collection</a>'));
                    return;
                }
                var waMsg = "Hello UMAR ROYALE! I just placed order " + order.code + ".\n"
                    + order.lines.map(function (l) { return "â€¢ " + l.name + " (" + l.size + ") Ã— " + l.qty + " â€” " + cash(l.total); }).join("\n")
                    + "\nTotal: " + cash(order.total) + "\nPayment: " + order.payment;
                showRoute(shell("âœ“", "Thank you", "Order <em>" + esc(order.code) + "</em>",
                    "Your requisition is with the concierge. We will reach out on WhatsApp to confirm delivery.",
                    '<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></div>'
                    + '<p class="code">' + esc(order.code) + "</p>"
                    + '<p style="color:var(--ivory-dim)">' + esc(order.customer) + " Â· " + esc(order.phone) + "</p>"
                    + order.lines.map(function (l) {
                        return '<div class="summary-line"><span>' + esc(l.name) + ' <small>' + esc(l.size) + " Ã— " + l.qty + "</small></span><b>" + cash(l.total) + "</b></div>";
                    }).join("")
                    + '<div class="summary-line"><span>Total</span><b style="font-family:var(--serif);font-size:1.2rem;color:var(--gold-lt)">' + cash(order.total) + "</b></div>"
                    + '<div class="summary-line"><span>Payment</span><b>' + esc(order.payment) + "</b></div>"
                    + '<div style="display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-top:1.8rem">'
                    + '<a class="btn" href="https://wa.me/' + esc(STORE.whatsapp) + "?text=" + encodeURIComponent(waMsg) + '" target="_blank" rel="noopener">Send to WhatsApp</a>'
                    + '<a class="btn ghost" href="#/shop">Continue Shopping</a></div>'
                    + "</div>"));
            }

            /* ---- Wishlist ---- */
            function renderWishlist() {
                var list = state.wish.map(get).filter(Boolean);
                showRoute(shell("10", "Saved for later", "Your <em>Wishlist</em>",
                    list.length ? list.length + " fragrance" + (list.length > 1 ? "s" : "") + " kept for when the moment calls." : "",
                    list.length ? '<div class="grid">' + list.map(card).join("") + "</div>"
                        : '<div class="empty" style="padding:3rem 1rem"><p>Nothing saved yet. Tap the heart on any fragrance.</p>'
                        + '<a class="btn" href="#/shop" style="margin-top:1rem">Explore the collection</a></div>'));
            }

            /* ---- About ---- */
            function renderAbout() {
                showRoute(shell("11", "The Legacy", "Our <em>Story</em>",
                    "Founded to redefine luxury perfumery.",
                    '<div class="co"><div class="prose">'
                    + "<p>UMAR ROYALE blends centuries-old French distillation artistry with modern restraint. Every flacon is a study in rare botanicals, precision craftsmanship and sophisticated design.</p>"
                    + "<p>We produce in small batches, formulate to a 38% extrait concentration, and never test on animals. Our base ingredients are sourced from suppliers we have visited in person.</p>"
                    + '<div class="points"><div class="point"><span class="n">01</span><div><b>Vegan &amp; Cruelty-Free</b><small>Certified, animal-safe, always.</small></div></div>'
                    + '<div class="point"><span class="n">02</span><div><b>Small Batch</b><small>Numbers of a few hundred per blend.</small></div></div>'
                    + '<div class="point"><span class="n">03</span><div><b>Hand-Filled</b><small>Every flacon filled and sealed by hand.</small></div></div></div>'
                    + "</div>"
                    + '<div class="co-box"><span class="eyebrow">By The Numbers</span>'
                    + '<div class="summary-line"><span>Signature Scents</span><b>' + ALL.length + "</b></div>"
                    + '<div class="summary-line"><span>Rare Ingredients</span><b>120+</b></div>'
                    + '<div class="summary-line"><span>Extrait Strength</span><b>38%</b></div>'
                    + '<div class="summary-line"><span>Max Longevity</span><b>12h</b></div>'
                    + '</div></div>'));
            }

            /* ---- Search ---- */
            function runSearch(q) {
                q = (q || "").trim().toLowerCase();
                var res = document.getElementById("searchRes");
                if (!q) { res.innerHTML = ""; return; }
                var hits = ALL.filter(function (p) { return tags(p).toLowerCase().indexOf(q) > -1; });
                res.innerHTML = hits.length
                    ? hits.map(card).join("")
                    : '<p style="color:var(--muted);grid-column:1/-1">Nothing matched â€œ' + esc(q) + "â€.</p>";
                observeReveals(res);
            }

            /* ==========================================================
               11. ROUTER
               ========================================================== */
            function route() {
                var raw = location.hash.replace(/^#/, "") || "/";
                var qsIdx = raw.indexOf("?");
                var path = qsIdx > -1 ? raw.slice(0, qsIdx) : raw;
                var qs = new URLSearchParams(qsIdx > -1 ? raw.slice(qsIdx + 1) : "");

                var home = document.getElementById("homeView");
                var rv = document.getElementById("routeView");
                closeAll();

                if (path === "/" || path === "/index.html") {
                    rv.hidden = true;
                    home.hidden = false;
                    paintHome();
                    window.scrollTo({ top: 0, behavior: "auto" });
                    return;
                }
                if (path === "/faq" || path === "/contact") {
                    rv.hidden = true;
                    home.hidden = false;
                    paintHome();
                    setTimeout(function () {
                        var el = path === "/faq" ? document.getElementById("faq") : document.getElementById("contact");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                    }, 80);
                    return;
                }
                if (path === "/shop") { renderShop(qs); return; }
                if (path.indexOf("/product/") === 0) {
                    renderProduct(decodeURIComponent(path.slice(9)));
                    var p = get(decodeURIComponent(path.slice(9)));
                    document.title = p ? p.name + " â€” UMAR ROYALE" : "UMAR ROYALE â€” Haute Parfumerie";
                    return;
                }
                if (path === "/checkout") { renderCheckout(); document.title = "Checkout â€” UMAR ROYALE"; return; }
                if (path.indexOf("/order/") === 0) { renderOrder(decodeURIComponent(path.slice(7))); return; }
                if (path === "/wishlist") { renderWishlist(); return; }
                if (path === "/about") { renderAbout(); return; }

                showRoute(shell("â€”", "Not found", "Page <em>not found</em>", "The page you asked for does not exist.", '<a class="btn" href="#/">Return home</a>'));
            }

            /* ==========================================================
               12. BOOT & EVENTS
               ========================================================== */
            function makeDust() {
                var d = document.getElementById("dust");
                if (!d) return;
                for (var i = 0; i < 26; i++) {
                    var p = document.createElement("i");
                    p.style.left = (Math.random() * 100) + "%";
                    p.style.top = (15 + Math.random() * 78) + "%";
                    p.style.animationDuration = (6 + Math.random() * 10) + "s";
                    p.style.animationDelay = (Math.random() * 12) + "s";
                    d.appendChild(p);
                }
            }

            function setupVideo() {
                var v = document.getElementById("heroVideo");
                if (!v) return;
                var shown = false;
                v.addEventListener("playing", function () { if (!shown) { shown = true; v.classList.add("live"); } });
                v.addEventListener("error", function () { v.remove(); });
                /* if a local hero.mp4 exists and starts, it takes over the stage */
                v.addEventListener("canplay", function () {
                    var attempt = Promise.resolve(v.play()).catch(function () { });
                    setTimeout(function () {
                        attempt.then(function () {
                            if (!v.paused) v.classList.add("live");
                        });
                    }, 400);
                });
                setTimeout(function () { if (!shown) v.classList.add("live"); }, 2600);
            }

            function setupIntro() {
                var intro = document.getElementById("intro");
                var done = false;
                function finish() {
                    if (done) return;
                    done = true;
                    intro.classList.add("done");
                }
                var t = setTimeout(finish, 3400);
                intro.addEventListener("click", function () { clearTimeout(t); finish(); });
            }

            /* event delegation for dynamic content */
            document.addEventListener("click", function (e) {
                var el = e.target;

                var add = el.closest && el.closest("[data-add]");
                if (add) {
                    e.preventDefault();
                    var pid = add.getAttribute("data-add");
                    var p = get(pid);
                    if (!p) return;
                    /* suggestion chips carry the desired size; plain adds use 50ml */
                    var sid = add.getAttribute("data-key");
                    if (sid) sid = sid.split("::")[1] || null;
                    addToCart(pid, sid, 1);
                    if (add.classList.contains("sg")) openCart();
                    return;
                }

                var wish = el.closest && el.closest("[data-wish]");
                if (wish) { e.preventDefault(); toggleWish(wish.getAttribute("data-wish")); return; }

                var hf = el.closest && el.closest("[data-hf]");
                if (hf) {
                    state.homeFilter = hf.getAttribute("data-hf");
                    paintHome();
                    return;
                }

                var gender = el.closest && el.closest("[data-gender]");
                if (gender) { state.shop.gender = gender.getAttribute("data-gender"); location.hash = "#/shop"; return; }

                var step = el.closest && el.closest("[data-step]");
                if (step) { setQty(step.getAttribute("data-key"), Number(step.getAttribute("data-step"))); return; }

                var rm = el.closest && el.closest("[data-rm]");
                if (rm) { removeLine(rm.getAttribute("data-rm")); return; }

                var chip = el.closest && el.closest("[data-q]");
                if (chip) {
                    var input = document.getElementById("searchIn");
                    input.value = chip.getAttribute("data-q");
                    runSearch(input.value);
                    return;
                }
            });

            /* static element events */
            document.getElementById("cartOpen").addEventListener("click", function (e) { e.preventDefault(); openCart(); });
            document.getElementById("cartClose").addEventListener("click", closeAll);
            document.getElementById("veil").addEventListener("click", closeAll);
            document.getElementById("keepShopping").addEventListener("click", closeAll);
            document.getElementById("burger").addEventListener("click", function () {
                var d = document.getElementById("drawerNav");
                var open = d.classList.toggle("open");
                if (open) document.body.classList.add("locked"); else document.body.classList.remove("locked");
            });

            document.getElementById("burger").addEventListener("click", function () {
                document.getElementById("drawerNav").classList.add("open");
                document.body.classList.add("locked");
                this.disabled = true;
                setTimeout(function () {
                    var d = document.getElementById("drawerNav");
                    d.style.cursor = "default";
                    d.addEventListener("click", function (ev) {
                        if (ev.target.tagName === "A") { closeAll(); }
                    });
                }, 50);
            });

            document.getElementById("searchOpen").addEventListener("click", openSearch);
            document.getElementById("searchClose").addEventListener("click", closeAll);
            document.getElementById("searchIn").addEventListener("input", function () { runSearch(this.value); });
            document.addEventListener("keydown", function (e) {
                if (e.key === "Escape") { closeAll(); if (document.getElementById("drawerNav").classList.contains("open")) { document.getElementById("drawerNav").classList.remove("open"); document.body.classList.remove("locked"); } }
            });

            document.getElementById("contactForm").addEventListener("submit", function (e) {
                e.preventDefault();
                var err = document.getElementById("cErr");
                var name = document.getElementById("cName").value.trim();
                var email = document.getElementById("cEmail").value.trim();
                var msg = document.getElementById("cMsg").value.trim();
                if (!name || !email || !msg) {
                    err.textContent = "Please fill in your name, email and message.";
                    err.hidden = false;
                    return;
                }
                err.hidden = true;
                var txt = "Hello UMAR ROYALE!%0A%0A" + encodeURIComponent(name) + " (" + encodeURIComponent(email) + ")%0A%0A" + encodeURIComponent(msg);
                window.open("https://wa.me/" + STORE.whatsapp + "?text=" + txt, "_blank");
                this.reset();
                toast("Message ready", "Sent to WhatsApp â€” we reply within a day.");
            });

            document.getElementById("newsForm").addEventListener("submit", function (e) {
                e.preventDefault();
                this.reset();
                toast("Subscribed", "Privileged previews are on their way.");
            });

            /* nav scroll state + back to top */
            var nav = document.getElementById("nav");
            var backtop = document.getElementById("backtop");
            window.addEventListener("scroll", function () {
                var y = window.scrollY || document.documentElement.scrollTop;
                nav.classList.toggle("solid", y > 40);
                backtop.classList.toggle("on", y > 700);
            }, { passive: true });

            backtop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });

            /* hero flacon name follows the payload */
            var hf = document.querySelector(".flacon-txt");
            if (hf && ALL.length) hf.textContent = "NÂº 001 Â· " + ALL[0].name;

            /* boot */
            makeDust();
            setupVideo();
            setupIntro();
            paintHome();
            paintCart();

            window.addEventListener("hashchange", route);
            if (!location.hash) history.replaceState(null, "", "#/");
            route();

        })();
    