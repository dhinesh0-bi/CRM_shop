// src/pages/Login.jsx
// Stunning login page for Find Laundry Service CRM
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, WashingMachine, MapPin, AlertCircle, Loader2 } from 'lucide-react';

const SHOP = {
  name: 'Find Laundry Service',
  tagline: 'Business Management Portal',
  location: 'Club House, Ground Floor, SBIOA Unity Enclave,\nMambakkam, Chennai – 600 127',
};

export default function Login() {
  const navigate             = useNavigate();
  const { login }            = useAuth();
  const [email, setEmail]    = useState('');
  const [password, setPass]  = useState('');
  const [showPass, setShowP] = useState(false);
  const [loading, setLoad]   = useState(false);
  const [error, setError]    = useState('');
  const [focused, setFocus]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoad(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = {
        'auth/invalid-credential':       'Invalid email or password. Please try again.',
        'auth/user-not-found':           'No account found with this email.',
        'auth/wrong-password':           'Incorrect password.',
        'auth/too-many-requests':        'Too many attempts. Please wait a moment.',
        'auth/network-request-failed':   'Network error. Check your connection.',
        'auth/invalid-email':            'Please enter a valid email address.',
      }[err.code] || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── Animated background bubbles ───────────────── */}
      <div className="login-bg-blob blob-1" />
      <div className="login-bg-blob blob-2" />
      <div className="login-bg-blob blob-3" />

      <div className="login-wrapper">
        {/* ── LEFT PANEL — Brand ──────────────────────── */}
        <div className="login-brand-panel">
          <div className="brand-inner">
            {/* Logo icon */}
            <div className="brand-logo-ring">
              <div className="brand-logo-icon">
                <WashingMachine size={36} color="#ffffff" strokeWidth={1.8} />
              </div>
            </div>

            <h1 className="brand-name">{SHOP.name}</h1>
            <p className="brand-tagline">{SHOP.tagline}</p>

            {/* Feature pills */}
            <div className="brand-features">
              {['Customer Tracking', 'Payment Links', 'Real-time Updates', 'Bill Automation'].map((f) => (
                <span key={f} className="feature-pill">{f}</span>
              ))}
            </div>

            {/* Location card */}
            <div className="brand-location">
              <MapPin size={14} color="#93C5FD" style={{ flexShrink: 0, marginTop: 2 }} />
              <p className="location-text">{SHOP.location}</p>
            </div>
          </div>

          {/* Decorative wave */}
          <svg
            className="brand-wave"
            viewBox="0 0 120 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path d="M120 0L0 0L0 80C20 60 50 70 80 55C95 48 110 50 120 45V0Z" fill="rgba(255,255,255,0.06)" />
            <path d="M120 20L0 0L0 80C30 72 60 65 90 70C105 72 115 68 120 65V20Z" fill="rgba(255,255,255,0.04)" />
          </svg>
        </div>

        {/* ── RIGHT PANEL — Login Form ──────────────── */}
        <div className="login-form-panel">
          <div className="login-form-inner">
            {/* Header */}
            <div className="form-header">
              <div className="form-logo-sm">
                <WashingMachine size={20} color="#2563EB" strokeWidth={2} />
              </div>
              <div>
                <h2 className="form-title">Welcome back</h2>
                <p className="form-subtitle">Sign in to your admin account</p>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="login-error" role="alert">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {/* Email */}
              <div className="field-group">
                <label className="field-label" htmlFor="login-email">
                  Email Address
                </label>
                <div className={`field-wrapper ${focused === 'email' ? 'focused' : ''}`}>
                  <Mail size={16} className="field-icon" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocus('email')}
                    onBlur={() => setFocus('')}
                    placeholder="admin1@findlaundry.in"
                    required
                    autoComplete="email"
                    className="field-input"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label className="field-label" htmlFor="login-password">
                  Password
                </label>
                <div className={`field-wrapper ${focused === 'pass' ? 'focused' : ''}`}>
                  <Lock size={16} className="field-icon" />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPass(e.target.value)}
                    onFocus={() => setFocus('pass')}
                    onBlur={() => setFocus('')}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="field-input"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowP((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                className="login-btn"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="spin-icon" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </form>

            {/* Admin hint */}
            <div className="admin-hint">
              <p className="hint-title">Authorised Admins Only</p>
              <p className="hint-body">
                This portal is restricted to registered admin accounts.<br />
                Contact the system administrator if you need access.
              </p>
            </div>

            {/* Footer */}
            <p className="login-footer">
              © 2025 {SHOP.name} · Mambakkam, Chennai
            </p>
          </div>
        </div>
      </div>

      {/* ── Component-scoped styles ────────────────────── */}
      <style>{`
        /* Root */
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #EDE9FE 100%);
          padding: 16px;
          position: relative;
          overflow: hidden;
        }

        /* Background animated blobs */
        .login-bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          animation: blobFloat 8s ease-in-out infinite alternate;
        }
        .blob-1 {
          width: 480px; height: 480px;
          background: radial-gradient(circle, #BFDBFE, #6366F1);
          top: -120px; left: -100px;
          animation-duration: 9s;
        }
        .blob-2 {
          width: 360px; height: 360px;
          background: radial-gradient(circle, #A5F3FC, #3B82F6);
          bottom: -80px; right: -80px;
          animation-duration: 11s;
          animation-delay: -3s;
        }
        .blob-3 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #DDD6FE, #8B5CF6);
          top: 40%; right: 20%;
          animation-duration: 7s;
          animation-delay: -5s;
        }
        @keyframes blobFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, -30px) scale(1.08); }
        }

        /* Card wrapper */
        .login-wrapper {
          position: relative;
          z-index: 1;
          display: flex;
          width: 100%;
          max-width: 920px;
          min-height: 560px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(37,99,235,0.15), 0 8px 24px rgba(0,0,0,0.08);
          animation: cardEntrance 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── LEFT BRAND PANEL ─────────────────────────── */
        .login-brand-panel {
          display: none;
          position: relative;
          flex-direction: column;
          justify-content: center;
          padding: 52px 44px;
          background: linear-gradient(145deg, #1D4ED8 0%, #2563EB 40%, #4F46E5 100%);
          overflow: hidden;
          flex: 0 0 400px;
        }
        @media (min-width: 768px) {
          .login-brand-panel { display: flex; }
        }
        .brand-inner { position: relative; z-index: 2; }

        .brand-logo-ring {
          width: 88px; height: 88px;
          border-radius: 24px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255,255,255,0.25);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 28px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(0,0,0,0.2), 0 0 0 0 rgba(255,255,255,0.15); }
          50%       { box-shadow: 0 8px 32px rgba(0,0,0,0.2), 0 0 0 12px rgba(255,255,255,0); }
        }
        .brand-logo-icon { display: flex; align-items: center; justify-content: center; }

        .brand-name {
          font-size: 26px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin: 0 0 8px;
        }
        .brand-tagline {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          font-weight: 400;
          margin: 0 0 28px;
        }

        .brand-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 32px;
        }
        .feature-pill {
          padding: 5px 12px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
        }

        .brand-location {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 14px 16px;
          background: rgba(0,0,0,0.18);
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .location-text {
          font-size: 12.5px;
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
          margin: 0;
          white-space: pre-line;
        }

        .brand-wave {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          width: 100%;
        }

        /* ── RIGHT FORM PANEL ─────────────────────────── */
        .login-form-panel {
          flex: 1;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 36px;
        }
        .login-form-inner {
          width: 100%;
          max-width: 360px;
        }

        .form-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .form-logo-sm {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: #EFF6FF;
          border: 1.5px solid #BFDBFE;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .form-title {
          font-size: 22px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.4px;
          margin: 0 0 2px;
        }
        .form-subtitle {
          font-size: 13px;
          color: #64748B;
          margin: 0;
          font-weight: 400;
        }

        /* Error alert */
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 14px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 10px;
          color: #DC2626;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 20px;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          60%      { transform: translateX(6px); }
          80%      { transform: translateX(-3px); }
        }

        /* Form */
        .login-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }

        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .field-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .field-wrapper.focused {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          background: #fff;
        }
        .field-icon { color: #94A3B8; flex-shrink: 0; }
        .field-wrapper.focused .field-icon { color: #2563EB; }
        .field-input {
          flex: 1;
          padding: 11px 0;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          color: #0F172A;
          font-family: inherit;
        }
        .field-input::placeholder { color: #CBD5E1; font-weight: 400; }
        .field-input:disabled { opacity: 0.6; }
        .eye-toggle {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #94A3B8;
          display: flex;
          transition: color 0.15s;
        }
        .eye-toggle:hover { color: #475569; }

        /* Submit button */
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: inherit;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(37,99,235,0.35);
          margin-top: 4px;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1D4ED8, #1E40AF);
          box-shadow: 0 6px 20px rgba(37,99,235,0.45);
          transform: translateY(-1px);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled {
          background: linear-gradient(135deg, #93C5FD, #A5B4FC);
          box-shadow: none;
          cursor: not-allowed;
        }
        .spin-icon { animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Admin hint box */
        .admin-hint {
          padding: 14px 16px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 20px;
        }
        .hint-title {
          font-size: 11px;
          font-weight: 700;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 4px;
        }
        .hint-body {
          font-size: 12px;
          color: #94A3B8;
          margin: 0;
          line-height: 1.5;
        }

        /* Footer */
        .login-footer {
          text-align: center;
          font-size: 11.5px;
          color: #CBD5E1;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
