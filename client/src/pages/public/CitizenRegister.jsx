import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function CitizenRegister() {
  const [form, setForm] = useState({
    full_name: '', cnic: '', email: '', phone: '', address: '', password: '', confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ── Validation Rules ──────────────────────────────────────────
  const validate = (name, value) => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        if (value.trim().length > 100) return 'Name must be less than 100 characters';
        return '';

      case 'cnic':
        if (!value.trim()) return 'CNIC is required';
        if (!/^\d{5}-\d{7}-\d{1}$/.test(value)) return 'CNIC format must be: 42201-1234567-1';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^03\d{2}-\d{7}$/.test(value)) return 'Phone format must be: 03XX-XXXXXXX';
        return '';

      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 10) return 'Address must be at least 10 characters';
        if (value.trim().length > 500) return 'Address must be less than 500 characters';
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        if (!/[!@#$%^&*]/.test(value)) return 'Password must contain at least one special character (!@#$%^&*)';
        return '';

      case 'confirm_password':
        if (!value) return 'Please confirm your password';
        if (value !== form.password) return 'Passwords do not match';
        return '';

      default:
        return '';
    }
  };

  // ── Handle Input Change with Real-time Validation ─────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    // Auto-format CNIC as user types
    if (name === 'cnic') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 5) formatted = digits;
      else if (digits.length <= 12) formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      else formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }

    // Auto-format Phone as user types
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 4) formatted = digits;
      else formatted = `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
    }

    setForm({ ...form, [name]: formatted });
    const error = validate(name, formatted);
    setErrors(prev => ({ ...prev, [name]: error }));

    // Re-validate confirm password when password changes
    if (name === 'password' && form.confirm_password) {
      const confirmError = form.confirm_password !== formatted ? 'Passwords do not match' : '';
      setErrors(prev => ({ ...prev, confirm_password: confirmError }));
    }
  };

  // ── Password Strength Indicator ───────────────────────────────
  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return { strength: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[!@#$%^&*]/.test(p)) score++;
    if (p.length >= 12) score++;
    if (score <= 2) return { strength: score, label: 'Weak', color: '#ef4444' };
    if (score === 3) return { strength: score, label: 'Fair', color: '#f59e0b' };
    if (score === 4) return { strength: score, label: 'Strong', color: '#3b82f6' };
    return { strength: score, label: 'Very Strong', color: '#22c55e' };
  };

  const passwordStrength = getPasswordStrength();

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(form).forEach(key => {
      newErrors[key] = validate(key, form[key]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some(e => e !== '')) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('https://trace-dreamily-zap.ngrok-free.dev/api/auth/citizen/register', form);
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

  // ── Error/Success Icon ────────────────────────────────────────
  const FieldIcon = ({ name }) => {
    if (!form[name]) return null;
    return errors[name]
      ? <XCircle size={16} className="text-red-400 inline ml-1" />
      : <CheckCircle size={16} className="text-green-400 inline ml-1" />;
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 text-neon-blue mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Create Citizen Account</h1>
          <p className="text-gray-400 text-sm mt-1">Fill all fields correctly to register</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Full Name <FieldIcon name="full_name" />
            </label>
            <input
              type="text" name="full_name" value={form.full_name}
              onChange={handleChange}
              className={`w-full bg-navy-800 border rounded-lg px-4 py-3 text-white focus:outline-none transition
                ${errors.full_name ? 'border-red-500 focus:border-red-500' : form.full_name && !errors.full_name ? 'border-green-500 focus:border-green-500' : 'border-gray-700 focus:border-neon-blue'}`}
              placeholder="Ahmed Khan"
            />
            {errors.full_name && <p className="text-red-400 text-xs mt-1">⚠ {errors.full_name}</p>}
          </div>

          {/* CNIC */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              CNIC <FieldIcon name="cnic" />
            </label>
            <input
              type="text" name="cnic" value={form.cnic}
              onChange={handleChange} maxLength={15}
              className={`w-full bg-navy-800 border rounded-lg px-4 py-3 text-white focus:outline-none transition
                ${errors.cnic ? 'border-red-500 focus:border-red-500' : form.cnic && !errors.cnic ? 'border-green-500 focus:border-green-500' : 'border-gray-700 focus:border-neon-blue'}`}
              placeholder="42201-1234567-1"
            />
            {errors.cnic && <p className="text-red-400 text-xs mt-1">⚠ {errors.cnic}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Email <FieldIcon name="email" />
            </label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange}
              className={`w-full bg-navy-800 border rounded-lg px-4 py-3 text-white focus:outline-none transition
                ${errors.email ? 'border-red-500 focus:border-red-500' : form.email && !errors.email ? 'border-green-500 focus:border-green-500' : 'border-gray-700 focus:border-neon-blue'}`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">⚠ {errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Phone <FieldIcon name="phone" />
            </label>
            <input
              type="text" name="phone" value={form.phone}
              onChange={handleChange} maxLength={12}
              className={`w-full bg-navy-800 border rounded-lg px-4 py-3 text-white focus:outline-none transition
                ${errors.phone ? 'border-red-500 focus:border-red-500' : form.phone && !errors.phone ? 'border-green-500 focus:border-green-500' : 'border-gray-700 focus:border-neon-blue'}`}
              placeholder="0321-1234567"
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">⚠ {errors.phone}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Address <FieldIcon name="address" />
            </label>
            <textarea
              name="address" value={form.address}
              onChange={handleChange} rows={2}
              className={`w-full bg-navy-800 border rounded-lg px-4 py-3 text-white focus:outline-none transition
                ${errors.address ? 'border-red-500 focus:border-red-500' : form.address && !errors.address ? 'border-green-500 focus:border-green-500' : 'border-gray-700 focus:border-neon-blue'}`}
              placeholder="Your full address (house, street, city)"
            />
            {errors.address && <p className="text-red-400 text-xs mt-1">⚠ {errors.address}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Password <FieldIcon name="password" />
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} name="password" value={form.password}
                onChange={handleChange}
                className={`w-full bg-navy-800 border rounded-lg px-4 py-3 text-white focus:outline-none pr-12 transition
                  ${errors.password ? 'border-red-500 focus:border-red-500' : form.password && !errors.password ? 'border-green-500 focus:border-green-500' : 'border-gray-700 focus:border-neon-blue'}`}
                placeholder="Min 8 chars, uppercase, number, special char"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400">
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {/* Password Strength Bar */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all"
                      style={{ backgroundColor: i <= passwordStrength.strength ? passwordStrength.color : '#374151' }} />
                  ))}
                </div>
                <p className="text-xs mt-1" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label} password
                </p>
              </div>
            )}
            {errors.password && <p className="text-red-400 text-xs mt-1">⚠ {errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Confirm Password <FieldIcon name="confirm_password" />
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? 'text' : 'password'} name="confirm_password" value={form.confirm_password}
                onChange={handleChange}
                className={`w-full bg-navy-800 border rounded-lg px-4 py-3 text-white focus:outline-none pr-12 transition
                  ${errors.confirm_password ? 'border-red-500 focus:border-red-500' : form.confirm_password && !errors.confirm_password ? 'border-green-500 focus:border-green-500' : 'border-gray-700 focus:border-neon-blue'}`}
                placeholder="Re-enter your password"
              />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-3 text-gray-400">
                {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirm_password && <p className="text-red-400 text-xs mt-1">⚠ {errors.confirm_password}</p>}
          </div>

          {/* Password Requirements Hint */}
          <div className="bg-navy-800 rounded-lg p-3 text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-300 mb-1">Password must contain:</p>
            {[
              { rule: form.password.length >= 8, text: 'At least 8 characters' },
              { rule: /[A-Z]/.test(form.password), text: 'One uppercase letter (A-Z)' },
              { rule: /[0-9]/.test(form.password), text: 'One number (0-9)' },
              { rule: /[!@#$%^&*]/.test(form.password), text: 'One special character (!@#$%^&*)' },
            ].map(({ rule, text }) => (
              <p key={text} className={rule ? 'text-green-400' : 'text-gray-500'}>
                {rule ? '✓' : '○'} {text}
              </p>
            ))}
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-neon-blue text-navy-900 font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{' '}
          <Link to="/citizen/login" className="text-neon-blue hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}