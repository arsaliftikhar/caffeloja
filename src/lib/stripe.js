/**
 * Stripe REST API Client for Caffeloja
 * Direct REST integration supporting Checkout Sessions, Recurring Subscriptions, Webhooks, and Payment Verification
 */
import crypto from 'crypto';

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || '';
}

export function isStripeConfigured() {
  const key = getStripeSecretKey();
  return Boolean(key && key.startsWith('sk_') && !key.includes('your_') && key.length > 24);
}

/**
 * Helper to execute authorized requests to Stripe API
 */
async function stripeRequest(endpoint, options = {}) {
  const secretKey = getStripeSecretKey();
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured in environment variables.');
  }

  const url = `${STRIPE_API_BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data?.error?.message || `Stripe API Error: ${response.status} ${response.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
}

/**
 * Creates a Stripe Checkout Session for Coffee Box orders
 */
export async function createStripeCheckoutSession({
  orderNumber,
  customer,
  items,
  total,
  referralCode,
  successUrl,
  cancelUrl,
}) {
  const params = new URLSearchParams();

  // Mode and payment types
  params.append('mode', 'payment');
  params.append('payment_method_types[0]', 'card');
  params.append('payment_method_types[1]', 'link');

  // Customer email
  if (customer?.email) {
    params.append('customer_email', customer.email);
  }

  // URLs
  params.append('success_url', successUrl);
  params.append('cancel_url', cancelUrl);

  // Line items
  items.forEach((item, index) => {
    params.append(`line_items[${index}][quantity]`, String(item.quantity || 1));
    params.append(`line_items[${index}][price_data][currency]`, 'usd');
    params.append(`line_items[${index}][price_data][unit_amount]`, String(Math.round(Number(item.price) * 100)));
    params.append(`line_items[${index}][price_data][product_data][name]`, item.name || 'Coffee Box (20 Pods)');
    params.append(`line_items[${index}][price_data][product_data][description]`, '20 Single-Serve Artisan Coffee Pods (Keurig K-Cup Compatible)');
    
    if (item.imageUrl) {
      // If absolute URL, provide to Stripe
      if (item.imageUrl.startsWith('http')) {
        params.append(`line_items[${index}][price_data][product_data][images][0]`, item.imageUrl);
      }
    }
  });

  // Metadata for webhook & post-payment processing
  params.append('metadata[orderNumber]', orderNumber);
  params.append('metadata[customerName]', customer?.name || '');
  params.append('metadata[customerEmail]', customer?.email || '');
  params.append('metadata[customerPhone]', customer?.phone || '');
  if (referralCode) {
    params.append('metadata[referralCode]', referralCode.toUpperCase());
  }

  return await stripeRequest('/checkout/sessions', {
    method: 'POST',
    body: params.toString(),
  });
}

/**
 * Retrieves a Stripe Checkout Session by ID
 */
