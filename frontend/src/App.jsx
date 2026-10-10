import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute   from './components/ProtectedRoute.jsx';
import MainLayout       from './components/MainLayout.jsx';

import LoginPage           from './pages/LoginPage.jsx';
import DashboardPage       from './pages/DashboardPage.jsx';
import GradesPage          from './pages/GradesPage.jsx';
import DocumentRequestPage from './pages/DocumentRequestPage.jsx';
import ClearancePage       from './pages/ClearancePage.jsx';
import ProfilePage         from './pages/ProfilePage.jsx';
import PaymentPage         from './pages/PaymentPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — wrapped in sidebar layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"        element={<DashboardPage />} />
            <Route path="grades"           element={<GradesPage />} />
            <Route path="document-request" element={<DocumentRequestPage />} />
            <Route path="clearance"        element={<ClearancePage />} />
            <Route path="profile"          element={<ProfilePage />} />
            <Route path="payment"          element={<PaymentPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
