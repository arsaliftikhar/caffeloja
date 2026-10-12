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

use Exception;
require_once HYBRIDMLM_PLUGIN_DIR . 'inc/api_helper.php';
require_once HYBRIDMLM_PLUGIN_DIR . 'inc/helper.php';
global $apiHelper;

/**
 * Class purchase
 */
class purchase extends helper
{
    /**
     * @return $this
     */
    function __construct()
    {
        $this->register_hooks();


        $this->apiHelper = new api_helper();

        return $this;
    }

    /**
     * @return $this
     */
    function register_hooks()
    {
        add_action('init', [$this, 'register_session']);
        add_action('woocommerce_thankyou', [$this, 'send_order_data'], 99999, 1);
        add_action('woocommerce_order_status_changed', [$this, 'update_order_status'], 10, 4);
        //add_action('wps_subscription_created',  [$this, 'update_subscription'], 10, 2 );
        add_action( 'woocommerce_checkout_process', [$this, 'acemero_membership_checkout_validation'] );
//        add_action( 'woocommerce_before_checkout_form', [$this, 'acemero_remove_generic_cart_error_notice_flexible'], 1 );
//        add_action( 'woocommerce_before_cart', [$this, 'acemero_remove_generic_cart_error_notice_flexible'], 1 );
        add_action( 'woocommerce_check_cart_items', [$this, 'acemero_membership_checkout_validation'], 10 );
        //        add_action( 'woocommerce_before_checkout_form', [$this, 'acemero_remove_generic_cart_error_notice'], 1 );
//        add_action( 'woocommerce_check_cart_items', [$this, 'acemero_validate_membership_cart']);
        // add_action('woocommerce_applied_coupon', [$this, 'user_applied_coupon'], 10, 1);
       // add_action('woocommerce_removed_coupon', [$this, 'user_removed_coupon'], 10, 1);
       // add_action( 'woocommerce_check_cart_items', [$this, 'acemero_validate_membership_cart'] );
        // Disable WooCommerce's generic cart error notice
       // add_filter( 'woocommerce_cart_redirect_after_error', '__return_false' );
//          add_action('woocommerce_before_calculate_totals', [$this, 'acemero_validate_membership_cart']); // Triggers during AJAX updates
//        add_action('woocommerce_add_to_cart', function($cart_item_key, $product_id) {
//            if (is_user_logged_in()) {
//                $categories = wp_get_post_terms($product_id, 'product_cat', ['fields' => 'slugs']);
//                if (in_array('membership', $categories)) {
//                    WC()->cart->remove_cart_item($cart_item_key);
//                    wc_add_notice(__('You cannot add membership products while logged in. Please log out to purchase a membership.', 'woocommerce'), 'error');
//                }
//            }
//        }, 10, 2);
add_action('woocommerce_before_shop_loop', [$this, 'add_title_before_shop_loop'], 5);

        return $this;
    }

    
    function update_subscription( $subscription_id, $order_id ) {
        if (!$order_id) return false;

        $order = wc_get_order($order_id);
        $subscription = wc_get_order($subscription_id);
        $next_payment_timestamp = $subscription->get_meta('wps_next_payment_date');
        $body = [
            'action' => 'updateSubscription',
            'data' => [
                'orderId' => $order_id,
                'wp_customer_id' => $order->get_user_id(),  
                'subscriptionID' => $subscription_id,
                'subscription_status'=> $subscription->get_meta('wps_subscription_status'),
                'subscription_expiry_date' => $next_payment_timestamp ? date('Y-m-d', $next_payment_timestamp) :null
            ]
        ];

        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];

        $result = $this->apiHelper->call_api($body, $headers);

