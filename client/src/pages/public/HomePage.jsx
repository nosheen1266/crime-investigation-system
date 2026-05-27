import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Search, Lock, Users, BarChart3, FlaskConical } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-navy-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="text-neon-blue w-8 h-8" />
            <span className="text-white font-bold text-lg">CICMS</span>
          </div>
          <h1 className="hidden md:block text-white font-semibold text-sm">Crime Investigation & Case Management System</h1>
          <div className="flex gap-2">
            {[
              { label: 'Citizen', path: '/citizen/login' },
              { label: 'Officer', path: '/officer/login' },
              { label: 'Forensic', path: '/forensic/login' },
              { label: 'Admin', path: '/admin/login' },
            ].map(({ label, path }) => (
              <button key={label} onClick={() => navigate(path)}
                className="btn-neon text-xs px-3 py-2">{label}</button>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative px-6 py-32 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #00b4ff 0%, transparent 70%)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Justice Served Through <span className="text-neon-blue">Technology</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">
            A secure, end-to-end crime investigation platform for citizens, officers, and forensic experts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('/citizen/register')}
              className="bg-neon-blue text-navy-900 font-bold px-8 py-3 rounded-lg hover:opacity-90 transition">
              Report a Crime
            </button>
            <button onClick={() => navigate('/citizen/login')} className="btn-neon px-8 py-3">
              Track Your Case
            </button>
          </div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="px-6 py-16 bg-navy-800">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { number: '12,847', label: 'Cases Solved' },
            { number: '3,200', label: 'Active Officers' },
            { number: '45,000+', label: 'Reports Filed' },
            { number: '120', label: 'Forensic Labs' },
          ].map(({ number, label }) => (
            <motion.div key={label} whileHover={{ scale: 1.05 }} className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-neon-blue">{number}</div>
              <div className="text-gray-400 mt-1 text-sm">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Our Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <FileText />, title: 'Secure Reporting', desc: 'File FIRs safely online with full encryption' },
              { icon: <Search />, title: 'Real-Time Tracking', desc: 'Monitor your case status live' },
              { icon: <Shield />, title: 'Evidence Management', desc: 'Secure digital evidence chain of custody' },
              { icon: <FlaskConical />, title: 'Forensic Integration', desc: 'Direct lab report pipeline' },
              { icon: <Lock />, title: 'Role-Based Access', desc: 'Zero unauthorized access guaranteed' },
              { icon: <BarChart3 />, title: 'Analytics Dashboard', desc: 'Full reporting and case analytics' },
            ].map(({ icon, title, desc }) => (
              <motion.div key={title} whileHover={{ scale: 1.02, borderColor: '#00b4ff' }}
                className="glass-card p-6 transition-all duration-300">
                <div className="text-neon-blue mb-3">{icon}</div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-16 bg-navy-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Case Flow Process</h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              'Citizen Files Report', 'Admin Reviews', 'Officer Investigates',
              'Evidence Collected', 'Forensic Analysis', 'Case Closed'
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-neon-blue text-navy-900 font-bold flex items-center justify-center mx-auto mb-2">{i + 1}</div>
                <p className="text-gray-400 text-xs">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Access by Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { role: 'Citizen', desc: 'File complaints, track cases, receive updates', path: '/citizen/login', color: 'text-neon-blue' },
              { role: 'Officer', desc: 'Manage assigned cases, add suspects and evidence', path: '/officer/login', color: 'text-green-400' },
              { role: 'Forensic', desc: 'Analyze evidence, submit lab reports', path: '/forensic/login', color: 'text-purple-400' },
              { role: 'Admin', desc: 'Manage all users, assign cases, view analytics', path: '/admin/login', color: 'text-red-400' },
            ].map(({ role, desc, path, color }) => (
              <div key={role} className="glass-card p-6 text-center">
                <Users className={`w-8 h-8 ${color} mx-auto mb-3`} />
                <h3 className="text-white font-bold mb-2">{role}</h3>
                <p className="text-gray-400 text-sm mb-4">{desc}</p>
                <button onClick={() => navigate(path)} className="btn-neon text-sm px-4 py-2 w-full">Login as {role}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-navy-800 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Is Something Wrong? Report It Now.</h2>
        <p className="text-gray-400 mb-8">Your identity is protected. File with full credentials.</p>
        <button onClick={() => navigate('/citizen/register')}
          className="bg-neon-blue text-navy-900 font-bold px-10 py-4 rounded-lg hover:opacity-90 transition text-lg">
          File a Report Now
        </button>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-gray-800 text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="text-neon-blue w-5 h-5" />
          <span className="text-white font-bold">CICMS</span>
        </div>
        <p>contact@crimesystem.gov | +92-51-9999-000 | Federal Investigation Center, Islamabad</p>
        <p className="mt-2">© 2025 Crime Investigation & Case Management System. All Rights Reserved.</p>
      </footer>
    </div>
  );
}