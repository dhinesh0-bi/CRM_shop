import { useState, useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../api';
import { UserPlus, Users, Check, X, Hash, Phone, Home } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDoorNumber, setNewDoorNumber] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/customers`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers', error);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Registering customer...' });

    try {
      await axios.post(`${BASE_URL}/api/customers`, {
        name: newName,
        phone: newPhone,
        doorNumber: newDoorNumber,
      });
      setStatus({ type: 'success', message: 'Customer registered successfully.' });
      setNewName('');
      setNewPhone('');
      setNewDoorNumber('');
      fetchCustomers();
      setTimeout(() => setStatus({ type: '', message: '' }), 3500);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to register. Ensure all fields are filled.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in-up">

      {/* ── PAGE HEADER ──────────────────────────────── */}
      <div className="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="page-title">Customer Directory</h1>
          <p className="page-subtitle">Manage your shop's client profiles and door assignments.</p>
        </div>
        <span className="badge badge-blue">
          <Users size={10} />
          {customers.length} Registered
        </span>
      </div>

      {/* ── REGISTRATION FORM ────────────────────────── */}
      <div className="crm-card p-6 mb-6">
        <div className="section-header">
          <UserPlus size={13} />
          Register New Customer
        </div>

        <form id="customer-form" onSubmit={handleCreateCustomer}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {/* Door Number */}
            <div>
              <label className="crm-label" htmlFor="door-number-input">
                <Home size={11} className="inline mr-1" />
                Door Number
              </label>
              <input
                id="door-number-input"
                type="text"
                required
                placeholder="e.g. 12/A"
                className="crm-input"
                value={newDoorNumber}
                onChange={(e) => setNewDoorNumber(e.target.value)}
              />
            </div>

            {/* Name */}
            <div>
              <label className="crm-label" htmlFor="customer-name-input">
                <Users size={11} className="inline mr-1" />
                Full Name
              </label>
              <input
                id="customer-name-input"
                type="text"
                required
                placeholder="Customer Name"
                className="crm-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="crm-label" htmlFor="customer-phone-input">
                <Phone size={11} className="inline mr-1" />
                Phone Number
              </label>
              <input
                id="customer-phone-input"
                type="text"
                required
                placeholder="e.g. 9486270000"
                className="crm-input"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            id="register-customer-btn"
            type="submit"
            className="btn-primary w-full"
            disabled={isSubmitting}
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            {isSubmitting ? (
              <>
                <span
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
                Registering...
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Register Customer
              </>
            )}
          </button>
        </form>

        {/* Status Alert */}
        {status.message && (
          <div
            className={`crm-alert mt-4 ${
              status.type === 'success'
                ? 'crm-alert-success'
                : status.type === 'error'
                ? 'crm-alert-error'
                : 'crm-alert-info'
            }`}
          >
            {status.type === 'success' ? <Check size={15} /> : status.type === 'error' ? <X size={15} /> : null}
            {status.message}
          </div>
        )}
      </div>

      {/* ── CUSTOMER LIST ────────────────────────────── */}
      <div className="crm-card overflow-hidden">
        {/* Card Header */}
        <div
          className="flex justify-between items-center px-6 py-4"
          style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: '#FAFBFC' }}
        >
          <div className="section-header mb-0">
            <Users size={13} />
            Registered Profiles
          </div>
          <span className="badge badge-gray">{customers.length} Total</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="crm-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>
                  <Hash size={11} className="inline mr-1" />
                  ID
                </th>
                <th>Door No.</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th style={{ width: '120px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <Users size={40} style={{ margin: '0 auto 12px', color: '#CBD5E1' }} />
                      <p>No customers registered yet.</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Use the form above to add your first customer.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span
                        className="font-mono text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: 'var(--surface-base)', color: 'var(--text-muted)' }}
                      >
                        #{c.id}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue">
                        <Home size={10} />
                        {c.doorNumber || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {c.name}
                      </p>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Phone size={13} />
                        <span className="font-medium">{c.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-paid">
                        <Check size={10} />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}