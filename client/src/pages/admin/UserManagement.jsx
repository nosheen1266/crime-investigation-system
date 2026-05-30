import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Users, FileText, BarChart3, Activity, User, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Reusable Field Icon ────────────────────────────────────────
const FieldIcon = ({ value, error }) => {
  if (!value) return null;
  return error
    ? <XCircle size={14} className="text-red-400 inline ml-1" />
    : <CheckCircle size={14} className="text-green-400 inline ml-1" />;
};

// ── Input class helper ─────────────────────────────────────────
const inputClass = (value, error) =>
  `w-full bg-navy-800 border rounded px-3 py-2 text-white text-sm focus:outline-none transition ${
    error ? 'border-red-500 focus:border-red-500' :
    value && !error ? 'border-green-500 focus:border-green-500' :
    'border-gray-700 focus:border-neon-blue'
  }`;

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
  const [creating, setCreating] = useState(false);
  const [showOfficerPass, setShowOfficerPass] = useState(false);
  const [showForensicPass, setShowForensicPass] = useState(false);

  const [officerForm, setOfficerForm] = useState({
    full_name: '', badge_number: '', rank: '', department: '', email: '', password: ''
  });
  const [officerErrors, setOfficerErrors] = useState({});

  const [forensicForm, setForensicForm] = useState({
    full_name: '', lab_id: '', specialization: '', email: '', password: ''
  });
  const [forensicErrors, setForensicErrors] = useState({});

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

  // ── Officer Validation ─────────────────────────────────────────
  const validateOfficerField = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'badge_number':
        if (!value.trim()) return 'Badge number is required';
        if (!/^OFF-\d{3,}$/.test(value)) return 'Format must be: OFF-001';
        return '';
      case 'rank':
        if (!value.trim()) return 'Rank is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Rank can only contain letters';
        if (value.trim().length < 3) return 'Rank must be at least 3 characters';
        return '';
      case 'department':
        if (!value.trim()) return 'Department is required';
        if (value.trim().length < 3) return 'Department must be at least 3 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Must contain at least one number';
        if (!/[!@#$%^&*]/.test(value)) return 'Must contain at least one special character (!@#$%^&*)';
        return '';
      default: return '';
    }
  };

  const handleOfficerChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'badge_number') {
      const upper = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
      formatted = upper;
    }
    setOfficerForm(prev => ({ ...prev, [name]: formatted }));
    setOfficerErrors(prev => ({ ...prev, [name]: validateOfficerField(name, formatted) }));
  };

  // ── Forensic Validation ────────────────────────────────────────
  const validateForensicField = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'lab_id':
        if (!value.trim()) return 'Lab ID is required';
        if (!/^LAB-\d{3,}$/.test(value)) return 'Format must be: LAB-001';
        return '';
      case 'specialization':
        if (!value.trim()) return 'Specialization is required';
        if (value.trim().length < 3) return 'Specialization must be at least 3 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Must contain at least one number';
        if (!/[!@#$%^&*]/.test(value)) return 'Must contain at least one special character (!@#$%^&*)';
        return '';
      default: return '';
    }
  };

  const handleForensicChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'lab_id') {
      formatted = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    }
    setForensicForm(prev => ({ ...prev, [name]: formatted }));
    setForensicErrors(prev => ({ ...prev, [name]: validateForensicField(name, formatted) }));
  };

  // ── Password Strength ──────────────────────────────────────────
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;
    if (password.length >= 12) score++;
    if (score <= 2) return { strength: score, label: 'Weak', color: '#ef4444' };
    if (score === 3) return { strength: score, label: 'Fair', color: '#f59e0b' };
    if (score === 4) return { strength: score, label: 'Strong', color: '#3b82f6' };
    return { strength: score, label: 'Very Strong', color: '#22c55e' };
  };

  // ── Create Officer ─────────────────────────────────────────────
  const createOfficer = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(officerForm).forEach(key => {
      newErrors[key] = validateOfficerField(key, officerForm[key]);
    });
    setOfficerErrors(newErrors);
    if (Object.values(newErrors).some(e => e !== '')) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    setCreating(true);
    try {
      const response = await axiosInstance.post('/api/admin/users/officers', officerForm);
      if (response.data.success) {
        toast.success('Officer account created!');
        setShowCreateOfficer(false);
        setOfficerForm({ full_name: '', badge_number: '', rank: '', department: '', email: '', password: '' });
        setOfficerErrors({});
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create officer');
    } finally { setCreating(false); }
  };

  // ── Create Forensic ────────────────────────────────────────────
  const createForensic = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(forensicForm).forEach(key => {
      newErrors[key] = validateForensicField(key, forensicForm[key]);
    });
    setForensicErrors(newErrors);
    if (Object.values(newErrors).some(e => e !== '')) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    setCreating(true);
    try {
      const response = await axiosInstance.post('/api/admin/users/forensic', forensicForm);
      if (response.data.success) {
        toast.success('Forensic officer account created!');
        setShowCreateForensic(false);
        setForensicForm({ full_name: '', lab_id: '', specialization: '', email: '', password: '' });
        setForensicErrors({});
        fetchAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create forensic officer');
    } finally { setCreating(false); }
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <BarChart3 size={16} /> },
    { label: 'Applications', path: '/admin/applications', icon: <FileText size={16} /> },
    { label: 'User Management', path: '/admin/users', icon: <Users size={16} /> },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: <Activity size={16} /> },
    { label: 'Profile', path: '/admin/profile', icon: <User size={16} /> },
  ];

  const officerStrength = getPasswordStrength(officerForm.password);
  const forensicStrength = getPasswordStrength(forensicForm.password);

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
            <button onClick={() => { setShowCreateOfficer(!showCreateOfficer); setOfficerErrors({}); }}
              className="btn-neon text-sm px-4 py-2">
              {showCreateOfficer ? 'Cancel' : '+ Create Officer'}
            </button>

            {showCreateOfficer && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Create Officer Account</h2>
                <form onSubmit={createOfficer} className="grid grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Full Name * <FieldIcon value={officerForm.full_name} error={officerErrors.full_name} />
                    </label>
                    <input type="text" name="full_name" value={officerForm.full_name}
                      onChange={handleOfficerChange} placeholder="Enter full name"
                      className={inputClass(officerForm.full_name, officerErrors.full_name)} />
                    {officerErrors.full_name && <p className="text-red-400 text-xs mt-1">⚠ {officerErrors.full_name}</p>}
                  </div>

                  {/* Badge Number */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Badge Number * <FieldIcon value={officerForm.badge_number} error={officerErrors.badge_number} />
                    </label>
                    <input type="text" name="badge_number" value={officerForm.badge_number}
                      onChange={handleOfficerChange} placeholder="OFF-001"
                      className={inputClass(officerForm.badge_number, officerErrors.badge_number)} />
                    {officerErrors.badge_number && <p className="text-red-400 text-xs mt-1">⚠ {officerErrors.badge_number}</p>}
                  </div>

                  {/* Rank */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Rank * <FieldIcon value={officerForm.rank} error={officerErrors.rank} />
                    </label>
                    <input type="text" name="rank" value={officerForm.rank}
                      onChange={handleOfficerChange} placeholder="e.g. Inspector"
                      className={inputClass(officerForm.rank, officerErrors.rank)} />
                    {officerErrors.rank && <p className="text-red-400 text-xs mt-1">⚠ {officerErrors.rank}</p>}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Department * <FieldIcon value={officerForm.department} error={officerErrors.department} />
                    </label>
                    <input type="text" name="department" value={officerForm.department}
                      onChange={handleOfficerChange} placeholder="e.g. Homicide Division"
                      className={inputClass(officerForm.department, officerErrors.department)} />
                    {officerErrors.department && <p className="text-red-400 text-xs mt-1">⚠ {officerErrors.department}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Email * <FieldIcon value={officerForm.email} error={officerErrors.email} />
                    </label>
                    <input type="email" name="email" value={officerForm.email}
                      onChange={handleOfficerChange} placeholder="officer@crimesystem.gov"
                      className={inputClass(officerForm.email, officerErrors.email)} />
                    {officerErrors.email && <p className="text-red-400 text-xs mt-1">⚠ {officerErrors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Password * <FieldIcon value={officerForm.password} error={officerErrors.password} />
                    </label>
                    <div className="relative">
                      <input type={showOfficerPass ? 'text' : 'password'} name="password" value={officerForm.password}
                        onChange={handleOfficerChange} placeholder="Min 8 chars, uppercase, number, special"
                        className={inputClass(officerForm.password, officerErrors.password) + ' pr-10'} />
                      <button type="button" onClick={() => setShowOfficerPass(!showOfficerPass)}
                        className="absolute right-2 top-2 text-gray-400">
                        {showOfficerPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {officerForm.password && (
                      <div className="mt-1">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all"
                              style={{ backgroundColor: i <= officerStrength.strength ? officerStrength.color : '#374151' }} />
                          ))}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: officerStrength.color }}>{officerStrength.label}</p>
                      </div>
                    )}
                    {officerErrors.password && <p className="text-red-400 text-xs mt-1">⚠ {officerErrors.password}</p>}
                  </div>

                  {/* Password Requirements */}
                  <div className="col-span-2 bg-navy-800 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                    <p className="font-semibold text-gray-300 mb-1">Password must contain:</p>
                    {[
                      { rule: officerForm.password.length >= 8, text: 'At least 8 characters' },
                      { rule: /[A-Z]/.test(officerForm.password), text: 'One uppercase letter (A-Z)' },
                      { rule: /[0-9]/.test(officerForm.password), text: 'One number (0-9)' },
                      { rule: /[!@#$%^&*]/.test(officerForm.password), text: 'One special character (!@#$%^&*)' },
                    ].map(({ rule, text }) => (
                      <p key={text} className={rule ? 'text-green-400' : 'text-gray-500'}>
                        {rule ? '✓' : '○'} {text}
                      </p>
                    ))}
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
            <button onClick={() => { setShowCreateForensic(!showCreateForensic); setForensicErrors({}); }}
              className="btn-neon text-sm px-4 py-2">
              {showCreateForensic ? 'Cancel' : '+ Create Forensic Officer'}
            </button>

            {showCreateForensic && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Create Forensic Officer Account</h2>
                <form onSubmit={createForensic} className="grid grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Full Name * <FieldIcon value={forensicForm.full_name} error={forensicErrors.full_name} />
                    </label>
                    <input type="text" name="full_name" value={forensicForm.full_name}
                      onChange={handleForensicChange} placeholder="Enter full name"
                      className={inputClass(forensicForm.full_name, forensicErrors.full_name)} />
                    {forensicErrors.full_name && <p className="text-red-400 text-xs mt-1">⚠ {forensicErrors.full_name}</p>}
                  </div>

                  {/* Lab ID */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Lab ID * <FieldIcon value={forensicForm.lab_id} error={forensicErrors.lab_id} />
                    </label>
                    <input type="text" name="lab_id" value={forensicForm.lab_id}
                      onChange={handleForensicChange} placeholder="LAB-001"
                      className={inputClass(forensicForm.lab_id, forensicErrors.lab_id)} />
                    {forensicErrors.lab_id && <p className="text-red-400 text-xs mt-1">⚠ {forensicErrors.lab_id}</p>}
                  </div>

                  {/* Specialization */}
                  <div className="col-span-2">
                    <label className="text-gray-400 text-xs mb-1 block">
                      Specialization * <FieldIcon value={forensicForm.specialization} error={forensicErrors.specialization} />
                    </label>
                    <input type="text" name="specialization" value={forensicForm.specialization}
                      onChange={handleForensicChange} placeholder="e.g. Ballistics Analysis"
                      className={inputClass(forensicForm.specialization, forensicErrors.specialization)} />
                    {forensicErrors.specialization && <p className="text-red-400 text-xs mt-1">⚠ {forensicErrors.specialization}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Email * <FieldIcon value={forensicForm.email} error={forensicErrors.email} />
                    </label>
                    <input type="email" name="email" value={forensicForm.email}
                      onChange={handleForensicChange} placeholder="forensic@crimesystem.gov"
                      className={inputClass(forensicForm.email, forensicErrors.email)} />
                    {forensicErrors.email && <p className="text-red-400 text-xs mt-1">⚠ {forensicErrors.email}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Password * <FieldIcon value={forensicForm.password} error={forensicErrors.password} />
                    </label>
                    <div className="relative">
                      <input type={showForensicPass ? 'text' : 'password'} name="password" value={forensicForm.password}
                        onChange={handleForensicChange} placeholder="Min 8 chars, uppercase, number, special"
                        className={inputClass(forensicForm.password, forensicErrors.password) + ' pr-10'} />
                      <button type="button" onClick={() => setShowForensicPass(!showForensicPass)}
                        className="absolute right-2 top-2 text-gray-400">
                        {showForensicPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {forensicForm.password && (
                      <div className="mt-1">
                        <div className="flex gap-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className="h-1 flex-1 rounded-full transition-all"
                              style={{ backgroundColor: i <= forensicStrength.strength ? forensicStrength.color : '#374151' }} />
                          ))}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: forensicStrength.color }}>{forensicStrength.label}</p>
                      </div>
                    )}
                    {forensicErrors.password && <p className="text-red-400 text-xs mt-1">⚠ {forensicErrors.password}</p>}
                  </div>

                  {/* Password Requirements */}
                  <div className="col-span-2 bg-navy-800 rounded-lg p-3 text-xs text-gray-400 space-y-1">
                    <p className="font-semibold text-gray-300 mb-1">Password must contain:</p>
                    {[
                      { rule: forensicForm.password.length >= 8, text: 'At least 8 characters' },
                      { rule: /[A-Z]/.test(forensicForm.password), text: 'One uppercase letter (A-Z)' },
                      { rule: /[0-9]/.test(forensicForm.password), text: 'One number (0-9)' },
                      { rule: /[!@#$%^&*]/.test(forensicForm.password), text: 'One special character (!@#$%^&*)' },
                    ].map(({ rule, text }) => (
                      <p key={text} className={rule ? 'text-green-400' : 'text-gray-500'}>
                        {rule ? '✓' : '○'} {text}
                      </p>
                    ))}
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