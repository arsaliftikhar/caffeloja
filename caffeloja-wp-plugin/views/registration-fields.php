<?php
$domain = 'hybrid-mlm';
$checkout = WC()->checkout;

$sponsor = isset($_SESSION['replicaName']) ?  $_SESSION['replicaName'] : null;
?>
<div id='my_custom_checkout_field' class='create-account'>
    <p class='woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide'>
        <label for='sponsor'><?php $this->_t('sponsor'); ?><?php if (get_option('sponsor_required')) {
                echo '<span class="required">*</span>';
            } ?></label>
        <input type='text' class='woocommerce-Input woocommerce-Input--text input-text' name='sponsor' id='sponsor'
               autocomplete='sponsor' value="<?php if($sponsor) echo $sponsor; else echo isset($_POST["sponsor"])?$_POST["sponsor"]:''; ?>" <?php echo ($sponsor) ? 'readonly' : false; ?> />
        <input type='hidden' name='reg-direction' value='wc-mlm'>
    </p>

    <p class='woocommerce-form-row woocommerce-form-row--wide form-row form-row-wide'>
        <label for='username'><?php $this->_t('username'); ?><span class='required'>*</span></label>
        <input type='text' class='woocommerce-Input woocommerce-Input--text input-text' name='username' id='username'
               autocomplete='username'
               value="<?php echo isset($_POST["username"])?$_POST["username"]:''; ?>"/>

    </p>
    <?php
    if (!is_checkout()) {
        ?>
        <p class='form-row form-row-first'>
            <label for='first_name'><?php $this->_t('first_name'); ?> <span class='required'>*</span></label>
            <input type='text' class='input-text' name='first_name' id='first_name' value='<?php echo isset($_POST["first_name"])? $_POST["first_name"]:''; ?>'/>
        </p>

        <p class='form-row form-row-last'>
            <label for='last_name'><?php $this->_t('last_name'); ?> <span class='required'>*</span></label>
            <input type='text' class='input-text' name='last_name' id='last_name' value='<?php echo isset($_POST["last_name"])?$_POST["last_name"]:''; ?>'/>
        </p>
        <?php
    }
    ?>

    <div class='clear'></div>
</div>