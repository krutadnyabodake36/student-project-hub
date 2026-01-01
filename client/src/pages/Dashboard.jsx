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
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      toast.success('Project deleted successfully!');
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

    if (action === 'create') navigate('/create-project');
    if (action === 'teams') navigate('/teams');
    if (action === 'like' && projectId) handleToggleLike(projectId);
  };

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Open Projects',
      value: projects.filter(p => p.status === 'Open').length,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Total Likes',
      value: projects.reduce((sum, p) => sum + (p.likesCount || p.likes?.length || 0), 0),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      label: 'Total Views',
      value: projects.reduce((sum, p) => sum + (p.views || 0), 0),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-violet-500'
    }
  ];

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass rounded-2xl shadow-xl p-6 card-hover scale-in border border-white/20" style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-white">{stat.icon}</div>
                <span className="text-5xl font-black text-white">{stat.value}</span>
              </div>
              <p className="text-white/90 font-bold text-lg mb-3">{stat.label}</p>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`} style={{ width: '100%' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* All Projects Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black text-white">All Projects</h2>
            <span className="px-6 py-3 glass text-white font-black rounded-full shadow-lg border border-white/20">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="glass rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
          <div className="mb-4">
            <div className="relative">
              <svg
                className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search projects by title, description, or tech stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/60 focus:border-white focus:bg-white/20 transition-all text-base font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-sm font-black text-white whitespace-nowrap">Filter:</span>
            {['All', 'Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Data Science', 'Other'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-xl font-black whitespace-nowrap transition-all transform hover:scale-105 ${selectedCategory === category
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'glass-dark text-white hover:bg-white/30 border border-white/20'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-white font-bold text-xl">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="glass rounded-2xl shadow-2xl p-12 text-center border border-white/20">
            <svg className="w-24 h-24 mx-auto mb-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <h3 className="text-3xl font-black text-white mb-3">
              {searchTerm || selectedCategory !== 'All' ? 'No projects found' : 'No Projects Yet'}
            </h3>
            <p className="text-white/80 text-lg mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Be the first to showcase your amazing work!'}
            </p>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/create-project')}
                className="relative px-10 py-4 text-lg font-black text-purple-900 bg-white rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
              >
                <span className="relative">Create Your First Project</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="glass rounded-2xl shadow-xl card-hover overflow-hidden border border-white/20"
              >
                {project.image && (
                  <div className="relative h-48 overflow-hidden cursor-pointer group" onClick={() => navigate(`/project/${project._id}`)}>
                    <img
                      src={(project.image.startsWith('http') ? project.image : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${project.image}`)}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 text-xs font-black rounded-full shadow-lg ${project.category === 'Machine Learning' ? 'bg-purple-500/90 text-white' :
                          project.category === 'Web Development' ? 'bg-blue-500/90 text-white' :
                            project.category === 'Mobile App' ? 'bg-green-500/90 text-white' :
                              project.category === 'IoT' ? 'bg-orange-500/90 text-white' :
                                project.category === 'Data Science' ? 'bg-pink-500/90 text-white' :
                                  'bg-gray-500/90 text-white'
                        }`}>
                        {project.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 text-xs font-black rounded-full shadow-lg ${project.status === 'Open'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <h3
                    className="text-2xl font-black text-white line-clamp-2 mb-3 cursor-pointer hover:text-yellow-300 transition"
                    onClick={() => navigate(`/project/${project._id}`)}
                  >
                    {project.title}
                  </h3>

                  <p className="text-sm text-white/80 line-clamp-3 mb-4">
                    {project.description}
                  </p>

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-black text-white/60 mb-2">TECH STACK</p>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-xs font-bold bg-white/10 text-white rounded-full border border-white/30"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="px-3 py-1 text-xs font-bold bg-white/10 text-white rounded-full">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-t border-white/20 pt-4">
                    <button
                      onClick={() => handleActionClick('like', project._id)}
                      className="flex items-center gap-1 text-white hover:text-pink-400 transition-all transform hover:scale-110 font-bold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{project.likesCount || project.likes?.length || 0}</span>
                    </button>
                    <span className="flex items-center gap-1 text-white/80 font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{project.comments?.length || 0}</span>
                    </span>
                    <span className="flex items-center gap-1 text-white/80 font-bold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{project.views || 0}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-black shadow-md">
                        {project.author?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {project.author?.name}
                        </p>
                        <p className="text-xs text-white/60">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAuthenticated && user?._id?.toString() === project.author?._id?.toString() ? (
                        <>
                          <Link
                            to={`/edit-project/${project._id}`}
                            className="p-2 text-blue-300 hover:bg-blue-500/20 rounded-lg transition-all transform hover:scale-110"
                            title="Edit Project"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="p-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-all transform hover:scale-110"
                            title="Delete Project"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => navigate(`/project/${project._id}`)}
                          className="px-5 py-2 bg-white text-purple-600 text-sm font-black rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Buttons */}
        {isAuthenticated && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
            <button
              onClick={() => handleActionClick('create')}
              className="group glass-dark rounded-full p-5 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 border border-white/20"
              title="Create Project"
            >
              <svg className="w-8 h-8 text-white group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            <button
              onClick={() => handleActionClick('teams')}
              className="group glass-dark rounded-full p-5 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 border border-white/20"
              title="Find Teams"
            >
              <svg className="w-8 h-8 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group glass-dark rounded-full p-5 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 border border-white/20"
              title="Scroll to Top"
            >
              <svg className="w-8 h-8 text-white group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Dashboard;
