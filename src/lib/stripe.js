/**
 * Stripe REST API Client for Caffè Loja
 * Direct REST integration supporting Checkout Sessions, Webhooks, and Payment Verification
 */

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || '';
}

export function isStripeConfigured() {
  const key = getStripeSecretKey();
  return Boolean(key && key.startsWith('sk_'));
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
    params.append(`line_items[${index}][price_data][product_data][name]`, item.name || 'Coffee Box (60 Pods)');
    params.append(`line_items[${index}][price_data][product_data][description]`, '60 Single-Serve Artisan Coffee Pods (Keurig K-Cup Compatible)');
    
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
