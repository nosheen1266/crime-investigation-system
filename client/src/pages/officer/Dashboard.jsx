import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Briefcase, User, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = ({ user, logout, navigate }) => (
  <div className="w-64 bg-navy-800 border-r border-gray-800 flex flex-col">
    <div className="p-6 border-b border-gray-800">
      <div className="text-neon-blue font-bold text-lg">CICMS</div>
      <div className="text-gray-400 text-xs mt-1">Officer Portal</div>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      {[
        { label: 'Dashboard', path: '/officer/dashboard', icon: <BarChart3 size={16} /> },
        { label: 'My Cases', path: '/officer/cases', icon: <Briefcase size={16} /> },
        { label: 'Profile', path: '/officer/profile', icon: <User size={16} /> },
      ].map(({ label, path, icon }) => (
        <button key={path} onClick={() => navigate(path)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${window.location.pathname === path ? 'bg-neon-blue/10 text-neon-blue' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
          {icon}{label}
        </button>
      ))}
    </nav>
    <div className="p-4 border-t border-gray-800">
      <div className="text-white text-sm font-medium">{user?.name}</div>
      <div className="text-gray-400 text-xs mb-3">Officer</div>
      <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm">
        <LogOut size={16} /> Logout
      </button>
    </div>
  </div>
);

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, pending_forensic: 0, closed: 0 });
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, casesRes] = await Promise.all([
        axiosInstance.get('/api/officer/dashboard/stats'),
        axiosInstance.get('/api/officer/cases?limit=5'),
      ]);
      setStats(statsRes.data.data);
      setCases(casesRes.data.data);
    } catch (err) { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const statusColor = (s) => ({
    pending: 'text-yellow-400', assigned: 'text-blue-400',
    investigating: 'text-orange-400', pending_forensic: 'text-purple-400', closed: 'text-green-400',
  }[s] || 'text-gray-400');

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <Sidebar user={user} logout={logout} navigate={navigate} />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Officer Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome, {user?.name}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Cases', value: stats.total, color: 'text-neon-blue' },
            { label: 'Active', value: stats.active, color: 'text-orange-400' },
            { label: 'Pending Forensic', value: stats.pending_forensic, color: 'text-purple-400' },
            { label: 'Closed', value: stats.closed, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-5">
              <div className={`text-2xl font-bold ${color}`}>{loading ? '...' : value}</div>
              <div className="text-gray-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Recent Cases</h2>
            <button onClick={() => navigate('/officer/cases')} className="text-neon-blue text-sm hover:underline">View All</button>
          </div>
          {loading ? <p className="text-gray-400">Loading...</p> : cases.length === 0 ? <p className="text-gray-400 text-sm">No cases assigned.</p> :
            <div className="space-y-3">
              {cases.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-navy-700 rounded-lg">
                  <div>
                    <p className="text-white text-sm font-medium">{c.title}</p>
                    <p className="text-gray-400 text-xs">{c.citizen_name} • #{c.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${statusColor(c.status)}`}>{c.status}</span>
                    <button onClick={() => navigate(`/officer/cases/${c.id}`)} className="text-neon-blue text-xs hover:underline">View</button>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}