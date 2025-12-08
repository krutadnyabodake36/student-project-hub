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
      // Filter only projects created by current user
      const userProjects = response.data.data.filter(
        project => project.author._id === user._id
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {!user ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <span className="text-5xl font-bold text-primary-500">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
              <p className="text-white/90 mb-1">{user?.email}</p>
              <p className="text-white/80">{user?.college}</p>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-primary-500 mb-2">
              {myProjects.length}
            </div>
            <div className="text-gray-600 font-medium">Total Projects</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {myProjects.filter(p => p.status === 'Open').length}
            </div>
            <div className="text-gray-600 font-medium">Open Projects</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {myProjects.reduce((total, p) => total + (p.comments?.length || 0), 0)}
            </div>
            <div className="text-gray-600 font-medium">Total Comments</div>
          </div>
        </div>

        {/* My Projects Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
            <Link
              to="/create-project"
              className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
            >
              + New Project
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : myProjects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start sharing your amazing projects with the community!
              </p>
              <Link
                to="/create-project"
                className="inline-block px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
              >
                Create Your First Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
                <div
                  key={project._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
                >
                  {project.image && (
                    <div className="mb-4">
                      <img
                        src={(project.image.startsWith('http') ? project.image : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${project.image}`)}
                        alt={project.title}
                        className="w-full h-36 object-cover rounded-lg mb-4"
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">
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
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full mb-2">
                        {project.category}
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
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Link
                      to={`/project/${project._id}`}
                      className="flex-1 px-4 py-2 text-center text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit-project/${project._id}`}
                      className="flex-1 px-4 py-2 text-center text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
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
