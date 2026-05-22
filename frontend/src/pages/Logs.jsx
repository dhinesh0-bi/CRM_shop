import { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, MessageCircle, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loadingId, setLoadingId] = useState(null); 
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); 

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to load logs", error);
    }
  };

  const handleRemind = async (paymentId, method) => {
    setLoadingId(`${paymentId}-${method}`); 
    setStatusMsg({ type: 'info', text: 'Sending reminder...' });

    try {
      const res = await axios.post('http://localhost:8080/api/billing/remind', {
        paymentId,
        deliveryMethod: method
      });
      setStatusMsg({ type: 'success', text: `✅ ${res.data.message}` });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send reminder.';
      setStatusMsg({ type: 'error', text: `❌ ${errorMsg}` });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleVerify = async (paymentId) => {
    setLoadingId(`verify-${paymentId}`);
    setStatusMsg({ type: 'info', text: 'Checking Razorpay...' });

    try {
      const res = await axios.get(`http://localhost:8080/api/billing/verify/${paymentId}`);
      setStatusMsg({ type: 'success', text: `✅ ${res.data.message}` });
      fetchLogs(); 
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (error) {
      setStatusMsg({ type: 'error', text: '❌ Failed to verify payment.' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } finally {
      setLoadingId(null);
    }
  };

  const handleManualPay = async (paymentId) => {
    // SECURITY CHECK: This triggers the browser's built-in alert box!
    const confirmed = window.confirm("⚠️ SECURITY CHECK\n\nAre you sure this customer has paid via Cash or GPay? Please verify before continuing.");
    
    // If they click "Cancel", the function stops here.
    if (!confirmed) return;

    setLoadingId(`manual-${paymentId}`);
    setStatusMsg({ type: 'info', text: 'Updating status to PAID...' });

    try {
      await axios.put(`http://localhost:8080/api/billing/manual-pay/${paymentId}`);
      setStatusMsg({ type: 'success', text: `✅ Bill #${paymentId} manually marked as PAID.` });
      fetchLogs(); // Refresh the table
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (error) {
      setStatusMsg({ type: 'error', text: '❌ Failed to update status.' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } finally {
      setLoadingId(null);
    }
  };

  // --- DYNAMIC LIVE FILTERING (By Door Number) ---
  const filteredLogs = logs.filter((log) => {
    // Safely check if doorNumber exists before calling toLowerCase()
    const logDoor = log.doorNumber || '';
    const customerDoor = log.customer?.doorNumber || '';
    
    const matchesSearch = 
      logDoor.toLowerCase().includes(searchQuery.toLowerCase()) || 
      customerDoor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = logs.length;
  const paidCount = logs.filter(l => l.status === 'PAID').length;
  const pendingCount = logs.filter(l => l.status === 'PENDING').length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200/50 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Billing Logs & Audits</h2>
          <p className="text-blue-200 mt-1 font-medium tracking-wide">Track transaction lifecycles and follow up with pending accounts.</p>
        </div>
        
        {statusMsg.text && (
          <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-sm transition-all animate-pulse ${
            statusMsg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
            statusMsg.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {statusMsg.text}
          </div>
        )}
      </div>

      {/* ADVANCED LIVE FILTER CONTROL ROW */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Smart Search Box (Door Number) */}
        <div className="relative md:col-span-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by Door No..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Segments Selector */}
        <div className="flex items-center gap-1.5 md:col-span-2 md:justify-end">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 hidden sm:inline flex items-center gap-1">
            <Filter size={14} /> Filter:
          </span>
          
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all ${
              statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all flex items-center gap-1.5 ${
              statusFilter === 'PAID' ? 'bg-green-600 text-white shadow-md shadow-green-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            <CheckCircle2 size={14} /> Paid ({paidCount})
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold tracking-wide transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING' ? 'bg-orange-600 text-white shadow-md shadow-orange-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <AlertCircle size={14} /> Unpaid ({pendingCount})
          </button>
        </div>
      </div>

      {/* DATA TABLE WRAPPER */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="p-4 font-semibold w-24">Bill ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold text-center w-24">Door No.</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold text-center w-32">Status</th>
                <th className="p-4 font-semibold text-center w-32">Method</th>
                <th className="p-4 font-semibold text-right w-48">Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400 italic font-medium bg-slate-50/50">
                    No records match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-slate-500 text-sm w-24">#{log.id}</td>
                    
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{log.customer?.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{log.customer?.phone}</p>
                    </td>

                    {/* NEW DOOR NUMBER CELL */}
                    <td className="p-4 text-center font-extrabold text-blue-900 bg-blue-50/30">
                      {log.doorNumber || log.customer?.doorNumber || '-'}
                    </td>
                    
                    <td className="p-4 font-extrabold text-slate-700">₹{log.amount}</td>
                    
                    <td className="p-4 text-center w-32 whitespace-nowrap">
                      {log.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          <CheckCircle2 size={14} /> PAID
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            <AlertCircle size={14} /> PENDING
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <button 
                              onClick={() => handleVerify(log.id)}
                              disabled={loadingId !== null}
                              className="text-[10px] uppercase font-extrabold text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              ↻ Sync
                            </button>
                            <span className="text-slate-200">|</span>
                            {/* THE NEW MANUAL PAY BUTTON */}
                            <button 
                              onClick={() => handleManualPay(log.id)}
                              disabled={loadingId !== null}
                              className="text-[10px] uppercase font-extrabold text-slate-400 hover:text-green-600 transition-colors"
                            >
                              ✓ Mark Paid
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-center w-32 whitespace-nowrap">
                      {log.deliveryMethod === 'whatsapp' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100">
                          <MessageCircle size={14} /> WA
                        </span>
                      ) : log.deliveryMethod === 'sms' ? (
                        <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">
                          <Smartphone size={14} /> SMS
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold">-</span>
                      )}
                    </td>

                    <td className="p-4 text-right w-48 whitespace-nowrap">
                      {log.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleRemind(log.id, 'whatsapp')} disabled={loadingId !== null} className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-bold transition disabled:opacity-50">
                            {loadingId === `${log.id}-whatsapp` ? '...' : <><MessageCircle size={15} /> WA</>}
                          </button>
                          
                          <button onClick={() => handleRemind(log.id, 'sms')} disabled={loadingId !== null} className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-bold transition disabled:opacity-50">
                            {loadingId === `${log.id}-sms` ? '...' : <><Smartphone size={15} /> SMS</>}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold italic pr-4">No actions required</span>
                      )}
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