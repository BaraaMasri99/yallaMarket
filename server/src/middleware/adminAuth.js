// Placeholder — replace with real JWT verification once auth is built
export function requireAdmin(req, res, next) {
  // TODO: decode JWT from Authorization header, verify role === 'admin'
  // For now, allow all requests through so routes can be tested
  next();
}
