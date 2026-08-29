import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Folder, Plus, Loader2, ArrowRight, Trash2 } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, {
        withCredentials: true,
      });
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/projects`,
        { title: newTitle, description: newDescription },
        { withCredentials: true }
      );
      setShowModal(false);
      setNewTitle('');
      setNewDescription('');
      fetchProjects();
    } catch (err) {
      setError('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this project? This will also delete all associated files and outputs.')) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, {
        withCredentials: true,
      });
      fetchProjects();
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="p-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage your content transformation workspaces</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" /> New Project
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-xl font-medium">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center p-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gray-50/50 dark:bg-gray-900/50">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 dark:text-indigo-400">
            <Folder className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">Get started by creating a new project workspace to upload your documents and begin generating content.</p>
          <button 
            onClick={() => setShowModal(true)}
            className="mt-6 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="group block h-full">
              <div className="h-full p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-[0_2px_10px_rgb(0,0,0,0.02)] dark:shadow-none hover:shadow-xl dark:hover:shadow-indigo-900/20 hover:-translate-y-1 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 flex items-center gap-2">
                   <button 
                     onClick={(e) => handleDeleteProject(e, project._id)}
                     className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 rounded-lg transition-colors shadow-sm"
                     title="Delete Project"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <ArrowRight className="w-5 h-5 text-indigo-500" />
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Folder className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white truncate pr-6">{project.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm line-clamp-2 flex-grow">
                  {project.description || 'No description provided for this project.'}
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs font-medium text-gray-400 dark:text-gray-500">
                  <span>Created</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 scale-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none"
                    placeholder="e.g. Q3 Marketing Campaign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all outline-none resize-none"
                    placeholder="Briefly describe what this workspace is for..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
