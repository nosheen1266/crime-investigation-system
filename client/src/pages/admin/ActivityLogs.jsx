import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Users, FileText, BarChart3, Activity, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ActivityLogs() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLogs(); }, [search]);

  const fetchLogs = async () => {
    try {
      const res = await axiosInstance.get(`/api/admin/activity-logs?search=${search}`);
      setLogs(res.data.data);
    } catch (err) { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  };

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
        <h1 className="text-2xl font-bold text-white mb-6">Activity Logs</h1>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by action or email..."
          className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none w-full max-w-md mb-6" />
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 text-sm">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Action</th>
                <th className="text-left p-4">Details</th>
                <th className="text-left p-4">IP</th>
                <th className="text-left p-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr>
                : logs.length === 0 ? <tr><td colSpan={6} className="text-center p-8 text-gray-400">No logs found.</td></tr>
                : logs.map(l => (
                  <tr key={l.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                    <td className="p-4 text-gray-400 text-sm">{l.email || 'System'}</td>
                    <td className="p-4 text-sm">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        l.role === 'admin' ? 'text-red-400 bg-red-400/10' :
                        l.role === 'officer' ? 'text-blue-400 bg-blue-400/10' :
                        l.role === 'forensic' ? 'text-purple-400 bg-purple-400/10' :
                        'text-green-400 bg-green-400/10'}`}>
                        {l.role || 'system'}
                      </span>
                    </td>
                    <td className="p-4 text-white text-sm">{l.action}</td>
                    <td className="p-4 text-gray-400 text-sm max-w-xs truncate">{l.details}</td>
                    <td className="p-4 text-gray-400 text-sm">{l.ip_address || '-'}</td>
                    <td className="p-4 text-gray-400 text-sm">{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}