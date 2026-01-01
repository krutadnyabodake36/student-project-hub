import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import AuthModal from './AuthModal';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="glass sticky top-0 z-50 border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-black text-white">
                  Student<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600">Hub</span>
                </h1>
                <p className="text-xs text-white/70 font-medium">Collaborate. Create. Innovate.</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/"
                className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${isActive('/')
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/20'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Explore
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-projects"
                    className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${isActive('/my-projects')
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Projects
                  </Link>

                  <Link
                    to="/messages"
                    className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${location.pathname.startsWith('/messages')
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                  </Link>

                  <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white/30">
                    <NotificationDropdown />

                    <Link
                      to={`/user/${user?._id}`}
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-white/20 transition-all group"
                    >
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture.startsWith('http')
                            ? user.profilePicture
                            : `http://localhost:5000${user.profilePicture}`}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-4 ring-white/50 group-hover:ring-white transition-all shadow-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-black shadow-lg group-hover:scale-110 transition-all">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-bold text-white hidden lg:block">
                        {user?.name}
                      </span>
                    </Link>

                    <button
                      onClick={logout}
                      className="px-5 py-2.5 text-sm font-black text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl transition-all transform hover:scale-110 shadow-lg hover:shadow-2xl"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3 ml-4">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-2.5 text-sm font-bold text-white hover:bg-white/20 rounded-xl transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="relative px-8 py-3 text-sm font-black text-white rounded-xl overflow-hidden group shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                    <span className="relative">Sign Up Free</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 glass-dark fade-in">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isActive('/')
                  ? 'bg-white text-purple-600'
                  : 'text-white hover:bg-white/20'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Explore
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${isActive('/my-projects')
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    My Projects
                  </Link>

                  <Link
                    to="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${location.pathname.startsWith('/messages')
                      ? 'bg-white text-purple-600'
                      : 'text-white hover:bg-white/20'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Messages
                  </Link>

                  <Link
                    to={`/user/${user?._id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/20 transition-all"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture.startsWith('http')
                          ? user.profilePicture
                          : `http://localhost:5000${user.profilePicture}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white/50"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-white/70">View Profile</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 rounded-xl transition-all shadow-md"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-center font-semibold text-white bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-center font-bold text-white bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 rounded-xl transition-all shadow-md"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default Navbar;
