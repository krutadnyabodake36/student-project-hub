import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context';
import api, { projectsAPI } from '../utils/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyProjects = useCallback(async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    try {
      const response = await projectsAPI.getAll();
      const userProjects = response.data.data.filter(
        project => project.author?._id?.toString() === user?._id?.toString()
      );
      setMyProjects(userProjects);
    } catch (error) {
      toast.error('Failed to load your projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      toast.success('Project deleted successfully!');
      fetchMyProjects();
    } catch (error) {
      toast.error('Failed to delete project');
      console.error(error);
    }
  };

  const stats = [
    {
      value: myProjects.length,
      label: 'Total Projects',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      value: myProjects.filter(p => p.status === 'Open').length,
      label: 'Open Projects',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      value: myProjects.reduce((total, p) => total + (p.comments?.length || 0), 0),
      label: 'Total Comments',
      gradient: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />

      {!user ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="glass rounded-3xl shadow-2xl p-8 mb-8 text-white border-2 border-white/20">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-black text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-black mb-2">{user?.name}</h1>
                <p className="text-white/90 mb-1 font-medium">{user?.email}</p>
                <p className="text-white/80 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {user?.college}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h3 className="text-lg font-black mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl font-bold border border-white/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="glass rounded-2xl shadow-xl p-6 card-hover border border-white/20">
                <div className="text-5xl font-black text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-white/90 font-bold text-lg mb-3">{stat.label}</div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`} style={{ width: '100%' }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* My Projects Section */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-4xl font-black text-white">My Projects</h2>
              <Link
                to="/create-project"
                className="relative px-8 py-3 text-lg font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                <span className="relative flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Project
                </span>
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : myProjects.length === 0 ? (
              <div className="glass rounded-2xl shadow-2xl p-12 text-center border border-white/20">
                <svg className="w-24 h-24 mx-auto mb-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-3xl font-black text-white mb-3">
                  No projects yet
                </h3>
                <p className="text-white/80 text-lg mb-8">
                  Start sharing your amazing projects with the community!
                </p>
                <Link
                  to="/create-project"
                  className="inline-block relative px-10 py-4 text-lg font-black text-purple-900 bg-white rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
                >
                  <span className="relative">Create Your First Project</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProjects.map((project) => (
                  <div
                    key={project._id}
                    className="glass rounded-2xl shadow-xl card-hover overflow-hidden border border-white/20"
                  >
                    {project.image && (
                      <div className="mb-4">
                        <img
                          src={(project.image.startsWith('http') ? project.image : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${project.image}`)}
                          alt={project.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-black text-white line-clamp-2 flex-1">
                            {project.title}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-black rounded-full ml-2 ${project.status === 'Open'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-white'
                            }`}>
                            {project.status}
                          </span>
                        </div>

                        {project.category && (
                          <span className={`inline-block px-3 py-1 text-xs font-black rounded-full mb-2 ${project.category === 'Machine Learning' ? 'bg-purple-500/20 text-purple-300 border border-purple-400' :
                              project.category === 'Web Development' ? 'bg-blue-500/20 text-blue-300 border border-blue-400' :
                                project.category === 'Mobile App' ? 'bg-green-500/20 text-green-300 border border-green-400' :
                                  project.category === 'IoT' ? 'bg-orange-500/20 text-orange-300 border border-orange-400' :
                                    project.category === 'Data Science' ? 'bg-pink-500/20 text-pink-300 border border-pink-400' :
                                      'bg-gray-500/20 text-gray-300 border border-gray-400'
                            }`}>
                            {project.category}
                          </span>
                        )}

                        <p className="text-sm text-white/80 line-clamp-3">
                          {project.description}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-black text-white/60 mb-2">TECH STACK</p>
                        <div className="flex flex-wrap gap-2">
                          {project.techStack?.slice(0, 3).map((tech, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-xs font-bold bg-white/10 text-white rounded-full border border-white/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-white/20">
                        <Link
                          to={`/project/${project._id}`}
                          className="flex-1 px-4 py-2 text-center text-sm font-black text-white bg-white/20 rounded-lg hover:bg-white/30 transition border border-white/30"
                        >
                          View
                        </Link>
                        <Link
                          to={`/edit-project/${project._id}`}
                          className="flex-1 px-4 py-2 text-center text-sm font-black text-white bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition border border-blue-400/50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className="flex-1 px-4 py-2 text-sm font-black text-white bg-red-500/20 rounded-lg hover:bg-red-500/30 transition border border-red-400/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
