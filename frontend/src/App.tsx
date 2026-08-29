import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
<<<<<<< Updated upstream
=======
import { Profile } from './pages/Profile';
import { OutputEditor } from './pages/OutputEditor';
import { Layout } from './components/Layout';
>>>>>>> Stashed changes

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
<<<<<<< Updated upstream
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
=======
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
        <Route path="/projects/:id" element={<Layout><ProjectDetails /></Layout>} />
        <Route path="/outputs/:id" element={<Layout><OutputEditor /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
>>>>>>> Stashed changes
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
