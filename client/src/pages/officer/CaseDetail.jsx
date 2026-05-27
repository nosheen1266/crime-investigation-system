import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, Briefcase, User, BarChart3, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CaseDetail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [tab, setTab] = useState('evidence');
  const [evidence, setEvidence] = useState([]);
  const [suspects, setSuspects] = useState([]);
  const [witnesses, setWitnesses] = useState([]);
  const [forensicReports, setForensicReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suspectForm, setSuspectForm] = useState({ full_name: '', description: '', address: '', relationship_to_case: '' });
  const [witnessForm, setWitnessForm] = useState({ full_name: '', contact: '', statement: '' });
  const [newStatus, setNewStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [caseRes, evRes, susRes, witRes, frRes] = await Promise.all([
        axiosInstance.get(`/api/officer/cases/${id}`),
        axiosInstance.get(`/api/officer/cases/${id}/evidence`),
        axiosInstance.get(`/api/officer/cases/${id}/suspects`),
        axiosInstance.get(`/api/officer/cases/${id}/witnesses`),
        axiosInstance.get(`/api/officer/cases/${id}/forensic-reports`),
      ]);
      setCaseData(caseRes.data.data);
      setEvidence(evRes.data.data);
      setSuspects(susRes.data.data);
      setWitnesses(witRes.data.data);
      setForensicReports(frRes.data.data);
      setNewStatus(caseRes.data.data.status);
    } catch (err) { toast.error('Failed to load case'); }
    finally { setLoading(false); }
  };

  const updateStatus = async () => {
    try {
      await axiosInstance.put(`/api/officer/cases/${id}/status`, { status: newStatus });
      toast.success('Status updated!');
      fetchAll();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const addSuspect = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/api/officer/cases/${id}/suspects`, suspectForm);
      toast.success('Suspect added!');
      setSuspectForm({ full_name: '', description: '', address: '', relationship_to_case: '' });
      fetchAll();
    } catch (err) { toast.error('Failed to add suspect'); }
  };

  const addWitness = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/api/officer/cases/${id}/witnesses`, witnessForm);
      toast.success('Witness added!');
      setWitnessForm({ full_name: '', contact: '', statement: '' });
      fetchAll();
    } catch (err) { toast.error('Failed to add witness'); }
  };

  const uploadEvidence = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      await axiosInstance.post(`/api/officer/cases/${id}/evidence`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Evidence uploaded!');
      fetchAll();
    } catch (err) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex">
      <div className="w-64 bg-navy-800 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800"><div className="text-neon-blue font-bold text-lg">CICMS</div><div className="text-gray-400 text-xs mt-1">Officer Portal</div></div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', path: '/officer/dashboard', icon: <BarChart3 size={16} /> },
            { label: 'My Cases', path: '/officer/cases', icon: <Briefcase size={16} /> },
            { label: 'Profile', path: '/officer/profile', icon: <User size={16} /> },
          ].map(({ label, path, icon }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${window.location.pathname === path ? 'bg-neon-blue/10 text-neon-blue' : 'text-gray-400 hover:text-white hover:bg-navy-700'}`}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="text-white text-sm font-medium">{user?.name}</div>
          <div className="text-gray-400 text-xs mb-3">Officer</div>
          <button onClick={async () => { await logout(); navigate('/'); }} className="flex items-center gap-2 text-gray-400 hover:text-red-400 text-sm"><LogOut size={16} /> Logout</button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-auto">
        <button onClick={() => navigate('/officer/cases')} className="text-neon-blue text-sm mb-4 hover:underline">← Back</button>
        {loading ? <p className="text-gray-400">Loading...</p> : !caseData ? <p className="text-gray-400">Not found.</p> : (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h1 className="text-2xl font-bold text-white mb-2">{caseData.title}</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                <div><span className="text-gray-400">Citizen:</span> <span className="text-white ml-2">{caseData.citizen_name}</span></div>
                <div><span className="text-gray-400">CNIC:</span> <span className="text-white ml-2">{caseData.cnic}</span></div>
                <div><span className="text-gray-400">Phone:</span> <span className="text-white ml-2">{caseData.phone}</span></div>
                <div><span className="text-gray-400">Incident Date:</span> <span className="text-white ml-2">{new Date(caseData.incident_date).toLocaleDateString()}</span></div>
                <div><span className="text-gray-400">Location:</span> <span className="text-white ml-2">{caseData.incident_location}</span></div>
              </div>
              <p className="text-gray-300 text-sm mb-4">{caseData.description}</p>
              <div className="flex items-center gap-3">
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none">
                  <option value="assigned">Assigned</option>
                  <option value="investigating">Investigating</option>
                  <option value="pending_forensic">Pending Forensic</option>
                  <option value="closed">Closed</option>
                </select>
                <button onClick={updateStatus} className="btn-neon text-sm px-4 py-2">Update Status</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {['evidence', 'suspects', 'witnesses', 'forensic'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? 'bg-neon-blue text-navy-900 font-bold' : 'bg-navy-800 text-gray-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Evidence Tab */}
            {tab === 'evidence' && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Evidence</h2>
                <label className="btn-neon text-sm px-4 py-2 cursor-pointer flex items-center gap-2 w-fit mb-4">
                  <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload Evidence'}
                  <input type="file" className="hidden" onChange={uploadEvidence} />
                </label>
                {evidence.length === 0 ? <p className="text-gray-400 text-sm">No evidence uploaded.</p> :
                  <div className="space-y-2">
                    {evidence.map(e => (
                      <div key={e.id} className="flex items-center justify-between bg-navy-700 rounded px-3 py-2">
                        <span className="text-white text-sm">{e.original_filename}</span>
                        <span className="text-gray-400 text-xs">{e.file_type}</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
            )}

            {/* Suspects Tab */}
            {tab === 'suspects' && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Suspects</h2>
                <form onSubmit={addSuspect} className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Full Name', key: 'full_name' },
                    { label: 'Relationship', key: 'relationship_to_case' },
                    { label: 'Address', key: 'address' },
                    { label: 'Description', key: 'description' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                      <input value={suspectForm[key]} onChange={e => setSuspectForm({...suspectForm, [key]: e.target.value})}
                        className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                    </div>
                  ))}
                  <button type="submit" className="btn-neon text-sm px-4 py-2 col-span-2 w-fit">Add Suspect</button>
                </form>
                {suspects.map(s => (
                  <div key={s.id} className="bg-navy-700 rounded p-3 mb-2 text-sm">
                    <p className="text-white font-medium">{s.full_name}</p>
                    <p className="text-gray-400">{s.relationship_to_case} • {s.address}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Witnesses Tab */}
            {tab === 'witnesses' && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Witnesses</h2>
                <form onSubmit={addWitness} className="space-y-3 mb-6">
                  {[
                    { label: 'Full Name', key: 'full_name' },
                    { label: 'Contact', key: 'contact' },
                    { label: 'Statement', key: 'statement' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                      <input value={witnessForm[key]} onChange={e => setWitnessForm({...witnessForm, [key]: e.target.value})}
                        className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                    </div>
                  ))}
                  <button type="submit" className="btn-neon text-sm px-4 py-2">Add Witness</button>
                </form>
                {witnesses.map(w => (
                  <div key={w.id} className="bg-navy-700 rounded p-3 mb-2 text-sm">
                    <p className="text-white font-medium">{w.full_name} • {w.contact}</p>
                    <p className="text-gray-400 mt-1">{w.statement}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Forensic Tab */}
            {tab === 'forensic' && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4">Forensic Reports</h2>
                {forensicReports.length === 0 ? <p className="text-gray-400 text-sm">No forensic reports yet.</p> :
                  forensicReports.map(r => (
                    <div key={r.id} className="bg-navy-700 rounded p-4 mb-3 text-sm">
                      <p className="text-white font-medium">{r.forensic_name}</p>
                      <p className="text-gray-400 mt-1">{r.findings}</p>
                      {r.conclusion && <p className="text-neon-blue mt-1">Conclusion: {r.conclusion}</p>}
                      <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${r.status === 'submitted' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>{r.status}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}