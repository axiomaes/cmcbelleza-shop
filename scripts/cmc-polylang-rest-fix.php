<?php
/**
 * Plugin Name: CMC Belleza — Polylang REST API Fix
 * Description: Habilita filtrado por idioma en REST API para arquitectura headless con Polylang Free
 * Version: 1.0.0
 * Author: CMC Belleza Dev Team
 */

// Regla de oro de WordPress: Salir si se accede directamente
if ( ! defined( 'ABSPATH' ) ) {
    exit; 
}

// Envolver en plugins_loaded para asegurar que Polylang ya cargó antes de enganchar hooks
add_action( 'plugins_loaded', function() {
    
    // Verificar que el objeto global o las funciones de Polylang existen
    if ( ! function_exists( 'PLL' ) ) {
        return; // Detener ejecución si Polylang no está activo
    }
    
    /**
     * HOOK 1: parse_request
     * Intercepta peticiones REST. Si incluye ?lang=es o ?lang=en, 
     * inyecta y fuerza el idioma actual globalmente en el objeto Polylang PLL().
     */
    add_action( 'parse_request', function( $wp ) {
        if ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) {
            return;
        }

        if ( isset( $_GET['lang'] ) ) {
            $lang = sanitize_text_field( $_GET['lang'] );
            $allowed_langs = array( 'es', 'en' ); // Whitelist de idiomas soportados

            if ( in_array( $lang, $allowed_langs ) ) {
                PLL()->curlang = PLL()->model->get_language( $lang );
                
                if ( PLL()->curlang ) {
                    load_default_textdomain( PLL()->curlang->locale );
                    $GLOBALS['wp_locale'] = new WP_Locale();
                }
            }
        }
    }, 5 ); 

    /**
     * HOOK 2: rest_post_query & rest_page_query
     * Modifica WP_Query en REST para inyectar el filtro de taxonomía en Entradas y Páginas.
     */
    add_filter( 'rest_post_query', 'cmc_filter_rest_queries_by_polylang', 10, 2 );
    add_filter( 'rest_page_query', 'cmc_filter_rest_queries_by_polylang', 10, 2 );
    
    function cmc_filter_rest_queries_by_polylang( $args, $request ) {
        $lang = $request->get_param( 'lang' );
        if ( ! empty( $lang ) ) {
            $args['lang'] = sanitize_text_field( $lang );
        }
        return $args;
    }

    /**
     * HOOK 3: woocommerce_rest_product_query
     * Inyecta el filtro de idioma en la API REST de WooCommerce.
     */
    add_filter( 'woocommerce_rest_product_query', function( $args, $request ) {
        $lang = $request->get_param( 'lang' );
        if ( ! empty( $lang ) ) {
            $args['lang'] = sanitize_text_field( $lang );
            $args['suppress_filters'] = false; 
        }
        return $args;
    }, 10, 2 );

    /**
     * HOOK 4: register_rest_field (Translations Mapping)
     * Registra la clave 'translations' en el JSON de Posts, Páginas y Productos.
     */
    add_action( 'rest_api_init', function() {
        $post_types = array( 'post', 'page', 'product' );
        
        foreach ( $post_types as $type ) {
            register_rest_field( $type, 'translations', array(
                'get_callback' => function( $object ) {
                    $post_id = $object['id'];
                    if ( function_exists( 'pll_get_post_translations' ) ) {
                        return pll_get_post_translations( $post_id );
                    }
                    return new stdClass(); 
                },
                'update_callback' => null,
                'schema'          => array(
                    'description' => 'Asociaciones de idioma de Polylang (es/en).',
                    'type'        => 'object',
                    'context'     => array( 'view', 'edit' ),
                ),
            ) );
        }
    } );

});
