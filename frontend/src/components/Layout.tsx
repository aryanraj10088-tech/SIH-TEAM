import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut, LayoutDashboard, FolderOpen, User, ClipboardList, ShieldAlert, BarChart3, Users } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, loading } = useAuth();

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Protect routes that are wrapped in Layout
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`, {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <nav className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            
            {/* Left: Branding */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">SrijanSetu</span>
              </Link>
            </div>
              
            {/* Center: Navigation Links */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center gap-2">
              <Link 
                to="/dashboard" 
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${location.pathname === '/dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              {user?.role === 'Operator' && (
                <Link 
                  to="/projects" 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${location.pathname.startsWith('/projects') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <FolderOpen className="w-4 h-4" />
                  Projects
                </Link>
              )}
              {user?.role === 'Reviewer' && (
                <Link 
                  to="/pending-reviews" 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${location.pathname === '/pending-reviews' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Reviews
                </Link>
              )}
              {user?.role === 'Administrator' && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${location.pathname === '/admin/dashboard' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    System Dashboard
                  </Link>
                  <Link 
                    to="/admin/assignments" 
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${location.pathname === '/admin/assignments' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Assignments
                  </Link>
                  <Link 
                    to="/admin/reviewers" 
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${location.pathname === '/admin/reviewers' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <Users className="w-4 h-4" />
                    Reviewers
                  </Link>
                </>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationDropdown />
              
              <Link
                to="/profile"
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                title="Your Profile"
              >
                <User className="w-5 h-5" />
              </Link>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full transition-colors duration-300 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 z-50 w-full bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe transition-colors duration-300">
        <div className="flex justify-around items-center h-16">
          <Link 
            to="/dashboard" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-medium">Dashboard</span>
          </Link>
          {user?.role === 'Operator' && (
            <Link 
              to="/projects" 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.startsWith('/projects') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <FolderOpen className="w-5 h-5" />
              <span className="text-[10px] font-medium">Projects</span>
            </Link>
          )}
          {user?.role === 'Reviewer' && (
            <Link 
              to="/pending-reviews" 
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/pending-reviews' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] font-medium">Reviews</span>
            </Link>
          )}
          {user?.role === 'Administrator' && (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/admin/dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-[10px] font-medium">Sys Dash</span>
              </Link>
              <Link 
                to="/admin/assignments" 
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/admin/assignments' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <ShieldAlert className="w-5 h-5" />
                <span className="text-[10px] font-medium">Assign</span>
              </Link>
              <Link 
                to="/admin/reviewers" 
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/admin/reviewers' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-medium">Reviewers</span>
              </Link>
            </>
          )}
          <Link 
            to="/profile" 
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};
