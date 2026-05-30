import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Users, FileText, BarChart3, Activity, User } from 'lucide-react';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr + 'Z').toLocaleDateString('en-PK', { timeZone: 'Asia/Karachi' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr + 'Z').toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
};

export default function AdminProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosInstance.get('/api/admin/profile').then(r => setProfile(r.data.data)).catch(() => toast.error('Failed to load'));
  }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm) return toast.error('Passwords do not match');
    if (passForm.new_password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await axiosInstance.put('/api/admin/change-password', {
        current_password: passForm.current_password,
        new_password: passForm.new_password
      });
      toast.success('Password changed!');
      setPassForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <div className="w-64 bg-navy-800 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="text-red-400 font-bold text-lg">CICMS ADMIN</div>
          <div className="text-gray-400 text-xs mt-1">Admin Portal</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 size={16} /> },
            { label: 'Applications', path: '/admin/applications', icon: <FileText size={16} /> },
            { label: 'User Management', path: '/admin/users', icon: <Users size={16} /> },
            { label: 'Activity Logs', path: '/admin/activity-logs', icon: <Activity size={16} /> },
            { label: 'Profile', path: '/admin/profile', icon: <User size={16} /> },
          ].map(({ label, path, icon }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                window.location.pathname === path ? 'bg-red-400/10 text-red-400' : 'text-gray-400 hover:text-white hover:bg-navy-700'
              }`}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-white text-sm font-medium">{user?.name}</div>
          <div className="text-gray-400 text-xs mb-3">Administrator</div>
          <button onClick={async () => { await logout(); navigate('/'); }}
            className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Admin Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Account Info</h2>
            {profile && (
              <div className="space-y-3 text-sm">
                {[
                  ['Email', profile.email],
                  ['Role', profile.role],
                  ['Member Since', formatDate(profile.created_at)],
                  ['Last Login', formatDateTime(profile.last_login)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-red-400/5 border border-red-400/20 rounded-lg">
                  <p className="text-red-400 text-xs font-medium">⚠ Administrator Account</p>
                  <p className="text-gray-400 text-xs mt-1">This account has full system access. Keep credentials secure.</p>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              {[
                ['Current Password', 'current_password'],
                ['New Password', 'new_password'],
                ['Confirm New Password', 'confirm']
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="text-gray-400 text-sm mb-1 block">{label}</label>
                  <input type="password" value={passForm[key]}
                    onChange={e => setPassForm({...passForm, [key]: e.target.value})}
                    className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-red-400 focus:outline-none" />
                </div>
              ))}
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}