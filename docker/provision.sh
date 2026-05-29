#!/usr/bin/env bash
# Provisions a headless WooCommerce store and seeds the Twist Engagement Ring
# composite (variable) product. Idempotent — safe to re-run.
set -euo pipefail

cd /var/www/html

echo "⏳ Waiting for the database & WordPress files…"
until wp core is-installed --allow-root >/dev/null 2>&1 || wp db check --allow-root >/dev/null 2>&1; do
  if [ -f wp-settings.php ] && wp db check --allow-root >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

# --- Core install -----------------------------------------------------------
if ! wp core is-installed --allow-root >/dev/null 2>&1; then
  echo "📦 Installing WordPress…"
  wp core install --allow-root \
    --url="${SITE_URL}" \
    --title="Aurelle Atelier" \
    --admin_user="admin" \
    --admin_password="admin" \
    --admin_email="admin@example.com" \
    --skip-email
fi

# Pretty permalinks are required by the WooCommerce Store API.
wp rewrite structure '/%postname%/' --hard --allow-root
wp option update blogname "Aurelle Atelier" --allow-root

# --- WooCommerce ------------------------------------------------------------
if ! wp plugin is-active woocommerce --allow-root >/dev/null 2>&1; then
  echo "🛍  Installing WooCommerce…"
  wp plugin install woocommerce --activate --allow-root
fi

wp option update woocommerce_currency "USD" --allow-root
wp option update woocommerce_store_country "US:CA" --allow-root
wp option update woocommerce_default_country "US:CA" --allow-root
# Skip the setup wizard / marketing prompts.
wp option update woocommerce_onboarding_profile '{"completed":true}' --format=json --allow-root || true

# --- Seed the product -------------------------------------------------------
echo "💍 Seeding the Twist Engagement Ring…"
wp eval-file /scripts/seed.php --allow-root

echo "✅ Provisioning complete."
echo "   Store API:  ${SITE_URL}/wp-json/wc/store/v1/products?slug=twist-engagement-ring"
echo "   WP admin:   ${SITE_URL}/wp-admin  (admin / admin)"
