import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';


import { Profile } from './pages/Profile';
import { OutputEditor } from './pages/OutputEditor';
import { PendingReviews } from './pages/PendingReviews';
import { Layout } from './components/Layout';
import { AdminAssignments } from './pages/AdminAssignments';
import { SystemDashboard } from './pages/SystemDashboard';
import { Signup } from './pages/Signup';
import { AcceptInvitation } from './pages/AcceptInvitation';
import { ReviewerManagement } from './pages/ReviewerManagement';
import { PendingUsers } from './pages/PendingUsers';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/accept-reviewer-invitation" element={<AcceptInvitation />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute allowedRoles={['Operator', 'Administrator']}><Layout><Projects /></Layout></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute allowedRoles={['Operator', 'Administrator']}><Layout><ProjectDetails /></Layout></ProtectedRoute>} />
        <Route path="/outputs/:id" element={<ProtectedRoute allowedRoles={['Operator', 'Reviewer', 'Administrator']}><Layout><OutputEditor /></Layout></ProtectedRoute>} />
        <Route path="/pending-reviews" element={<ProtectedRoute allowedRoles={['Reviewer', 'Administrator']}><Layout><PendingReviews /></Layout></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['Administrator']}><Layout><SystemDashboard /></Layout></ProtectedRoute>} />
        <Route path="/admin/assignments" element={<ProtectedRoute allowedRoles={['Administrator']}><Layout><AdminAssignments /></Layout></ProtectedRoute>} />
        <Route path="/admin/reviewers" element={<ProtectedRoute allowedRoles={['Administrator']}><Layout><ReviewerManagement /></Layout></ProtectedRoute>} />
        <Route path="/admin/pending-users" element={<ProtectedRoute allowedRoles={['Administrator']}><Layout><PendingUsers /></Layout></ProtectedRoute>} />
        
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
