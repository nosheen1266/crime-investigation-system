import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, FlaskConical, User, BarChart3, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const FSidebar = ({ user, logout, navigate }) => (
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
);

export default function ForensicDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pending: 0, in_analysis: 0, submitted: 0 });
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, evRes] = await Promise.all([
        axiosInstance.get('/api/forensic/dashboard/stats'),
        axiosInstance.get('/api/forensic/evidence?limit=5'),
      ]);
      setStats(statsRes.data.data);
      setEvidence(evRes.data.data);
    } catch (err) { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <FSidebar user={user} logout={logout} navigate={navigate} />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Forensic Dashboard</h1>
        <p className="text-gray-400 mb-8">Welcome, {user?.name}</p>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Pending Evidence', value: stats.pending, color: 'text-yellow-400' },
            { label: 'In Analysis', value: stats.in_analysis, color: 'text-orange-400' },
            { label: 'Reports Submitted', value: stats.submitted, color: 'text-green-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="glass-card p-5">
              <div className={`text-2xl font-bold ${color}`}>{loading ? '...' : value}</div>
              <div className="text-gray-400 text-sm">{label}</div>
            </div>
          ))}
        </div>
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Recent Evidence</h2>
            <button onClick={() => navigate('/forensic/evidence')} className="text-neon-blue text-sm hover:underline">View All</button>
          </div>
          {loading ? <p className="text-gray-400">Loading...</p> : evidence.length === 0 ? <p className="text-gray-400 text-sm">No evidence assigned.</p> :
            <div className="space-y-3">
              {evidence.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-navy-700 rounded-lg">
                  <div>
                    <p className="text-white text-sm">{e.original_filename}</p>
                    <p className="text-gray-400 text-xs">Case: {e.case_title}</p>
                  </div>
                  <button onClick={() => navigate(`/forensic/evidence/${e.id}`)} className="text-neon-blue text-xs hover:underline">Analyze</button>
                </div>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  );
}