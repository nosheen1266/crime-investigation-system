import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axiosConfig';
import { LogOut, FileText, Search, Plus, User, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewApplication() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', incident_date: '', incident_location: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 10) return toast.error('Maximum 10 files allowed');
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.incident_date || !form.incident_location)
      return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const res = await axiosInstance.post('/api/citizen/applications', form);
      if (res.data.success && files.length > 0) {
        const fd = new FormData();
        files.forEach(f => fd.append('files', f));
        await axiosInstance.post(`/api/citizen/applications/${res.data.id}/files`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.success('Application submitted successfully!');
      navigate('/citizen/applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
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
        <h1 className="text-2xl font-bold text-white mb-6">Submit New Application</h1>
        <div className="glass-card p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                placeholder="Brief title of the incident" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                placeholder="Describe the incident in detail..." rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Incident Date</label>
                <input type="date" value={form.incident_date} onChange={e => setForm({...form, incident_date: e.target.value})}
                  className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none" />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">Location</label>
                <input value={form.incident_location} onChange={e => setForm({...form, incident_location: e.target.value})}
                  className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                  placeholder="Where did it happen?" />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Attach Files (optional, max 10)</label>
              <label className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-neon-blue transition">
                <Upload className="text-gray-400 mb-2" />
                <span className="text-gray-400 text-sm">Click to upload images, PDFs, or videos</span>
                <input type="file" multiple accept="image/*,application/pdf,video/mp4" onChange={handleFileChange} className="hidden" />
              </label>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-navy-700 rounded px-3 py-2">
                      <span className="text-white text-sm">{f.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-neon-blue text-navy-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}