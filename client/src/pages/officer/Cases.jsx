import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Briefcase, User, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OfficerCases() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { fetchCases(); }, [search, status]);

  const fetchCases = async () => {
    try {
      const res = await axiosInstance.get(`/api/officer/cases?search=${search}&status=${status}`);
      setCases(res.data.data);
    } catch (err) { toast.error('Failed to load cases'); }
    finally { setLoading(false); }
  };

  const statusColor = (s) => ({
    pending: 'text-yellow-400 bg-yellow-400/10', assigned: 'text-blue-400 bg-blue-400/10',
    investigating: 'text-orange-400 bg-orange-400/10', pending_forensic: 'text-purple-400 bg-purple-400/10',
    closed: 'text-green-400 bg-green-400/10',
  }[s] || 'text-gray-400 bg-gray-400/10');

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <div className="w-64 bg-navy-800 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800"><div className="text-neon-blue font-bold text-lg">CICMS</div><div className="text-gray-400 text-xs mt-1">Officer Portal</div></div>
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
          <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm"><LogOut size={16} /> Logout</button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Cases</h1>
        <div className="flex gap-4 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cases..."
            className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none flex-1" />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none">
            <option value="">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="investigating">Investigating</option>
            <option value="pending_forensic">Pending Forensic</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 text-sm">
                <th className="text-left p-4">#ID</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Citizen</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Assigned</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr>
                : cases.length === 0 ? <tr><td colSpan={6} className="text-center p-8 text-gray-400">No cases found.</td></tr>
                : cases.map(c => (
                  <tr key={c.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                    <td className="p-4 text-gray-400 text-sm">#{c.id}</td>
                    <td className="p-4 text-white text-sm">{c.title}</td>
                    <td className="p-4 text-gray-400 text-sm">{c.citizen_name}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(c.status)}`}>{c.status}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(c.assigned_at).toLocaleDateString()}</td>
                    <td className="p-4"><button onClick={() => navigate(`/officer/cases/${c.id}`)} className="text-neon-blue text-sm hover:underline">View</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}