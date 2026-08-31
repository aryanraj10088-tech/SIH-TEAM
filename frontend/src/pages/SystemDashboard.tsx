import { useEffect, useState } from 'react';
import { adminApi, type SystemStats } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { Users, FolderOpen, Zap, ClipboardList, CheckCircle, XCircle, LayoutDashboard } from 'lucide-react';

export const SystemDashboard = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getSystemStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch system stats', err);
        setError('Failed to load system statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (role !== 'Administrator') {
    return <div className="p-8 text-center text-red-500">Access Denied: Administrators only.</div>;
  }

  if (loading) return <div className="flex justify-center items-center h-64">Loading system statistics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">High-level overview of platform usage and metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProjects}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Outputs Generated</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalOutputs}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Reviews</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingReviews}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Outputs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.approvedOutputs}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-5">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected Outputs</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.rejectedOutputs}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
