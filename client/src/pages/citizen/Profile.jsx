import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, FileText, Search, Plus, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CitizenProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/api/citizen/profile');
      setProfile(res.data.data);
      setForm({ full_name: res.data.data.full_name, phone: res.data.data.phone, address: res.data.data.address });
    } catch (err) { toast.error('Failed to load profile'); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.put('/api/citizen/profile', form);
      toast.success('Profile updated!');
    } catch (err) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passForm.new_password !== passForm.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await axiosInstance.put('/api/citizen/change-password', { current_password: passForm.current_password, new_password: passForm.new_password });
      toast.success('Password changed!');
      setPassForm({ current_password: '', new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
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
          <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Account Info</h2>
            <div className="text-sm space-y-2 mb-6">
              <p><span className="text-gray-400">Email:</span> <span className="text-white ml-2">{profile?.email}</span></p>
              <p><span className="text-gray-400">CNIC:</span> <span className="text-white ml-2">{profile?.cnic}</span></p>
              <p><span className="text-gray-400">Member Since:</span> <span className="text-white ml-2">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''}</span></p>
            </div>
            <form onSubmit={updateProfile} className="space-y-4">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'Phone', key: 'phone', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="text-gray-400 text-sm mb-1 block">{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                    className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none" rows={3} />
              </div>
              <button type="submit" disabled={loading} className="btn-neon w-full py-2">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-white font-semibold mb-4">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              {[
                { label: 'Current Password', key: 'current_password' },
                { label: 'New Password', key: 'new_password' },
                { label: 'Confirm New Password', key: 'confirm' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-gray-400 text-sm mb-1 block">{label}</label>
                  <input type="password" value={passForm[key]} onChange={e => setPassForm({...passForm, [key]: e.target.value})}
                    className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none" />
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-neon w-full py-2">
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}