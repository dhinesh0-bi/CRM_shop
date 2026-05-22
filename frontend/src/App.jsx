import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Billing from './pages/Billing';
import Logs from './pages/Logs';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-sky-200 font-sans antialiased">        <Navbar />
        {/* We added pt-20 for mobile nav spacing, and md:ml-64 for desktop sidebar spacing */}
        <main className="flex-1 overflow-x-hidden pt-20 md:pt-0 md:ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}