import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import { Users, Mail, UserPlus, RefreshCw, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const ReviewerManagement: React.FC = () => {
  const [reviewers, setReviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [inviteData, setInviteData] = useState({ name: '', email: '' });
  const [inviting, setInviting] = useState(false);

  const fetchReviewers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReviewers();
      setReviewers(data);
    } catch (error) {
      toast.error('Failed to load reviewers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      await adminApi.inviteReviewer(inviteData);
      toast.success('Invitation sent successfully');
      setInviteData({ name: '', email: '' });
      fetchReviewers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to invite reviewer');
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      await adminApi.resendInvitation(id);
      toast.success('Invitation resent successfully');
      fetchReviewers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    }
  };

  const filteredReviewers = reviewers.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          Reviewer Management
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-500" />
              Invite Reviewer
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="Reviewer Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 p-2.5 text-sm dark:bg-gray-700 dark:text-white"
                  placeholder="reviewer@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={inviting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Send Invitation
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Reviewers</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search reviewers..."
                  className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredReviewers.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                No reviewers found.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {filteredReviewers.map(reviewer => (
                  <div key={reviewer._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {reviewer.name}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          reviewer.accountStatus === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {reviewer.accountStatus}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3.5 h-3.5" />
                        {reviewer.email}
                      </div>
                    </div>
                    <div>
                      {reviewer.accountStatus === 'PENDING' && (
                        <button
                          onClick={() => handleResend(reviewer._id)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-md"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Resend Invite
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
