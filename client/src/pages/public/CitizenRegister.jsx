import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function CitizenRegister() {
  const [form, setForm] = useState({ full_name: '', cnic: '', email: '', phone: '', address: '', password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.values(form).some(v => !v)) return toast.error('Please fill all fields');
    if (form.password !== form.confirm_password) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/citizen/register', form);
      if (res.data.success) {
        toast.success('Account created! Please login.');
        navigate('/citizen/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-neon-blue mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Create Citizen Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Ahmed Khan' },
            { label: 'CNIC', key: 'cnic', type: 'text', placeholder: '42201-1234567-1' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone', key: 'phone', type: 'text', placeholder: '0321-1234567' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-gray-400 text-sm mb-1 block">{label}</label>
              <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
                placeholder={placeholder} />
            </div>
          ))}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Address</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none"
              placeholder="Your full address" rows={2} />
          </div>
          {['password', 'confirm_password'].map((key) => (
            <div key={key}>
              <label className="text-gray-400 text-sm mb-1 block">{key === 'password' ? 'Password' : 'Confirm Password'}</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                  className="w-full bg-navy-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-neon-blue focus:outline-none pr-12"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">
                  {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-neon-blue text-navy-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">Already have an account? <Link to="/citizen/login" className="text-neon-blue hover:underline">Login</Link></p>
      </motion.div>
    </div>
  );
}