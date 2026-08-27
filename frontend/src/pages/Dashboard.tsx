import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, LogOut, Users, FolderOpen } from 'lucide-react';

interface User {
  name: string;
  email: string;
  role: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          withCredentials: true,
        });
        setUser(data);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="flex items-center justify-center h-16 border-b">
          <span className="text-xl font-bold text-gray-800">SrijanSetu</span>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/projects" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">
            <FolderOpen className="w-5 h-5 mr-3" />
            Projects
          </Link>
          {user?.role === 'Administrator' && (
            <a href="#" className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded">
              <Users className="w-5 h-5 mr-3" />
              Administration
            </a>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b">
          <h1 className="text-xl font-semibold text-gray-800">Overview</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border rounded shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-800">0</p>
            </div>
            <div className="p-6 bg-white border rounded shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Sources Ingested</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-800">0</p>
            </div>
            <div className="p-6 bg-white border rounded shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Generated Outputs</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-800">0</p>
            </div>
          </div>

          <div className="p-6 bg-white border rounded shadow-sm min-h-[400px]">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h2>
            <div className="flex items-center justify-center h-64 text-gray-500 border-2 border-dashed rounded bg-gray-50">
              No recent activity found.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
