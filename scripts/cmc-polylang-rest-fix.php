<?php
/**
 * Plugin Name: CMC Belleza — Polylang REST API Fix
 * Description: Habilita filtrado por idioma en REST API para arquitectura headless con Polylang Free
 * Version: 1.0.2
 * Author: CMC Belleza Dev Team
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; 
}

add_action( 'plugins_loaded', function() {
    
    if ( ! function_exists( 'PLL' ) ) {
        return; 
    }
    
    /**
     * HOOK 1: Iniciar idioma en Contexto REST Global
     * Enganchamos en rest_api_init (que siempre se ejecuta antes del dispatch REST)
     * para forzar a Polylang a establecer curlang en peticiones WooCommerce.
     */
    add_action( 'rest_api_init', function() {
        if ( isset( $_GET['lang'] ) ) {
            $lang = sanitize_text_field( $_GET['lang'] );
            $allowed_langs = array( 'es', 'en' ); 

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
     * HOOK 2: rest_post_query & rest_page_query (Para core WP)
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
     * HOOK 3: Solución Definitiva via pre_get_posts (Garantizado para WooCommerce REST)
     * Intercepta la consulta SQL final de WP_Query antes de ejecutarse.
     * Como es una fase tardía, evita cualquier limpieza o filtrado del REST Controller.
     */
    add_action( 'pre_get_posts', function( $query ) {
        // Ejecutar solo en contexto REST API y si no es panel de administración
        if ( ! is_admin() && defined( 'REST_REQUEST' ) && REST_REQUEST ) {
            
            // Capturar parámetro ?lang de la URL global
            $lang = isset( $_GET['lang'] ) ? sanitize_text_field( $_GET['lang'] ) : '';
            $allowed_langs = array( 'es', 'en' );
            
            if ( ! empty( $lang ) && in_array( $lang, $allowed_langs ) ) {
                
                // Caso 1: Si la query consulta productos de WooCommerce ('product')
                if ( $query->get( 'post_type' ) === 'product' || ( is_array( $query->get( 'post_type' ) ) && in_array( 'product', $query->get( 'post_type' ) ) ) ) {
                    
                    $tax_query = $query->get( 'tax_query' );
                    if ( ! is_array( $tax_query ) ) {
                        $tax_query = array();
                    }
                    
                    // Inyección manual indestructible de la taxonomía 'language'
                    $tax_query[] = array(
                        'taxonomy' => 'language',
                        'field'    => 'slug',
                        'terms'    => $lang,
                        'operator' => 'IN',
                    );
                    
                    $query->set( 'tax_query', $tax_query );
                }
            }
        }
    }, 999 ); // Prioridad máxima para ser el último hook ejecutado

    /**
     * HOOK 4: register_rest_field (Translations)
     */
    add_action( 'rest_api_init', function() {
        $post_types = array( 'post', 'page', 'product' );
        
        foreach ( $post_types as $type ) {
            register_rest_field( $type, 'translations', array(
                'get_callback' => function( $object ) {
                    $post_id = $object['id'];
                    if ( function_exists( 'pll_get_post_translations' ) ) {
                        $translations = pll_get_post_translations( $post_id );
                        return !empty($translations) ? $translations : new stdClass();
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
