import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { userId, role, student_id, deptId }
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

// Usage: requireRole('registrar')  or  requireRole('admin', 'registrar')
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role)
    ? next()
    : res.status(403).json({ message: 'You do not have access to this resource.' });
