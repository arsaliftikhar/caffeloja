<?php
/**
 *  -------------------------------------------------
 *  Hybrid MLM  Copyright (c) 2018 All Rights Reserved
 *  -------------------------------------------------
 *
 * @author Acemero Technologies Pvt Ltd
 * @link https://www.acemero.com
 * @see https://www.hybridmlm.io
 * @version 1.00
 */

namespace HybridMLMWP\Inc;

require_once HYBRIDMLM_PLUGIN_DIR . 'inc/helper.php';

/**
 * Class pv
 */
class pv extends helper
{
    /**
     * @return $this
     */
    function __construct()
    {
        $this->register_hooks();

        return $this;
    }

    /**
     * @return $this
     */
    function register_hooks()
    {
        add_action('woocommerce_product_options_general_product_data', [$this, 'create_custom_product_field']);
        add_action('woocommerce_process_product_meta', [$this, 'save_custom_product_field']);
        add_action('woocommerce_variation_options_pricing', [$this, 'create_custom_product_field_in_variations'], 10, 3);
        add_action('woocommerce_save_product_variation', [$this, 'save_custom_product_field_variations'], 10, 2);
        add_filter('woocommerce_available_variation', [$this, 'add_custom_field_variation_data']);
        // add_action('woocommerce_after_shop_loop_item', [$this, 'display_pv_on_product_list']);
        // add_filter('woocommerce_get_price_html', [$this, 'add_pv_on_product_page'], 9999, 2);
        // add_action('woocommerce_before_add_to_cart_form', [$this, 'display_pv_on_product_list'], 11);
        // add_action('woocommerce_after_cart_table', [$this, 'add_pv_table'], 10, 0);
        // add_action('woocommerce_review_order_before_payment', [$this, 'add_pv_table'], 10, 0);

        return $this;
    }

    /**
     * Create custom product field
     */
    function create_custom_product_field()
    {
        global  $post;


        $product = wc_get_product($post->ID);
        $product->get_type();

       /* if( $product->get_type()== "variable" ) {
            $product->update_meta_data('mlm_product_pv', '');
            $product->save();
            return true;
        }*/
            $args = [
                'id' => 'mlm_product_pv',
                'label' => $this->__t('mlm_product_pv'),
                'class' => 'hybrid-custom-field',
                'desc_tip' => true,
                'description' => $this->__t('enter_mlm_product_pv'),
            ];

        echo "<div class='hybrid-custom-field-group show_if_simple'>";
            woocommerce_wp_text_input($args);
            echo "</div>";
    }

    /**
     * @param $post_id
     */
    function save_custom_product_field($post_id)
    {
        $product = wc_get_product($post_id);
        $title = isset($_POST['mlm_product_pv']) ? $_POST['mlm_product_pv'] : '';
        $product->update_meta_data('mlm_product_pv', sanitize_text_field($title));
        $product->save();
    }

    /**
     * @param $loop
     * @param $variation_data
     * @param $variation
     */
    function create_custom_product_field_in_variations($loop, $variation_data, $variation)
    {
        woocommerce_wp_text_input([
            'id' => 'mlm_variation_product_pv[' . $loop . ']',
            'class' => 'short',
            'label' => $this->__t('mlm_product_pv'),
            'value' => get_post_meta($variation->ID, 'mlm_variation_product_pv', true)
        ]);
    }

    /**
     * @param $variation_id
     * @param $i
     */
    function save_custom_product_field_variations($variation_id, $i)
    {
        global  $post;
        $product = wc_get_product($post->ID);
        $custom_field = $_POST['mlm_variation_product_pv'][$i];

        if (isset($custom_field)) update_post_meta($variation_id, 'mlm_variation_product_pv', esc_attr($custom_field));
        $product->update_meta_data('mlm_product_pv', '');
        $product->save();
    }

    /**
     * @param $variations
     * @return mixed
     */
    function add_custom_field_variation_data($variations)
    {
        $variations['mlm_variation_product_pv'] = '<div class="woocommerce_custom_field">' . $this->__t('mlm_product_pv') . ': <span>' . get_post_meta($variations['variation_id'], 'mlm_variation_product_pv', true) . '</span></div>';

        return $variations;
    }


    /**
     *
     */
    function display_pv_on_product_list()
    {
        global $product;

        if ($product->is_type('variable')) {
            $variations = $product->get_available_variations();
            $variations_id = wp_list_pluck($variations, 'variation_id');
            foreach ($variations_id as $vid) {
                $product_pv[] = get_post_meta($vid, 'mlm_variation_product_pv', true);
            }
            $pv_arr = array_diff($product_pv, [null]);
            if(count($pv_arr))
            {
                if(min($pv_arr)==max($pv_arr))
                    $pv = max($pv_arr);
                else
                    $pv = min($pv_arr) . " - " . max($pv_arr);
            }
            else
                $pv ='';


        } else {
            $pv = get_post_meta($product->get_id(), 'mlm_product_pv', true);
        }
        if($pv)
        echo "<p><strong>" . $this->__t('pv') . ": " . $pv . "</strong></p>";
    }

    /**
     * @param $price
     * @param $product
     * @return string
     */
    function add_pv_on_product_page($price, $product)
    {
        $product_pv = get_post_meta($product->get_variation_id(), 'mlm_variation_product_pv', true);
       // if (!$product_pv)
          //  $product_pv = get_post_meta($product->get_id(), 'mlm_product_pv', true);

        if ($product_pv)
            $price .= '&nbsp;&nbsp;<br/><span style="order: 3;"><strong>' . $this->__t("pv") . ': </strong>' . $product_pv . ' </span>' ;

        return $price;
    }



    /**
     *
     */
    function add_pv_table()
    {
        global $woocommerce;
        $items = $woocommerce->cart->get_cart();
        echo "<div class='pv-table'><h3>" . $this->__t('products_PV') . "</h3>";
        echo '<table class="shop_table_responsive" cellspacing="0">
				<thead>
					<tr>
						<th>' . $this->__t("product") . '</th>
						<th>' . $this->__t("pv") . '</th>
						<th>' . $this->__t("quantity") . '</th>
						<th>' . $this->__t("total_pv") . '</th>
					</tr>
				</thead>
				<tbody>';
        foreach ($items as $item => $values) {
            $product = wc_get_product($values['data']->get_id());
                $product_pv = get_post_meta($values['variation_id'], 'mlm_variation_product_pv', true);
            if (!$product_pv)
                $product_pv = get_post_meta($values['product_id'], 'mlm_product_pv', true);

                $total_pv = $product_pv ? $product_pv * $values['quantity']:'';

            echo "<tr><td>" . $product->get_title() . "</td>        
						<td>" . $product_pv . "</td>
						<td>" . $values['quantity'] . "</td>
						<td>" . $total_pv . "</td>
					</tr>";
        }
        echo '</tbody>
    </table></div>';
    }


}