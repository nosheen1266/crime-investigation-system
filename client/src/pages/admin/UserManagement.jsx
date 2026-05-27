import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Users, FileText, BarChart3, Activity, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('citizens');
  const [citizens, setCitizens] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [forensics, setForensics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateOfficer, setShowCreateOfficer] = useState(false);
  const [showCreateForensic, setShowCreateForensic] = useState(false);
  const [officerForm, setOfficerForm] = useState({
    full_name: '', badge_number: '', rank: '', department: '', email: '', password: ''
  });
  const [forensicForm, setForensicForm] = useState({
    full_name: '', lab_id: '', specialization: '', email: '', password: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, oRes, fRes] = await Promise.all([
        axiosInstance.get('/api/admin/users/citizens'),
        axiosInstance.get('/api/admin/users/officers'),
        axiosInstance.get('/api/admin/users/forensic'),
      ]);
      setCitizens(cRes.data.data || []);
      setOfficers(oRes.data.data || []);
      setForensics(fRes.data.data || []);
    } catch (err) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (userId) => {
    try {
      await axiosInstance.put(`/api/admin/users/${userId}/toggle-status`);
      toast.success('Status updated!');
      fetchAll();
    } catch (err) { toast.error('Failed'); }
  };

  const createOfficer = async (e) => {
    e.preventDefault();
    if (!officerForm.full_name || !officerForm.badge_number || !officerForm.rank || 
        !officerForm.department || !officerForm.email || !officerForm.password) {
      toast.error('All fields are required');
      return;
    }
    setCreating(true);
    try {
      const response = await axiosInstance.post('/api/admin/users/officers', {
        full_name: officerForm.full_name,
        badge_number: officerForm.badge_number,
        rank: officerForm.rank,
        department: officerForm.department,
        email: officerForm.email,
        password: officerForm.password
      });
      if (response.data.success) {
        toast.success('Officer account created!');
        setShowCreateOfficer(false);
        setOfficerForm({ full_name: '', badge_number: '', rank: '', department: '', email: '', password: '' });
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create officer');
    }
    finally { setCreating(false); }
  };

  const createForensic = async (e) => {
    e.preventDefault();
    if (!forensicForm.full_name || !forensicForm.lab_id || !forensicForm.specialization || 
        !forensicForm.email || !forensicForm.password) {
      toast.error('All fields are required');
      return;
    }
    setCreating(true);
    try {
      const response = await axiosInstance.post('/api/admin/users/forensic', {
        full_name: forensicForm.full_name,
        lab_id: forensicForm.lab_id,
        specialization: forensicForm.specialization,
        email: forensicForm.email,
        password: forensicForm.password
      });
      if (response.data.success) {
        toast.success('Forensic officer account created!');
        setShowCreateForensic(false);
        setForensicForm({ full_name: '', lab_id: '', specialization: '', email: '', password: '' });
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create forensic officer');
    }
    finally { setCreating(false); }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 size={16} /> },
    { label: 'Applications', path: '/admin/applications', icon: <FileText size={16} /> },
    { label: 'User Management', path: '/admin/users', icon: <Users size={16} /> },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: <Activity size={16} /> },
    { label: 'Profile', path: '/admin/profile', icon: <User size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-navy-800 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="text-red-400 font-bold text-lg">CICMS ADMIN</div>
          <div className="text-gray-400 text-xs mt-1">Admin Portal</div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ label, path, icon }) => (
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-6">User Management</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['citizens', 'officers', 'forensics'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                tab === t ? 'bg-neon-blue text-navy-900 font-bold' : 'bg-navy-800 text-gray-400 hover:text-white'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Citizens Tab */}
        {tab === 'citizens' && (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">CNIC</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center p-8 text-gray-400">Loading...</td></tr>
                ) : citizens.length === 0 ? (
                  <tr><td colSpan={5} className="text-center p-8 text-gray-400">No citizens found.</td></tr>
                ) : citizens.map(u => (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                    <td className="p-4 text-white text-sm">{u.full_name}</td>
                    <td className="p-4 text-gray-400 text-sm">{u.email}</td>
                    <td className="p-4 text-gray-400 text-sm">{u.cnic}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button onClick={() => toggleStatus(u.id)}
                        className={`text-xs px-3 py-1 rounded border ${u.is_active ? 'border-red-400 text-red-400 hover:bg-red-400/10' : 'border-green-400 text-green-400 hover:bg-green-400/10'}`}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Officers Tab */}
        {tab === 'officers' && (
          <div className="space-y-4">
            <button onClick={() => setShowCreateOfficer(!showCreateOfficer)}
              className="btn-neon text-sm px-4 py-2">
              {showCreateOfficer ? 'Cancel' : '+ Create Officer'}
            </button>

            {showCreateOfficer && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Create Officer Account</h2>
                <form onSubmit={createOfficer} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Full Name *</label>
                    <input type="text" value={officerForm.full_name}
                      onChange={e => setOfficerForm({...officerForm, full_name: e.target.value})}
                      placeholder="Enter full name"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Badge Number *</label>
                    <input type="text" value={officerForm.badge_number}
                      onChange={e => setOfficerForm({...officerForm, badge_number: e.target.value})}
                      placeholder="e.g. OFF-003"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Rank *</label>
                    <input type="text" value={officerForm.rank}
                      onChange={e => setOfficerForm({...officerForm, rank: e.target.value})}
                      placeholder="e.g. Inspector"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Department *</label>
                    <input type="text" value={officerForm.department}
                      onChange={e => setOfficerForm({...officerForm, department: e.target.value})}
                      placeholder="e.g. Homicide Division"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Email *</label>
                    <input type="email" value={officerForm.email}
                      onChange={e => setOfficerForm({...officerForm, email: e.target.value})}
                      placeholder="officer@crimesystem.gov"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Password *</label>
                    <input type="password" value={officerForm.password}
                      onChange={e => setOfficerForm({...officerForm, password: e.target.value})}
                      placeholder="Min 6 characters"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <button type="submit" disabled={creating}
                    className="col-span-2 bg-neon-blue text-navy-900 font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition">
                    {creating ? 'Creating...' : 'Create Officer Account'}
                  </button>
                </form>
              </div>
            )}

            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Badge</th>
                    <th className="text-left p-4">Rank</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr>
                  ) : officers.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-gray-400">No officers found.</td></tr>
                  ) : officers.map(u => (
                    <tr key={u.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                      <td className="p-4 text-white text-sm">{u.full_name}</td>
                      <td className="p-4 text-gray-400 text-sm">{u.email}</td>
                      <td className="p-4 text-gray-400 text-sm">{u.badge_number}</td>
                      <td className="p-4 text-gray-400 text-sm">{u.rank}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus(u.id)}
                          className={`text-xs px-3 py-1 rounded border ${u.is_active ? 'border-red-400 text-red-400 hover:bg-red-400/10' : 'border-green-400 text-green-400 hover:bg-green-400/10'}`}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Forensics Tab */}
        {tab === 'forensics' && (
          <div className="space-y-4">
            <button onClick={() => setShowCreateForensic(!showCreateForensic)}
              className="btn-neon text-sm px-4 py-2">
              {showCreateForensic ? 'Cancel' : '+ Create Forensic Officer'}
            </button>

            {showCreateForensic && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Create Forensic Officer Account</h2>
                <form onSubmit={createForensic} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Full Name *</label>
                    <input type="text" value={forensicForm.full_name}
                      onChange={e => setForensicForm({...forensicForm, full_name: e.target.value})}
                      placeholder="Enter full name"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Lab ID *</label>
                    <input type="text" value={forensicForm.lab_id}
                      onChange={e => setForensicForm({...forensicForm, lab_id: e.target.value})}
                      placeholder="e.g. LAB-003"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-gray-400 text-xs mb-1 block">Specialization *</label>
                    <input type="text" value={forensicForm.specialization}
                      onChange={e => setForensicForm({...forensicForm, specialization: e.target.value})}
                      placeholder="e.g. Ballistics Analysis"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Email *</label>
                    <input type="email" value={forensicForm.email}
                      onChange={e => setForensicForm({...forensicForm, email: e.target.value})}
                      placeholder="forensic@crimesystem.gov"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Password *</label>
                    <input type="password" value={forensicForm.password}
                      onChange={e => setForensicForm({...forensicForm, password: e.target.value})}
                      placeholder="Min 6 characters"
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                  <button type="submit" disabled={creating}
                    className="col-span-2 bg-neon-blue text-navy-900 font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition">
                    {creating ? 'Creating...' : 'Create Forensic Officer Account'}
                  </button>
                </form>
              </div>
            )}

            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-gray-400 text-sm">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Lab ID</th>
                    <th className="text-left p-4">Specialization</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr>
                  ) : forensics.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-gray-400">No forensic officers found.</td></tr>
                  ) : forensics.map(u => (
                    <tr key={u.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                      <td className="p-4 text-white text-sm">{u.full_name}</td>
                      <td className="p-4 text-gray-400 text-sm">{u.email}</td>
                      <td className="p-4 text-gray-400 text-sm">{u.lab_id}</td>
                      <td className="p-4 text-gray-400 text-sm">{u.specialization}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus(u.id)}
                          className={`text-xs px-3 py-1 rounded border ${u.is_active ? 'border-red-400 text-red-400 hover:bg-red-400/10' : 'border-green-400 text-green-400 hover:bg-green-400/10'}`}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}