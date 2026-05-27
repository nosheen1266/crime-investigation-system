import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, FlaskConical, User, BarChart3, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EvidenceList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { fetchEvidence(); }, [search, status]);

  const fetchEvidence = async () => {
    try {
      const res = await axiosInstance.get(`/api/forensic/evidence?search=${search}&status=${status}`);
      setEvidence(res.data.data);
    } catch (err) { toast.error('Failed to load evidence'); }
    finally { setLoading(false); }
  };

  const statusColor = (s) => ({
    pending: 'text-yellow-400 bg-yellow-400/10',
    in_analysis: 'text-orange-400 bg-orange-400/10',
    submitted: 'text-green-400 bg-green-400/10',
  }[s] || 'text-gray-400 bg-gray-400/10');

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <div className="w-64 bg-navy-800 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800"><div className="text-neon-blue font-bold text-lg">CICMS</div><div className="text-gray-400 text-xs mt-1">Forensic Portal</div></div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/forensic/dashboard', icon: <BarChart3 size={16} /> },
            { label: 'My Evidence', path: '/forensic/evidence', icon: <FlaskConical size={16} /> },
            { label: 'Reports', path: '/forensic/reports', icon: <FileText size={16} /> },
            { label: 'Profile', path: '/forensic/profile', icon: <User size={16} /> },
          ].map(({ label, path, icon }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${window.location.pathname === path ? 'bg-neon-blue/10 text-neon-blue' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-white text-sm font-medium">{user?.name}</div>
          <div className="text-gray-400 text-xs mb-3">Forensic Officer</div>
          <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm"><LogOut size={16} /> Logout</button>
        </div>
      </div>
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-6">My Evidence</h1>
        <div className="flex gap-4 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search evidence..."
            className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none flex-1" />
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="bg-navy-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_analysis">In Analysis</option>
            <option value="submitted">Submitted</option>
          </select>
        </div>
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 text-sm">
                <th className="text-left p-4">#ID</th>
                <th className="text-left p-4">File</th>
                <th className="text-left p-4">Case</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Assigned</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center p-8 text-gray-400">Loading...</td></tr>
                : evidence.length === 0 ? <tr><td colSpan={6} className="text-center p-8 text-gray-400">No evidence assigned.</td></tr>
                : evidence.map(e => (
                  <tr key={e.id} className="border-b border-gray-800 hover:bg-navy-700/50">
                    <td className="p-4 text-gray-400 text-sm">#{e.id}</td>
                    <td className="p-4 text-white text-sm">{e.original_filename}</td>
                    <td className="p-4 text-gray-400 text-sm">{e.case_title}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(e.status)}`}>{e.status || 'pending'}</span></td>
                    <td className="p-4 text-gray-400 text-sm">{e.assigned_at ? new Date(e.assigned_at).toLocaleDateString() : '-'}</td>
                    <td className="p-4"><button onClick={() => navigate(`/forensic/evidence/${e.id}`)} className="text-neon-blue text-sm hover:underline">Analyze</button></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}