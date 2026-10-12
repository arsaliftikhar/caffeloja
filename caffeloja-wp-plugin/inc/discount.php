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
 * Class discount
 */
class discount  extends helper
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

        add_filter('woocommerce_get_price_html', [$this, 'apply_discount_on_price'], 9999, 2);
        add_action('woocommerce_before_calculate_totals', [$this, 'calculate_totals'], 9999);

        return $this;
    }

    /**
     * @param $wp_user_id
     * @return boolean
     */
    function check_mlm_user($wp_user_id)
    {
        if (!$wp_user_id) return false;

        $mlm_user_id = get_user_meta($wp_user_id, 'mlm_user_id', true);
        if ($mlm_user_id) return $mlm_user_id;

        return false;
    }

    /**
     * @param $price_html
     * @param $product
     * @return mixed
     */
    function apply_discount_on_price($price_html, $product)
    {
        // ONLY ON FRONTEND
        if (is_admin()) return $price_html;

        // ONLY IF PRICE NOT NULL
        if ('' === $product->get_price()) return $price_html;

        if (!($discountRate = (double)get_option('hybridmlm_discount_price'))) return $price_html;

        // IF CUSTOMER LOGGED IN, APPLY 20% DISCOUNT
        if (wc_current_user_has_role('customer') && $this->check_mlm_user(get_current_user_id())) {
            $orig_price = wc_get_price_to_display($product);
            $discount_price = $orig_price - ($orig_price * $discountRate / 100);
           // $product_pv = get_post_meta($product->get_variation_id(), 'mlm_variation_product_pv', true);
           // if (!$product_pv)
                //$product_pv = get_post_meta($product->get_id(), 'mlm_product_pv', true);
            $price_html = '<p class="price">';
            $price_html .= '<del>' . wc_price($orig_price) . '</del>';
            $price_html .= '&nbsp;&nbsp;<ins>' . wc_price($discount_price) . '</ins>';

            //if ($product_pv)
                //$price_html .= '&nbsp;&nbsp;<br/><span style="order: 3;"><strong>' . $this->__t("pv") . ': </strong>'.$product_pv.'</span>';

            $price_html .= '</p>';

        }

        return $price_html;
    }

    /**
     * @param $cart
     */
    function calculate_totals($cart)
    {
        if (is_admin() && !defined('DOING_AJAX')) return;

        if (did_action('woocommerce_before_calculate_totals') >= 2) return;

        // IF CUSTOMER NOT LOGGED IN, DONT APPLY DISCOUNT
        if (!wc_current_user_has_role('customer')) return;

        if (!$this->check_mlm_user(get_current_user_id())) return;

        if (!($discountRate = (double)get_option('hybridmlm_discount_price'))) return;

        // LOOP THROUGH CART ITEMS & APPLY 20% DISCOUNT
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            $product = $cart_item['data'];
            $price = $product->get_price();
            $cart_item['data']->set_price($price - ($price * $discountRate / 100));
        }
    }


}