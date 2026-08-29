import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { outputsApi } from '../api/outputs';
import { FileText, CheckCircle, Clock, AlertTriangle, XCircle, Search } from 'lucide-react';

interface OutputListProps {
  projectId: string;
}

export const OutputList = ({ projectId }: OutputListProps) => {
  const [outputs, setOutputs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutputs = async () => {
      try {
        const data = await outputsApi.getOutputs(projectId);
        setOutputs(data);
      } catch (err) {
        console.error('Failed to fetch outputs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOutputs();
  }, [projectId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="w-4 h-4 text-gray-500" />;
      case 'PENDING_REVIEW': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      case 'PENDING_REVIEW': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-4 text-center">Loading outputs...</div>;

  if (outputs.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No generated outputs found. Create one from a source document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {outputs.map((output) => (
        <div key={output._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white capitalize">
                {output.format.replace('_', ' ')}
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(output.status)}`}>
                {getStatusIcon(output.status)}
                {output.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created: {new Date(output.createdAt).toLocaleString()}
            </p>
          </div>
          
          <Link
            to={`/outputs/${output._id}`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors font-medium text-sm"
          >
            <Search className="w-4 h-4" />
            Open Editor / Review
          </Link>
        </div>
      ))}
    </div>
  );
};

