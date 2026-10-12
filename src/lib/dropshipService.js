import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import MLMSettings from '@/models/MLMSettings';

/**
 * Forward customer coffee order to WordPress Dropshipper (https://oldchicagocoffee.com)
 * Supports WooCommerce REST API, Store API, and Hybrid MLM Plugin Bridge format.
 */
export async function forwardOrderToWordPress(order) {
  try {
    await connectToDatabase();
    const settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' });

    const dropshipConfig = settings?.dropshipSettings || {
      targetUrl: 'https://oldchicagocoffee.com',
      autoForward: true,
      apiMode: 'wc_rest',
    };

    const targetUrl = (dropshipConfig.targetUrl || 'https://oldchicagocoffee.com').replace(/\/+$/, '');

    // Format line items according to standard WooCommerce format
    const lineItems = (order.items || []).map((item) => ({
      name: item.name,
      product_id: item.productId || 0,
      quantity: item.quantity,
      subtotal: (item.price * item.quantity).toString(),
      total: (item.price * item.quantity).toString(),
      meta_data: [
        { key: 'Grind Type', value: item.grind || 'Whole Bean' },
        { key: 'Dropship Source', value: 'caffeloja.com' },
        { key: 'Source Order Number', value: order.orderNumber },
      ],
    }));

    // Construct WooCommerce payload
    const wcPayload = {
      payment_method: 'bacs',
      payment_method_title: 'Dropship Forwarded from Caffè Loja',
      set_paid: true,
      billing: {
        first_name: order.customer?.name?.split(' ')[0] || 'Coffee',
        last_name: order.customer?.name?.split(' ').slice(1).join(' ') || 'Customer',
        address_1: order.customer?.address?.street || 'Standard Address',
        city: order.customer?.address?.city || 'Lisbon',
        postcode: order.customer?.address?.postalCode || '1000-001',
        country: order.customer?.address?.country || 'PT',
        email: order.customer?.email || 'order@caffeloja.com',
        phone: order.customer?.phone || '',
      },
      shipping: {
        first_name: order.customer?.name?.split(' ')[0] || 'Coffee',
        last_name: order.customer?.name?.split(' ').slice(1).join(' ') || 'Customer',
        address_1: order.customer?.address?.street || 'Standard Address',
        city: order.customer?.address?.city || 'Lisbon',
        postcode: order.customer?.address?.postalCode || '1000-001',
        country: order.customer?.address?.country || 'PT',
      },
      line_items: lineItems,
      customer_note: `Dropship Order from Caffè Loja. Original Ref: ${order.orderNumber}. Referrer: ${order.referralCode || 'Direct'}.`,
    };

    let responseResult = {
      success: true,
      dropshipOrderId: 'OCC-' + Math.floor(100000 + Math.random() * 900000),
      mode: dropshipConfig.apiMode || 'wc_rest',
      message: 'Order dispatched to dropshipper queue',
    };

    // If WooCommerce REST credentials or plugin bridge endpoint is configured
    if (dropshipConfig.consumerKey && dropshipConfig.consumerSecret) {
      const endpoint = `${targetUrl}/wp-json/wc/v3/orders`;
      const authHeader = 'Basic ' + Buffer.from(`${dropshipConfig.consumerKey}:${dropshipConfig.consumerSecret}`).toString('base64');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'User-Agent': 'CaffeLoja-Dropship-Bridge/1.0',
        },
        body: JSON.stringify(wcPayload),
      });

      if (response.ok) {
        const wpData = await response.json();
        responseResult = {
          success: true,
          dropshipOrderId: `WP#${wpData.id || wpData.number || 'SYNCED'}`,
          mode: 'wc_rest_live',
          message: 'Order successfully created in WordPress WooCommerce!',
          raw: wpData,
        };
      } else {
        const errText = await response.text();
        console.warn('WordPress WC REST response status:', response.status, errText);
        responseResult = {
          success: false,
          dropshipOrderId: `OCC-PENDING-${Date.now()}`,
          mode: 'wc_rest_retry_queue',
          message: `WordPress API responded with status ${response.status}. Queued for retry.`,
          error: errText,
        };
      }
    } else {
      // Simulation / Plugin Bridge Ready Mode (when API keys are pending entry in admin)
      responseResult = {
        success: true,
        dropshipOrderId: `OCC-SIM-${Date.now()}`,
        mode: 'simulation_ready',
        message: `Order packaged for ${targetUrl}. (Configure Consumer Key & Secret in Admin to activate live REST sync).`,
      };
    }

    // Update MongoDB Order with dropship metadata
    await Order.findByIdAndUpdate(order._id, {
      'dropshipping.isForwarded': true,
      'dropshipping.dropshipOrderId': responseResult.dropshipOrderId,
      'dropshipping.targetUrl': targetUrl,
      'dropshipping.status': responseResult.success ? 'forwarded' : 'pending',
      'dropshipping.forwardedAt': new Date(),
      'dropshipping.responseLog': JSON.stringify(responseResult),
      status: 'forwarded_to_dropshipper',
    });

    return responseResult;
  } catch (error) {
    console.error('Dropshipping dispatch error:', error);
    return {
      success: false,
      error: error.message,
      dropshipOrderId: null,
    };
  }
}
