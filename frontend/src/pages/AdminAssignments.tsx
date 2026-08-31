import { useState, useEffect } from 'react';
import { projectsApi } from '../api/projects';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { Loader2, Search, ShieldAlert, Folder, UserCheck, Check } from 'lucide-react';

interface ProjectInfo {
  _id: string;
  title: string;
  ownerId: { _id: string; name: string; email: string };
  assignedReviewers: { _id: string; name: string; email: string }[];
}

interface Reviewer {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export const AdminAssignments = () => {
  const { role } = useAuth();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Reviewer[]>([]);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAssignableProjects();
      setProjects(data);
      if (selectedProject) {
        // Refresh selected project data
        const updated = data.find((p: ProjectInfo) => p._id === selectedProject._id);
        if (updated) setSelectedProject(updated);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    try {
      setSearching(true);
      const data = await usersApi.searchReviewers(searchEmail);
      setSearchResults(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search reviewers');
    } finally {
      setSearching(false);
    }
  };

  const handleAssign = async (reviewerId: string) => {
    if (!selectedProject) return;
    try {
      setAssigning(reviewerId);
      await projectsApi.addReviewer(selectedProject._id, reviewerId);
      await fetchProjects();
      setSearchResults([]);
      setSearchEmail('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign reviewer');
    } finally {
      setAssigning(null);
    }
  };

  const handleRemove = async (reviewerId: string) => {
    if (!selectedProject) return;
    if (!window.confirm('Remove this reviewer from the project?')) return;
    try {
      await projectsApi.removeReviewer(selectedProject._id, reviewerId);
      await fetchProjects();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove reviewer');
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
    <div className="p-4 sm:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Sidebar - Project List */}
      <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-500" />
            Select Project
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : error ? (
            <div className="p-4 text-red-500 text-sm text-center">{error}</div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No projects found.</div>
          ) : (
            projects.map(p => (
              <button
                key={p._id}
                onClick={() => setSelectedProject(p)}
                className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                  selectedProject?._id === p._id 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white truncate">{p.title}</div>
                <div className="text-xs text-gray-500 truncate mt-1">Owner: {p.ownerId?.email || 'Unknown'}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content - Assignment UI */}
      <div className="w-full md:w-2/3 flex flex-col gap-6">
        {!selectedProject ? (
          <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <UserCheck className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Review Assignments</h3>
            <p>Select a project from the left to manage its reviewers.</p>
          </div>
        ) : (
          <>
            {/* Project Details & Assigned Reviewers */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedProject.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Owner: {selectedProject.ownerId?.email || 'Unknown'}</p>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">Assigned Reviewers</h3>
              
              {selectedProject.assignedReviewers.length === 0 ? (
                <div className="text-sm text-gray-500 italic mb-6">No reviewers assigned to this project yet.</div>
              ) : (
                <div className="space-y-3 mb-6">
                  {selectedProject.assignedReviewers.map(r => (
                    <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div>
                        <div className="font-medium text-sm text-gray-900 dark:text-white">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.email}</div>
                      </div>
                      <button 
                        onClick={() => handleRemove(r._id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign New Reviewer */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Assign New Reviewer</h3>
              
              <form onSubmit={handleSearch} className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="Search reviewer by email..."
                    className="w-full pl-10 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !searchEmail.trim()}
                  className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </form>

              {searchResults.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Search Results</h4>
                  <div className="space-y-3">
                    {searchResults.map(user => {
                      const isAlreadyAssigned = selectedProject.assignedReviewers.some(r => r._id === user._id);
                      return (
                        <div key={user._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email} &bull; Role: {user.role}</div>
                          </div>
                          {isAlreadyAssigned ? (
                            <span className="text-xs text-gray-400 font-medium px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded flex items-center gap-1">
                              <Check className="w-3 h-3" /> Assigned
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAssign(user._id)}
                              disabled={assigning === user._id}
                              className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-medium px-4 py-1.5 rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                              {assigning === user._id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Assign'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {searchEmail && searchResults.length === 0 && !searching && (
                <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                  No reviewers found matching that email.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
