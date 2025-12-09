import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import AuthModal from './AuthModal';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Helper function to check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Student <span className="text-primary-500">Hub</span>
              </h1>
            </Link>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {/* Public Links (always visible) */}
              <Link
                to="/"
                className={`font-medium transition ${
                  isActive('/') 
                    ? 'text-primary-600 font-semibold' 
                    : 'text-gray-700 hover:text-primary-500'
                }`}
              >
                Explore
              </Link>

              <Link
                to="/teams"
                className={`font-medium transition ${
                  isActive('/teams') 
                    ? 'text-primary-600 font-semibold' 
                    : 'text-gray-700 hover:text-primary-500'
                }`}
              >
                Find Team
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-projects"
                    className={`font-medium transition ${
                      isActive('/my-projects') 
                        ? 'text-primary-600 font-semibold' 
                        : 'text-gray-700 hover:text-primary-500'
                    }`}
                  >
                    My Projects
                  </Link>
                  
                  <Link
                    to="/messages"
                    className={`font-medium transition relative ${
                      location.pathname.startsWith('/messages')
                        ? 'text-primary-600 font-semibold' 
                        : 'text-gray-700 hover:text-primary-500'
                    }`}
                  >
                    Messages
                  </Link>

                  <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
                    {/* Notifications Dropdown */}
                    <NotificationDropdown />
                    
                    {/* User Profile Link */}
                    <Link 
                      to={`/user/${user?._id}`}
                      className="flex items-center space-x-2 hover:opacity-80 transition"
                    >
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture.startsWith('http') 
                            ? user.profilePicture 
                            : `http://localhost:5000${user.profilePicture}`}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700 hidden md:block">
                        {user?.name}
                      </span>
                    </Link>
                    
                    {/* Logout Button */}
                    <button
                      onClick={logout}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-500 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default Navbar;
