import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { outputsApi } from '../api/outputs';
import { ClipboardList, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const PendingReviews = () => {
  const [outputs, setOutputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const { lastUpdateTimestamp } = useNotifications();

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await outputsApi.getPendingReviews();
        setOutputs(data);
      } catch (err) {
        console.error('Failed to fetch pending reviews', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [lastUpdateTimestamp]);

  if (role !== 'Reviewer' && role !== 'Administrator') {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Outputs submitted and awaiting your review.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading pending reviews...</div>
      ) : outputs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <ClipboardList className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending reviews</h3>
          <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {outputs.map((output) => (
            <div key={output._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                  {output.format.replace('_', ' ').toUpperCase()}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(output.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Project: {output.projectId?.title || 'Unknown'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
                Submitted by {output.createdBy?.name || 'Unknown'}
              </p>
              
              <Link 
                to={`/outputs/${output._id}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-sm font-medium transition-colors"
              >
                Review Output
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
