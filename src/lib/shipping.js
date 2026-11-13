export const ALLOWED_SHIPPING_COUNTRY = 'United States';
export const ALLOWED_SHIPPING_COUNTRY_CODE = 'US';
export const US_ONLY_SHIPPING_ERROR = 'Shipping is currently available to the United States only.';

const US_COUNTRY_ALIASES = new Set([
  'us',
  'usa',
  'u.s.',
  'u.s.a.',
  'united states',
  'united states of america',
]);

/**
 * Validates that an omitted or provided shipping country is the United States.
 */
export function isUnitedStatesCountry(country) {
  const clean = String(country || '').trim().toLowerCase();
  if (!clean) return true;
  return US_COUNTRY_ALIASES.has(clean);
}

/**
 * Normalizes a customer payload so its shipping address country is locked to US.
 */
export function normalizeCustomerShipping(customer) {
  return {
    ...customer,
    address: {
      ...(customer?.address || {}),
      country: ALLOWED_SHIPPING_COUNTRY_CODE,
    },
  };
}

/**
 * Normalizes member shipping fields and enforces United States as the shipping country.
 */
export function normalizeShippingFields(shipping) {
  return {
    phone: String(shipping?.phone || '').trim(),
    street: String(shipping?.street || '').trim(),
    city: String(shipping?.city || '').trim(),
    state: String(shipping?.state || '').trim(),
    postalCode: String(shipping?.postalCode || '').trim(),
    country: ALLOWED_SHIPPING_COUNTRY,
  };
}
