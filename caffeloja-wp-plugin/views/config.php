<?php echo $this->add_css('config'); ?>
<?php echo $this->add_css('//maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css', true); ?>
<?php echo $this->add_css('//cdnjs.cloudflare.com/ajax/libs/Ladda/1.0.6/ladda.min.css', true); ?>
<?php echo $this->add_js('//cdnjs.cloudflare.com/ajax/libs/Ladda/1.0.6/spin.min.js', true); ?>
<?php echo $this->add_js('//cdnjs.cloudflare.com/ajax/libs/Ladda/1.0.6/ladda.min.js', true); ?>
<?php if (!class_exists('WooCommerce')) { ?>
    <div class="hybridWooPluginSettings">
        <h2><?php _e('Please activate WooCommerce', 'woocommerce'); ?></h2>
    </div>
<?php } else { ?>
    <div class="hybridWooPluginSettings">
        <h2><?php $this->_t('settings'); ?></h2>
        <form class="settingsForm">
            <?php
            settings_fields('hybridmlm-settings-group');
            do_settings_sections('hybridmlm-settings-group');
            ?>
            <div class='eachField'>
                <label><?php $this->_t('basic_url'); ?></label>
                <div class='inputHolder flex'>
                    <input placeholder="<?php $this->_t('basic_url'); ?>" type='text' name='hybridmlm_basic_url'
                           value="<?php echo esc_attr(get_option('hybridmlm_basic_url')); ?>">
                </div>
            </div>
            <div class='eachField'>
                <label><?php $this->_t('api_endpoint'); ?></label>
                <div class='inputHolder flex'>
                    <input placeholder="<?php $this->_t('api_endpoint'); ?>" type='text'
                           name='hybridmlm_api_endpoint'
                           value="<?php echo esc_attr(get_option('hybridmlm_api_endpoint')); ?>">
                </div>
            </div>
            <div class='eachField'>
                <label><?php $this->_t('client_id'); ?></label>
                <div class='inputHolder flex'>
                    <input placeholder="<?php $this->_t('client_id'); ?>" type="text" name="hybridmlm_client_id"
                           value="<?php echo esc_attr(get_option('hybridmlm_client_id')); ?>">
                </div>
            </div>
            <div class='eachField'>
                <label><?php $this->_t('client_secret'); ?></label>
                <div class='inputHolder flex'>
                    <input placeholder="<?php $this->_t('client_secret'); ?>" type='text'
                           name='hybridmlm_client_secret'
                           value="<?php echo esc_attr(get_option('hybridmlm_client_secret')); ?>">
                </div>
            </div>
            <div class='eachField'>
                <label><?php $this->_t('grant_type'); ?></label>
                <div class='inputHolder flex'>
                    <input placeholder='<?php $this->_t('grant_type'); ?>' type='text' name='hybridmlm_grant_type'
                           value="<?php echo esc_attr(get_option('hybridmlm_grant_type')); ?>">
                </div>
            </div>
            <div class='eachField'>
                <label><?php $this->_t('default_discount'); ?></label>
                <div class='inputHolder flex'>
                    <input placeholder="<?php $this->_t('discount_price'); ?>" type='text'
                           name='hybridmlm_discount_price'
                           value="<?php echo esc_attr(get_option('hybridmlm_discount_price')); ?>">
                </div>
            </div>
            <table class='form-table' role='presentation'>
                <tbody>
                <tr>
                    <th scope='row'><label for='default_post_format'><?php $this->_t('registration_type'); ?></label></th>
                    <td>
                        <select name='hybridmlm_wp_mlm_reg_option'>
                            <option value='wc_to_mlm' <?php echo (get_option('hybridmlm_wp_mlm_reg_option') == 'wc_to_mlm') ? 'selected' : false; ?>><?php $this->_t('wc_to_mlm'); ?></option>
                            <option value='mlm_to_wc' <?php echo (get_option('hybridmlm_wp_mlm_reg_option') == 'mlm_to_wc') ? 'selected' : false; ?>><?php $this->_t('mlm_to_wc'); ?></option>
                            <option value='both_direction' <?php echo (get_option('hybridmlm_wp_mlm_reg_option') == 'both_direction') ? 'selected' : false; ?>><?php $this->_t('both_direction'); ?></option>
                        </select>
                    </td>
                </tr>
                </tbody>
            </table>
            <div class='eachField'>
                <div class='form-check form-switch'>
                    <input class='form-check-input' type='checkbox' id='sponsor_required' name='sponsor_required'
                           value='1' <?php echo (get_option('sponsor_required') == 1) ? 'checked' : false; ?>>
                    <label class='form-check-label'
                           for='flexSwitchCheckChecked'><?php $this->_t('sponsor_required_text'); ?></label>
                </div>
            </div>
            <div class='actions'>
                <button class='saveSettings btn btn-success ladda-button' data-style='contract' type='button'>
                    <?php $this->_t('save'); ?>
                </button>
            </div>
        </form>

        <div class='successMessage'>
            <i class='las la-check'></i> <?php $this->_t('information_saved'); ?>
        </div>
    </div>
<?php } ?>


<script type='text/javascript'>
    jQuery(function ($) {
        Ladda.bind('.ladda-button');

        $('.saveSettings').click(function () {
            $.post('<?php echo admin_url('options.php'); ?>', $('.hybridWooPluginSettings form').serialize(), function (response) {
                $('.successMessage').slideDown();

                setTimeout(() => {
                    $('.successMessage').slideUp();
                }, 2000);
                Ladda.stopAll();
            }).fail(response => {
                Ladda.stopAll();
            });
        });
    });

    function copy_shortcode() {
        /* Get the text field */

        var copyText = document.getElementById('shortcodeInput');
        /* Select the text field */
        copyText.select();
        /* Copy the text inside the text field */
        document.execCommand('copy');
        copyText.blur();
        alert('copied');
    }
</script>