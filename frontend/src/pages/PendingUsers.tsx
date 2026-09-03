import { useEffect, useState } from 'react';
import { adminApi } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const PendingUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { role } = useAuth();

  const fetchUsers = async () => {
    try {
      const data = await adminApi.getPendingUsers();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject', userRole?: string) => {
    setProcessingId(id);
    try {
      if (action === 'approve') {
        await adminApi.approveUser(id, userRole!);
        toast.success('User approved');
      } else {
        await adminApi.rejectUser(id);
        toast.success('User rejected');
      }
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process user');
    } finally {
      setProcessingId(null);
    }
  };

  if (role !== 'Administrator') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <ShieldAlert className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p>This page is restricted to Administrators only.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Users</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Approve or reject organizational users.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No pending users.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map(user => (
              <div key={user._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-lg">{user.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Signed up on {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select 
                    id={`role-${user._id}`}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  >
                    <option value="Operator">Operator</option>
                    <option value="Reviewer">Reviewer</option>
                  </select>
                  
                  <button
                    onClick={() => handleAction(user._id, 'approve', (document.getElementById(`role-${user._id}`) as HTMLSelectElement).value)}
                    disabled={processingId === user._id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(user._id, 'reject')}
                    disabled={processingId === user._id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
