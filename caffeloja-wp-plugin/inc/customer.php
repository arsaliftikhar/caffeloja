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

use GuzzleHttp\Exception\GuzzleException;
use WP_Error;
use WP_User_Query;

require_once HYBRIDMLM_PLUGIN_DIR . 'inc/api_helper.php';
require_once HYBRIDMLM_PLUGIN_DIR . 'inc/helper.php';

global $apiHelper;

/**
 * Class hooks
 */
class customer extends helper
{
    /**
     * @return $this
     */
    function __construct()
    {
        $this->register_hooks();

//        if (!session_id()) {
//            session_start();
//        }

        $this->apiHelper = new api_helper();

        return $this;
    }

    /**
     * @return $this
     */
    function register_hooks()
    {
        if (get_option('hybridmlm_wp_mlm_reg_option') == 'wc_to_mlm' || get_option('hybridmlm_wp_mlm_reg_option') == 'both_direction') {
            add_action('woocommerce_register_form_start', function () {
                return include HYBRIDMLM_VIEW_DIR . 'registration-fields.php';
            }, 20);
            add_action('woocommerce_created_customer', [$this, 'customer_register'], 10, 3);
            add_action('woocommerce_before_checkout_registration_form', function () {
                return include HYBRIDMLM_VIEW_DIR . 'registration-fields.php';
            }, 20);
            // Custom checkout fields validation
            add_action('woocommerce_register_post', [$this, 'custom_checkout_field_validate'], 10, 3);
            add_filter('woocommerce_registration_errors', [$this, 'my_registration_errors'], 10, 3);
            add_action('user_new_form', [$this, 'sponsor_field_on_dashboard']);
        } else {
            add_action('user_register', [$this, 'assign_role_to_wp_user'], 10, 1);
        }

        add_action('password_reset', [$this, 'update_password_from_reset_password']);
        add_action('profile_update', [$this, 'update_profile']);

        // validate profile field
        add_action('user_profile_update_errors', [$this, 'validate_profile_fields'], 0, 3);
        add_action('woocommerce_save_account_details_errors', [$this, 'user_validate_profile_fields'], 10, 2);

        add_action('wp_login', [$this, 'mlm_user_login'], 10, 2);
        add_filter('woocommerce_account_dashboard', [$this, 'mlm_login_button']);

        add_filter('gettext',[$this, 'custom_login_label_text'], 20, 3);
        add_filter('authenticate', [$this, 'custom_login_with_member_id'], 30, 3);

        return $this;
    }

