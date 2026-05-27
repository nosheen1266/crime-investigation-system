import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { setAuthToken } from './api/axiosConfig';

// Public pages
import HomePage from './pages/public/HomePage';
import CitizenLogin from './pages/public/CitizenLogin';
import CitizenRegister from './pages/public/CitizenRegister';
import OfficerLogin from './pages/public/OfficerLogin';
import ForensicLogin from './pages/public/ForensicLogin';
import AdminLogin from './pages/public/AdminLogin';

// Citizen pages
import CitizenDashboard from './pages/citizen/Dashboard';
import CitizenApplications from './pages/citizen/Applications';
import NewApplication from './pages/citizen/NewApplication';
import ApplicationDetail from './pages/citizen/ApplicationDetail';
import CitizenProfile from './pages/citizen/Profile';

// Officer pages
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerCases from './pages/officer/Cases';
import CaseDetail from './pages/officer/CaseDetail';
import OfficerProfile from './pages/officer/Profile';

// Forensic pages
import ForensicDashboard from './pages/forensic/Dashboard';
import EvidenceList from './pages/forensic/EvidenceList';
import EvidenceDetail from './pages/forensic/EvidenceDetail';
import ForensicReports from './pages/forensic/Reports';
import ForensicProfile from './pages/forensic/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminApplications from './pages/admin/Applications';
import AdminApplicationDetail from './pages/admin/ApplicationDetail';
import UserManagement from './pages/admin/UserManagement';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminProfile from './pages/admin/Profile';

// Special pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen text-neon-blue">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/unauthorized" replace />;
  return children;
};

export default function App() {
  const { accessToken } = useAuth();

  useEffect(() => {
    setAuthToken(accessToken);
  }, [accessToken]);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/citizen/login" element={<CitizenLogin />} />
      <Route path="/citizen/register" element={<CitizenRegister />} />
      <Route path="/officer/login" element={<OfficerLogin />} />
      <Route path="/forensic/login" element={<ForensicLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Citizen */}
      <Route path="/citizen/dashboard" element={<ProtectedRoute allowedRole="citizen"><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/citizen/applications" element={<ProtectedRoute allowedRole="citizen"><CitizenApplications /></ProtectedRoute>} />
      <Route path="/citizen/applications/new" element={<ProtectedRoute allowedRole="citizen"><NewApplication /></ProtectedRoute>} />
      <Route path="/citizen/applications/:id" element={<ProtectedRoute allowedRole="citizen"><ApplicationDetail /></ProtectedRoute>} />
      <Route path="/citizen/profile" element={<ProtectedRoute allowedRole="citizen"><CitizenProfile /></ProtectedRoute>} />

      {/* Officer */}
      <Route path="/officer/dashboard" element={<ProtectedRoute allowedRole="officer"><OfficerDashboard /></ProtectedRoute>} />
      <Route path="/officer/cases" element={<ProtectedRoute allowedRole="officer"><OfficerCases /></ProtectedRoute>} />
      <Route path="/officer/cases/:id" element={<ProtectedRoute allowedRole="officer"><CaseDetail /></ProtectedRoute>} />
      <Route path="/officer/profile" element={<ProtectedRoute allowedRole="officer"><OfficerProfile /></ProtectedRoute>} />

      {/* Forensic */}
      <Route path="/forensic/dashboard" element={<ProtectedRoute allowedRole="forensic"><ForensicDashboard /></ProtectedRoute>} />
      <Route path="/forensic/evidence" element={<ProtectedRoute allowedRole="forensic"><EvidenceList /></ProtectedRoute>} />
      <Route path="/forensic/evidence/:id" element={<ProtectedRoute allowedRole="forensic"><EvidenceDetail /></ProtectedRoute>} />
      <Route path="/forensic/reports" element={<ProtectedRoute allowedRole="forensic"><ForensicReports /></ProtectedRoute>} />
      <Route path="/forensic/profile" element={<ProtectedRoute allowedRole="forensic"><ForensicProfile /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/applications" element={<ProtectedRoute allowedRole="admin"><AdminApplications /></ProtectedRoute>} />
      <Route path="/admin/applications/:id" element={<ProtectedRoute allowedRole="admin"><AdminApplicationDetail /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><UserManagement /></ProtectedRoute>} />
      <Route path="/admin/activity-logs" element={<ProtectedRoute allowedRole="admin"><ActivityLogs /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRole="admin"><AdminProfile /></ProtectedRoute>} />

      {/* Special */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}