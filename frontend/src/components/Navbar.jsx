// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Receipt, History, WashingMachine, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location     = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard',     path: '/',          icon: LayoutDashboard, description: 'Overview & metrics' },
    { name: 'Customers',     path: '/customers', icon: Users,            description: 'Client directory' },
    { name: 'Generate Bill', path: '/billing',   icon: Receipt,          description: 'Create invoices' },
    { name: 'Bill Logs',     path: '/logs',      icon: History,          description: 'Audit & tracking' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Derive initials from email (e.g. "admin1@findlaundry.in" → "A1")
  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-40"
        style={{
          width: '256px',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--surface-border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
          >
            <WashingMachine size={18} color="#fff" />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: 'var(--text-primary)', lineHeight: '1.2' }}>
              Find Laundry Service
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Business Portal</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p
            className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            Main Menu
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all duration-150 relative"
                style={{
                  backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? '600' : '500',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {/* Active left bar */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ backgroundColor: 'var(--brand-primary)' }}
                  />
                )}
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all"
                  style={{ backgroundColor: isActive ? '#DBEAFE' : 'transparent' }}
                >
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight truncate">{link.name}</p>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: isActive ? '#60A5FA' : 'var(--text-muted)', fontWeight: 400 }}
                  >
                    {link.description}
                  </p>
                </div>
                {isActive && <ChevronRight size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />}
              </Link>
            );
          })}
        </nav>

        {/* User Badge + Logout */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl"
            style={{ backgroundColor: 'var(--surface-base)' }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.email?.split('@')[0] ?? 'Admin'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {user?.email ?? ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                padding: '4px',
                borderRadius: '6px',
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#DC2626';
                e.currentTarget.style.background = '#FEF2F2';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.background = 'none';
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ──────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          height: '60px',
          backgroundColor: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--surface-border)',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
          >
            <WashingMachine size={14} color="#fff" />
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Find Laundry</span>
        </div>

        {/* Mobile Nav Pills + Logout */}
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
                style={{
                  backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                  textDecoration: 'none',
                }}
                title={link.name}
              >
                <Icon size={18} />
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-9 h-9 rounded-lg transition-all"
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
            }}
          >
            <LogOut size={18} />
          </button>
        </nav>
      </header>
    </>
  );
}