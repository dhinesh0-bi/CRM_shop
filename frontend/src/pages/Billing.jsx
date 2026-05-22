import { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, MessageCircle, Search, CheckCircle, Banknote } from 'lucide-react';

export default function Billing() {
  const [customers, setCustomers] = useState([]);
  const [nameQuery, setNameQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState(null); 
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // New Form State Checkboxes
  const [amount, setAmount] = useState('');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [isCash, setIsCash] = useState(false);
  
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    axios.get('http://localhost:8080/api/customers')
      .then(res => setCustomers(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setNameQuery(customer.doorNumber || '');
    setActiveSearch(null); 
  };

  const handleSendBill = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setStatus({ type: 'error', message: '❌ Please select a valid customer.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Processing transaction...' });
    try {
      const res = await axios.post('http://localhost:8080/api/billing/send', { 
        customerId: selectedCustomer.id, 
        amount, 
        notifyWhatsapp,
        notifySms,
        isCash 
      });
      setStatus({ type: 'success', message: `✅ ${res.data.message}` });
      
      setAmount('');
      setNameQuery('');
      setSelectedCustomer(null);
    } catch (error) {
      setStatus({ type: 'error', message: `❌ Failed to process bill.` });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      
      <div className="mb-8 border-b border-slate-200/50 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Generate Bill</h2>
        <p className="text-blue-200 mt-1 font-medium tracking-wide">Search customer and dispatch invoices instantly.</p>
      </div>

      <div className="bg-white/95 backdrop-blur-md p-6 md:p-10 rounded-2xl shadow-2xl border border-white/20">
        <form onSubmit={handleSendBill} className="space-y-6">
          
          {/* CUSTOMER SEARCH SECTION (DOOR NUMBER) */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Search size={16} className="text-blue-500" /> Find by Door Number
            </h3>
            <div className="relative">
              <input 
                type="text" placeholder="Enter Door Number..." 
                className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none transition-all font-bold text-lg ${selectedCustomer ? 'border-green-400 bg-green-50 text-green-800' : 'border-slate-300 focus:border-blue-500'}`}
                value={nameQuery} 
                onChange={(e) => {
                  setNameQuery(e.target.value);
                  setActiveSearch('door');
                  setSelectedCustomer(null);
                }} 
              />
              {activeSearch === 'door' && nameQuery && (
                <div className="absolute top-[55px] left-0 w-full bg-white border border-slate-200 shadow-xl rounded-lg mt-1 max-h-60 overflow-y-auto z-50">
                  {customers.filter(c => c.doorNumber?.toLowerCase().includes(nameQuery.toLowerCase())).map(c => (
                    <div key={c.id} onClick={() => handleSelectCustomer(c)} className="px-4 py-3 border-b hover:bg-sky-50 cursor-pointer">
                      <p className="font-extrabold text-blue-900 text-lg">Door: {c.doorNumber}</p>
                      <p className="text-xs text-slate-500 font-medium">{c.name} • {c.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-lg w-fit border border-green-200">
                <CheckCircle size={16} /> Locked to Door {selectedCustomer.doorNumber} ({selectedCustomer.name})
              </div>
            )}
          </div>

          {/* AMOUNT INPUT */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Bill Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
              <input type="number" required min="1" placeholder="0.00" 
                className="w-full pl-10 pr-4 py-4 border border-slate-300 rounded-xl outline-none bg-slate-50 text-xl font-bold text-slate-800 focus:border-blue-500" 
                value={amount} onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
          </div>

          {/* PAYMENT MODE CHECKBOX */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-5 h-5 accent-green-600 rounded cursor-pointer" checked={isCash} onChange={(e) => setIsCash(e.target.checked)} />
              <div className="flex items-center gap-2">
                <Banknote size={20} className="text-green-600"/>
                <span className="font-extrabold text-slate-800">Customer paying via Cash / Direct GPay</span>
              </div>
            </label>
            <p className="text-xs text-slate-500 mt-2 ml-8 font-medium">Bypasses Razorpay link generation. Bill is instantly marked as PAID in the system.</p>
          </div>

          {/* NOTIFICATION CHECKBOXES */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Send Receipt / Link Via:</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex flex-1 items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="checkbox" className="w-5 h-5 accent-emerald-500 rounded" checked={notifyWhatsapp} onChange={(e) => setNotifyWhatsapp(e.target.checked)} />
                <MessageCircle size={18} className="text-emerald-500"/> <span className="font-bold text-slate-700">WhatsApp</span>
              </label>
              
              <label className="flex flex-1 items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input type="checkbox" className="w-5 h-5 accent-blue-500 rounded" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} />
                <Smartphone size={18} className="text-blue-500"/> <span className="font-bold text-slate-700">SMS</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={status.type === 'loading'} className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 text-white font-extrabold text-lg py-4 rounded-xl shadow-lg">
            {status.type === 'loading' ? 'Processing...' : isCash ? 'Record Cash Payment' : 'Generate Secure Link'}
          </button>
        </form>

        {status.message && (
          <div className={`mt-6 p-4 rounded-xl text-center font-bold text-sm border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}