const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'divecloud-dev-secret';
const BCRYPT_ROUNDS = 12;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function userPayload(u) {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    first_name: u.first_name,
    last_name: u.last_name,
    avatar_url: u.avatar_url || null,
  };
}

function verifyToken(header) {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return jwt.verify(header.slice(7), JWT_SECRET);
}

module.exports = { JWT_SECRET, BCRYPT_ROUNDS, signToken, userPayload, verifyToken };
