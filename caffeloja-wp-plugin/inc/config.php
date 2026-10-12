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
 * Class config
 * @package HybridMLMWP\Inc
 */
class config extends helper
{

    /**
     * @return $this
     */
    function __construct()
    {
        $this->config_hooks();

        return $this;
    }

    /**
     * @return $this
     */
    function config_hooks()
    {
        if (is_admin()) {
            add_action('admin_menu', [$this, 'config']);
            add_action('admin_init', [$this, 'register_setting']);
            //generate token on settings save.
            add_action('added_option', function( $option_name, $option_value ) {
                if(!isset($_POST["hybridmlm_client_secret"]) || $_POST["hybridmlm_client_secret"]=='') return;
                $this->generate_token();

            }, 10, 2);
            add_action('updated_option', function( $old_value, $value ) {
                if(!isset($_POST["hybridmlm_client_secret"]) || $_POST["hybridmlm_client_secret"]=='') return;
                $this->generate_token();
            }, 10, 2);
        }

        return $this;
    }

    /**
     * @return $this
     */
    function config()
    {
        add_options_page(HYBRIDMLM_PLUGIN_NAME, HYBRIDMLM_PLUGIN_NAME, 'manage_options', 'hybridmlm', function () {
            return include HYBRIDMLM_VIEW_DIR . 'config.php';
        }, 26);

        return $this;
    }

    /**
     * @return $this
     */
    function register_setting()
    {
        register_setting('hybridmlm-settings-group', 'hybridmlm_basic_url');
        register_setting('hybridmlm-settings-group', 'hybridmlm_api_endpoint');
        register_setting('hybridmlm-settings-group', 'hybridmlm_api_token');
        register_setting('hybridmlm-settings-group', 'hybridmlm_wp_mlm_reg_option');
        register_setting('hybridmlm-settings-group', 'hybridmlm_discount_price');
        register_setting('hybridmlm-settings-group', 'hybridmlm_mlm_registration');
        register_setting('hybridmlm-settings-group', 'hybridmlm_wc_mlm_call_order_hook_on');
        register_setting('hybridmlm-settings-group', 'hybridmlm_client_id');
        register_setting('hybridmlm-settings-group', 'hybridmlm_client_secret');
        register_setting('hybridmlm-settings-group', 'hybridmlm_grant_type');
        register_setting('hybridmlm-settings-group', 'sponsor_required');

        return $this;
    }

    /**
     *
     */
    function generate_token()
    {
        $base_url = get_option('hybridmlm_basic_url')?:$_POST["hybridmlm_basic_url"];
        $action = 'oauth/token';
        $end_point = $base_url . $action;

        $body = wp_json_encode([
            'client_id' => get_option('hybridmlm_client_id')?:$_POST["hybridmlm_client_id"],
            'client_secret' => get_option('hybridmlm_client_secret')?:$_POST["hybridmlm_client_secret"],
            'redirect_url' => $base_url,
            'grant_type' => $hybridmlm_grant_type = get_option('hybridmlm_grant_type')?:$_POST["hybridmlm_grant_type"],
            'scope' => '*',
        ]);

        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        $options = [
            'body' => $body,
            'headers' => $headers,
            'timeout' => 60,
            'redirection' => 5,
            'blocking' => true,
            'httpversion' => '1.0',
            'sslverify' => false,
            'data_format' => 'body',
        ];
        $response = wp_remote_post($end_point, $options);
        $response_code = $response['response']['code'];

        if ($response_code != 200) return;

        $response_body = json_decode($response['body']);


        global $wpdb;

        $data = [
            'user_id' => $user_id = 1,
            'token_type' => $token_type = $response_body->token_type,
            'access_token' => $access_token = $response_body->access_token,
            'grant_type' => $hybridmlm_grant_type,
            'expires_in' => $response_body->expires_in
        ];
        $table= "{$wpdb->prefix}hybridmlm_api_tokens";
        $count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM ".$table." WHERE user_id = %d and token_type = %s", $user_id, $token_type));
            if ($count == 0) {
                $data['created_at'] = date('Y-m-d H:i:s');
                $format = ['%d', '%s', '%s', '%s', '%s', '%s'];
                $wpdb->insert($table, $data, $format);

            } else {
                $data['updated_at'] = date('Y-m-d H:i:s');

                $format = ['%d', '%s', '%s', '%s', '%s', '%s'];
                $wpdb->update($table, $data, ['user_id' => $user_id, 'token_type' => $token_type], $format,
                    ['%d', '%s']);
            }

        return $access_token;
    }
}