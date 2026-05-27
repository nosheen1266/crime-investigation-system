import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Users, FileText, BarChart3, Activity, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const ASidebar = ({ user, logout, navigate }) => (
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
);

const COLORS = ['#00b4ff','#ffaa00','#ff6600','#9b5fff','#00ff88'];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [charts, setCharts] = useState({ monthly: [], status_distribution: [] });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, chartsRes, logsRes] = await Promise.all([
        axiosInstance.get('/api/admin/dashboard/stats'),
        axiosInstance.get('/api/admin/dashboard/charts'),
        axiosInstance.get('/api/admin/activity-logs?limit=10'),
      ]);
      setStats(statsRes.data.data);
      setCharts(chartsRes.data);
      setLogs(logsRes.data.data);
    } catch (err) { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <ASidebar user={user} logout={logout} navigate={navigate} />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">System overview and analytics</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: stats.total, color: 'text-neon-blue' },
            { label: 'Pending (Unassigned)', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Active Cases', value: stats.active, color: 'text-orange-400' },
            { label: 'Closed Cases', value: stats.closed, color: 'text-green-400' },
            { label: 'Total Officers', value: stats.total_officers, color: 'text-purple-400' },
            { label: 'Unassigned Evidence', value: stats.unassigned_evidence, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-5">
              <div className={`text-2xl font-bold ${color}`}>{loading ? '...' : (value ?? 0)}</div>
              <div className="text-gray-400 text-sm">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Applications per Month</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.monthly}>
                <XAxis dataKey="month" stroke="#8892b0" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8892b0" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f1328', border: '1px solid #00b4ff22', color: '#e0e8ff' }} />
                <Bar dataKey="count" fill="#00b4ff" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Case Status Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.status_distribution} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status }) => status}>
                  {charts.status_distribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f1328', border: '1px solid #00b4ff22', color: '#e0e8ff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Details</th>
                <th className="text-left p-3">Time</th>
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={4} className="text-center p-6 text-gray-400">Loading...</td></tr>
                  : logs.map(l => (
                    <tr key={l.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                      <td className="p-3 text-gray-400">{l.email || 'System'}</td>
                      <td className="p-3 text-white">{l.action}</td>
                      <td className="p-3 text-gray-400">{l.details}</td>
                      <td className="p-3 text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}