        return $this;
    }


    /**
     * Validate membership products on checkout
     */
    function acemero_membership_checkout_validation() {
        if ( ! WC()->cart ) return;

        $has_membership = false;
        $has_normal_product = false;

        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $product_id = $cart_item['product_id'];

            if ( has_term( 'membership', 'product_cat', $product_id ) ) {
                $has_membership = true;
            }

            if ( has_term( 'products', 'product_cat', $product_id ) ) {
                $has_normal_product = true;
            }
        }
        

        // Membership-only cart
        if ( !is_user_logged_in() && $has_membership && ! $has_normal_product ) {
            wc_add_notice( 'You cannot purchase a membership product alone. Please add a regular product from Products category to your cart.', 'error' );
        }

        // Logged-in user trying to buy membership
        if ( is_user_logged_in() && $this->user_has_active_wps_subscription( get_current_user_id() ) && $has_membership ) {
            wc_add_notice( 'Membership products can only be purchased by guests / inactive users.', 'error' );
        }

        //  if ( !is_user_logged_in() && !$has_membership ) {
        //     wc_add_notice( 'Please log in to continue.', 'error' );
        // }

        // Stop checkout if there are any errors
        // if ( wc_notice_count( 'error' ) > 0 ) {
        //     // This prevents WooCommerce from proceeding to order creation
        //     throw new Exception('Membership validation failed.');
        // }
    }




    /**
     * Validate membership products in the cart
     */
    function acemero_validate_membership_cart_flexible1() {
        if ( ! WC()->cart ) return;

        $has_membership = false;
        $has_normal_product = false;

        foreach ( WC()->cart->get_cart() as $cart_item ) {
            $product_id = $cart_item['product_id'];

            if ( has_term( 'membership', 'product_cat', $product_id ) ) {
                $has_membership = true;
            }

            if ( has_term( 'products', 'product_cat', $product_id ) ) {
                $has_normal_product = true;
            }
        }

        // Membership products cannot be bought alone
        if ( $has_membership && ! $has_normal_product ) {
            wc_add_notice( __( 'You cannot purchase a membership product alone. Please add a regular product from Products category to your cart.' ), 'error' );
//            remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
        }

        // Membership products only for guests
        if ( is_user_logged_in() && !$this->user_has_active_wps_subscription( get_current_user_id() ) && $has_membership ) {
            wc_add_notice( __( 'Membership products can only be purchased by guests / non active users.' ), 'error' );
//            remove_action( 'woocommerce_proceed_to_checkout', 'woocommerce_button_proceed_to_checkout', 20 );
        }

        // Optional: Warn guest if membership + regular products are in cart
//        if ( $has_membership && $has_normal_product && ! is_user_logged_in() ) {
//            wc_add_notice( __( 'You have added a membership product along with regular products. Please review before checkout.' ), 'notice' );
//        }
    }


    /**
     * Remove WooCommerce generic cart error messages
     */
    function acemero_remove_generic_cart_error_notice_flexible1() {
        if ( ! is_cart() && ! is_checkout() ) return;

        $all_notices = wc_get_notices();

        if ( empty( $all_notices ) || ! isset( $all_notices['error'] ) ) return;

        $filtered_errors = [];

        foreach ( $all_notices['error'] as $notice ) {
            $text = is_array( $notice ) && isset( $notice['notice'] ) ? wp_strip_all_tags( $notice['notice'] ) : wp_strip_all_tags( (string) $notice );

            // Skip WooCommerce generic cart errors
            if ( strpos( $text, 'There are some issues with the items in your cart' ) !== false ) continue;

            $filtered_errors[] = $text;
        }

        // Clear all and re-add only custom messages
        wc_clear_notices();

        foreach ( $filtered_errors as $err ) {
            wc_add_notice( $err, 'error' );
        }
    }


    /**
     * @param $user_id
     * @return bool
     */
    function user_has_active_wps_subscription($user_id ) {
        global $wpdb;
        if ( ! $user_id ) {
            return false;
        }

        $query = $wpdb->prepare("SELECT o.id
    FROM {$wpdb->prefix}wc_orders AS o
    INNER JOIN {$wpdb->prefix}wc_orders_meta AS m1 
        ON o.id = m1.order_id AND m1.meta_key = 'wps_customer_id'
    INNER JOIN {$wpdb->prefix}wc_orders_meta AS m2 
        ON o.id = m2.order_id AND m2.meta_key = 'wps_subscription_status'
    WHERE o.type = 'wps_subscriptions'
      AND m1.meta_value = %d
      AND m2.meta_value IN ('active', 'renewal')
    LIMIT 1", $user_id);

        $order_id = $wpdb->get_var($query);
        if ( $order_id ) return true;
        else return false;
    }

//    /**
//     * Validate membership cart (your existing logic).
//     */
//    function acemero_validate_membership_cart() {
//        if ( ! WC()->cart ) {
//            return;
//        }
//
//        $has_membership = false;
//        $has_normal_product = false;
//
//        foreach ( WC()->cart->get_cart() as $cart_item ) {
//            $product_id = $cart_item['product_id'];
//
//            if ( has_term( 'membership', 'product_cat', $product_id ) ) {
//                $has_membership = true;
//            } else {
//                $has_normal_product = true;
//            }
//        }
//
//        if ( $has_membership && ! $has_normal_product ) {
//            wc_add_notice( __( 'You cannot purchase a membership product alone. Please add a regular product to your cart.' ), 'error' );
//        }
//
//        if ( is_user_logged_in() && $has_membership ) {
//            wc_add_notice( __( 'Membership products can only be purchased by guests. Please log out to continue.' ), 'error' );
//        }
//    }
//
//
//
//    /**
//     * Remove WooCommerce generic cart error on checkout so only custom messages remain.
//     */
//    function acemero_remove_generic_cart_error_notice() {
//        // Only run on checkout page
//        if ( ! is_checkout() ) {
//            return;
//        }
//
//        // Get all notices (errors, success, info)
//        $all_notices = wc_get_notices();
//
//        if ( empty( $all_notices ) || ! isset( $all_notices['error'] ) ) {
//            return;
//        }
//
//        $filtered_errors = array();
//
//        // Iterate and keep only non-generic error messages
//        foreach ( $all_notices['error'] as $notice ) {
//            // Notice may be string or array depending on WooCommerce version
//            if ( is_array( $notice ) && isset( $notice['notice'] ) ) {
//                $text = wp_strip_all_tags( $notice['notice'] );
//            } else {
//                $text = wp_strip_all_tags( (string) $notice );
//            }
//
//            // If it contains WooCommerce generic text, skip it
//            // (compare by a distinctive substring)
//            if ( strpos( $text, 'There are some issues with the items in your cart' ) !== false ) {
//                continue;
//            }
//
//            // Keep other error notices
//            $filtered_errors[] = $text;
//        }
//
//        // Clear all notices and re-add only the filtered ones (errors)
//        if ( ! empty( $filtered_errors ) ) {
//            wc_clear_notices();
//            foreach ( $filtered_errors as $err_text ) {
//                wc_add_notice( $err_text, 'error' );
//            }
//        } else {
//            // If no remaining errors, just clear to remove the generic message entirely
//            wc_clear_notices();
//        }
//    }



    /**
     * @return void
     */
//    function acemero_validate_membership_cart() {
//        $has_membership = false;
//        $has_normal_product = false;
//
//        foreach ( WC()->cart->get_cart() as $cart_item ) {
//            $product_id = $cart_item['product_id'];
//
//            if ( has_term( 'membership', 'product_cat', $product_id ) ) {
//                $has_membership = true;
//            } else {
//                $has_normal_product = true;
//            }
//        }
//
//        // Case 1: Only membership products are in the cart
//        if ( $has_membership && ! $has_normal_product ) {
//            wc_add_notice( __( 'You cannot purchase a membership product alone. Please add a regular product to your cart.' ), 'error' );
//        }
//
//        // Case 2: Logged-in user tries to buy membership (if restricted)
//        if ( is_user_logged_in() && $has_membership ) {
//            wc_add_notice( __( 'Membership products can only be purchased by guests. Please log out to continue.' ), 'error' );
//        }
//    }

    /**
     *
     */
    function register_session()
    {
        if (!session_id()) {
            session_start();
        }
    }

    /**
     * @param $order_id
     * @return bool|ResponseInterface
     */
    function send_order_data($order_id)
    {
        if (!$order_id) return false;

        $order = wc_get_order($order_id);
        $items = $order->get_items();
        $calculated_pv = $total_pv = 0;
        $is_membership_order = false;
        $products = [];
        $subscription_id = $order->get_meta('wps_subscription_id');    
        foreach ($items as $key => $item) {
            $subscription_product= get_post_meta($item->get_product_id(), '_wps_sfw_product', true);
            $products[$key] = [
                'name' => $item->get_name(),
                'product_id' => $item->get_product_id(),
                'variation_id' => $item->get_variation_id(),
                'quantity' => $item->get_quantity(),
                'subtotal' => $item->get_subtotal(),
                'total' => $item->get_total(),
                'tax' => $item->get_subtotal_tax(),
                'taxclass' => $item->get_tax_class(),
                'taxstat' => $item->get_tax_status(),
                'allmeta' => $item->get_meta_data(),
                'type' => $item->get_type(),
                'is_membership' => ($subscription_product && $subscription_product == 'yes') ? true : false
            ];

            if($subscription_product && $subscription_product == 'yes')
                $is_membership_order = true;

            $product_pv = get_post_meta($item->get_variation_id(), 'mlm_variation_product_pv', true);
            if (!$product_pv)
                $product_pv = get_post_meta($item->get_product_id(), 'mlm_product_pv', true);
            $products[$key]['pv'] = $product_pv;

            if ($products[$key]['pv']) {
                $total_pv += ((double)$products[$key]['pv'] * (int)$products[$key]['quantity']);
                if($subscription_id && !$subscription_product)
                    $calculated_pv += ((double)$products[$key]['pv'] * (int)$products[$key]['quantity']);
                else
                    $calculated_pv = $total_pv;
            }

            $item->update_meta_data('pv', $product_pv);
            $item->save();
        }
        $order_id = $order->get_id();
        update_post_meta($order_id, 'total_pv', esc_attr(htmlspecialchars($total_pv)));

        $body = [
            'action' => 'purchase',
            'data' => [
                'orderId' => $order_id,
                'wp_customer_id' => $order->get_user_id(),
                'currency' => $order->get_currency(),
                'sub_total' => $order->get_subtotal(),
                'total' => $order->get_total(),
                'items' => $products,
                'total_pv' => $total_pv,
                'calculated_pv' => $calculated_pv
            ]
        ];

        if (isset($_SESSION['replicaName']) && !$order->get_user_id()) {
            $replication_status = true;
            $wp_user = get_user_by('login', $replicaName = $_SESSION['replicaName']);
            $replication_mlm_user_id = get_user_meta($wp_user->ID, 'mlm_user_id', true);

            update_post_meta($order_id, 'replication_status', esc_attr(htmlspecialchars($replication_status)));
            update_post_meta($order_id, 'replication_user_id', esc_attr(htmlspecialchars($wp_user->ID)));
            update_post_meta($order_id, 'replication_mlm_user_id', esc_attr(htmlspecialchars($replication_mlm_user_id)));
            $body['data']['replication_status'] = $replication_status;
            $body['data']['replication_user_id'] = $replication_mlm_user_id;
            $body['data']['wp_customer_id'] = $wp_user->ID;
        }

        if(count($order->get_coupon_codes()))
        {
            foreach( $order->get_coupon_codes() as $coupon_code ) {
                $body['data']['coupon_code'] = $coupon_code;
            }

        }

       
        if($is_membership_order)
        {           
            $subscription = wc_get_order($subscription_id);
            $next_payment_timestamp = $subscription->get_meta('wps_next_payment_date');
            $body['data']['is_membership_order'] = true;
            $body['data']['subscriptionID'] = $subscription_id;
            $body['data']['subscription_status'] = $subscription->get_meta('wps_subscription_status');
            $body['data']['subscription_expiry_date'] = $next_payment_timestamp ? date('Y-m-d', $next_payment_timestamp) :null;
        }
        else
            $body['data']['is_membership_order'] = false;

        $status = $order->get_status();
        $body['data']['status'] = $status;

        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];

        $result = $this->apiHelper->call_api($body, $headers);

        $mlm_order_id = json_decode($result['body'], true)[0]['order']['id'];
        if ($mlm_order_id)
            update_post_meta($order_id, 'mlm_order_id', esc_attr(htmlspecialchars($mlm_order_id)));

        return $this;
    }

    /**
     * @param $order_id
     * @param $old_status
     * @param $new_status
     * @param $that
     * @return mixed
     */
    function update_order_status($order_id, $old_status, $new_status, $that)
    {
        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'updateOrderStatus',
            'data' => [
                'wp_order_id' => $order_id,
                'status' => $new_status,
            ]
        ];
        $update_status = $this->apiHelper->call_api($body, $headers);

        return json_decode($update_status['body'], true);
    }

    /**
     * @param $coupon_code
     */
  /*  function user_applied_coupon($coupon_code ) {

        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'applyCoupon',
            'data' => [
                'coupon_code' => $coupon_code
            ]
        ];
        $update_status = $this->apiHelper->call_api($body, $headers);

        return json_decode($update_status['body'], true);

    }*/

    /**
     * @param $coupon_code
     */
   /* function user_removed_coupon($coupon_code ) {

        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'removeCoupon',
            'data' => [
                'coupon_code' => $coupon_code
            ]
        ];
        $update_status = $this->apiHelper->call_api($body, $headers);

        return json_decode($update_status['body'], true);
    }*/

    function add_title_before_shop_loop() {
    if (is_shop()) {
        echo '<h5 class="shop-page-title">Click On The Image To Order The Product</h5><h6>In Order For You To Become An Affiliate You Must Pay The Annual Hosting Fee($129) And Pay For At Least One Order Of Coffee ($110)</h6>';
        }
        }
}