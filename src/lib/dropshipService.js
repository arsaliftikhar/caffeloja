import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import MLMSettings from '@/models/MLMSettings';
import { ALLOWED_SHIPPING_COUNTRY_CODE, isUnitedStatesCountry } from '@/lib/shipping';

function normalizeCountryCode(country) {
  if (!isUnitedStatesCountry(country)) {
    throw new Error('Dropshipping dispatch rejected: non-US shipping country.');
  }
  return ALLOWED_SHIPPING_COUNTRY_CODE;
}

function mapWooCommerceSku(item) {
  const sku = String(item?.sku || '').trim();
  const name = String(item?.name || '').toLowerCase();
  const upper = sku.toUpperCase();
  if (
    !sku ||
    upper === 'CB-20PODS' ||
    upper === '20CUP' ||
    upper === '20PK' ||
    name.includes('coffee box') ||
    name.includes('pods')
  ) {
    return '20PK';
  }
  return sku;
}

/**
 * Forward customer coffee order to WooCommerce REST API
 */
export async function forwardOrderToWordPress(order) {
  try {
    await connectToDatabase();
    const settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' });
    const dropshipConfig = settings?.dropshipSettings || {};

    const defaultEndpoint = process.env.WC_ORDERS_API_URL || 'https://oldchicagocoffee.com/1/wp-json/wc/v3/orders';
    const configuredTarget = (dropshipConfig.targetUrl || '').replace(/\/+$/, '');
    let endpoint =
      process.env.WC_ORDERS_API_URL ||
      (configuredTarget
        ? configuredTarget.includes('/wp-json/')
          ? configuredTarget
          : `${configuredTarget}/wp-json/wc/v3/orders`
        : defaultEndpoint);

    // Normalize endpoint (retain /1/ if configured, ensure wc orders endpoint path)
    endpoint = (endpoint || 'https://oldchicagocoffee.com/1/wp-json/wc/v3/orders').replace(/\/+$/, '');
    if (!endpoint.includes('/wp-json/')) {
      endpoint = `${endpoint}/wp-json/wc/v3/orders`;
    }

    const consumerKey = process.env.WC_CONSUMER_KEY || dropshipConfig.consumerKey || '';
    const consumerSecret = process.env.WC_CONSUMER_SECRET || dropshipConfig.consumerSecret || '';

    const fullName = String(order.customer?.name || 'Coffee Customer').trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || 'Coffee';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const countryCode = normalizeCountryCode(order.customer?.address?.country);

    const wcPayload = {
      billing: {
        first_name: firstName,
        last_name: lastName,
        address_1: order.customer?.address?.street || '',
        address_2: '',
        city: order.customer?.address?.city || '',
        state: order.customer?.address?.state || '',
        postcode: order.customer?.address?.postalCode || '',
        country: countryCode,
        email: order.customer?.email || 'order@caffeloja.com',
        phone: order.customer?.phone || '',
      },
      shipping: {
        first_name: firstName,
        last_name: lastName,
        address_1: order.customer?.address?.street || '',
        address_2: '',
        city: order.customer?.address?.city || '',
        state: order.customer?.address?.state || '',
        postcode: order.customer?.address?.postalCode || '',
        country: countryCode,
      },
      line_items: (order.items || []).map((item) => ({
        sku: mapWooCommerceSku(item),
        quantity: item.quantity || 1,
      })),
      customer_id: 0,
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      customer_note: `Caffeloja Order ${order.orderNumber}${order.referralCode ? ` | Referral: ${order.referralCode}` : ''}`,
    };

    let responseResult;
    let httpStatus = null;

    if (consumerKey && consumerSecret) {
      // 1. Primary method: Standard HTTP Basic Auth header (as verified in Postman to https://oldchicagocoffee.com/1/wp-json/wc/v3/orders)
      const authHeader =
        'Basic ' + Buffer.from(`${consumerKey.trim()}:${consumerSecret.trim()}`).toString('base64');

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          'User-Agent': 'Caffeloja-WooCommerce-Client/1.0',
        },
        body: JSON.stringify(wcPayload),
      });

      // 2. Fallback: Query parameter authentication if Basic Auth header is rejected
      if (!response.ok && (response.status === 401 || response.status === 403)) {
        let requestUrl = endpoint;
        try {
          const u = new URL(endpoint);
          u.searchParams.set('consumer_key', consumerKey.trim());
          u.searchParams.set('consumer_secret', consumerSecret.trim());
          requestUrl = u.toString();
        } catch (e) {
          requestUrl = `${endpoint}${endpoint.includes('?') ? '&' : '?'}consumer_key=${encodeURIComponent(consumerKey.trim())}&consumer_secret=${encodeURIComponent(consumerSecret.trim())}`;
        }

        const fallbackResponse = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Caffeloja-WooCommerce-Client/1.0',
          },
          body: JSON.stringify(wcPayload),
        });

        if (fallbackResponse.ok) {
          response = fallbackResponse;
        }
      }

      httpStatus = response.status;

      if (response.ok) {
        const wpData = await response.json();
        responseResult = {
          success: true,
          httpStatus,
          dropshipOrderId: `WC#${wpData.id || wpData.number || 'SYNCED'}`,
          mode: 'wc_rest_live',
          message: 'Order successfully created in WooCommerce!',
          raw: wpData,
        };
      } else {
        const errText = await response.text();
        console.warn('WooCommerce REST error:', response.status, errText);
        let guidance = '';
        if (errText.includes('woocommerce_rest_cannot_create')) {
          guidance = ' (Notice: WooCommerce API key permissions are set to "Read". In WordPress WP-Admin > WooCommerce > Settings > Advanced > REST API, edit this key and change Permissions from "Read" to "Read/Write", and verify the User is an Administrator).';
        } else if (errText.includes('xecurify') || errText.includes('miniOrange')) {
          guidance = ' (Notice: miniOrange WP REST API plugin on WordPress blocked the request. Deactivate the miniOrange plugin in WordPress WP-Admin > Plugins since WooCommerce core authenticates REST requests natively).';
        }
        responseResult = {
          success: false,
          httpStatus,
          dropshipOrderId: `OCC-PENDING-${Date.now()}`,
          mode: 'wc_rest_retry_queue',
          message: `WooCommerce API responded with status ${response.status}.${guidance}`,
          error: errText,
        };
      }
    } else {
      responseResult = {
        success: true,
        httpStatus: 0,
        dropshipOrderId: `OCC-SIM-${Date.now()}`,
        mode: 'simulation_ready',
        message: 'WC Consumer Key/Secret not configured; order simulated.',
      };
    }

    await Order.findByIdAndUpdate(
      order._id,
      {
        $set: {
          'dropshipping.isForwarded': true,
          'dropshipping.dropshipOrderId': responseResult.dropshipOrderId,
          'dropshipping.targetUrl': endpoint,
          'dropshipping.status': responseResult.success ? 'forwarded' : 'failed',
          'dropshipping.forwardedAt': new Date(),
          'dropshipping.httpStatus': httpStatus,
          'dropshipping.requestPayload': JSON.stringify(wcPayload, null, 2),
          'dropshipping.responseLog': JSON.stringify(responseResult, null, 2),
          status: responseResult.success ? 'forwarded_to_dropshipper' : 'processing',
        },
      },
      { strict: false }
    );

    return responseResult;
  } catch (error) {
    console.error('Dropshipping dispatch error:', error);
    try {
      if (order?._id) {
        await Order.findByIdAndUpdate(
          order._id,
          {
            $set: {
              'dropshipping.status': 'failed',
              'dropshipping.forwardedAt': new Date(),
              'dropshipping.responseLog': JSON.stringify({ success: false, error: error.message }, null, 2),
            },
          },
          { strict: false }
        );
      }
    } catch {}
    return {
      success: false,
      error: error.message,
      dropshipOrderId: null,
    };
  }
}
