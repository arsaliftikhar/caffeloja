<?php
/*
Plugin Name: Hybrid-MLM
Plugin URI: https://www.hybridmlm.io/
Description: Plugin to connect woo-commerce with hybrid MLM
Author: HybridMLM
Author URI: https://www.hybridmlm.io/
License: GPLv2 or later
Text Domain: hybrid-mlm
Domain Path: /languages
Version : 1.0.0
*/

use HybridMLMWP\Inc\config;
use HybridMLMWP\Inc\customer;
use HybridMLMWP\Inc\discount;
use HybridMLMWP\Inc\helper;
use HybridMLMWP\Inc\install;
use HybridMLMWP\Inc\purchase;
use HybridMLMWP\Inc\pv;
use HybridMLMWP\Inc\replication;
use HybridMLMWP\Inc\replication_widget;

if (!function_exists('add_action')) {
    echo 'voilaa, nothing here';
    exit;
}


define_constants();
includes();
init_hooks();
/**
 *
 */
function define_constants()
{
    define('HYBRIDMLM_VERSION', '1.0.0');
    define('HYBRIDMLM_PLUGIN_NAME', 'Hybrid-MLM');
    define('HYBRIDMLM_PLUGIN_DIR', plugin_dir_path(__FILE__));
    define('HYBRIDMLM_PLUGIN_URL', site_url() . '/wp-content/plugins/hybrid-mlm');
    define('HYBRIDMLM_VIEW_DIR', HYBRIDMLM_PLUGIN_DIR . 'views/');
    define('HYBRIDMLM_ASSETS_URL', HYBRIDMLM_PLUGIN_URL . '/assets/');
    define('HYBRIDMLM_API_ENDPOINT', 'http://localhost');
    define('HYBRIDMLM_DOMAIN', 'http://localhost');
}

/**
 *
 */
function includes()
{
    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/install.php';

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/helper.php';
    global $helper;

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/customer.php';
    $customer = new customer();

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/api.php';
    $api = new api();

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/api_helper.php';
    global $apiHelper;

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/config.php';
    $config = new config();

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/discount.php';
    $discount = new discount();

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/replication.php';
    $replication = new replication();

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/purchase.php';
    $purchase = new purchase();

    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/pv.php';
    $pv = new pv();
    require_once HYBRIDMLM_PLUGIN_DIR . 'inc/replication_widget.php';
    $replication_widget = new replication_widget();


}

/**
 *
 */
function init_hooks()
{
    add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'add_configuration_link');
    register_activation_hook(__FILE__, 'activate');
}

/**
 * @param $links
 * @return array
 */
function add_configuration_link($links)
{
    $helper = new helper();
    $plugin_links = [
        '<a href="' . admin_url('options-general.php?page=hybridmlm') . '">' . $helper->__t('configure') . '</a>'
    ];
    return array_merge($plugin_links, $links);
}

/**
 *
 */
function activate()
{
    $hybridWooBridgeInstall = new install();
}


