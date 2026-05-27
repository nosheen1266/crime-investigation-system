import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Users, FileText, BarChart3, Activity, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminApplicationDetail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [forensics, setForensics] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [selectedForensic, setSelectedForensic] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [appRes, offRes, forRes] = await Promise.all([
        axiosInstance.get(`/api/admin/applications/${id}`),
        axiosInstance.get('/api/admin/officers/available'),
        axiosInstance.get('/api/admin/forensic/available'),
      ]);
      setData(appRes.data);
      setOfficers(offRes.data.data);
      setForensics(forRes.data.data);
    } catch (err) { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const assignOfficer = async () => {
    if (!selectedOfficer) return toast.error('Select an officer');
    try {
      await axiosInstance.post(`/api/admin/applications/${id}/assign-officer`, { officer_id: selectedOfficer });
      toast.success('Officer assigned!');
      fetchAll();
    } catch (err) { toast.error('Failed to assign'); }
  };

  const assignForensic = async () => {
    if (!selectedEvidence || !selectedForensic) return toast.error('Select evidence and forensic officer');
    try {
      await axiosInstance.post(`/api/admin/evidence/${selectedEvidence}/assign-forensic`, { forensic_officer_id: selectedForensic });
      toast.success('Forensic officer assigned!');
      fetchAll();
    } catch (err) { toast.error('Failed to assign'); }
  };

  const AdminSidebar = () => (
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

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <button onClick={() => navigate('/admin/applications')} className="text-neon-blue text-sm mb-4 hover:underline">← Back</button>
        {loading ? <p className="text-gray-400">Loading...</p> : !data ? <p className="text-gray-400">Not found.</p> : (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h1 className="text-2xl font-bold text-white mb-3">{data.data.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[['Citizen', data.data.citizen_name], ['CNIC', data.data.cnic], ['Phone', data.data.phone],
                  ['Status', data.data.status], ['Incident Date', new Date(data.data.incident_date).toLocaleDateString()],
                  ['Location', data.data.incident_location]].map(([k, v]) => (
                  <p key={k}><span className="text-gray-400">{k}:</span> <span className="text-white ml-2">{v}</span></p>
                ))}
              </div>
              <p className="text-gray-300 text-sm mt-3">{data.data.description}</p>
            </div>

            {/* Assign Officer */}
            {!data.data.officer_name && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Assign Officer</h2>
                <div className="flex gap-4">
                  <select value={selectedOfficer} onChange={e => setSelectedOfficer(e.target.value)}
                    className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white flex-1 focus:border-neon-blue focus:outline-none">
                    <option value="">Select Officer</option>
                    {officers.map(o => <option key={o.id} value={o.id}>{o.full_name} ({o.badge_number}) - {o.active_cases} active cases</option>)}
                  </select>
                  <button onClick={assignOfficer} className="btn-neon px-6 py-2">Assign</button>
                </div>
              </div>
            )}

            {data.data.officer_name && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-2">Assigned Officer</h2>
                <p className="text-white">{data.data.officer_name} — {data.data.badge_number}</p>
              </div>
            )}

            {/* Evidence & Assign Forensic */}
            {data.evidence?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Evidence — Assign to Forensic</h2>
                <div className="flex gap-4 mb-4 flex-wrap">
                  <select value={selectedEvidence} onChange={e => setSelectedEvidence(e.target.value)}
                    className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white flex-1 focus:border-neon-blue focus:outline-none">
                    <option value="">Select Evidence</option>
                    {data.evidence.filter(e => !e.assigned_to_forensic).map(e => <option key={e.id} value={e.id}>{e.original_filename}</option>)}
                  </select>
                  <select value={selectedForensic} onChange={e => setSelectedForensic(e.target.value)}
                    className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white flex-1 focus:border-neon-blue focus:outline-none">
                    <option value="">Select Forensic Officer</option>
                    {forensics.map(f => <option key={f.id} value={f.id}>{f.full_name} ({f.specialization})</option>)}
                  </select>
                  <button onClick={assignForensic} className="btn-neon px-6 py-2">Assign</button>
                </div>
                <div className="space-y-2">
                  {data.evidence.map(e => (
                    <div key={e.id} className="flex items-center justify-between bg-navy-700 rounded px-3 py-2 text-sm">
                      <span className="text-white">{e.original_filename}</span>
                      <span className={e.forensic_name ? 'text-green-400' : 'text-yellow-400'}>{e.forensic_name || 'Unassigned'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}