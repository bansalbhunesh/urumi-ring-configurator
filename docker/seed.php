<?php
/**
 * Seeds a WooCommerce *variable* product (the "composite" driving the
 * configurator): the Twist Engagement Ring with Metal × Stone variations.
 *
 * Prices mirror src/lib/config.ts exactly so the live store and the mock
 * fallback agree to the dollar. Idempotent: re-running is a no-op.
 *
 * Run via: wp eval-file /scripts/seed.php --allow-root
 */

if ( ! class_exists( 'WC_Product_Variable' ) ) {
    WP_CLI::error( 'WooCommerce is not active.' );
}

const BASE_PRICE = 2400;
$metals = array( 'White Gold' => 0, 'Yellow Gold' => 180, 'Rose Gold' => 180 );
$stones = array( 'Round' => 0, 'Oval' => 420, 'Princess' => 260 );

$tax_metal = 'pa_metal';
$tax_stone = 'pa_stone';

/** Create a global product attribute taxonomy if missing, return its id. */
function ensure_attribute( $label, $slug ) {
    $id = wc_attribute_taxonomy_id_by_name( $slug );
    if ( ! $id ) {
        $id = wc_create_attribute(
            array(
                'name'         => $label,
                'slug'         => $slug,
                'type'         => 'select',
                'order_by'     => 'menu_order',
                'has_archives' => false,
            )
        );
    }
    return is_wp_error( $id ) ? 0 : $id;
}

$metal_attr_id = ensure_attribute( 'Metal', 'metal' );
$stone_attr_id = ensure_attribute( 'Stone', 'stone' );

// Register the taxonomies for this request so we can insert terms.
foreach ( array( $tax_metal, $tax_stone ) as $tax ) {
    if ( ! taxonomy_exists( $tax ) ) {
        register_taxonomy( $tax, 'product', array( 'hierarchical' => false ) );
    }
}

function ensure_term( $name, $tax ) {
    $term = get_term_by( 'name', $name, $tax );
    if ( ! $term ) {
        wp_insert_term( $name, $tax );
    }
}
foreach ( array_keys( $metals ) as $m ) {
    ensure_term( $m, $tax_metal );
}
foreach ( array_keys( $stones ) as $s ) {
    ensure_term( $s, $tax_stone );
}

// Already seeded?
$existing = get_page_by_path( 'twist-engagement-ring', OBJECT, 'product' );
if ( $existing ) {
    WP_CLI::success( 'Twist Engagement Ring already exists (#' . $existing->ID . ').' );
    return;
}

$product = new WC_Product_Variable();
$product->set_name( 'The Twist Engagement Ring' );
$product->set_slug( 'twist-engagement-ring' );
$product->set_status( 'publish' );
$product->set_catalog_visibility( 'visible' );
$product->set_short_description(
    'A made-to-order twist solitaire in solid 18k recycled gold. Two strands wind into one, cradling the centre stone of your choice.'
);
$product->set_description(
    'Hand-finished to a mirror polish and set with a conflict-free diamond. Configure your metal and centre-stone cut; each combination is built to order.'
);

$attr_metal = new WC_Product_Attribute();
$attr_metal->set_id( $metal_attr_id );
$attr_metal->set_name( $tax_metal );
$attr_metal->set_options( array_keys( $metals ) );
$attr_metal->set_visible( true );
$attr_metal->set_variation( true );

$attr_stone = new WC_Product_Attribute();
$attr_stone->set_id( $stone_attr_id );
$attr_stone->set_name( $tax_stone );
$attr_stone->set_options( array_keys( $stones ) );
$attr_stone->set_visible( true );
$attr_stone->set_variation( true );

$product->set_attributes( array( $attr_metal, $attr_stone ) );
$product_id = $product->save();

wp_set_object_terms( $product_id, array_keys( $metals ), $tax_metal );
wp_set_object_terms( $product_id, array_keys( $stones ), $tax_stone );

$count = 0;
foreach ( $metals as $m_name => $m_prem ) {
    foreach ( $stones as $s_name => $s_prem ) {
        $variation = new WC_Product_Variation();
        $variation->set_parent_id( $product_id );
        $variation->set_attributes(
            array(
                $tax_metal => sanitize_title( $m_name ),
                $tax_stone => sanitize_title( $s_name ),
            )
        );
        $variation->set_regular_price( (string) ( BASE_PRICE + $m_prem + $s_prem ) );
        $variation->set_sku(
            'TWIST-' . strtoupper( str_replace( ' ', '', $m_name ) ) . '-' . strtoupper( $s_name )
        );
        $variation->set_status( 'publish' );
        $variation->save();
        $count++;
    }
}

WP_CLI::success( "Created product #{$product_id} with {$count} variations." );
