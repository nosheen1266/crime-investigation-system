import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-900">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-9xl font-bold text-neon-blue">404</h1>
        <h2 className="text-3xl font-semibold text-white mt-4">Page Not Found</h2>
        <p className="text-gray-400 mt-2">The page you are looking for does not exist.</p>
        <button onClick={() => navigate('/')} className="btn-neon mt-8">Go Back Home</button>
      </motion.div>
    </div>
  );
}