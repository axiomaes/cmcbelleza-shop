<?php
/**
 * CMC Belleza - Fix Polylang REST API para WordPress Headless y WooCommerce (Bilingüismo)
 * 
 * INSTRUCCIONES: 
 * Añade este bloque al FINAL del archivo functions.php de tu tema activo
 * (Preferiblemente un Tema Hijo / Child Theme) para evitar perderlo en futuras actualizaciones.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Salir si se accede directamente
}

// Envolver en plugins_loaded para asegurar que Polylang ya cargó antes de enganchar hooks
add_action( 'plugins_loaded', function() {
    
    // Verificar que el objeto global o las funciones de Polylang existen
    if ( ! function_exists( 'PLL' ) ) {
        return; // Detener ejecución si Polylang no está activo
    }
    
    /**
     * ------------------------------------------------------------------
     * HOOK 1: parse_request
     * ------------------------------------------------------------------
     * Intercepta peticiones REST. Si incluye ?lang=es o ?lang=en, 
     * inyecta y fuerza el idioma actual globalmente en el objeto Polylang PLL().
     */
    add_action( 'parse_request', function( $wp ) {
        // Solo actuar en contexto de llamadas a la REST API nativa
        if ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) {
            return;
        }

        if ( isset( $_GET['lang'] ) ) {
            $lang = sanitize_text_field( $_GET['lang'] );
            $allowed_langs = array( 'es', 'en' ); // Whitelist estricta de idiomas habilitados

            if ( in_array( $lang, $allowed_langs ) ) {
                // Asigna el idioma en el objeto global de Polylang
                PLL()->curlang = PLL()->model->get_language( $lang );
                
                // Mapea el locale de WordPress (ej: es_ES, en_US) para coherencia interna
                if ( PLL()->curlang ) {
                    load_default_textdomain( PLL()->curlang->locale );
                    $GLOBALS['wp_locale'] = new WP_Locale();
                }
            }
        }
    }, 5 ); // Prioridad 5 para asegurar la inicialización antes de procesar el Query

    /**
     * ------------------------------------------------------------------
     * HOOK 2: rest_post_query & rest_page_query
     * ------------------------------------------------------------------
     * Modifica el hook del WP_Query para Entradas y Páginas estándar en REST.
     * Fuerza la inyección del argumento 'lang' para que la base de datos filtre.
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
     * ------------------------------------------------------------------
     * HOOK 3: woocommerce_rest_product_query
     * ------------------------------------------------------------------
     * Inyecta el filtro del tax_query o parámetro 'lang' en WooCommerce REST
     * para devolver exclusivamente productos pertenecientes al idioma consultado.
     */
    add_filter( 'woocommerce_rest_product_query', function( $args, $request ) {
        $lang = $request->get_param( 'lang' );
        if ( ! empty( $lang ) ) {
            // Polylang mapea los idiomas mediante taxonomías en productos
            $args['lang'] = sanitize_text_field( $lang );
            
            // suppress_filters debe ser falso para permitir que Polylang intercepte el SQL query
            $args['suppress_filters'] = false;
        }
        return $args;
    }, 10, 2 );

    /**
     * ------------------------------------------------------------------
     * HOOK 4: register_rest_field (Translations Mapping)
     * ------------------------------------------------------------------
     * Registra una clave virtual 'translations' en el JSON devuelto por la REST API
     * para Posts, Páginas y Productos. Devuelve los IDs asociados a cada idioma.
     */
    add_action( 'rest_api_init', function() {
        $post_types = array( 'post', 'page', 'product' );
        
        foreach ( $post_types as $type ) {
            register_rest_field( $type, 'translations', array(
                'get_callback' => function( $object ) {
                    $post_id = $object['id'];
                    if ( function_exists( 'pll_get_post_translations' ) ) {
                        // Devuelve array asociativo: array('es' => 123, 'en' => 456)
                        return pll_get_post_translations( $post_id );
                    }
                    return new stdClass(); // Retornar objeto vacío si falla
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
