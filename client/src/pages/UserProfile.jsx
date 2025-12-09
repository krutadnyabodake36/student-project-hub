import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { userAPI, projectsAPI } from '../utils/api';
import api from '../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile(id);
      setUser(response.data.data);
      
      // Check if following
      if (currentUser && response.data.data.followers) {
        setIsFollowing(response.data.data.followers.some(
          f => f._id?.toString() === currentUser._id?.toString()
        ));
      }

      // Fetch user's projects
      const projectsRes = await projectsAPI.getAll();
      const userProjects = projectsRes.data.data.filter(
        p => p.author?._id?.toString() === id?.toString()
      );
      setProjects(userProjects);
    } catch (err) {
      // Log for debugging
      console.error('Error:', err);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      return;
    }

    try {
      const response = await userAPI.toggleFollow(id);
      setIsFollowing(response.data.isFollowing);
      setUser(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          followersCount: response.data.followersCount
        }
      }));
      toast.success(response.data.isFollowing ? 'Following!' : 'Unfollowed');
    } catch (err) {
      // Log for debugging
      console.error('Follow error:', err);
      toast.error('Failed to update follow status');
    }
  };

  const handleMessage = () => {
    if (!isAuthenticated) {
      toast.error('Please login to send messages');
      return;
    }
    navigate(`/messages/${id}`);
  };

  const handleEndorse = async (skill) => {
    if (!isAuthenticated) {
      toast.error('Please login to endorse skills');
      return;
    }

    try {
      await userAPI.endorseSkill(id, skill);
      toast.success(`Endorsed ${skill}!`);
      fetchUserProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to endorse');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id?.toString() === id?.toString();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-primary-500 to-purple-600"></div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-4">
              {/* Profile Picture */}
              <div className="relative">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith('http') 
                      ? user.profilePicture 
                      : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${user.profilePicture}`}
                    alt={user.name}
                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-primary-500 flex items-center justify-center text-white text-4xl font-bold">
                    {(user.name?.charAt(0)?.toUpperCase()) || '?'}
                  </div>
                )}
              </div>

              {/* Name and Actions */}
              <div className="flex-1 sm:ml-6 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    <p className="text-gray-600">{user.college}</p>
                    {user.degree && <p className="text-sm text-gray-500">{user.degree} {user.year && `• ${user.year}`}</p>}
                  </div>

                  {/* Action Buttons */}
                  {isOwnProfile ? (
                    <Link
                      to="/profile/edit"
                      className="mt-4 sm:mt-0 px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
                    >
                      Edit Profile
                    </Link>
                  ) : (
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-2 font-medium rounded-lg transition ${
                          isFollowing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-primary-500 text-white hover:bg-primary-600'
                        }`}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                      <button
                        onClick={handleMessage}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                      >
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-gray-700 mt-4 mb-4">{user.bio}</p>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-6 py-4 border-t border-b border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.stats?.projectsCount || 0}</p>
                <p className="text-sm text-gray-600">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.stats?.followersCount || 0}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.stats?.followingCount || 0}</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{user.stats?.totalLikes || 0}</p>
                <p className="text-sm text-gray-600">Total Likes</p>
              </div>
            </div>

            {/* Social Links */}
            {(user.socialLinks?.github || user.socialLinks?.linkedin || user.socialLinks?.portfolio) && (
              <div className="flex items-center space-x-4 mt-4">
                {user.socialLinks.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {user.socialLinks.portfolio && (
                  <a
                    href={user.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-primary-600 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {user.skills && user.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-3">
              {user.skills.map((skill, index) => {
                const endorsementCount = user.endorsements?.filter(e => e.skill === skill).length || 0;
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                      {skill}
                    </span>
                    {endorsementCount > 0 && (
                      <span className="text-sm text-gray-600">
                        {endorsementCount} {endorsementCount === 1 ? 'endorsement' : 'endorsements'}
                      </span>
                    )}
                    {!isOwnProfile && isAuthenticated && (
                      <button
                        onClick={() => handleEndorse(skill)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        +Endorse
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-4 font-medium transition ${
                activeTab === 'projects'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Projects ({projects.length})
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
              >
                {project.image && (
                  <img
                    src={project.image.startsWith('http') 
                      ? project.image 
                      : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${project.image}`}
                    alt={project.title}
                    className="w-full h-36 object-cover rounded-lg mb-4"
                  />
                )}

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {project.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>❤️ {project.likes?.length || 0}</span>
                    <span>👁️ {project.views || 0}</span>
                  </div>
                  <Link
                    to={`/project/${project._id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No projects yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;
