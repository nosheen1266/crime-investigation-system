import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { FileText, Clock, Search, CheckCircle, Bell, LogOut, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, closed: 0 });
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, appsRes, notifRes] = await Promise.all([
        axiosInstance.get('/api/citizen/dashboard/stats'),
        axiosInstance.get('/api/citizen/applications?limit=5'),
        axiosInstance.get('/api/citizen/notifications'),
      ]);
      setStats(statsRes.data.data);
      setApplications(appsRes.data.data);
      setNotifications(notifRes.data.data?.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const statusColor = (s) => ({
    pending: 'text-yellow-400 bg-yellow-400/10',
    assigned: 'text-blue-400 bg-blue-400/10',
    investigating: 'text-orange-400 bg-orange-400/10',
    pending_forensic: 'text-purple-400 bg-purple-400/10',
    closed: 'text-green-400 bg-green-400/10',
  }[s] || 'text-gray-400 bg-gray-400/10');

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-navy-800 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="text-neon-blue font-bold text-lg">CICMS</div>
          <div className="text-gray-400 text-xs mt-1">Citizen Portal</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/citizen/dashboard', icon: <FileText size={16} /> },
            { label: 'My Applications', path: '/citizen/applications', icon: <Search size={16} /> },
            { label: 'New Application', path: '/citizen/applications/new', icon: <Plus size={16} /> },
            { label: 'Profile', path: '/citizen/profile', icon: <User size={16} /> },
          ].map(({ label, path, icon }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${window.location.pathname === path ? 'bg-neon-blue/10 text-neon-blue' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-white text-sm font-medium">{user?.name}</div>
          <div className="text-gray-400 text-xs mb-3">Citizen</div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm transition">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-400 mb-8">Here's your case overview</p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Applications', value: stats.total, icon: <FileText />, color: 'text-neon-blue' },
              { label: 'Pending', value: stats.pending, icon: <Clock />, color: 'text-yellow-400' },
              { label: 'Active', value: stats.active, icon: <Search />, color: 'text-orange-400' },
              { label: 'Closed', value: stats.closed, icon: <CheckCircle />, color: 'text-green-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="glass-card p-5">
                <div className={`${color} mb-2`}>{icon}</div>
                <div className="text-2xl font-bold text-white">{loading ? '...' : value}</div>
                <div className="text-gray-400 text-sm">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white font-semibold">Recent Applications</h2>
                <button onClick={() => navigate('/citizen/applications/new')}
                  className="btn-neon text-xs px-3 py-1">+ New</button>
              </div>
              {loading ? <p className="text-gray-400">Loading...</p> : applications.length === 0 ?
                <p className="text-gray-400 text-sm">No applications yet.</p> :
                <div className="space-y-3">
                  {applications.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-navy-700 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">{app.title}</p>
                        <p className="text-gray-400 text-xs">#{app.id}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColor(app.status)}`}>{app.status}</span>
                        <button onClick={() => navigate(`/citizen/applications/${app.id}`)}
                          className="text-neon-blue text-xs hover:underline">View</button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>

            {/* Notifications */}
            <div className="glass-card p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Bell size={16} /> Notifications</h2>
              {loading ? <p className="text-gray-400">Loading...</p> : notifications?.length === 0 ?
                <p className="text-gray-400 text-sm">No notifications.</p> :
                <div className="space-y-3">
                  {notifications?.map(n => (
                    <div key={n.id} className={`p-3 rounded-lg ${n.is_read ? 'bg-navy-700' : 'bg-neon-blue/5 border border-neon-blue/20'}`}>
                      <p className="text-white text-sm font-medium">{n.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{n.message}</p>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}