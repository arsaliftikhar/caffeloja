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
use WP_Error;

/**
 * Class apiHelper
 * @package HybridMLMWP\Inc
 */
class api_helper
{
    /**
     * @return $this
     */
    function __construct()
    {
        return $this;
    }

    /**
     * @param $body
     * @param $headers
     * @return array|string|WP_Error
     */
    function call_api($body, $headers)
    {
        $api_end_point = get_option('hybridmlm_api_endpoint');

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

        $api = $this->add_to_api_history('wp-hybridmlm', $body['action'], serialize($body['data']));
        try {
            $response = wp_remote_post($api_end_point, $options);
            $this->update_api_history($api, true, $response['body']);

            return $response;
        } catch (Exception $exception) {
            $this->update_api_history($api, false, $exception->getMessage());

            return $exception->getMessage();
        }
    }

    /**
     * @param $direction
     * @param $operation
     * @param $data
     * @param null $wp_customer_id
     * @return false|int
     */
    function add_to_api_history($direction, $operation, $data, $wp_customer_id = null)
    {
        global $wpdb;

        $wpdb->insert($wpdb->prefix . 'hybridmlm_api_history', [
            'direction' => $direction,
            'operation' => $operation,
            'status' => false,
            'customer_id' => $wp_customer_id,
            'data' => $data,
        ]);

        return $wpdb->insert_id;
    }

    /**
     * @param $api_id
     * @param $status
     * @param $response
     * @param null $wp_customer_id
     * @return bool
     */
    function update_api_history($api_id, $status, $response, $wp_customer_id = null)
    {
        global $wpdb;

        return $wpdb->update($wpdb->prefix . 'hybridmlm_api_history', [
            'response' => serialize($response),
            'status' => $status,
            'customer_id' => $wp_customer_id,
        ], ['id' => $api_id]);
    }
}