    /**
     * @param $customer_id
     * @param $new_customer_data
     * @param $password_generated
     * @return $this
     * @throws GuzzleException
     */
    function customer_register($customer_id, $new_customer_data, $password_generated)
    {
        $direction = (isset($_POST['reg-direction'])) ? $_POST['reg-direction'] : false;
        if ($direction != 'wc-mlm') return true;

        $user = get_user_by('id', $customer_id);
        $user->add_role('mlm_pc');

        if (isset($_POST['username'])) {
            global $wpdb;
            $wpdb->update(
                $wpdb->users,
                ['user_login' => sanitize_text_field($_POST['username'])],
                ['ID' => $customer_id]
            );
        }

        $sponsor = (isset($_POST['sponsor'])) ? $_POST['sponsor'] : false;

        if ($password_generated)
            $password = $new_customer_data['user_pass'];
        else
            $password = isset($_POST['account_password']) ? sanitize_text_field($_POST['account_password']) : (isset($_POST['password']) ? sanitize_text_field($_POST['password']) : NULL);

        update_user_meta($customer_id, 'sponsor', sanitize_text_field($sponsor));

        if (isset($_POST['first_name'])) {
            update_user_meta($customer_id, 'billing_first_name', sanitize_text_field($_POST['first_name']));
            update_user_meta($customer_id, 'first_name', sanitize_text_field($_POST['first_name']));
        }
        if (isset($_POST['last_name'])) {
            update_user_meta($customer_id, 'billing_last_name', sanitize_text_field($_POST['last_name']));
            update_user_meta($customer_id, 'last_name', sanitize_text_field($_POST['last_name']));
        }

        if (isset($_POST['billing_first_name'])) {
            update_user_meta($customer_id, 'billing_first_name', sanitize_text_field($_POST['billing_first_name']));
            update_user_meta($customer_id, 'first_name', sanitize_text_field($_POST['billing_first_name']));
        }
        if (isset($_POST['billing_last_name'])) {
            update_user_meta($customer_id, 'billing_last_name', sanitize_text_field($_POST['billing_last_name']));
            update_user_meta($customer_id, 'last_name', sanitize_text_field($_POST['billing_last_name']));
        }

        $response = $this->sendRegistrationData($customer_id, $password, $_POST['username']);

        $response_code = $response['response']['code'];
        if ($response_code == 200) {
            $response_body = json_decode($response['body'], true);

            $member_id = $response_body[0]['user']['member_id'];
            $mlm_id = $response_body[0]['user']['id'];
            update_user_meta($customer_id, 'mlm_member_id', sanitize_text_field($member_id));
            update_user_meta($customer_id, 'mlm_user_id', sanitize_text_field($mlm_id));
            $user = get_user_by('id', $customer_id);
            $user->add_role('mlm_user');
            $user->remove_role('mlm_pc');
        }

        return true;
    }

    /**
     * @param $username
     * @param $email
     * @param $validation_errors
     * @return
     */
    function custom_checkout_field_validate($username, $email, $validation_errors)
    {
        if (!isset($_POST['reg-direction']) || isset($_POST['reg-direction']) != 'wc-mlm') return $validation_errors;

        if (get_option('sponsor_required')) {
            if (isset($_POST['sponsor']) && empty($_POST['sponsor']))
                $validation_errors->add('sponsor_error', $this->__t('sponsor_required'));
        }
        if (isset($_POST['sponsor']) && $_POST['sponsor']) {
            if (!$this->verify_sponsor($_POST['sponsor']))
                $validation_errors->add('sponsor', $this->__t('sponsor_validation'));
        }

        if (isset($_POST['username']) && empty($_POST['username']))
            $validation_errors->add('username_error', $this->__t('username_required'));

        if (isset($_POST['username']) && $_POST['username']) {
            if ($this->verify_username($_POST['username']))
                $validation_errors->add('username', $this->__t('username_validation'));
        }

        if (isset($_POST['first_name']) && empty($_POST['first_name']))
            $validation_errors->add('first_name_error', $this->__t('firstname_required'));

        if (isset($_POST['last_name']) && empty($_POST['last_name']))
            $validation_errors->add('last_name_error', $this->__t('lastname_required'));

        if ($this->is_email_already_exists($email))
            $validation_errors->add('email', $this->__t('email_validation'));

        return $validation_errors;
    }

    /**
     * @param $errors
     * @param $sanitized_user_login
     * @param $user_email
     * @return mixed
     */
    function my_registration_errors($errors, $sanitized_user_login, $user_email)
    {
        if (!isset($_POST['reg-direction']) || isset($_POST['reg-direction']) != 'wc-mlm') return $errors;
        if (strlen(sanitize_text_field($_POST['username'])) < 5) {
            $errors->add('username_too_short', $this->__t('username_short'));
        }


        return $errors;
    }

    /**
     * @param $sponsor
     * @return
     */
    function verify_sponsor($sponsor)
    {
        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'verifySponsor',
            'data' => [
                'sponsor' => $sponsor
            ]];

        $sponsor = $this->apiHelper->call_api($body, $headers);

