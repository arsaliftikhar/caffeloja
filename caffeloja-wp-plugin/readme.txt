======== Hybrid-mlm =============
Contributors: Hybrid-mlm

===== To set up the plugin =========
1. First you need to install the woocommerce plugin, then only it will work.

2. After the installation of woocommerce plugin and our hybrid mlm plugin, you can access the configuration settings of the hybrid mlm plugin
   from Dashboard Under Settings menu, or you can access the configuration from plugins list.

3. In the configuration, you can set the MLM public url, MLM API endpoint, Client ID, Client Secret, Grant type as 'client_credentials' and Registration Type.
   These are compulsory fields, you need to fill, for proper working, And other optional fields are Discount Rate for MLM users, and make sponsor field optional on registration.

4. To connect woocommerce to MLM, you need to generate the key and secret
   Woocommerce > Settings > Advanced > REST API
   click on create key, and give a name on the field and should select the "READ / WRITE" permission to generate the key..
   After generating the key, you need to copy the key and secret, it will not appear second time.
   So paste these key and secret in the MLM site Module configuration.

5. To support Auto Login, you need to install the "Simple JWT Login" (Min Version: 3.1.0) from wordpress repository.
   Then put a decryption key in general settings, and then activate login (choose login by email/username as you need) and authentication.

6. To set replication user name display, you need to copy and paste the below php code after the beginning of BODY tag,

   <?php if (shortcode_exists( 'replication_user_display' ) ) { echo  do_shortcode('[replication_user_display]');}?>

