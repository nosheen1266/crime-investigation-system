import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, FileText, Search, Plus, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ApplicationDetail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDetail(); }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await axiosInstance.get(`/api/citizen/applications/${id}`);
      setData(res.data);
    } catch (err) { toast.error('Failed to load application'); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/'); };

  const statusColor = (s) => ({
    pending: 'text-yellow-400 bg-yellow-400/10',
    assigned: 'text-blue-400 bg-blue-400/10',
    investigating: 'text-orange-400 bg-orange-400/10',
    pending_forensic: 'text-purple-400 bg-purple-400/10',
    closed: 'text-green-400 bg-green-400/10',
  }[s] || 'text-gray-400 bg-gray-400/10');

  const steps = ['pending', 'assigned', 'investigating', 'pending_forensic', 'closed'];

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
        <button onClick={() => navigate('/citizen/applications')} className="text-neon-blue text-sm mb-4 hover:underline">← Back</button>
        {loading ? <p className="text-gray-400">Loading...</p> : !data ? <p className="text-gray-400">Not found.</p> : (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-white">{data.data.title}</h1>
                  <p className="text-gray-400 text-sm mt-1">Application #{data.data.id} • Submitted {new Date(data.data.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${statusColor(data.data.status)}`}>{data.data.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Incident Date:</span> <span className="text-white ml-2">{new Date(data.data.incident_date).toLocaleDateString()}</span></div>
                <div><span className="text-gray-400">Location:</span> <span className="text-white ml-2">{data.data.incident_location}</span></div>
              </div>
              <div className="mt-4">
                <span className="text-gray-400 text-sm">Description:</span>
                <p className="text-white mt-1">{data.data.description}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="glass-card p-6">
              <h2 className="text-white font-semibold mb-4">Case Progress</h2>
              <div className="flex items-center gap-2">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                      ${steps.indexOf(data.data.status) >= i ? 'bg-neon-blue text-navy-900' : 'bg-navy-700 text-gray-400'}`}>
                      {i + 1}
                    </div>
                    <div className="text-xs text-gray-400 capitalize hidden md:block">{step.replace('_', ' ')}</div>
                    {i < steps.length - 1 && <div className={`h-0.5 flex-1 ${steps.indexOf(data.data.status) > i ? 'bg-neon-blue' : 'bg-gray-700'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Officer */}
            {data.data.officer_name && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-3">Assigned Officer</h2>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-400">Name:</span> <span className="text-white ml-2">{data.data.officer_name}</span></p>
                  <p><span className="text-gray-400">Badge:</span> <span className="text-white ml-2">{data.data.badge_number}</span></p>
                  <p><span className="text-gray-400">Department:</span> <span className="text-white ml-2">{data.data.department}</span></p>
                </div>
              </div>
            )}

            {/* Evidence */}
            {data.evidence?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-3">Evidence Files</h2>
                <div className="space-y-2">
                  {data.evidence.map(e => (
                    <div key={e.id} className="flex items-center justify-between bg-navy-700 rounded px-3 py-2">
                      <span className="text-white text-sm">{e.original_filename}</span>
                      <span className="text-gray-400 text-xs">{e.file_type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forensic Reports */}
            {data.forensic_reports?.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-3">Forensic Reports</h2>
                {data.forensic_reports.map((r, i) => (
                  <div key={i} className="bg-navy-700 rounded p-4 text-sm">
                    <p><span className="text-gray-400">Forensic Officer:</span> <span className="text-white ml-2">{r.forensic_name}</span></p>
                    <p className="mt-2 text-gray-400">Findings:</p>
                    <p className="text-white">{r.findings}</p>
                    {r.conclusion && <><p className="mt-2 text-gray-400">Conclusion:</p><p className="text-white">{r.conclusion}</p></>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}