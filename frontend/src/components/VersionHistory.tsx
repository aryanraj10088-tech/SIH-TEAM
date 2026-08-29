import { History, User } from 'lucide-react';

interface Version {
  _id: string;
  editedBy: { name: string };
  editedAt: string;
  note: string;
}

interface VersionHistoryProps {
  versions: Version[];
}

export const VersionHistory = ({ versions }: VersionHistoryProps) => {
  if (!versions || versions.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 p-4 text-center">
        No edits have been made yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions.slice().reverse().map((version, idx) => (
        <div key={version._id} className="flex gap-4 relative">
          {/* Timeline line */}
          {idx !== versions.length - 1 && (
            <div className="absolute left-4 top-10 bottom-[-16px] w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          )}
          
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-2 border-white dark:border-gray-800 z-10">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700 flex-1">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {version.editedBy?.name || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(version.editedAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {version.note || 'Manual edit'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

