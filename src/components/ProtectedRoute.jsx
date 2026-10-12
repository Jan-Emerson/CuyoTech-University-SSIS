import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// allowedRoles: array of roles that can access this route
// if omitted, any authenticated user can access
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they try to access another role's page
    const HOME = {
      student:    '/dashboard',
      registrar:  '/registrar/dashboard',
      cashier:    '/cashier/dashboard',
      dept_staff: '/dept/dashboard',
      admin:      '/admin/dashboard',
    };
    return <Navigate to={HOME[user.role] || '/login'} replace />;
  }

  return children;
}
