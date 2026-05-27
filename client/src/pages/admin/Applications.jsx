import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Users, FileText, BarChart3, Activity, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApplications() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { fetchApps(); }, [search, status]);

  const fetchApps = async () => {
    try {
      const res = await axiosInstance.get(`/api/admin/applications?search=${search}&status=${status}`);
      setApps(res.data.data);
    } catch (err) { toast.error('Failed to load'); }
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
        <div className="p-6 border-b border-gray-800"><div className="text-red-400 font-bold text-lg">CICMS ADMIN</div><div className="text-gray-400 text-xs mt-1">Admin Portal</div></div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 size={16} /> },
            { label: 'Applications', path: '/admin/applications', icon: <FileText size={16} /> },
            { label: 'User Management', path: '/admin/users', icon: <Users size={16} /> },
            { label: 'Activity Logs', path: '/admin/activity-logs', icon: <Activity size={16} /> },
            { label: 'Profile', path: '/admin/profile', icon: <User size={16} /> },
          ].map(({ label, path, icon }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${window.location.pathname === path ? 'bg-red-400/10 text-red-400' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-white text-sm font-medium">{user?.name}</div>
          <div className="text-gray-400 text-xs mb-3">Administrator</div>
          <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm"><LogOut size={16} /> Logout</button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-6">All Applications</h1>
        <div className="flex gap-4 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, CNIC, ID..."
            className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none flex-1" />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
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
                <th className="text-left p-4">Citizen</th>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Officer</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center p-8 text-gray-400">Loading...</td></tr>
                : apps.length === 0 ? <tr><td colSpan={7} className="text-center p-8 text-gray-400">No applications found.</td></tr>
                : apps.map(a => (
                  <tr key={a.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                    <td className="p-4 text-gray-400 text-sm">#{a.id}</td>
                    <td className="p-4 text-white text-sm">{a.citizen_name}</td>
                    <td className="p-4 text-white text-sm">{a.title}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(a.status)}`}>{a.status}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{a.officer_name || 'Unassigned'}</td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(a.created_at).toLocaleDateString()}</td>
                    <td className="p-4"><button onClick={() => navigate(`/admin/applications/${a.id}`)} className="text-neon-blue text-sm hover:underline">Manage</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}