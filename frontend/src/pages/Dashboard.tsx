import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileText, Zap, BarChart3, FolderOpen, Clock, CheckCircle, FileUp, MessageSquare, Eye } from 'lucide-react';

interface Activity {
  _id: string;
  entityType: string;
  action: string;
  createdAt: string;
  performedBy?: any;
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [sourceCount, setSourceCount] = useState(0);
  const [outputCount, setOutputCount] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch projects
        const { data: projectsData } = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, {
          withCredentials: true,
        });
        setProjectCount(projectsData.length);

        // Fetch sources and outputs for all projects concurrently
        const projectPromises = projectsData.map(async (project: any) => {
          let pSources = 0;
          let pOutputs = 0;

          try {
            const { data: sourcesData } = await axios.get(
              `${import.meta.env.VITE_API_URL}/projects/${project._id}/sources`,
              { withCredentials: true }
            );
            pSources = sourcesData.length;
          } catch (err) {
            console.error(`Failed to fetch sources for project ${project._id}`, err);
          }

          try {
            const { data: outputsData } = await axios.get(
              `${import.meta.env.VITE_API_URL}/outputs?projectId=${project._id}`,
              { withCredentials: true }
            );
            pOutputs = outputsData.length;
          } catch (err) {
            console.error(`Failed to fetch outputs for project ${project._id}`, err);
          }

          return { sources: pSources, outputs: pOutputs };
        });

        const results = await Promise.all(projectPromises);
        
        let totalSources = 0;
        let totalOutputs = 0;
        results.forEach(res => {
          totalSources += res.sources;
          totalOutputs += res.outputs;
        });

        setSourceCount(totalSources);
        setOutputCount(totalOutputs);

        // Fetch recent activity
        try {
          const { data: activityData } = await axios.get(
            `${import.meta.env.VITE_API_URL}/auth/activity/recent`,
            { withCredentials: true }
          );
          setActivities(activityData);
        } catch (err) {
          console.error('Failed to fetch recent activity', err);
        }
      } catch (error: any) {
        console.error('Failed to fetch dashboard data', error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATED':
        return <FileUp className="w-4 h-4 text-blue-500" />;
      case 'EDITED':
        return <Eye className="w-4 h-4 text-orange-500" />;
      case 'SUBMITTED_FOR_REVIEW':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <MessageSquare className="w-4 h-4 text-red-500" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    const action = activity.action.replace(/_/g, ' ').toLowerCase();
    return `${action} ${activity.entityType.toLowerCase()}`;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{projectCount}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sources Ingested</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{sourceCount}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Generated Outputs</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{outputCount}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm min-h-[300px]">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
            <p>No recent activity found.</p>
            <p className="text-sm mt-1 opacity-75">Your latest generations and uploads will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity._id} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
                <div className="mt-1 flex-shrink-0">
                  {getActivityIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