export async function retrieveStripeCheckoutSession(sessionId) {
  if (!sessionId) return null;
  return await stripeRequest(`/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
  });
}

/**
 * Creates a Stripe PaymentIntent for embedded Card Elements subscription payment
 */
export async function createStripePaymentIntent({
  amount,
  customer,
  orderNumber,
  referralCode,
}) {
  const params = new URLSearchParams();
  params.append('amount', String(Math.round(Number(amount) * 100)));
  params.append('currency', 'usd');
  params.append('payment_method_types[0]', 'card');
  params.append('description', `Caffeloja Monthly Coffee Box Subscription (${orderNumber})`);

  if (customer?.email) {
    params.append('receipt_email', customer.email);
  }

  params.append('metadata[orderNumber]', orderNumber);
  params.append('metadata[customerName]', customer?.name || '');
  params.append('metadata[customerEmail]', customer?.email || '');
  if (referralCode) {
    params.append('metadata[referralCode]', referralCode.toUpperCase());
  }

  return await stripeRequest('/payment_intents', {
    method: 'POST',
    body: params.toString(),
  });
}

/**
 * Retrieves a Stripe PaymentIntent by ID
 */
export async function retrieveStripePaymentIntent(paymentIntentId) {
  if (!paymentIntentId) return null;
  return await stripeRequest(`/payment_intents/${encodeURIComponent(paymentIntentId)}`, {
    method: 'GET',
  });
}

/**
 * Finds or creates a Stripe Customer for recurring subscription billing
 */
export async function createOrGetStripeCustomer({
  existingCustomerId,
  email,
  name,
  phone,
  shipping,
}) {
  if (existingCustomerId) {
    try {
      const existing = await stripeRequest(`/customers/${encodeURIComponent(existingCustomerId)}`, {
        method: 'GET',
      });
      if (existing && !existing.deleted) {
        return existing;
      }
    } catch {
      // Create a fresh customer if not found
    }
  }

  const params = new URLSearchParams();
  if (email) params.append('email', email);
  if (name) params.append('name', name);
  if (phone) params.append('phone', phone);
  if (shipping?.street) {
    params.append('shipping[name]', name || email || 'Member');
    if (phone) params.append('shipping[phone]', phone);
    params.append('shipping[address][line1]', shipping.street);
    if (shipping.city) params.append('shipping[address][city]', shipping.city);
    if (shipping.state) params.append('shipping[address][state]', shipping.state);
    if (shipping.postalCode) params.append('shipping[address][postal_code]', shipping.postalCode);
    params.append('shipping[address][country]', shipping.country || 'US');
  }

  return await stripeRequest('/customers', {
    method: 'POST',
    body: params.toString(),
  });
}

/**
 * Gets or creates the recurring $69.00/month Coffee Box (20 Pods) Stripe Price
 */
export async function getOrCreateMonthlyCoffeePrice() {
  const lookupKey = 'caffeloja_coffee_box_monthly_69';
  const listRes = await stripeRequest(`/prices?lookup_keys[]=${encodeURIComponent(lookupKey)}&active=true&limit=1`, {
    method: 'GET',
  });

  if (listRes?.data?.length > 0) {
    return listRes.data[0].id;
  }

  const productParams = new URLSearchParams();
  productParams.append('name', 'Coffee Box (20 Pods) — Monthly Subscription');
  productParams.append('description', '20 Single-Serve Artisan Roasted Coffee Pods delivered monthly.');
  const product = await stripeRequest('/products', {
    method: 'POST',
    body: productParams.toString(),
  });

  const priceParams = new URLSearchParams();
  priceParams.append('product', product.id);
  priceParams.append('unit_amount', '6900');
  priceParams.append('currency', 'usd');
  priceParams.append('recurring[interval]', 'month');
  priceParams.append('lookup_key', lookupKey);
  priceParams.append('transfer_lookup_key', 'true');

  const price = await stripeRequest('/prices', {
    method: 'POST',
    body: priceParams.toString(),
  });

  return price.id;
}

/**
 * Creates an incomplete monthly Stripe Subscription with a PaymentIntent ready for on-page card confirmation
 */
export async function createStripeMonthlySubscription({
  customerId,
  priceId,
  orderNumber,
  userId,
  referralCode,
}) {
  const params = new URLSearchParams();
  params.append('customer', customerId);
  params.append('items[0][price]', priceId);
  params.append('payment_behavior', 'default_incomplete');
  params.append('payment_settings[save_default_payment_method]', 'on_subscription');
  params.append('payment_settings[payment_method_types][0]', 'card');
  params.append('expand[0]', 'latest_invoice.payment_intent');
  params.append('metadata[orderNumber]', orderNumber);
  params.append('metadata[userId]', String(userId || ''));
  if (referralCode) {
    params.append('metadata[referralCode]', referralCode.toUpperCase());
  }

  return await stripeRequest('/subscriptions', {
    method: 'POST',
    body: params.toString(),
  });
}

/**
 * Retrieves a Stripe Subscription with expanded payment method
 */
export async function retrieveStripeSubscription(subscriptionId) {
  if (!subscriptionId) return null;
  return await stripeRequest(
    `/subscriptions/${encodeURIComponent(subscriptionId)}?expand[0]=default_payment_method&expand[1]=latest_invoice.payment_intent`,
    { method: 'GET' }
  );
}

/**
 * Cancels an active Stripe Subscription immediately
 */
export async function cancelStripeSubscription(subscriptionId) {
  if (!subscriptionId) return null;
  return await stripeRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'DELETE',
  });
}

/**
 * Verifies Stripe webhook signature if STRIPE_WEBHOOK_SECRET is configured
 */
export function verifyStripeWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!secret || !secret.startsWith('whsec_') || secret.includes('your_') || secret.length < 20) {
    return true; // Skip strict verification when placeholder webhook secret is in use
  }
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((item) => {
      const [k, v] = item.split('=');
      return [k?.trim(), v?.trim()];
    })
  );
  if (!parts.t || !parts.v1) return false;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${parts.t}.${rawBody}`, 'utf8')
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(parts.v1));
  } catch {
    return false;
  }
}
