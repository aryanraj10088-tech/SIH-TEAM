import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Rocket, FileText, Zap, BarChart3, Plus, FolderOpen } from 'lucide-react';

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

  // Logout handle removed, now in Navbar

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col space-y-8 p-4 sm:p-8 max-w-6xl mx-auto min-h-screen">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-8 sm:p-12 shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
          <Rocket className="w-64 h-64 text-white transform rotate-45" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Welcome back, {user?.name?.split(' ')[0] || 'Creator'}! 👋
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mb-8 leading-relaxed">
            Ready to transform your content today? Create a new workspace or jump back into your recent projects to instantly generate executive summaries, LinkedIn posts, and compliance advisories.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/projects" 
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-sm transition-all flex items-center gap-2 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              New Project
            </Link>
            <Link 
              to="/projects" 
              className="bg-blue-700/50 hover:bg-blue-700/70 text-white font-medium px-6 py-3 rounded-lg border border-blue-500/50 backdrop-blur-sm transition-all"
            >
              View Workspaces
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sources Ingested</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Generated Outputs</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">0</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm min-h-[300px]">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
          <p>No recent activity found.</p>
          <p className="text-sm mt-1 opacity-75">Your latest generations and uploads will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
