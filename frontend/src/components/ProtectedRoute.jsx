// src/components/ProtectedRoute.jsx
// Redirects unauthenticated users to /login; shows a spinner while Firebase resolves
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 100%)',
        }}
      >
        {/* Animated spinner */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '3px solid #DBEAFE',
            borderTop: '3px solid #2563EB',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>
          Loading…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
