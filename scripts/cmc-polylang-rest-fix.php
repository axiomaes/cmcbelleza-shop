<?php
/**
 * Plugin Name: CMC Belleza — Polylang REST API Fix
 * Description: Habilita filtrado por idioma en REST API para arquitectura headless con Polylang Free y Secure Custom Fields. Incluye campos programáticos, plantillas personalizadas, custom endpoints y dashboard de traducción.
 * Version: 1.0.4
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
     * ==================================================================
     * SECCIÓN 0: REGISTRO DE PLANTILLAS DE PÁGINA
     * ==================================================================
     * Registra dinámicamente las plantillas para la organización de bloques.
     */
    add_filter( 'theme_page_templates', function( $post_templates, $wp_theme, $post, $post_type ) {
        if ( $post_type === 'page' ) {
            $post_templates['template-home.php'] = 'Plantilla CMC Home';
            $post_templates['template-about.php'] = 'Plantilla CMC About';
            $post_templates['template-flexible.php'] = 'Plantilla CMC Flexible';
        }
        return $post_templates;
    }, 10, 4 );

    /**
     * ==================================================================
     * SECCIÓN 1: CAMPOS PROGRAMÁTICOS (SCF / ACF API)
     * ==================================================================
     */
    if ( function_exists( 'acf_add_local_field_group' ) ) {
        
        // --- GRUPO 1A: PÁGINA HOME ---
        acf_add_local_field_group( array(
            'key' => 'group_cmc_home',
            'title' => '⚙️ Configuración de Portada (Home)',
            'fields' => array(
                // HERO
                array( 'key' => 'field_home_hero_tab', 'label' => 'Hero Section', 'type' => 'tab' ),
                array( 'key' => 'field_hero_title', 'label' => 'Título Hero', 'name' => 'hero_title', 'type' => 'text', 'maxlength' => 60, 'instructions' => 'Máx 60 caracteres.' ),
                array( 'key' => 'field_hero_subtitle', 'label' => 'Subtítulo Hero', 'name' => 'hero_subtitle', 'type' => 'textarea', 'maxlength' => 120, 'rows' => 3, 'instructions' => 'Máx 120 caracteres.' ),
                array( 'key' => 'field_hero_image', 'label' => 'Imagen de Fondo', 'name' => 'hero_image', 'type' => 'image', 'return_format' => 'url' ),
                array( 'key' => 'field_hero_cta_text', 'label' => 'Texto Botón CTA', 'name' => 'hero_cta_text', 'type' => 'text', 'maxlength' => 20, 'wrapper' => array('width' => '50%') ),
                array( 'key' => 'field_hero_cta_url', 'label' => 'URL Botón CTA', 'name' => 'hero_cta_url', 'type' => 'url', 'wrapper' => array('width' => '50%') ),
                
                // FEATURES
                array( 'key' => 'field_home_features_tab', 'label' => 'Características / Iconos', 'type' => 'tab' ),
                array( 'key' => 'field_features_title', 'label' => 'Título Sección Características', 'name' => 'features_title', 'type' => 'text', 'maxlength' => 40, 'instructions' => 'Máx 40 caracteres.' ),
                
                // Feature 1
                array( 'key' => 'field_feat_1_group', 'label' => 'Bloque 1', 'type' => 'group', 'name' => 'feature_1', 'layout' => 'block', 'sub_fields' => array(
                    array( 'key' => 'field_f1_icon', 'label' => 'Icono (ej: "spa", "eco")', 'name' => 'feature_1_icon', 'type' => 'text', 'default_value' => 'spa' ),
                    array( 'key' => 'field_f1_title', 'label' => 'Título', 'name' => 'feature_1_title', 'type' => 'text', 'maxlength' => 30 ),
                    array( 'key' => 'field_f1_desc', 'label' => 'Descripción', 'name' => 'feature_1_desc', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 )
                )),
                // Feature 2
                array( 'key' => 'field_feat_2_group', 'label' => 'Bloque 2', 'type' => 'group', 'name' => 'feature_2', 'layout' => 'block', 'sub_fields' => array(
                    array( 'key' => 'field_f2_icon', 'label' => 'Icono', 'name' => 'feature_2_icon', 'type' => 'text', 'default_value' => 'verified' ),
                    array( 'key' => 'field_f2_title', 'label' => 'Título', 'name' => 'feature_2_title', 'type' => 'text', 'maxlength' => 30 ),
                    array( 'key' => 'field_f2_desc', 'label' => 'Descripción', 'name' => 'feature_2_desc', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 )
                )),
                // Feature 3
                array( 'key' => 'field_feat_3_group', 'label' => 'Bloque 3', 'type' => 'group', 'name' => 'feature_3', 'layout' => 'block', 'sub_fields' => array(
                    array( 'key' => 'field_f3_icon', 'label' => 'Icono', 'name' => 'feature_3_icon', 'type' => 'text', 'default_value' => 'local_shipping' ),
                    array( 'key' => 'field_f3_title', 'label' => 'Título', 'name' => 'feature_3_title', 'type' => 'text', 'maxlength' => 30 ),
                    array( 'key' => 'field_f3_desc', 'label' => 'Descripción', 'name' => 'feature_3_desc', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 )
                )),

                // PROMO BANNER
                array( 'key' => 'field_home_banner_tab', 'label' => 'Banner Promocional', 'type' => 'tab' ),
                array( 'key' => 'field_banner_active', 'label' => '¿Activar Banner?', 'name' => 'banner_active', 'type' => 'true_false', 'default_value' => 0, 'ui' => 1 ),
                array( 'key' => 'field_banner_title', 'label' => 'Título Banner', 'name' => 'banner_title', 'type' => 'text', 'maxlength' => 50, 'conditional_logic' => array(array(array('field' => 'field_banner_active', 'operator' => '==', 'value' => '1'))) ),
                array( 'key' => 'field_banner_image', 'label' => 'Imagen Banner', 'name' => 'banner_image', 'type' => 'image', 'return_format' => 'url', 'conditional_logic' => array(array(array('field' => 'field_banner_active', 'operator' => '==', 'value' => '1'))) ),
                array( 'key' => 'field_banner_cta_text', 'label' => 'Texto Botón', 'name' => 'banner_cta_text', 'type' => 'text', 'maxlength' => 20, 'conditional_logic' => array(array(array('field' => 'field_banner_active', 'operator' => '==', 'value' => '1'))), 'wrapper' => array('width' => '50%') ),
                array( 'key' => 'field_banner_cta_url', 'label' => 'URL Botón', 'name' => 'banner_cta_url', 'type' => 'url', 'conditional_logic' => array(array(array('field' => 'field_banner_active', 'operator' => '==', 'value' => '1'))), 'wrapper' => array('width' => '50%') ),

                // COLLECTIONS
                array( 'key' => 'field_home_coll_tab', 'label' => 'Colecciones Destacadas', 'type' => 'tab' ),
                array( 'key' => 'field_collections_title', 'label' => 'Título Sección Colecciones', 'name' => 'collections_title', 'type' => 'text', 'maxlength' => 40 ),
                array( 'key' => 'field_collections_subtitle', 'label' => 'Subtítulo Sección Colecciones', 'name' => 'collections_subtitle', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 3 ),
            ),
            'location' => array(
                array(
                    array( 'param' => 'page_template', 'operator' => '==', 'value' => 'template-home.php' ),
                ),
            ),
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
        ));

        // --- GRUPO 1B: PÁGINA ABOUT ---
        acf_add_local_field_group( array(
            'key' => 'group_cmc_about',
            'title' => '🌿 Configuración Sobre Nosotros (About)',
            'fields' => array(
                // ABOUT HERO
                array( 'key' => 'field_about_hero_tab', 'label' => 'Hero Section', 'type' => 'tab' ),
                array( 'key' => 'field_about_title', 'label' => 'Título Hero About', 'name' => 'about_title', 'type' => 'text', 'maxlength' => 60 ),
                array( 'key' => 'field_about_subtitle', 'label' => 'Subtítulo Hero About', 'name' => 'about_subtitle', 'type' => 'textarea', 'maxlength' => 150, 'rows' => 3 ),
                array( 'key' => 'field_about_image', 'label' => 'Imagen Destacada', 'name' => 'about_image', 'type' => 'image', 'return_format' => 'url' ),

                // HISTORIA
                array( 'key' => 'field_about_story_tab', 'label' => 'Nuestra Historia', 'type' => 'tab' ),
                array( 'key' => 'field_story_title', 'label' => 'Título de Historia', 'name' => 'story_title', 'type' => 'text', 'maxlength' => 40 ),
                array( 'key' => 'field_story_content', 'label' => 'Contenido de Historia', 'name' => 'story_content', 'type' => 'wysiwyg', 'tabs' => 'all', 'toolbar' => 'basic', 'media_upload' => 0, 'instructions' => 'Límite sugerido: 500 caracteres.' ),

                // VALORES
                array( 'key' => 'field_about_values_tab', 'label' => 'Valores Corporativos', 'type' => 'tab' ),
                // Value 1
                array( 'key' => 'field_val_1_group', 'label' => 'Valor 1', 'type' => 'group', 'name' => 'value_1', 'sub_fields' => array(
                    array( 'key' => 'field_v1_title', 'label' => 'Título', 'name' => 'value_1_title', 'type' => 'text', 'maxlength' => 30 ),
                    array( 'key' => 'field_v1_desc', 'label' => 'Descripción', 'name' => 'value_1_desc', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 )
                )),
                // Value 2
                array( 'key' => 'field_val_2_group', 'label' => 'Valor 2', 'type' => 'group', 'name' => 'value_2', 'sub_fields' => array(
                    array( 'key' => 'field_v2_title', 'label' => 'Título', 'name' => 'value_2_title', 'type' => 'text', 'maxlength' => 30 ),
                    array( 'key' => 'field_v2_desc', 'label' => 'Descripción', 'name' => 'value_2_desc', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 )
                )),
                // Value 3
                array( 'key' => 'field_val_3_group', 'label' => 'Valor 3', 'type' => 'group', 'name' => 'value_3', 'sub_fields' => array(
                    array( 'key' => 'field_v3_title', 'label' => 'Título', 'name' => 'value_3_title', 'type' => 'text', 'maxlength' => 30 ),
                    array( 'key' => 'field_v3_desc', 'label' => 'Descripción', 'name' => 'value_3_desc', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 )
                )),
            ),
            'location' => array(
                array(
                    array( 'param' => 'page_template', 'operator' => '==', 'value' => 'template-about.php' ),
                ),
            ),
            'position' => 'normal',
        ));

        // --- GRUPO 1C: LANDING PAGES FLEXIBLES (FLEXIBLE CONTENT) ---
        acf_add_local_field_group( array(
            'key' => 'group_cmc_flexible',
            'title' => '⚡ Constructor Visual de Bloques (Landing Builder)',
            'fields' => array(
                array(
                    'key' => 'field_flexible_blocks',
                    'label' => 'Bloques de la Página',
                    'name' => 'flexible_blocks',
                    'type' => 'flexible_content',
                    'instructions' => 'Añade y ordena dinámicamente componentes visuales.',
                    'button_label' => '➕ Añadir Bloque a la Página',
                    'layouts' => array(
                        // LAYOUT: Hero Banner
                        'lay_hero_banner' => array(
                            'key' => 'lay_hero_banner',
                            'name' => 'hero_banner',
                            'label' => '🎬 Hero Banner',
                            'display' => 'block',
                            'sub_fields' => array(
                                array( 'key' => 'f_hb_title', 'label' => 'Título', 'name' => 'title', 'type' => 'text', 'maxlength' => 60 ),
                                array( 'key' => 'f_hb_subtitle', 'label' => 'Subtítulo', 'name' => 'subtitle', 'type' => 'textarea', 'maxlength' => 120, 'rows' => 2 ),
                                array( 'key' => 'f_hb_image', 'label' => 'Imagen', 'name' => 'image', 'type' => 'image', 'return_format' => 'url' ),
                                array( 'key' => 'f_hb_cta_t', 'label' => 'Texto Botón', 'name' => 'cta_text', 'type' => 'text', 'maxlength' => 20, 'wrapper' => array('width' => '33%') ),
                                array( 'key' => 'f_hb_cta_u', 'label' => 'URL Botón', 'name' => 'cta_url', 'type' => 'url', 'wrapper' => array('width' => '33%') ),
                                array( 'key' => 'f_hb_overlay', 'label' => 'Opacidad Overlay (0-100)', 'name' => 'overlay_opacity', 'type' => 'number', 'min' => 0, 'max' => 100, 'default_value' => 40, 'wrapper' => array('width' => '34%') ),
                            )
                        ),
                        // LAYOUT: Text Image
                        'lay_text_image' => array(
                            'key' => 'lay_text_image',
                            'name' => 'text_image',
                            'label' => '📖 Texto + Imagen (50/50)',
                            'display' => 'block',
                            'sub_fields' => array(
                                array( 'key' => 'f_ti_title', 'label' => 'Título', 'name' => 'title', 'type' => 'text', 'maxlength' => 50 ),
                                array( 'key' => 'f_ti_content', 'label' => 'Contenido / WYSIWYG', 'name' => 'content', 'type' => 'wysiwyg', 'toolbar' => 'basic', 'media_upload' => 0 ),
                                array( 'key' => 'f_ti_image', 'label' => 'Imagen', 'name' => 'image', 'type' => 'image', 'return_format' => 'url', 'wrapper' => array('width' => '50%') ),
                                array( 'key' => 'f_ti_pos', 'label' => 'Posición Imagen', 'name' => 'image_position', 'type' => 'select', 'choices' => array('left' => 'Izquierda', 'right' => 'Derecha'), 'default_value' => 'right', 'wrapper' => array('width' => '50%') ),
                            )
                        ),
                        // LAYOUT: Products Grid
                        'lay_products_grid' => array(
                            'key' => 'lay_products_grid',
                            'name' => 'products_grid',
                            'label' => '🛍️ Rejilla de Productos',
                            'display' => 'block',
                            'sub_fields' => array(
                                array( 'key' => 'f_pg_title', 'label' => 'Título de la Sección', 'name' => 'title', 'type' => 'text', 'maxlength' => 40 ),
                                array( 'key' => 'f_pg_subtitle', 'label' => 'Subtítulo de la Sección', 'name' => 'subtitle', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 ),
                                array( 'key' => 'f_pg_cat', 'label' => 'ID Categoría WooCommerce', 'name' => 'category_id', 'type' => 'number', 'instructions' => 'Deja en blanco para destacar recientes.', 'wrapper' => array('width' => '50%') ),
                                array( 'key' => 'f_pg_count', 'label' => 'Cantidad de Productos', 'name' => 'products_count', 'type' => 'number', 'default_value' => 4, 'wrapper' => array('width' => '50%') ),
                            )
                        ),
                        // LAYOUT: CTA Banner
                        'lay_cta_banner' => array(
                            'key' => 'lay_cta_banner',
                            'name' => 'cta_banner',
                            'label' => '📣 Banner de Llamada a la Acción (CTA)',
                            'display' => 'block',
                            'sub_fields' => array(
                                array( 'key' => 'f_cta_title', 'label' => 'Título', 'name' => 'title', 'type' => 'text', 'maxlength' => 50 ),
                                array( 'key' => 'f_cta_sub', 'label' => 'Subtítulo', 'name' => 'subtitle', 'type' => 'textarea', 'maxlength' => 100, 'rows' => 2 ),
                                array( 'key' => 'f_cta_bg', 'label' => 'Color de Fondo', 'name' => 'background_color', 'type' => 'color_picker', 'default_value' => '#334f2b', 'wrapper' => array('width' => '33%') ),
                                array( 'key' => 'f_cta_txt', 'label' => 'Texto Botón', 'name' => 'cta_text', 'type' => 'text', 'maxlength' => 20, 'wrapper' => array('width' => '33%') ),
                                array( 'key' => 'f_cta_url', 'label' => 'URL Enlace', 'name' => 'cta_url', 'type' => 'url', 'wrapper' => array('width' => '34%') ),
                            )
                        ),
                        // LAYOUT: Testimonial
                        'lay_testimonial' => array(
                            'key' => 'lay_testimonial',
                            'name' => 'testimonial',
                            'label' => '⭐ Reseña / Testimonio',
                            'display' => 'block',
                            'sub_fields' => array(
                                array( 'key' => 'f_t_quote', 'label' => 'Cita / Testimonio', 'name' => 'quote', 'type' => 'textarea', 'maxlength' => 200, 'rows' => 3 ),
                                array( 'key' => 'f_t_auth', 'label' => 'Autor / Cliente', 'name' => 'author', 'type' => 'text', 'maxlength' => 40, 'wrapper' => array('width' => '50%') ),
                                array( 'key' => 'f_t_rate', 'label' => 'Puntuación (1-5)', 'name' => 'rating', 'type' => 'number', 'min' => 1, 'max' => 5, 'default_value' => 5, 'wrapper' => array('width' => '50%') ),
                            )
                        ),
                    )
                )
            ),
            'location' => array(
                array(
                    array( 'param' => 'page_template', 'operator' => '==', 'value' => 'template-flexible.php' ),
                ),
            ),
            'position' => 'normal',
        ));

    } // Fin de config ACF

    /**
     * ==================================================================
     * SECCIÓN 2: CUSTOM REST API ENDPOINT (FALLBACK DE IDIOMA INCLUIDO)
     * ==================================================================
     */
    add_action( 'rest_api_init', function() {
        register_rest_route( 'cmc/v1', '/page/(?P<slug>[a-zA-Z0-9-_]+)', array(
            'methods' => 'GET',
            'callback' => 'cmc_get_page_by_slug_endpoint',
            'permission_callback' => '__return_true'
        ) );
    } );

    /**
     * CALLBACK ENDPOINT REST /wp-json/cmc/v1/page/{slug}?lang=locale
     */
    function cmc_get_page_by_slug_endpoint( $request ) {
        $slug = sanitize_text_field( $request['slug'] );
        $lang = $request->get_param( 'lang' );
        
        if ( empty( $lang ) ) {
            $lang = 'es';
        }

        // Búsqueda de página ignorando filtros de idioma iniciales para localizar el nodo
        $args = array(
            'name'           => $slug,
            'post_type'      => array( 'page', 'post' ),
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'lang'           => '', // Fuerza Polylang a desactivar filtros de idioma para encontrar por slug puro
        );

        $query = new WP_Query( $args );

        if ( ! $query->have_posts() ) {
            return new WP_Error( 'rest_no_page', 'Página no encontrada', array( 'status' => 404 ) );
        }

        $found_post = $query->posts[0];
        $target_id = $found_post->ID;

        // Mapear a la traducción requerida si existe
        if ( function_exists( 'pll_get_post' ) ) {
            $translated_id = pll_get_post( $found_post->ID, $lang );
            // Si existe la traducción, pivotamos al ID traducido
            if ( $translated_id && 'publish' === get_post_status( $translated_id ) ) {
                $target_id = $translated_id;
            }
        }

        $target_post = get_post( $target_id );
        
        // Obtención de campos ACF
        $acf_fields = array();
        if ( function_exists( 'get_fields' ) ) {
            $fields = get_fields( $target_id );
            $acf_fields = ! empty( $fields ) ? $fields : new stdClass();
        } else {
            $acf_fields = new stdClass();
        }

        // Obtener hermano para translation_id
        $sibling_id = null;
        if ( function_exists( 'pll_get_post_translations' ) ) {
            $translations = pll_get_post_translations( $target_id );
            $other_lang = ( $lang === 'es' ) ? 'en' : 'es';
            $sibling_id = isset( $translations[$other_lang] ) ? $translations[$other_lang] : null;
        }

        // Formatear respuesta final
        return new WP_REST_Response( array(
            'id'             => $target_id,
            'slug'           => $target_post->post_name,
            'lang'           => $lang,
            'translation_id' => $sibling_id,
            'template'       => get_post_meta( $target_id, '_wp_page_template', true ),
            'acf'            => $acf_fields,
            'status'         => $target_post->post_status,
            'title'          => get_the_title( $target_id )
        ), 200 );
    }

    /**
     * ==================================================================
     * SECCIÓN 3: DASHBOARD BILINGÜE & METABOX DE TRADUCCIÓN
     * ==================================================================
     */
    
    // Dashboard CMC Menú Principal
    add_action( 'admin_menu', function() {
        add_menu_page(
            'CMC Belleza',
            'CMC Belleza',
            'edit_posts',
            'cmc-traducciones',
            'cmc_render_dashboard_page',
            'dashicons-translation',
            30
        );
    } );

    function cmc_render_dashboard_page() {
        ?>
        <div class="wrap">
            <h1 style="margin-bottom: 20px;">🌍 CMC Belleza — Auditoría de Traducciones</h1>
            <p class="description">Visualización del estado de bilingüismo en páginas críticas para asegurar la integridad del Front-End headless.</p>
            <br>
            
            <table class="wp-list-table widefat fixed striped posts">
                <thead>
                    <tr>
                        <th scope="col" class="manage-column column-title">Página / Post</th>
                        <th scope="col" class="manage-column">Estado ES (Principal)</th>
                        <th scope="col" class="manage-column">Estado EN (Inglés)</th>
                        <th scope="col" class="manage-column">Plantilla Utilizada</th>
                    </tr>
                </thead>
                <tbody>
                <?php
                $pages = get_posts( array(
                    'post_type'      => 'page',
                    'posts_per_page' => -1,
                    'lang'           => 'es', // Empezamos por el idioma origen para cruzar
                    'post_status'    => array( 'publish', 'draft', 'pending' )
                ) );

                if ( empty($pages) ) {
                    echo '<tr><td colspan="4">No se encontraron páginas.</td></tr>';
                } else {
                    foreach ( $pages as $p ) {
                        $es_status = get_post_status( $p->ID );
                        $es_link = get_edit_post_link( $p->ID );
                        $template = get_post_meta( $p->ID, '_wp_page_template', true );
                        
                        // Cruzar traducción
                        $en_id = 0;
                        $en_status = 'none';
                        $en_link = '#';
                        
                        if ( function_exists( 'pll_get_post' ) ) {
                            $translated = pll_get_post( $p->ID, 'en' );
                            if ( $translated ) {
                                $en_id = $translated;
                                $en_status = get_post_status( $translated );
                                $en_link = get_edit_post_link( $translated );
                            } else {
                                // Genera enlace para crear traducción en Polylang
                                $en_link = admin_url( 'post-new.php?post_type=page&from_post=' . $p->ID . '&new_lang=en' );
                            }
                        }

                        // Formatear Etiquetas ES
                        $tag_es = '❌ Sin crear';
                        if ( $es_status === 'publish' ) {
                            $tag_es = '<span style="color: #46b450; font-weight:bold;">✅ Publicado</span>';
                        } elseif ( $es_status === 'draft' || $es_status === 'pending' ) {
                            $tag_es = '<span style="color: #ffb900; font-weight:bold;">⚠️ Borrador</span>';
                        }

                        // Formatear Etiquetas EN
                        $tag_en = '<a href="'.$en_link.'" style="color: #dc3232; text-decoration:none; font-weight:bold;">❌ Sin traducción (Crear)</a>';
                        if ( $en_status === 'publish' ) {
                            $tag_en = '<span style="color: #46b450; font-weight:bold;">✅ Publicado</span>';
                        } elseif ( $en_status === 'draft' || $en_status === 'pending' ) {
                            $tag_en = '<span style="color: #ffb900; font-weight:bold;">⚠️ Borrador</span>';
                        }
                        ?>
                        <tr>
                            <td class="title column-title">
                                <strong><a class="row-title" href="<?php echo $es_link; ?>"><?php echo get_the_title( $p->ID ); ?></a></strong>
                            </td>
                            <td>
                                <a href="<?php echo $es_link; ?>"><?php echo $tag_es; ?></a>
                            </td>
                            <td>
                                <a href="<?php echo $en_link; ?>"><?php echo $tag_en; ?></a>
                            </td>
                            <td>
                                <code><?php echo $template ? esc_html($template) : 'default'; ?></code>
                            </td>
                        </tr>
                        <?php
                    }
                }
                ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    // Metabox de Traducción en la barra lateral del Editor
    add_action( 'add_meta_boxes', function() {
        add_meta_box(
            'cmc_translation_status_box',
            '🌐 Estado de traducción CMC',
            'cmc_render_translation_metabox',
            array( 'page', 'post' ),
            'side',
            'high'
        );
    } );

    function cmc_render_translation_metabox( $post ) {
        if ( ! function_exists( 'pll_get_post_translations' ) ) {
            echo '<p>El plugin Polylang no está activo.</p>';
            return;
        }

        $translations = pll_get_post_translations( $post->ID );
        $current_lang = pll_get_post_language( $post->ID );

        $has_es = isset($translations['es']);
        $has_en = isset($translations['en']);
        
        $es_pub = $has_es && get_post_status($translations['es']) === 'publish';
        $en_pub = $has_en && get_post_status($translations['en']) === 'publish';

        echo '<div style="margin-top: 10px; padding: 10px; border-radius: 5px; border: 1px solid #ccd0d4; background: #f9f9f9;">';
        
        if ( $es_pub && $en_pub ) {
            echo '<div style="background-color: #edf8ee; color: #1e4620; border: 1px solid #c3e6cb; padding: 8px; border-radius: 3px; font-weight:bold; display:flex; align-items:center; gap:6px;">';
            echo '<span>✅ Totalmente Traducido</span>';
            echo '</div>';
            echo '<p style="font-size:12px; margin-bottom:0;">Ambas versiones (ES/EN) están publicadas y accesibles.</p>';
        } else {
            echo '<div style="background-color: #fffcf3; color: #856404; border: 1px solid #ffeeba; padding: 8px; border-radius: 3px; font-weight:bold; display:flex; align-items:center; gap:6px;">';
            echo '<span>⚠️ Incompleto</span>';
            echo '</div>';
            echo '<p style="font-size:12px; margin-bottom: 10px;">Se detecta que falta una de las versiones o está en borrador.</p>';
            
            // Indicar específicamente
            if ( !$has_en ) {
                $en_create_link = admin_url( 'post-new.php?post_type='.$post->post_type.'&from_post=' . $post->ID . '&new_lang=en' );
                echo '<a href="'.esc_url($en_create_link).'" class="button button-primary" style="width:100%; text-align:center; background-color:#d63638; border-color:#d63638;">➕ Crear Traducción EN</a>';
            } else if ( !$en_pub ) {
                $en_edit = get_edit_post_link($translations['en']);
                echo '<a href="'.esc_url($en_edit).'" class="button button-secondary" style="width:100%; text-align:center;">📝 Publicar Borrador EN</a>';
            }
        }
        echo '</div>';
    }

    /**
     * ==================================================================
     * SECCIÓN DE LEGADO (HOOKS 1-4 ORIGINALES PRESERVADOS DE V1.0.2)
     * ==================================================================
     */
    
    // HOOK 1: Iniciar idioma en Contexto REST Global
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

    // HOOK 2: rest_post_query & rest_page_query
    add_filter( 'rest_post_query', 'cmc_filter_rest_queries_by_polylang', 10, 2 );
    add_filter( 'rest_page_query', 'cmc_filter_rest_queries_by_polylang', 10, 2 );
    
    function cmc_filter_rest_queries_by_polylang( $args, $request ) {
        $lang = $request->get_param( 'lang' );
        if ( ! empty( $lang ) ) {
            $args['lang'] = sanitize_text_field( $lang );
        }
        return $args;
    }

    // HOOK 3: pre_get_posts (Para WooCommerce REST)
    add_action( 'pre_get_posts', function( $query ) {
        if ( ! is_admin() && defined( 'REST_REQUEST' ) && REST_REQUEST ) {
            $lang = isset( $_GET['lang'] ) ? sanitize_text_field( $_GET['lang'] ) : '';
            $allowed_langs = array( 'es', 'en' );
            
            if ( ! empty( $lang ) && in_array( $lang, $allowed_langs ) ) {
                if ( $query->get( 'post_type' ) === 'product' || ( is_array( $query->get( 'post_type' ) ) && in_array( 'product', $query->get( 'post_type' ) ) ) ) {
                    $tax_query = $query->get( 'tax_query' );
                    if ( ! is_array( $tax_query ) ) {
                        $tax_query = array();
                    }
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
    }, 999 );

    // HOOK 4: register_rest_field (Translations & Lang con soporte de ESCRITURA)
    add_action( 'rest_api_init', function() {
        $post_types = array( 'post', 'page', 'product' );
        foreach ( $post_types as $type ) {
            // A) Traducciones (GET & UPDATE)
            register_rest_field( $type, 'translations', array(
                'get_callback' => function( $object ) {
                    $post_id = $object['id'];
                    if ( function_exists( 'pll_get_post_translations' ) ) {
                        $translations = pll_get_post_translations( $post_id );
                        return !empty($translations) ? $translations : new stdClass();
                    }
                    return new stdClass(); 
                },
                'update_callback' => function( $value, $object, $field_name ) {
                    if ( ! is_array( $value ) ) return;
                    if ( function_exists( 'pll_save_post_translations' ) ) {
                        $sanitized = array();
                        foreach ( $value as $k => $v ) {
                            $sanitized[sanitize_key($k)] = intval($v);
                        }
                        pll_save_post_translations( $sanitized );
                    }
                },
                'schema'          => array(
                    'description' => 'Asociaciones de idioma de Polylang (es/en).',
                    'type'        => 'object',
                    'context'     => array( 'view', 'edit' ),
                ),
            ) );

            // B) Lenguaje (GET & UPDATE)
            register_rest_field( $type, 'lang', array(
                'get_callback' => function( $object ) {
                    if ( function_exists( 'pll_get_post_language' ) ) {
                        return pll_get_post_language( $object['id'] );
                    }
                    return null;
                },
                'update_callback' => function( $value, $object, $field_name ) {
                    if ( empty( $value ) ) return;
                    if ( function_exists( 'pll_set_post_language' ) ) {
                        pll_set_post_language( $object->ID, sanitize_text_field( $value ) );
                    }
                },
                'schema' => array(
                    'description' => 'Idioma del objeto Polylang.',
                    'type'        => 'string',
                    'context'     => array( 'view', 'edit' ),
                )
            ) );
        }
    } );

});
