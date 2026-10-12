<?php
/*
Plugin Name: HybridMLM-WC Bridge
Plugin URI: https://www.hybridmlm.io/
Description: Plugin to connect woo-commerce with hybrid MLM
Author: HybridMLM
Author URI: https://www.hybridmlm.io/
License: GPLv2 or later
Text Domain: HybridMLM-WC
Version : 1.0.0
*/


/**
 * Class api
 */
class api
{
    /**
     * @return $this
     */
    function __construct()
    {
        $this->register_api_endpoints();
        return $this;
    }

    /**
     * @return $this
     */
    function register_api_endpoints()
    {
        add_action('rest_api_init', function () {
            register_rest_route('wc/v3', '/updateRole/(?P<id>\d+)', [
                'methods' => 'PUT',
                'callback' => [$this, 'update_role'],
                'permission_callback' => '__return_true'
            ]);

            register_rest_route('wc/v3', '/nonSyncOrders', [
                'methods' => 'GET',
                'callback' => [$this, 'non_sync_orders'],
                'permission_callback' => '__return_true'
            ]);

            register_rest_route('wc/v3', '/validateUsername', [
                'methods' => 'GET',
                'callback' => [$this, 'validate_username'],
                'permission_callback' => '__return_true'
            ]);

            register_rest_route('wc/v3', '/validateEmail', [
                'methods' => 'GET',
                'callback' => [$this, 'validate_email'],
                'permission_callback' => '__return_true'
            ]);

            register_rest_route('wc/v3', '/updateUsername/(?P<id>\d+)', [
                'methods' => 'PUT',
                'callback' => [$this, 'update_username'],
                'permission_callback' => '__return_true'
            ]);

            register_rest_route('wc/v3', '/getOrderStatus', [
                'methods' => 'GET',
                'callback' => [$this, 'get_order_status'],
                'permission_callback' => '__return_true'
            ]);

            register_rest_route('wc/v3', '/syncOrderStatus', [
                'methods' => 'GET',
                'callback' => [$this, 'sync_order_status'],
                'permission_callback' => '__return_true'
            ]);

        });
    }

    /**
     * @param WP_REST_Request $request
     * @return WP_Error|WP_REST_Response
     */
    function update_role(WP_REST_Request $request)
    {
        if (!is_user_logged_in() || !current_user_can('administrator'))
            return new WP_Error('unauthorized', __('Unauthorized access'), ['status' => 401]);

        $user = get_user_by('id', ($user_id = $request->get_param('id')));
        if (!get_userdata($user_id))
            return new WP_Error('unprocessable entry', __('Invalid user'), ['status' => 422]);

        if ($GLOBALS['wp_roles']->is_role($role_to = $request->get_param('role_to')) & $GLOBALS['wp_roles']->is_role($role_from = $request->get_param('role_from'))) {
            $user->add_role($role_to);
            $user->remove_role($role_from);

            return new WP_REST_Response('User role updated successfully');
        } else
            return new WP_Error('unprocessable entry', __('Invalid user role'), ['status' => 422]);
    }

