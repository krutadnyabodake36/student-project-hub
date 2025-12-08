import { Link } from 'react-router-dom';
import { useAuth } from '../context';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Student <span className="text-primary-500">Hub</span>
            </h1>
          </Link>
          
          {/* Navigation Links */}
{isAuthenticated && (
  <div className="flex items-center space-x-6">
    <Link
      to="/dashboard"
      className="text-gray-700 hover:text-primary-500 font-medium transition"
    >
      Projects
    </Link>
    <Link
      to="/create-project"
      className="text-gray-700 hover:text-primary-500 font-medium transition"
    >
      Create Project
    </Link>
    <Link
  to="/teams"
  className="text-gray-700 hover:text-primary-500 font-medium transition"
>
  Find Teams
</Link>

    <Link
      to="/profile"
      className="text-gray-700 hover:text-primary-500 font-medium transition"
    >
      My Profile
    </Link>
    
    <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user?.name}
        </span>
      </div>
      
      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
      >
        Logout
      </button>
    </div>
  </div>
)}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
