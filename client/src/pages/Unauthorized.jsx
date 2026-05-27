import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboard = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-9xl font-bold text-red-500">403</h1>
        <h2 className="text-3xl font-semibold text-white mt-4">Access Denied</h2>
        <p className="text-gray-400 mt-2">You do not have permission to view this page.</p>
        {user && <p className="text-neon-blue mt-1">Your role: <span className="font-bold">{user.role}</span></p>}
        <button onClick={() => navigate(getDashboard())} className="btn-neon mt-8">Go to My Dashboard</button>
      </motion.div>
    </div>
  );
}