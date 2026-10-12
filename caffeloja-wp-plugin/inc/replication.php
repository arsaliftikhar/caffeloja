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

use WP_User_Query;

require_once HYBRIDMLM_PLUGIN_DIR . 'inc/helper.php';

/**
 * Class replication
 */
class replication extends helper
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
        add_action('init', [$this, 'set_replication']);
            add_shortcode('replication_user_display', [$this, 'replica_display']);

        add_action('wp_logout', [$this, 'destroy_sessions']);

        return $this;
    }

    /**
     * Register session
     */
    function set_replication()
    {
        if (!session_id()) session_start();

        $replica_name = isset($_GET['replicaName']) ? $_GET['replicaName'] : (isset($_SESSION['replicaName']) ? $_SESSION['replicaName'] : null);

        if ($this->verify_replication_by_name($replica_name)) {
            if ( !is_user_logged_in() ) {
                $_SESSION['replicaName'] = $replica_name;

            }

        } else if (isset($_GET['replicaName'])) {
            ?>
            <script> alert('<?php $this->_t('invalid_replication_user'); ?>'); </script>
            <?php
        }
    }

    /**
     * @param $username
     */
    function replica_display()
    {
        if (!session_id()) session_start();

        $replica_name = (isset($_SESSION['replicaName']) ? $_SESSION['replicaName'] : null);
        if ($this->verify_replication_by_name($replica_name)) {
            ?>
            <style>
                .sticky-text {
                    position: fixed;
                    right: 10px;
                    top: 85%;
                    z-index: 99;
                    background: #f83d23;
                    width: 200px;
                    height: 100px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 0 6px #000;
                    color: #fff;
                    padding: 20px;
                }
            </style>
            <div class='sticky-text'><?php $this->_t('replication_name'); ?><?php echo $replica_name; ?></div>
            <?php
        }

    }

    /**
     * @param $username
     * @return bool
     */
    function verify_replication_by_name($username)
    {
        $user_query = new WP_User_Query([
            'meta_key'   => 'mlm_member_id',
            'meta_value' => $username,
            'number'     => 1,
        ]);

        $users = $user_query->get_results();
        
        return !empty($users) ? true : false;
    }

    /**
     *
     */
    function destroy_sessions() {
        unset($_SESSION["replicaName"]);
        unset($_SESSION["token_type"]);
        unset($_SESSION["access_token"]);
        unset($_SESSION["refresh_token"]);
        unset($_SESSION["expires_in"]);
    }


}