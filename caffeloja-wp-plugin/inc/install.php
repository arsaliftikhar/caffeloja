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

/**
 * Class install
 * @package HybridWoo\Inc
 */
class install
{
    public function __construct()
    {
        $this->create_tables();
        $this->addUserRoles();
        return $this;
    }

    /**
     * Install DB and create cron events when activated.
     *
     * @return void
     */
    public static function create_tables()
    {
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        global $wpdb;

        if ($wpdb->has_cap('collation')) {
            $collate = $wpdb->get_charset_collate();
        }

        $tables1 = "CREATE TABLE {$wpdb->prefix}hybridmlm_api_history (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			direction varchar(200) NULL,
			operation varchar(200) NULL,
			data TEXT NULL,
			response TEXT NULL,
			status bigint(20) NOT NULL,
			customer_id bigint(20) NULL,
			created_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id),
			KEY operation (operation)
		) $collate;";

        dbDelta($tables1);

        $tables2 = "CREATE TABLE {$wpdb->prefix}hybridmlm_api_tokens (       
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            token_type varchar(200) NOT NULL,
            access_token longText NOT NULL,
            grant_type varchar(200) NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expires_in varchar(200) NOT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id)
        ) $collate;";
        dbDelta($tables2);
    }

    /**
     *  Add user roles
     */
    function addUserRoles()
    {
        add_role(
            'mlm_pc',
            'MLM Non Sync Users',
            [
                'read' => true,
                'delete_posts' => false
            ]
        );

        add_role(
            'mlm_user',
            'MLM Users',
            [
                'read' => true,
                'delete_posts' => false
            ]
        );
    }
}