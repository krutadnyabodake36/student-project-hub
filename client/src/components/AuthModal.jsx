import { useState } from 'react';
import { useAuth } from '../context';
import toast from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    skills: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(loginData);
      if (result.success) {
        toast.success('Welcome back! 🎉');
        onClose();
      }
    } catch (error) {
      // Error already handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = {
        ...registerData,
        skills: registerData.skills.split(',').map(s => s.trim())
      };
      const result = await register(userData);
      if (result.success) {
        toast.success('Account created! Welcome! 🎉');
        onClose();
      }
    } catch (error) {
      // Error already handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 fade-in">
      <div className="glass-dark rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-white/20 scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-white/20">
          <h2 className="text-3xl font-black text-white neon-glow">
            {activeTab === 'login' ? 'Welcome Back' : 'Join Student Hub'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-all hover:rotate-90 transform duration-300"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 font-black transition-all ${activeTab === 'login'
                ? 'text-white border-b-4 border-yellow-400 bg-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 font-black transition-all ${activeTab === 'register'
                ? 'text-white border-b-4 border-yellow-400 bg-white/10'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <div className="p-8">
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4 text-lg font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl disabled:opacity-50 transform hover:scale-105 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                <div className="absolute inset-0 shimmer"></div>
                <span className="relative">{loading ? 'Logging in...' : 'Login'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  College/University
                </label>
                <input
                  type="text"
                  required
                  value={registerData.college}
                  onChange={(e) => setRegisterData({ ...registerData, college: e.target.value })}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                  placeholder="MIT"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={registerData.skills}
                  onChange={(e) => setRegisterData({ ...registerData, skills: e.target.value })}
                  className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                  placeholder="React, Node.js, Python"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full py-4 text-lg font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl disabled:opacity-50 transform hover:scale-105 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                <div className="absolute inset-0 shimmer"></div>
                <span className="relative">{loading ? 'Creating account...' : 'Sign Up'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
