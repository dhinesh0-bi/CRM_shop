// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Billing from './pages/Billing';
import Logs from './pages/Logs';

// Layout for authenticated pages (sidebar + content area)
function AppLayout({ children }) {
  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: 'var(--surface-base)', fontFamily: "'Inter', sans-serif" }}
    >
      <Navbar />
      {/* pt-16 for mobile topbar, md:ml-64 for desktop sidebar */}
      <main className="flex-1 overflow-x-hidden pt-16 md:pt-0 md:ml-64">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — all wrapped in ProtectedRoute */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <AppLayout><Customers /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <AppLayout><Billing /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <AppLayout><Logs /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all → dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}