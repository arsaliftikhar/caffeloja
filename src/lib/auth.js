import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'caffeloja_mlm_super_secure_jwt_secret_2026';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
