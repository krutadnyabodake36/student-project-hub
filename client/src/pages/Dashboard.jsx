import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import api, { projectsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.techStack?.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProjects(filtered);
  }, [projects, selectedCategory, searchTerm]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (projectId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      toast.error('Please login to like projects');
      return;
    }

    try {
      const res = await projectsAPI.toggleLike(projectId);
      const newCount = res.data.likesCount;
      setProjects(prev => prev.map(p => p._id === projectId ? { ...p, likes: Array(newCount).fill(null) } : p));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle like');
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      toast.success('Project deleted successfully! 🗑️');
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleActionClick = (action, projectId = null) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      toast.error('Please login to continue');
      return;
    }
    
    // Perform the action
    if (action === 'create') navigate('/create-project');
    if (action === 'teams') navigate('/teams');
    if (action === 'like' && projectId) handleToggleLike(projectId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner for Non-Logged Users */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome to Student Hub! 👋</h1>
            <p className="text-lg mb-4">Discover amazing student projects, connect with creators, and find team members!</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Join Now - It's Free! 🚀
            </button>
          </div>
        )}

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📊</span>
              <span className="text-4xl font-bold">{projects.length}</span>
            </div>
            <p className="text-blue-100 font-medium">Total Projects</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">✅</span>
              <span className="text-4xl font-bold">
                {projects.filter(p => p.status === 'Open').length}
              </span>
            </div>
            <p className="text-green-100 font-medium">Open Projects</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">❤️</span>
              <span className="text-4xl font-bold">
                {projects.reduce((sum, p) => sum + (p.likesCount || p.likes?.length || 0), 0)}
              </span>
            </div>
            <p className="text-purple-100 font-medium">Total Likes</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">👁️</span>
              <span className="text-4xl font-bold">
                {projects.reduce((sum, p) => sum + (p.views || 0), 0)}
              </span>
            </div>
            <p className="text-orange-100 font-medium">Total Views</p>
          </div>
        </div>

        {/* Trending Projects Section */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              🔥 Trending Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projects
                .sort((a, b) => (b.likesCount || b.likes?.length || 0) - (a.likesCount || a.likes?.length || 0))
                .slice(0, 3)
                .map((project) => (
                  <div
                    key={project._id}
                    className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200 hover:shadow-lg transition cursor-pointer"
                    onClick={() => navigate(`/project/${project._id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 line-clamp-2 flex-1">
                        {project.title}
                      </h3>
                      <span className="text-2xl">🏆</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="flex items-center space-x-1">
                          <span>❤️</span>
                          <span className="font-semibold">{project.likesCount || project.likes?.length || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>👁️</span>
                          <span className="font-semibold">{project.views || 0}</span>
                        </span>
                      </div>
                      <span className="text-sm font-medium text-orange-600">View →</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recent Activity Feed */}
        {projects.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚡</span>
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {projects
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((project) => (
                  <div key={project._id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {project.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{project.author?.name}</span>
                        {' '}created a new project
                      </p>
                      <Link
                        to={`/project/${project._id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 truncate block"
                      >
                        {project.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(project.createdAt).toLocaleDateString()} • {new Date(project.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Explore Projects</h2>
            <span className="text-gray-600">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
            </span>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects by title, description, or tech stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                <svg 
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter:</span>
              {['All', 'Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Data Science', 'Other'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'All' ? 'No projects found' : 'No Projects Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to create a project!'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/create-project')}
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
              >
                {project.image && (
                  <div className="mb-4 cursor-pointer" onClick={() => navigate(`/project/${project._id}`)}>
                    <img
                      src={(project.image.startsWith('http') ? project.image : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${project.image}`)}
                      alt={project.title}
                      className="w-full h-36 object-cover rounded-lg mb-4"
                    />
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 cursor-pointer hover:text-primary-600"
                      onClick={() => navigate(`/project/${project._id}`)}
                    >
                      {project.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                      project.status === 'Open' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  {project.category && (
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                      project.category === 'Web Development' ? 'bg-blue-100 text-blue-700' :
                      project.category === 'Mobile App' ? 'bg-green-100 text-green-700' :
                      project.category === 'Machine Learning' ? 'bg-purple-100 text-purple-700' :
                      project.category === 'IoT' ? 'bg-orange-100 text-orange-700' :
                      project.category === 'Data Science' ? 'bg-pink-100 text-pink-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.category === 'Web Development' && '💻'}
                      {project.category === 'Mobile App' && '📱'}
                      {project.category === 'Machine Learning' && '🧠'}
                      {project.category === 'IoT' && '🔌'}
                      {project.category === 'Data Science' && '📊'}
                      {project.category === 'Other' && '🎯'}
                      {' '}{project.category}
                    </span>
                  )}
                  
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {project.description}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">TECH STACK</p>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack?.slice(0, 3).map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack?.length > 3 && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        +{project.techStack.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <button
                    onClick={() => handleActionClick('like', project._id)}
                    className="flex items-center space-x-1 hover:text-red-500 transition"
                  >
                    <span>❤️</span>
                    <span>{project.likesCount || project.likes?.length || 0}</span>
                  </button>
                  <span className="flex items-center space-x-1">
                    <span>💬</span>
                    <span>{project.comments?.length || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>👁️</span>
                    <span>{project.views || 0}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {project.author?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {project.author?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isAuthenticated && user?._id?.toString() === project.author?._id?.toString() ? (
                      <>
                        <Link
                          to={`/edit-project/${project._id}`}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          🗑️
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => navigate(`/project/${project._id}`)}
                        className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition"
                      >
                        View →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Floating Buttons */}
        {isAuthenticated && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
            <button
              onClick={() => handleActionClick('create')}
              className="bg-primary-500 hover:bg-primary-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
              title="Create Project"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            <button
              onClick={() => handleActionClick('teams')}
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
              title="Find Teams"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gray-700 hover:bg-gray-800 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
              title="Scroll to Top"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              </button>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Dashboard;
