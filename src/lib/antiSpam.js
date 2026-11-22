/**
 * Caffeloja Anti-Spam & Bot Protection Utility
 * Provides multi-layer defense against automated web crawlers, headless bots,
 * and form spam without harming genuine customer experience.
 */

// In-memory rate limiting map: key -> [timestamps]
const rateLimitMap = new Map();

// Periodic cleanup every 10 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of rateLimitMap.entries()) {
      const valid = timestamps.filter((t) => now - t < 3600000); // retain max 1 hour
      if (valid.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, valid);
      }
    }
  }, 600000);
}

/**
 * Extract client IP address from standard forwarding headers
 */
export function getClientIp(request) {
  try {
    const headers = request.headers;
    const xForwardedFor = headers.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    const cfIp = headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();
  } catch {}
  return 'unknown-ip';
}

/**
 * Rate Limiter
 * @param {string} key Identifier (e.g. IP or email)
 * @param {number} maxRequests Maximum requests allowed within window
 * @param {number} windowMs Time window in milliseconds
 * @returns {boolean} True if within limit, false if rate limited
 */
export function checkRateLimit(key, maxRequests = 5, windowMs = 600000) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return true;
}

/**
 * Validates submission timing.
 * Real humans take at least 2.5-3 seconds to fill a form.
 * Bots submit in < 1-2 seconds or reuse stale timestamps.
 */
export function isValidSubmissionTiming(tokenTime, minSeconds = 2.5, maxHours = 24) {
  if (!tokenTime) return false;
  const numTime = Number(tokenTime);
  if (isNaN(numTime)) return false;

  const now = Date.now();
  const elapsedSeconds = (now - numTime) / 1000;

  // Too fast = bot script
  if (elapsedSeconds < minSeconds) return false;

  // Too old = stale replay attack
  if (elapsedSeconds > maxHours * 3600) return false;

  return true;
}

/**
 * Known spam triggers: SEO solicitations, casino, crypto schemes, bulk backlinks
 */
const SPAM_PATTERNS = [
  /seo\s+(audit|ranking|proposal|expert|services|boost)/i,
  /backlinks?/i,
  /domain\s+rating/i,
  /first\s+page\s+of\s+google/i,
  /page\s*1\s+on\s+google/i,
  /crypto\s+(recovery|investment|trading\s+bot|doubler)/i,
  /whatsapp:\s*\+?\d+/i,
  /telegram:\s*@/i,
  /t\.me\/[a-z0-9_]+/i,
  /viagra|cialis|poker|casino|online\s+gambling/i,
  /guest\s+post/i,
  /lead\s+generation\s+software/i,
  /email\s+list\s+provider/i,
  /porn|erotic|xxx/i,
  /loan\s+offer|urgent\s+inheritance/i,
];

/**
 * Analyze text content for suspicious spam characteristics
 */
export function isSpamContent({ name = '', email = '', subject = '', message = '' }) {
  const combinedText = `${name} ${email} ${subject} ${message}`;

  // 1. Excessive links check (contact inquiries with 2+ links are almost exclusively spam)
  const urlMatches = combinedText.match(/https?:\/\/|www\./gi) || [];
  if (urlMatches.length >= 2) {
    return { isSpam: true, reason: 'Excessive URLs in message' };
  }

  // 2. HTML/BBCode injection patterns often used in bot blast submissions
  if (/\[url=|<a\s+href=|href=/i.test(combinedText)) {
    return { isSpam: true, reason: 'HTML/BBCode link formatting detected' };
  }

  // 3. Keyword spam matching
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(combinedText)) {
      return { isSpam: true, reason: `Matches spam pattern: ${pattern}` };
    }
  }

  // 4. Repeated character spam (e.g. "aaaaaaa", "asdfasdfasdf")
  if (/(.)\1{9,}/.test(message)) {
    return { isSpam: true, reason: 'Repeated character flood' };
  }

  // 5. Cyrillic/Russian script check in subject or message when company is US-based
  const cyrillicMatch = combinedText.match(/[\u0400-\u04FF]/g) || [];
  if (cyrillicMatch.length > 15) {
    return { isSpam: true, reason: 'Foreign script spam detected' };
  }

  return { isSpam: false };
}
