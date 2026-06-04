import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../api';
import { Users, Clock, IndianRupee, RefreshCw, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingBills: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      key: 'customers',
      label: 'Total Customers',
      value: isLoading ? null : stats.totalCustomers,
      icon: Users,
      chipClass: 'icon-chip-blue',
      cardClass: 'blue',
      badge: 'Active Accounts',
      badgeClass: 'badge-blue',
      valueColor: '#1E40AF',
    },
    {
      key: 'pending',
      label: 'Pending Bills',
      value: isLoading ? null : stats.pendingBills,
      icon: Clock,
      chipClass: 'icon-chip-amber',
      cardClass: 'amber',
      badge: 'Awaiting Payment',
      badgeClass: 'badge-pending',
      valueColor: '#B45309',
    },
    {
      key: 'revenue',
      label: 'Revenue Collected',
      value: isLoading
        ? null
        : `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: IndianRupee,
      chipClass: 'icon-chip-green',
      cardClass: 'green',
      badge: 'Total Earnings',
      badgeClass: 'badge-paid',
      valueColor: '#15803D',
    },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in-up">

      {/* ── PAGE HEADER ────────────────────────────────── */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-blue">
              <TrendingUp size={10} /> Live
            </span>
          </div>
          <h1 className="page-title">Overview Dashboard</h1>
          <p className="page-subtitle">{dateStr}</p>
        </div>
        <button
          id="dashboard-refresh-btn"
          onClick={fetchStats}
          className="btn-secondary"
          disabled={isLoading}
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`stat-card ${card.cardClass} animate-fade-in-up`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`icon-chip ${card.chipClass}`}>
                  <Icon size={20} />
                </div>
                <span className={`badge ${card.badgeClass}`}>{card.badge}</span>
              </div>

              <p
                className="text-sm font-600 mb-1"
                style={{ color: 'var(--text-secondary)', fontWeight: 600 }}
              >
                {card.label}
              </p>

              <div className="flex items-end justify-between">
                <p
                  className="text-3xl font-extrabold tracking-tight"
                  style={{ color: card.valueColor, letterSpacing: '-0.5px' }}
                >
                  {card.value === null ? (
                    <span className="inline-block w-20 h-8 rounded animate-pulse" style={{ backgroundColor: '#E2E8F0' }} />
                  ) : (
                    card.value
                  )}
                </p>
                <div
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: 'var(--surface-base)', color: 'var(--text-muted)' }}
                >
                  <ArrowUpRight size={12} />
                  Updated
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUICK SUMMARY PANEL ────────────────────────── */}
      <div className="crm-card p-6">
        <div className="section-header">
          <TrendingUp size={13} />
          Business Summary
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          {[
            {
              label: 'Collection Rate',
              value: isLoading
                ? '—'
                : stats.pendingBills + (stats.totalCustomers - stats.pendingBills) > 0
                ? `${Math.round(((stats.totalCustomers - stats.pendingBills) / Math.max(stats.totalCustomers, 1)) * 100)}%`
                : '0%',
              desc: 'Bills cleared vs total',
              color: '#16A34A',
            },
            {
              label: 'Avg. Bill Value',
              value: isLoading
                ? '—'
                : stats.totalCustomers > 0
                ? `₹${(stats.totalRevenue / stats.totalCustomers).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
                : '₹0',
              desc: 'Revenue per customer',
              color: '#2563EB',
            },
            {
              label: 'Pending Amount',
              value: isLoading ? '—' : stats.pendingBills,
              desc: 'Bills awaiting clearance',
              color: '#D97706',
            },
          ].map((item) => (
            <div key={item.label} className="px-6 py-4 first:pl-0 last:pr-0">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                {item.label}
              </p>
              <p className="text-2xl font-extrabold mb-0.5" style={{ color: item.color }}>
                {item.value}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}