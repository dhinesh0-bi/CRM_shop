import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDoorNumber, setNewDoorNumber] = useState(''); 
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to load customers", error);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setStatus('Adding...');
    
    try {
      // Sending ALL THREE pieces of data to prevent the 400 Bad Request error
      await axios.post('http://localhost:8080/api/customers', { 
        name: newName, 
        phone: newPhone,
        doorNumber: newDoorNumber 
      });
      
      setStatus('✅ Customer added successfully!');
      
      // Clear the form
      setNewName('');
      setNewPhone('');
      setNewDoorNumber('');
      
      // Refresh the table
      fetchCustomers();
      setTimeout(() => setStatus(''), 3000);
    } catch (error) {
      setStatus('❌ Failed to add customer. Make sure all fields are filled.');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* HEADER SECTION */}
      <div className="mb-8 border-b border-slate-200/50 pb-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Customer Directory</h2>
        <p className="text-blue-200 mt-1 font-medium tracking-wide">Manage your shop's clients and door numbers.</p>
      </div>

      {/* ADD CUSTOMER FORM */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-blue-500" /> Register New Customer
        </h3>
        
        <form onSubmit={handleCreateCustomer} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input 
            type="text" required placeholder="Door Number (e.g. 12/A)"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
            value={newDoorNumber} onChange={(e) => setNewDoorNumber(e.target.value)}
          />
          <input 
            type="text" required placeholder="Customer Name"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
            value={newName} onChange={(e) => setNewName(e.target.value)}
          />
          <input 
            type="text" required placeholder="Phone (e.g. 948627XXXX)"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
            value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
          />
          <button type="submit" className="sm:col-span-3 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-slate-900 text-white font-extrabold text-lg py-3 rounded-xl transition-all shadow-md transform hover:-translate-y-0.5">
            + Register Customer
          </button>
        </form>
        
        {status && (
          <p className="mt-4 text-center text-sm font-bold text-slate-700 bg-slate-100 py-2 rounded-lg">
            {status}
          </p>
        )}
      </div>

      {/* CUSTOMER DIRECTORY LIST */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Users size={18} /> Registered Profiles
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full">
            {customers.length} Total
          </span>
        </div>
        
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {customers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic font-medium">No customers registered yet.</div>
          ) : (
            customers.map((c) => (
              <div key={c.id} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-blue-50 text-blue-800 text-xs font-extrabold px-2 py-0.5 rounded border border-blue-200">
                      Door: {c.doorNumber || 'N/A'}
                    </span>
                    <p className="font-bold text-slate-800 text-lg">{c.name}</p>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">{c.phone}</p>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  ID: {c.id}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
    </div>
  );
}