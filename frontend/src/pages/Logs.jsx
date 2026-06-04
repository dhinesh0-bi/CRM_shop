import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../api';
import {
  Smartphone,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  Check,
  Banknote,
  History,
} from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/logs`);
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to load logs', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const showMsg = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
  };

  const handleRemind = async (paymentId, method) => {
    setLoadingId(`${paymentId}-${method}`);
    showMsg('info', 'Sending reminder...');
    try {
      const res = await axios.post(`${BASE_URL}/api/billing/remind`, {
        paymentId,
        deliveryMethod: method,
      });
      showMsg('success', res.data.message);
    } catch (error) {
      showMsg('error', error.response?.data?.error || 'Failed to send reminder.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleVerify = async (paymentId) => {
    setLoadingId(`verify-${paymentId}`);
    showMsg('info', 'Checking Razorpay...');
    try {
      const res = await axios.get(`${BASE_URL}/api/billing/verify/${paymentId}`);
      showMsg('success', res.data.message);
      fetchLogs();
    } catch (error) {
      showMsg('error', 'Failed to verify payment.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleManualPay = async (paymentId) => {
    const confirmed = window.confirm(
      '⚠️ Security Check\n\nConfirm that this customer has paid via Cash or GPay before continuing.'
    );
    if (!confirmed) return;

    setLoadingId(`manual-${paymentId}`);
    showMsg('info', 'Updating status to PAID...');
    try {
      await axios.put(`${BASE_URL}/api/billing/manual-pay/${paymentId}`);
      showMsg('success', `Bill #${paymentId} marked as PAID.`);
      fetchLogs();
    } catch (error) {
      showMsg('error', 'Failed to update status.');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const logDoor = log.doorNumber || '';
    const customerDoor = log.customer?.doorNumber || '';
    const matchesSearch =
      logDoor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerDoor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = logs.length;
  const paidCount = logs.filter((l) => l.status === 'PAID').length;
  const pendingCount = logs.filter((l) => l.status === 'PENDING').length;

  const filterOptions = [
    { label: `All`, count: totalCount, key: 'ALL', activeStyle: { backgroundColor: 'var(--text-primary)', color: '#fff' }, inactiveStyle: { backgroundColor: 'var(--surface-base)', color: 'var(--text-secondary)' } },
    { label: `Paid`, count: paidCount, key: 'PAID', icon: CheckCircle2, activeStyle: { backgroundColor: '#16A34A', color: '#fff' }, inactiveStyle: { backgroundColor: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' } },
    { label: `Unpaid`, count: pendingCount, key: 'PENDING', icon: AlertCircle, activeStyle: { backgroundColor: '#D97706', color: '#fff' }, inactiveStyle: { backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' } },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto animate-fade-in-up">

      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Billing Logs &amp; Audits</h1>
          <p className="page-subtitle">Track transaction lifecycles and follow up with pending accounts.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Global Status Alert */}
          {statusMsg.text && (
            <div
              className={`crm-alert ${
                statusMsg.type === 'success'
                  ? 'crm-alert-success'
                  : statusMsg.type === 'error'
                  ? 'crm-alert-error'
                  : 'crm-alert-info'
              }`}
            >
              {statusMsg.text}
            </div>
          )}
          <button id="logs-refresh-btn" onClick={fetchLogs} className="btn-secondary" disabled={isRefreshing}>
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── FILTER BAR ───────────────────────────────── */}
      <div
        className="crm-card px-5 py-4 mb-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        {/* Search */}
        <div className="search-wrapper w-full sm:w-72">
          <Search size={15} />
          <input
            id="logs-search-input"
            type="text"
            placeholder="Search by door number..."
            className="crm-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-semibold uppercase tracking-wider hidden sm:flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <Filter size={12} />
            Filter:
          </span>
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = statusFilter === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={isActive ? opt.activeStyle : { ...opt.inactiveStyle, border: '1px solid var(--surface-border)' }}
              >
                {Icon && <Icon size={12} />}
                {opt.label} ({opt.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── DATA TABLE ───────────────────────────────── */}
      <div className="crm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Customer</th>
                <th style={{ textAlign: 'center' }}>Door No.</th>
                <th>Amount</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Channel</th>
                <th style={{ textAlign: 'right', paddingRight: '24px' }}>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <History size={40} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
                      <p>No records match your filter.</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Try adjusting your search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    {/* Bill ID */}
                    <td>
                      <span
                        className="font-mono text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: 'var(--surface-base)', color: 'var(--text-muted)' }}
                      >
                        #{log.id}
                      </span>
                    </td>

                    {/* Customer */}
                    <td>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {log.customer?.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {log.customer?.phone}
                      </p>
                    </td>

                    {/* Door Number */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-blue">
                        {log.doorNumber || log.customer?.doorNumber || '—'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                        ₹{log.amount}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: 'center' }}>
                      {log.status === 'PAID' ? (
                        <span className="badge badge-paid">
                          <CheckCircle2 size={11} />
                          PAID
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="badge badge-pending">
                            <AlertCircle size={11} />
                            PENDING
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleVerify(log.id)}
                              disabled={loadingId !== null}
                              className="flex items-center gap-1 text-xs font-semibold transition-colors disabled:opacity-50"
                              style={{ color: 'var(--brand-primary)' }}
                              title="Sync with Razorpay"
                            >
                              <RotateCcw size={11} />
                              Sync
                            </button>
                            <span style={{ color: 'var(--surface-border)', fontSize: '12px' }}>|</span>
                            <button
                              onClick={() => handleManualPay(log.id)}
                              disabled={loadingId !== null}
                              className="flex items-center gap-1 text-xs font-semibold transition-colors disabled:opacity-50"
                              style={{ color: '#16A34A' }}
                              title="Mark as manually paid"
                            >
                              <Check size={11} />
                              Mark Paid
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Channel */}
                    <td style={{ textAlign: 'center' }}>
                      {log.deliveryMethod === 'whatsapp' ? (
                        <span className="badge" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                          <MessageCircle size={11} />
                          WhatsApp
                        </span>
                      ) : log.deliveryMethod === 'sms' ? (
                        <span className="badge badge-blue">
                          <Smartphone size={11} />
                          SMS
                        </span>
                      ) : log.deliveryMethod === 'cash' ? (
                        <span className="badge badge-paid">
                          <Banknote size={11} />
                          Cash
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    {/* Quick Actions */}
                    <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                      {log.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            id={`remind-wa-${log.id}`}
                            onClick={() => handleRemind(log.id, 'whatsapp')}
                            disabled={loadingId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            style={{
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
                            }}
                          >
                            {loadingId === `${log.id}-whatsapp` ? (
                              <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <MessageCircle size={13} />
                            )}
                            WA
                          </button>
                          <button
                            id={`remind-sms-${log.id}`}
                            onClick={() => handleRemind(log.id, 'sms')}
                            disabled={loadingId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #BFDBFE',
                            }}
                          >
                            {loadingId === `${log.id}-sms` ? (
                              <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Smartphone size={13} />
                            )}
                            SMS
                          </button>
                        </div>
                      ) : (
                        <span
                          className="text-xs font-medium italic pr-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          No action required
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {filteredLogs.length > 0 && (
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              borderTop: '1px solid var(--surface-border)',
              backgroundColor: '#FAFBFC',
            }}
          >
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Showing <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{filteredLogs.length}</span> of{' '}
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{totalCount}</span> records
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs" style={{ color: '#15803D', fontWeight: 600 }}>
                ✓ {paidCount} Paid
              </span>
              <span className="text-xs" style={{ color: '#B45309', fontWeight: 600 }}>
                ⏳ {pendingCount} Pending
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}