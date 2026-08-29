import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Shield, Loader2 } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          withCredentials: true,
        });
        setUser(data);
      } catch (error) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm p-8 overflow-hidden relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0 border-4 border-white dark:border-gray-800">
            <span className="text-5xl font-bold text-white uppercase">{user.name.charAt(0)}</span>
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 capitalize flex items-center justify-center md:justify-start gap-1.5 mt-1">
                <Shield className="w-4 h-4 text-green-500" />
                {user.role} Account
              </p>
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 inline-block md:block w-full">
              <div className="flex items-center justify-center md:justify-start gap-3 text-gray-700 dark:text-gray-300">
                <div className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
