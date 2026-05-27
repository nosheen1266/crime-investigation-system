import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function CitizenLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/citizen/login', form, { withCredentials: true });
      if (res.data.success) {
        login(res.data.accessToken, res.data.user);
        toast.success('Login successful!');
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-neon-blue mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Citizen Portal</h1>
          <p className="text-gray-400 mt-1">Crime Investigation & Case Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
              placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none pr-12"
                placeholder="••••••••" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-neon-blue text-navy-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400 text-sm">Don't have an account? <Link to="/citizen/register" className="text-neon-blue hover:underline">Register</Link></p>
          <p className="text-gray-400 text-sm"><Link to="/" className="text-neon-blue hover:underline">← Back to Home</Link></p>
        </div>
      </motion.div>
    </div>
  );
}