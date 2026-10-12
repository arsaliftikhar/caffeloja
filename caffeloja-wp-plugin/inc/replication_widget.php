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

require_once HYBRIDMLM_PLUGIN_DIR . 'inc/replication.php';
global $replication;

class replication_widget extends \WP_Widget
{
    function __construct() {

        parent::__construct('replication_widget', __('Replication Widget', 'hybrid-mlm'),
            array( 'description' => __( 'Replication widget to display replication user on frontend', 'hybrid-mlm' ), )
        );

        $this->replication = new replication();
        return $this;

    }

    /**
     * @return $this
     */
    function register_hooks()
    {
        add_action( 'widgets_init', [$this, 'replica_widget'] );

        return $this;
    }

    public function widget( $args, $instance ) {
        $this->replication->replica_display();
    }



    function replica_widget() {
        register_widget( 'replication_widget' );
    }

}