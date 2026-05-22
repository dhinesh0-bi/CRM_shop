import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Clock, IndianRupee, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingBills: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:8080/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard stats", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 mt-1">Real-time metrics for your shop.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Customers Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} className="text-blue-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Users size={18} className="text-blue-500" /> Total Customers
          </h3>
          <p className="text-4xl font-extrabold text-slate-800">
            {isLoading ? "..." : stats.totalCustomers}
          </p>
        </div>

        {/* Pending Bills Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={80} className="text-orange-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Clock size={18} className="text-orange-500" /> Pending Bills
          </h3>
          <p className="text-4xl font-extrabold text-orange-600">
            {isLoading ? "..." : stats.pendingBills}
          </p>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-6 rounded-2xl shadow-lg border border-green-600 relative overflow-hidden group hover:shadow-xl transition-shadow text-white">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity group-hover:scale-110 duration-300">
            <IndianRupee size={80} />
          </div>
          <h3 className="text-sm font-bold text-green-100 uppercase tracking-wider mb-2 flex items-center gap-2">
            <IndianRupee size={18} /> Revenue Collected
          </h3>
          <p className="text-4xl font-extrabold">
            {isLoading ? "..." : `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </p>
        </div>

      </div>
    </div>
  );
}