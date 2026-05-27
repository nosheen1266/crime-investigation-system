import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, FlaskConical, User, BarChart3, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EvidenceDetail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [findingForm, setFindingForm] = useState({ finding_type: '', description: '', conclusion: '' });
  const [reportForm, setReportForm] = useState({ findings: '', conclusion: '' });
  const [reportFile, setReportFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [evRes, findRes] = await Promise.all([
        axiosInstance.get(`/api/forensic/evidence/${id}`),
        axiosInstance.get(`/api/forensic/evidence/${id}/findings`),
      ]);
      setData(evRes.data.data);
      setFindings(findRes.data.data);
    } catch (err) { toast.error('Failed to load evidence'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (status) => {
    try {
      await axiosInstance.put(`/api/forensic/evidence/${id}/status`, { status });
      toast.success('Status updated!');
      fetchData();
    } catch (err) { toast.error('Failed'); }
  };

  const addFinding = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/api/forensic/evidence/${id}/findings`, findingForm);
      toast.success('Finding added!');
      setFindingForm({ finding_type: '', description: '', conclusion: '' });
      fetchData();
    } catch (err) { toast.error('Failed to add finding'); }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('findings', reportForm.findings);
      fd.append('conclusion', reportForm.conclusion);
      if (reportFile) fd.append('file', reportFile);
      await axiosInstance.post(`/api/forensic/evidence/${id}/report`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report submitted!');
      fetchData();
    } catch (err) { toast.error('Failed to submit report'); }
    finally { setSubmitting(false); }
  };

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
        <button onClick={() => navigate('/forensic/evidence')} className="text-neon-blue text-sm mb-4 hover:underline">← Back</button>
        {loading ? <p className="text-gray-400">Loading...</p> : !data ? <p className="text-gray-400">Not found.</p> : (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h1 className="text-xl font-bold text-white mb-3">{data.original_filename}</h1>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <p><span className="text-gray-400">Case:</span> <span className="text-white ml-2">{data.case_title}</span></p>
                <p><span className="text-gray-400">Type:</span> <span className="text-white ml-2">{data.file_type}</span></p>
                <p><span className="text-gray-400">Status:</span> <span className="text-neon-blue ml-2">{data.report_status || 'pending'}</span></p>
              </div>
              <div className="flex gap-2">
                {['pending', 'in_analysis', 'submitted'].map(s => (
                  <button key={s} onClick={() => updateStatus(s)}
                    className={`text-xs px-3 py-1 rounded-full border ${data.report_status === s ? 'border-neon-blue text-neon-blue' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Add Finding */}
            <div className="glass-card p-6">
              <h2 className="text-white font-semibold mb-4">Add Lab Finding</h2>
              <form onSubmit={addFinding} className="space-y-3">
                {[['Finding Type', 'finding_type'], ['Description', 'description'], ['Conclusion', 'conclusion']].map(([label, key]) => (
                  <div key={key}>
                    <label className="text-gray-400 text-xs mb-1 block">{label}</label>
                    <input value={findingForm[key]} onChange={e => setFindingForm({...findingForm, [key]: e.target.value})}
                      className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" />
                  </div>
                ))}
                <button type="submit" className="btn-neon text-sm px-4 py-2">Add Finding</button>
              </form>
              {findings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {findings.map(f => (
                    <div key={f.id} className="bg-navy-700 rounded p-3 text-sm">
                      <p className="text-neon-blue font-medium">{f.finding_type}</p>
                      <p className="text-white mt-1">{f.description}</p>
                      {f.conclusion && <p className="text-gray-400 mt-1">{f.conclusion}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Report */}
            <div className="glass-card p-6">
              <h2 className="text-white font-semibold mb-4">Submit Forensic Report</h2>
              <form onSubmit={submitReport} className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Findings Summary</label>
                  <textarea value={reportForm.findings} onChange={e => setReportForm({...reportForm, findings: e.target.value})}
                    className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" rows={4} />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Conclusion</label>
                  <textarea value={reportForm.conclusion} onChange={e => setReportForm({...reportForm, conclusion: e.target.value})}
                    className="w-full bg-navy-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-neon-blue focus:outline-none" rows={3} />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Upload Report File (PDF)</label>
                  <input type="file" accept="application/pdf" onChange={e => setReportFile(e.target.files[0])}
                    className="text-gray-400 text-sm" />
                </div>
                <button type="submit" disabled={submitting} className="bg-neon-blue text-navy-900 font-bold px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}