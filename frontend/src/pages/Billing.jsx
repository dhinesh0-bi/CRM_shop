import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../api';
import { Smartphone, MessageCircle, Search, CheckCircle, Banknote, Receipt, X, IndianRupee } from 'lucide-react';

export default function Billing() {
  const [customers, setCustomers] = useState([]);
  const [nameQuery, setNameQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [amount, setAmount] = useState('');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [isCash, setIsCash] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/customers`)
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNameQuery(customer.doorNumber || '');
    setActiveSearch(null);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setNameQuery('');
  };

  const handleSendBill = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setStatus({ type: 'error', message: 'Please select a valid customer first.' });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Processing transaction...' });

    try {
      const res = await axios.post(`${BASE_URL}/api/billing/send`, {
        customerId: selectedCustomer.id,
        amount,
        notifyWhatsapp,
        notifySms,
        isCash,
      });
      setStatus({ type: 'success', message: res.data.message });
      setAmount('');
      setNameQuery('');
      setSelectedCustomer(null);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to process bill. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.doorNumber?.toLowerCase().includes(nameQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto animate-fade-in-up">

      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="page-header">
        <h1 className="page-title">Generate Bill</h1>
        <p className="page-subtitle">Search a customer by door number and dispatch an invoice instantly.</p>
      </div>

      {/* ── BILLING FORM CARD ────────────────────────── */}
      <div className="crm-card p-6 md:p-8">
        <form id="billing-form" onSubmit={handleSendBill} className="space-y-6">

          {/* ── CUSTOMER SEARCH ── */}
          <div>
            <div className="section-header">
              <Search size={13} />
              Find Customer by Door Number
            </div>

            <div style={{ position: 'relative' }}>
              <div className="search-wrapper">
                <Search size={15} />
                <input
                  id="door-search-input"
                  type="text"
                  placeholder="Enter door number..."
                  className={`crm-input ${selectedCustomer ? 'border-green-400' : ''}`}
                  style={selectedCustomer ? { backgroundColor: '#F0FDF4', color: '#15803D', fontWeight: 600 } : {}}
                  value={nameQuery}
                  onChange={(e) => {
                    setNameQuery(e.target.value);
                    setActiveSearch('door');
                    setSelectedCustomer(null);
                  }}
                  readOnly={!!selectedCustomer}
                />
              </div>

              {/* Dropdown */}
              {activeSearch === 'door' && nameQuery && !selectedCustomer && (
                <div
                  className="absolute left-0 right-0 rounded-xl shadow-lg overflow-hidden animate-fade-in"
                  style={{
                    top: 'calc(100% + 6px)',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--surface-border)',
                    zIndex: 50,
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {filtered.length === 0 ? (
                    <div className="p-4 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                      No customers found for "{nameQuery}"
                    </div>
                  ) : (
                    filtered.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="px-4 py-3 cursor-pointer transition-colors"
                        style={{ borderBottom: '1px solid var(--surface-border-light)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-base)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          Door: {c.doorNumber}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {c.name} • {c.phone}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Customer Chip */}
            {selectedCustomer && (
              <div
                className="flex items-center justify-between mt-3 px-3 py-2.5 rounded-lg animate-fade-in"
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle size={15} style={{ color: '#16A34A' }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#15803D' }}>
                      {selectedCustomer.name}
                    </p>
                    <p className="text-xs" style={{ color: '#4ADE80' }}>
                      Door {selectedCustomer.doorNumber} • {selectedCustomer.phone}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearCustomer}
                  className="p-1 rounded-lg"
                  style={{ color: '#15803D' }}
                  title="Clear selection"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* ── AMOUNT INPUT ── */}
          <div>
            <label className="crm-label" htmlFor="bill-amount-input">
              <IndianRupee size={11} className="inline mr-1" />
              Bill Amount (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <span
                className="absolute font-semibold text-base"
                style={{
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              >
                ₹
              </span>
              <input
                id="bill-amount-input"
                type="number"
                required
                min="1"
                placeholder="0.00"
                className="crm-input"
                style={{ paddingLeft: '32px', fontSize: '18px', fontWeight: 700 }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* ── PAYMENT MODE ── */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--surface-base)', border: '1.5px solid var(--surface-border)' }}
          >
            <label
              className="flex items-center gap-3 cursor-pointer"
              htmlFor="cash-payment-checkbox"
            >
              <input
                id="cash-payment-checkbox"
                type="checkbox"
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#16A34A' }}
                checked={isCash}
                onChange={(e) => setIsCash(e.target.checked)}
              />
              <div className="flex items-center gap-2">
                <div className="icon-chip icon-chip-green" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                  <Banknote size={15} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Cash / Direct GPay Payment
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Bypasses Razorpay. Bill instantly marked as PAID.
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* ── NOTIFICATION OPTIONS ── */}
          <div>
            <div className="section-header">
              <MessageCircle size={13} />
              Send Receipt / Link Via
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label
                className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${notifyWhatsapp ? '#22C55E' : 'var(--surface-border)'}`,
                  backgroundColor: notifyWhatsapp ? '#F0FDF4' : 'var(--surface-card)',
                }}
                htmlFor="whatsapp-notify-checkbox"
              >
                <input
                  id="whatsapp-notify-checkbox"
                  type="checkbox"
                  className="w-4 h-4"
                  style={{ accentColor: '#22C55E' }}
                  checked={notifyWhatsapp}
                  onChange={(e) => setNotifyWhatsapp(e.target.checked)}
                />
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} style={{ color: '#22C55E' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>WhatsApp</span>
                </div>
              </label>

              <label
                className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${notifySms ? 'var(--brand-primary)' : 'var(--surface-border)'}`,
                  backgroundColor: notifySms ? '#EFF6FF' : 'var(--surface-card)',
                }}
                htmlFor="sms-notify-checkbox"
              >
                <input
                  id="sms-notify-checkbox"
                  type="checkbox"
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--brand-primary)' }}
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                />
                <div className="flex items-center gap-2">
                  <Smartphone size={16} style={{ color: 'var(--brand-primary)' }} />
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>SMS</span>
                </div>
              </label>
            </div>
          </div>

          {/* ── SUBMIT ── */}
          <button
            id="generate-bill-btn"
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
            style={{ padding: '14px', fontSize: '15px' }}
          >
            {isSubmitting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : isCash ? (
              <>
                <Banknote size={17} />
                Record Cash Payment
              </>
            ) : (
              <>
                <Receipt size={17} />
                Generate Secure Invoice
              </>
            )}
          </button>
        </form>

        {/* Status Alert */}
        {status.message && (
          <div
            className={`crm-alert mt-5 ${
              status.type === 'success'
                ? 'crm-alert-success'
                : status.type === 'error'
                ? 'crm-alert-error'
                : 'crm-alert-info'
            }`}
          >
            {status.type === 'success' ? <CheckCircle size={15} /> : status.type === 'error' ? <X size={15} /> : null}
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}