    /**
     * @param WP_REST_Request $request
     * @return false|string|WP_Error
     */
    function non_sync_orders(WP_REST_Request $request)
    {
        if (!is_user_logged_in() || !current_user_can('administrator'))
            return new WP_Error('unauthorized', __('Unauthorized access'), ['status' => 401]);

        $order_id = $request->get_param('order_id');
        $orders = [];
        if ($order_id) {
            $order = wc_get_order($order_id);

            if(!$order)return (json_encode($orders));

            $wp_customer_id = $order->get_user_id();
            $user = get_userdata($wp_customer_id);
            $items = $order->get_items();
            $products = [];
            foreach ($items as $key => $item) {
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
                    'type' => $item->get_type()
                ];
            }
            $orders[] = [
                'order_id' => $order_id,
                'wp_customer_id' => $wp_customer_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'items' => $products,
                'currency' => $order->get_currency(),
                'sub_total' => $order->get_subtotal(),
                'total' => $order->get_total(),
                'total_pv' => get_post_meta($order_id, 'total_pv', true),
                'username' => $user->user_login,
                'order_status' => $order->get_status(),
            ];
        } else {

            $args = [
                'type' => 'shop_order',
                'limit' => -1,
                'meta_key' => 'mlm_order_id',
                'meta_compare' => 'NOT EXISTS',
            ];

            if ($customer_id = $request->get_param('customer_id'))
            {
                $user = get_user_by('id', $customer_id);
                if($user)
                $args['customer_id'] = $customer_id;
                else
                    return (json_encode($orders));
            }


            if ($request->get_param('status'))
                $args['status'] = [$request->get_param('status')];

            $order_created_date = $request->get_param('order_created_date');
            if ($order_created_date) {
                $order_created_date = explode(' - ', $order_created_date);
                $order_created_date_from = $order_created_date[0];
                $order_created_date_to = $order_created_date[1];
                $args['date_created'] = $order_created_date_from . '...' . $order_created_date_to;
            }

            foreach (wc_get_orders($args) as $key => $order) {
                $wp_customer_id = $order->get_user_id();
                if(!$wp_customer_id)
                {
                    $wp_customer_id = get_post_meta($order->ID, 'replication_user_id', true);
                }
                if($wp_customer_id) {
                    $user = get_userdata($wp_customer_id);
                    $items = $order->get_items();
                    $products = [];
                    foreach ($items as $key => $item) {
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
                            'type' => $item->get_type()
                        ];
                    }
                    $orders[$key] = [
                        'order_id' => $order_id = $order->ID,
                        'wp_customer_id' => $wp_customer_id,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'items' => $products,
                        'currency' => $order->get_currency(),
                        'sub_total' => $order->get_subtotal(),
                        'total' => $order->get_total(),
                        'total_pv' => get_post_meta($order_id, 'total_pv', true),
                        'username' => $user->user_login,
                        'order_status' => $order->get_status(),
                    ];
                }
            }
        }

        return (json_encode($orders));
    }

    /**
     * @param WP_REST_Request $request
     * @return WP_Error|WP_REST_Response
     */
    function validate_username(WP_REST_Request $request)
    {
        if (!is_user_logged_in() || !current_user_can('administrator'))
            return new WP_Error('unauthorized', __('Unauthorized access'), ['status' => 401]);

        $customer_id = $request->get_param('wp_customer_id');
        $username = $request->get_param('username');
        if ($customer_id) {
            $user_query = new WP_User_Query(['search' => $username, 'search_columns' => ['user_login'], 'exclude' => [$customer_id]]);
            $results = $user_query->get_results();
            if ($results)
                return new WP_REST_Response(['status' => 200, 'response' => ['status' => true, 'message' => 'Username exists']]);
            else
                return new WP_REST_Response(['status' => 422, 'response' => ['status' => false, 'message' => 'Username not exists']]);
        } else {
            if (username_exists($username))
                return new WP_REST_Response(['status' => 200, 'response' => ['status' => true, 'message' => 'Username exists']]);
            else
                return new WP_REST_Response(['status' => 422, 'response' => ['status' => false, 'message' => 'Username not exists']]);
        }
    }

    /**
     * @param WP_REST_Request $request
     * @return WP_Error|WP_REST_Response
     */
    function validate_email(WP_REST_Request $request)
    {
        if (!is_user_logged_in() || !current_user_can('administrator'))
            return new WP_Error('unauthorized', __('Unauthorized access'), ['status' => 401]);

        $customer_id = $request->get_param('wp_customer_id');
        $email = $request->get_param('email');
        if ($customer_id) {
            $user_query = new WP_User_Query(['search' => $email, 'search_columns' => ['user_email'], 'exclude' => [$customer_id]]);
            $results = $user_query->get_results();
            if ($results)
                return new WP_REST_Response(['status' => 200, 'response' => ['status' => true, 'message' => 'Email exists']]);
            else
                return new WP_REST_Response(['status' => 422, 'response' => ['status' => false, 'message' => 'Email not exists']]);
        } else {
            if (email_exists($email))
                return new WP_REST_Response(['status' => 200, 'response' => ['status' => true, 'message' => 'Email exists']]);
            else
                return new WP_REST_Response(['status' => 422, 'response' => ['status' => false, 'message' => 'Email not exists']]);

        }
    }

    /**
     * @param WP_REST_Request $request
     * @return WP_Error|WP_REST_Response
     */
    function update_username(WP_REST_Request $request)
    {
        if (!is_user_logged_in() || !current_user_can('administrator'))
            return new WP_Error('unauthorized', __('Unauthorized access'), ['status' => 401]);

        if (!get_userdata($user_id = $request->get_param('id')))
            return new WP_Error('unprocessable entry', __('Invalid user'), ['status' => 422]);

        global $wpdb;
        $wpdb->update(
            $wpdb->users,
            ['user_login' => $request->get_param('username')],
            ['ID' => $user_id]
        );

        return new WP_REST_Response(['status' => 200, 'response' => ['status' => true, 'message' => 'Username updated successfully']]);
    }

    /**
     * @return WP_Error|WP_REST_Response
     */
    function get_order_status()
    {
        if (!is_user_logged_in() || !current_user_can('administrator'))
            return new WP_Error('unauthorized', __('Unauthorized access'), ['status' => 401]);

        $statuses = wc_get_order_statuses();

        return json_encode($statuses);
    }

    /**
     * @return WP_Error|WP_REST_Response
     */
    function sync_order_status(WP_REST_Request $request)
    {
        if (!is_user_logged_in() || !current_user_can('administrator'))
            return new WP_Error('unauthorized', __('Unauthorized access'), ['status' => 401]);

        require_once HYBRIDMLM_PLUGIN_DIR . 'inc/purchase.php';
        $this->purchase = new \HybridMLMWP\Inc\purchase();
        $order_id = $request->get_param('order_id');
        $order = wc_get_order($order_id);
        $new_status =  $order->get_status();
        $update_status = $this->purchase->update_order_status($order_id,$new_status,$new_status,'');

        return $update_status;
    }


}