/* ----------------------------------------------------------------------------
   Seed the live WooCommerce store with the full Twist Engagement Ring catalog
   (8 metals × 10 cuts = 80 variations) over the REST API v3 — no server shell
   needed, just a Read/Write API key.

   The live demo store is currently only partly seeded (white-gold only), which
   is why non-white-gold combos fall back to the mock. Running this makes every
   configuration a real, live, buyable variation.

   USAGE
     1. In WP admin: WooCommerce → Settings → Advanced → REST API → Add key
        (Permissions: Read/Write). Copy the Consumer key + Consumer secret.
     2. Put them in .env.local (gitignored) — NEVER commit them:
          WOOCOMMERCE_URL=https://your-store.example
          WOO_CONSUMER_KEY=ck_xxx
          WOO_CONSUMER_SECRET=cs_xxx
     3. node --env-file=.env.local scripts/seed-live-store.mjs
     4. Revoke the key afterwards if it was only for this.

   Idempotent: re-running only adds variations that are missing.

   KEEP IN SYNC with src/lib/config.ts (the app's source of truth). Mirrored here
   the same way docker/seed.php mirrors it, so the live store and the app agree
   to the dollar.
---------------------------------------------------------------------------- */

const BASE_URL = (process.env.WOOCOMMERCE_URL ?? "").replace(/\/$/, "");
const CK = process.env.WOO_CONSUMER_KEY ?? "";
const CS = process.env.WOO_CONSUMER_SECRET ?? "";

if (!BASE_URL || !CK || !CS) {
  console.error(
    "Missing env. Set WOOCOMMERCE_URL, WOO_CONSUMER_KEY, WOO_CONSUMER_SECRET\n" +
      "e.g. node --env-file=.env.local scripts/seed-live-store.mjs",
  );
  process.exit(1);
}

const PRODUCT_NAME = "The Twist Engagement Ring";
const PRODUCT_SLUG = "twist-engagement-ring";
const BASE_PRICE = 2400;

// [id, label, premium] — mirrors src/lib/config.ts
const METALS = [
  ["white-gold-14k", "14k White Gold", 0],
  ["white-gold", "White Gold", 180],
  ["yellow-gold-14k", "14k Yellow Gold", 180],
  ["yellow-gold", "Yellow Gold", 360],
  ["rose-gold-14k", "14k Rose Gold", 180],
  ["rose-gold", "Rose Gold", 360],
  ["platinum", "Platinum", 620],
  ["palladium", "Palladium", 420],
];
const STONES = [
  ["round", "Round", 0],
  ["oval", "Oval", 420],
  ["princess", "Princess", 260],
  ["cushion", "Cushion", 340],
  ["emerald", "Emerald", 520],
  ["radiant", "Radiant", 460],
  ["pear", "Pear", 480],
  ["marquise", "Marquise", 520],
  ["heart", "Heart", 560],
  ["asscher", "Asscher", 500],
];

const priceFor = (mPrem, sPrem) => BASE_PRICE + mPrem + sPrem;
const skuFor = (mId, sId) =>
  `TWIST-${mId.toUpperCase().replace("-", "")}-${sId.toUpperCase()}`;

const auth = "Basic " + Buffer.from(`${CK}:${CS}`).toString("base64");
const api = `${BASE_URL}/wp-json/wc/v3`;

async function call(path, init = {}) {
  const res = await fetch(`${api}${path}`, {
    ...init,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return json;
}

async function findOrCreateProduct() {
  const existing = await call(`/products?slug=${PRODUCT_SLUG}&per_page=1`);
  if (Array.isArray(existing) && existing[0]) {
    console.log(`• Found product #${existing[0].id} (${existing[0].name})`);
    // Ensure it is variable and carries both attributes.
    await call(`/products/${existing[0].id}`, {
      method: "PUT",
      body: JSON.stringify({ type: "variable", attributes: attributeDefs() }),
    });
    return existing[0].id;
  }
  const created = await call(`/products`, {
    method: "POST",
    body: JSON.stringify({
      name: PRODUCT_NAME,
      slug: PRODUCT_SLUG,
      type: "variable",
      status: "publish",
      attributes: attributeDefs(),
    }),
  });
  console.log(`• Created product #${created.id}`);
  return created.id;
}

function attributeDefs() {
  return [
    { name: "Metal", visible: true, variation: true, options: METALS.map((m) => m[1]) },
    { name: "Stone", visible: true, variation: true, options: STONES.map((s) => s[1]) },
  ];
}

async function existingComboKeys(productId) {
  const keys = new Set();
  for (let page = 1; ; page++) {
    const batch = await call(`/products/${productId}/variations?per_page=100&page=${page}`);
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const v of batch) {
      const metal = v.attributes?.find((a) => a.name === "Metal")?.option ?? "";
      const stone = v.attributes?.find((a) => a.name === "Stone")?.option ?? "";
      keys.add(`${metal}|||${stone}`);
    }
    if (batch.length < 100) break;
  }
  return keys;
}

async function main() {
  console.log(`Seeding ${PRODUCT_NAME} → ${BASE_URL}`);
  const productId = await findOrCreateProduct();
  const have = await existingComboKeys(productId);

  const create = [];
  for (const [mId, mLabel, mPrem] of METALS) {
    for (const [sId, sLabel, sPrem] of STONES) {
      if (have.has(`${mLabel}|||${sLabel}`)) continue;
      create.push({
        regular_price: String(priceFor(mPrem, sPrem)),
        sku: skuFor(mId, sId),
        attributes: [
          { name: "Metal", option: mLabel },
          { name: "Stone", option: sLabel },
        ],
      });
    }
  }

  if (create.length === 0) {
    console.log("✓ All 80 variations already present — nothing to do.");
    return;
  }

  console.log(`• Creating ${create.length} missing variations…`);
  // Store API batch endpoint handles up to 100 at a time.
  const result = await call(`/products/${productId}/variations/batch`, {
    method: "POST",
    body: JSON.stringify({ create }),
  });
  console.log(`✓ Created ${result.create?.length ?? 0} variations.`);
  console.log(
    `\nVerify: ${BASE_URL}/wp-json/wc/store/v1/products?slug=${PRODUCT_SLUG}`,
  );
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
