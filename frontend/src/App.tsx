import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
        <Route path="/projects/:id" element={<Layout><ProjectDetails /></Layout>} />
        <Route path="/outputs/:id" element={<Layout><OutputEditor /></Layout>} />
        <Route path="/pending-reviews" element={<Layout><PendingReviews /></Layout>} />
        <Route path="/admin/dashboard" element={<Layout><SystemDashboard /></Layout>} />
        <Route path="/admin/assignments" element={<Layout><AdminAssignments /></Layout>} />
        <Route path="/admin/reviewers" element={<Layout><ReviewerManagement /></Layout>} />
        <Route path="/admin/pending-users" element={<Layout><PendingUsers /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
