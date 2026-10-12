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

require_once HYBRIDMLM_PLUGIN_DIR . 'inc/config.php';

/**
 * Class helper
 * @package HybridMLMWP\Inc
 */
class helper
{
    /**
     * @param $file
     * @param bool $absolute
     * @return string
     */
    function add_css($file, $absolute = false)
    {
        return '<link rel="stylesheet" type="text/css" href="' . ($absolute ? $file : (HYBRIDMLM_ASSETS_URL . 'css/' . $file . '.css')) . '" />';
    }

    /**
     * @param $file
     * @param bool $absolute
     * @return string
     */
    function add_js($file, $absolute = false)
    {
        return '<script type="text/javascript" src="' . ($absolute ? $file : (HYBRIDMLM_ASSETS_URL . 'js/' . $file . '.js')) . '"></script>';
    }

    /**
     * @return bool|string
     */
    function get_token()
    {
        global $wpdb;

       /* $token_list = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}hybridmlm_api_tokens WHERE user_id='1' and token_type= 'bearer'");
        $token = $token_list[0];

        $date = $token->updated_at != '' ? $token->updated_at : $token->created_at;
        $difference_in_seconds = strtotime(date('Y-m-d H:i:s')) - strtotime($date);

        if ($difference_in_seconds < $token->expires_in)
            $token = $token->token_type . ' ' . $token->access_token;
        else {*/
            $config = new config();
            $token = $config->generate_token();
       // }

        return $token;
    }

    /**
     * @return bool|string
     */
    function get_lang_code()
    {
        $languages = ['ar', 'de', 'en','es', 'fr', 'hi','it', 'ja', 'ko','ms', 'pl', 'pt','ru', 'sl', 'sw','th', 'tr', 'ur','vi', 'zh'];
        foreach ($languages as $code){
            if (in_array($code, explode('/', $_SERVER['REQUEST_URI'])) || in_array($code, explode('=', $_SERVER['REQUEST_URI']))) {
                return $code;
            }
        }
        return substr(get_locale(), 0, 2);;
    }

    /**
     * @param $key
     * @return mixed
     */
    function _t($key)
    {
        $lang = $this->get_lang_code();
        $lang_file = require HYBRIDMLM_PLUGIN_DIR . "languages/$lang.php";

        echo $lang_file[$key];
    }

    /**
     * @param $key
     * @return mixed
     */
    function __t($key)
    {
        $lang = $this->get_lang_code();
        $lang_file = require HYBRIDMLM_PLUGIN_DIR . "languages/$lang.php";

        return $lang_file[$key];
    }
}