        return json_decode($sponsor['body'], true)['status'];
    }

    /**
     * @param $email
     * @param bool $customer_id
     * @return bool
     */
    function is_email_already_exists($email, $customer_id = false)
    {
        $data['email'] = $email;

        if (!$customer_id) {
            $is_email_exist_in_wp = (boolean)email_exists($email);
            if ($is_email_exist_in_wp) return true;
        } else {
            $data['wp_customer_id'] = $customer_id;
            $user_query = new WP_User_Query(array('search' => $email, 'search_columns' => array('user_email'), 'exclude' => array($customer_id)));
            $results = $user_query->get_results();
            if (count($results)) return true;
        }
        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'verifyEmail',
            'data' => $data
        ];

        $email = $this->apiHelper->call_api($body, $headers);

        return json_decode($email['body'], true)['status'];
    }

    /**
     * @param $username
     * @return bool
     */
    function verify_username($username)
    {
        if (username_exists($username)) return true;

        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'verifyUsername',
            'data' => [
                'username' => $username
            ]];
        $username = $this->apiHelper->call_api($body, $headers);

        return (json_decode($username['body'], true)['status']);

    }

    /**
     * @param $userId
     * @param string $password
     * @param $username
     * @return string
     */
    function sendRegistrationData($userId, $password = '', $username)
    {
        $user = get_user_by('id', $userId);

        $user->add_role('mlm_pc');
        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'register',
            'data' => [
                'username' => $username,
                'email' => $user->user_email,
                'sponsor' => get_user_meta($userId, 'sponsor', true),
                'firstname' => get_user_meta($userId, 'billing_first_name', true),
                'lastname' => get_user_meta($userId, 'billing_last_name', true),
                'dob' => get_user_meta($userId, 'dob', true),
                'country_id' => get_user_meta($userId, 'billing_country', true),
                'state_id' => get_user_meta($userId, 'billing_state', true),
                'city_id' => get_user_meta($userId, 'billing_city', true),
                'gender' => get_user_meta($userId, 'gender', true),
                'pin_code' => get_user_meta($userId, 'billing_postcode', true),
                'phone' => get_user_meta($userId, 'phone', true),
                'password' => $password,
                'wp_customer_id' => $userId,
                'sponsor_required' => get_option('sponsor_required')
            ]];

        return $this->apiHelper->call_api($body, $headers);
    }


    /**
     * @param $user_id
     * @return mixed
     */
    function update_profile($user_id)
    {

        if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false)
            return true;

        $user = get_user_by('id', $user_id);
        if (is_admin()) {
            if ($_POST['action'] == 'editpost') {
                return true;
            }
            $password = $_POST['pass1'];
            $firstname = sanitize_text_field($_POST['first_name']);
            $lastname = sanitize_text_field($_POST['last_name']);
            $email = sanitize_text_field($_POST['email']);

            if ($_POST['action'] == 'createuser') {
                update_user_meta($user_id, 'sponsor', sanitize_text_field($_POST['sponsor']));
                if (isset($_POST['first_name'])) {
                    update_user_meta($user_id, 'billing_first_name', $firstname);
                    update_user_meta($user_id, 'first_name', $firstname);
                }
                if (isset($_POST['last_name'])) {
                    update_user_meta($user_id, 'billing_last_name', $lastname);
                    update_user_meta($user_id, 'last_name', $lastname);
                }
                return $this->sendRegistrationData($user_id, $password, $_POST['user_login']);
            }

        } else {
            $password = $_POST['password_1'];
            $firstname = $_POST['account_first_name'];
            $lastname = $_POST['account_last_name'];
            $email = $_POST['account_email'] ?: $_POST['billing_email'];

            if ($email) {
                if ($this->is_email_already_exists($email, $user_id)) {
                    return new WP_Error('Update-error', $this->__t('email_exists'));
                }
            }

        }

        $phone = $_POST['billing_phone'];
        $address = $_POST['billing_address_1'] . ' ' . $_POST['billing_address_2'];
        $city = $_POST['billing_city'];
        $country_code = $_POST['billing_country'];
        $pin = $_POST['billing_postcode'];

        $data = [
            'wp_customer_id' => $user_id,
            'firstname' => $firstname ?: $_POST['billing_first_name'] ?: get_user_meta($user_id, 'first_name', true),
            'lastname' => $lastname ?: $_POST['billing_last_name'] ?: get_user_meta($user_id, 'last_name', true),
            'email' => $email ?: $_POST['billing_email'] ?: $user->user_email,
            'phone' => $phone ?: get_user_meta($user_id, 'billing_phone', true),
            'address' => $address ?: get_user_meta($user_id, 'billing_address_1', true) . ' ' . get_user_meta($user_id, 'billing_address_1', true),
            'city' => $city ?: get_user_meta($user_id, 'billing_city', true),
            'country_code' => $country_code ?: get_user_meta($user_id, 'billing_country', true),
            'pin' => $pin ?: get_user_meta($user_id, 'billing_postcode', true),
        ];
        if ($password) {
            $access_token = $this->get_token();
            $headers = [
                'Authorization' => $access_token,
            ];
            $body = [
                'action' => 'changePassword',
                'data' => [
                    'wp_customer_id' => $user_id,
                    'password' => $password
                ]
            ];
            $this->apiHelper->call_api($body, $headers);

        }

        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];

        $body = [
            'action' => 'updateProfile',
            'data' => $data
        ];

        return $this->apiHelper->call_api($body, $headers);
    }

    /**
     * @param $user
     * @param $pass
     * @return mixed
     */
    function update_password_from_reset_password($user, $pass)
    {
        if (!$pass) return json_decode(['status' => false], true);

        $access_token = $this->get_token();
        $headers = [
            'Authorization' => $access_token,
        ];
        $body = [
            'action' => 'changePassword',
            'data' => [
                'wp_customer_id' => $user->ID,
                'password' => $pass
            ]
        ];
        $update_password = $this->apiHelper->call_api($body, $headers);

        return json_decode($update_password['body'], true)['status'];
    }

    /**
     * @param $errors
     * @param $update
     * @param $user
     * @return mixed
     */
    function validate_profile_fields(&$errors, $update, &$user)
    {
        if ($this->is_email_already_exists($_POST['email'], $user->ID))
            $errors->add('email', $this->__t('email_validation'));
        if ($_POST['action'] == 'createuser') {
            if (isset($_POST['first_name']) && empty($_POST['first_name']))
                $errors->add('first_name_error', $this->__t('firstname_required'));

            if (isset($_POST['last_name']) && empty($_POST['last_name']))
                $errors->add('last_name_error', $this->__t('lastname_required'));
            if (isset($_POST['sponsor']) && $_POST['sponsor']) {
                if (!$this->verify_sponsor($_POST['sponsor']))
                    $errors->add('sponsor', $this->__t('sponsor_validation'));
            }
            if (isset($_POST['user_login']) && $_POST['user_login']) {
                if ($this->verify_username($_POST['user_login']))
                    $errors->add('username', $this->__t('username_validation'));
            }
        }

        return $errors;

    }

    /**
     * @param $errors
     * @param $user
     * @return mixed
     */
    function user_validate_profile_fields(&$errors, &$user)
    {
        if ($this->is_email_already_exists($_POST['account_email'], $user->ID))
            $errors->add('email', $this->__t('email_validation'));

        return $errors;
    }

    /**
     *
     */
    function sponsor_field_on_dashboard()
    {
        ?>
        <table class="form-table">
            <tr class="form-field form-required">
                <th><label for="company"><?php $this->_t('Sponsor'); ?> <span
                                class="description">(<?php $this->_t('required'); ?>)</span></label></th>
                <td>
                    <input type="text" class="regular-text" name="sponsor" value="" id="sponsor"/>
                </td>
            </tr>
        </table>
        <?php
    }

    /**
     * @param $user_id
     */
    function assign_role_to_wp_user($user_id)
    {
        $user = get_user_by('id', $user_id);
        $user->add_role('mlm_pc');
    }

    /**
     * @param $user_login
     * @param $user
     * @return bool
     */
    function mlm_user_login($user_login, $user)
    {
        if (!session_id()) {
            session_start();
        } else
            unset($_SESSION['replicaName']);

        if (current_user_can('manage_options'))
            return true;

        $body = wp_json_encode([
            'client_id' => get_option('hybridmlm_client_id'),
            'client_secret' => get_option('hybridmlm_client_secret'),
            'redirect_url' => $base_url = get_option('hybridmlm_basic_url'),
            'username' => $user->data->user_email,
            'password' => isset($_POST['password']) ? $_POST['password'] : $_POST['pwd'],
            'grant_type' => 'password',
            'scope' => '',
        ]);

        $options = [
            'body' => $body,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => ' application/json',
            ],
            'timeout' => 60,
            'redirection' => 5,
            'blocking' => true,
            'httpversion' => '1.0',
            'sslverify' => false,
            'data_format' => 'body',
        ];

        $endpoint = $base_url . 'oauth/token';
        $response = wp_remote_post($endpoint, $options);
        $responseCode = $response['response']['code'];
        if ($responseCode == 200) {
            $data = json_decode($response['body']);
            $_SESSION['token_type'] = $data->token_type;
            $_SESSION['access_token'] = $data->access_token;
            $_SESSION['refresh_token'] = $data->refresh_token;
            $_SESSION['expires_in'] = $data->expires_in;
        }
    }

    /**
     * MLM login button
     */
    function mlm_login_button()
    {
        $basic_url = get_option('hybridmlm_basic_url');

        if (current_user_can('manage_options'))
            return true;

        if (isset($_SESSION["access_token"]) & !current_user_can('manage_options'))
            echo "<div class='mlm-login'><form target='_blank' id='mlm-login-form' method='post' action='" . $basic_url . "woocommerce/loginFromWp'><input type='hidden' name='api_token' value='" . $_SESSION["access_token"] . "'/> <button id='mlm-log-btn' type='submit'>Login to Backoffice</button></form> </div>";
        else
            echo "<div class='mlm-login'><a class='button' target='_blank' href='" . $basic_url . "user/home'>Login to Backoffice</a> </div>";
    }

    /**
     * @param $user
     * @param $username
     * @param $password
     * @return mixed|WP_Error
     */
    function custom_login_with_member_id ($user, $username, $password)
    {
        // Return if username or password is empty
        if (empty($username) || empty($password)) {
            return $user;
        }
        $wp_user = get_user_by('login', $username);
        if ($wp_user) {
            return $user;
        }
        // Try to get user by member_id
        $user_query = new WP_User_Query([
            'meta_key' => 'mlm_member_id',
            'meta_value' => $username,
            'number' => 1,
            'count_total' => false,
        ]);
        if (!empty($user_query->results)) {
            $found_user = $user_query->results[0];
            // Check password
            if (wp_check_password($password, $found_user->user_pass, $found_user->ID)) {
                return $found_user; // Successful login
            } else {
                return new WP_Error('incorrect_password', __('Invalid password.'));
            }
        }
        elseif(empty($user_query->results) && !filter_var($username, FILTER_VALIDATE_EMAIL)){
            return new WP_Error('incorrect_member_id', __('Incorrect member id , please enter valid one.'));
        }
        // If not found by member ID, let WordPress try normal login (username/email)
        return $user;
    }

    /**
     * @param $translated_text
     * @param $text
     * @param $domain
     * @return mixed|string|null
     */
    function custom_login_label_text ($translated_text, $text, $domain) {
        if ('Username or email address' === $text) {
            $translated_text = __('Member ID or Email', 'woocommerce');
        }
        return $translated_text;
    }
}