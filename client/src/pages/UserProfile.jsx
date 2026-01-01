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

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await userAPI.getProfile(id);
      setUser(response.data.data);

      if (currentUser && response.data.data.followers) {
        setIsFollowing(response.data.data.followers.some(
          f => f._id?.toString() === currentUser._id?.toString()
        ));
      }

      const projectsRes = await projectsAPI.getAll();
      const userProjects = projectsRes.data.data.filter(
        p => p.author?._id?.toString() === id?.toString()
      );
      setProjects(userProjects);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

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
      <div className="min-h-screen animated-gradient">
        <Navbar />
        <div className="flex flex-col justify-center items-center py-20">
          <div className="relative mb-4">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-white font-bold text-xl">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen animated-gradient">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <svg className="w-24 h-24 mx-auto mb-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-4xl font-black text-white mb-3">User not found</h2>
          <p className="text-white/80 text-lg mb-8">This profile doesn't exist or has been removed</p>
          <Link
            to="/"
            className="inline-block relative px-10 py-4 text-lg font-black text-purple-900 bg-white rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
          >
            <span className="relative">Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id?.toString() === id?.toString();

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="glass rounded-3xl shadow-2xl overflow-hidden mb-6 border-2 border-white/20">
          {/* Banner */}
          <div className="h-48 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 mb-6">
              {/* Profile Picture */}
              <div className="relative group">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith('http')
                      ? user.profilePicture
                      : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${user.profilePicture}`}
                    alt={user.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover shadow-2xl group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gradient-to-br from-yellow-400 to-pink-600 flex items-center justify-center text-white text-5xl md:text-6xl font-black shadow-2xl group-hover:scale-105 transition-transform">
                    {(user.name?.charAt(0)?.toUpperCase()) || '?'}
                  </div>
                )}
              </div>

              {/* Name and Actions */}
              <div className="flex-1 md:ml-6 mt-4 md:mt-0 w-full">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                      {user.name}
                    </h1>
                    <div className="space-y-1">
                      <p className="text-white/90 font-medium flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {user.college}
                      </p>
                      {user.degree && (
                        <p className="text-sm text-white/70 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          {user.degree} {user.year && `• ${user.year}`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {isOwnProfile ? (
                    <Link
                      to="/profile/edit"
                      className="relative px-8 py-3 text-lg font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                      <span className="relative flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-3 font-black rounded-xl transition-all transform hover:scale-105 shadow-lg ${isFollowing
                            ? 'glass text-white border-2 border-white/30'
                            : 'bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white'
                          }`}
                      >
                        {isFollowing ? 'Following' : '+ Follow'}
                      </button>
                      <button
                        onClick={handleMessage}
                        className="px-6 py-3 glass text-white font-black rounded-xl hover:bg-white/30 transition-all shadow-lg border-2 border-white/30 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="glass-dark rounded-xl p-4 mb-6 border border-white/20">
                <p className="text-white/90 leading-relaxed">{user.bio}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-dark rounded-xl p-4 text-white text-center transform hover:scale-105 transition-all shadow-lg border border-white/20">
                <p className="text-4xl font-black mb-1">{user.stats?.projectsCount || 0}</p>
                <p className="text-sm text-white/80 font-bold">Projects</p>
              </div>
              <div className="glass-dark rounded-xl p-4 text-white text-center transform hover:scale-105 transition-all shadow-lg border border-white/20">
                <p className="text-4xl font-black mb-1">{user.stats?.followersCount || 0}</p>
                <p className="text-sm text-white/80 font-bold">Followers</p>
              </div>
              <div className="glass-dark rounded-xl p-4 text-white text-center transform hover:scale-105 transition-all shadow-lg border border-white/20">
                <p className="text-4xl font-black mb-1">{user.stats?.followingCount || 0}</p>
                <p className="text-sm text-white/80 font-bold">Following</p>
              </div>
              <div className="glass-dark rounded-xl p-4 text-white text-center transform hover:scale-105 transition-all shadow-lg border border-white/20">
                <p className="text-4xl font-black mb-1">{user.stats?.totalLikes || 0}</p>
                <p className="text-sm text-white/80 font-bold">Total Likes</p>
              </div>
            </div>

            {/* Social Links */}
            {(user.socialLinks?.github || user.socialLinks?.linkedin || user.socialLinks?.portfolio) && (
              <div className="flex items-center gap-3 pt-6 border-t border-white/20">
                <span className="text-sm font-black text-white">Connect:</span>
                {user.socialLinks.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all transform hover:scale-110 shadow-lg"
                    title="GitHub"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg"
                    title="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
                {user.socialLinks.portfolio && (
                  <a
                    href={user.socialLinks.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-110 shadow-lg"
                    title="Portfolio"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="glass rounded-3xl shadow-2xl p-6 md:p-8 mb-6 border-2 border-white/20">
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Skills & Expertise
            </h3>
            <div className="flex flex-wrap gap-3">
              {user.skills.map((skill, index) => {
                const endorsementCount = user.endorsements?.filter(e => e.skill === skill).length || 0;
                return (
                  <div key={index} className="group relative">
                    <div className="flex items-center gap-2 px-5 py-3 bg-white/10 rounded-xl border-2 border-white/30 hover:border-white/60 transition-all">
                      <span className="font-black text-white">{skill}</span>
                      {endorsementCount > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-400 text-purple-900 text-xs font-black rounded-full">
                          {endorsementCount}
                        </span>
                      )}
                    </div>
                    {!isOwnProfile && isAuthenticated && (
                      <button
                        onClick={() => handleEndorse(skill)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 text-purple-900 rounded-full opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 shadow-lg flex items-center justify-center"
                        title={`Endorse ${skill}`}
                      >
                        <span className="text-xs font-black">+</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="glass rounded-3xl shadow-2xl mb-6 border-2 border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/20">
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Projects ({projects.length})
            </h3>
          </div>

          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-24 h-24 mx-auto mb-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="text-2xl font-black text-white mb-2">
                  {isOwnProfile ? 'No projects yet' : `${user.name} hasn't created any projects yet`}
                </h3>
                <p className="text-white/80 mb-6">
                  {isOwnProfile ? 'Share your amazing work with the community!' : 'Check back later for updates'}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/create-project"
                    className="inline-block relative px-10 py-4 text-lg font-black text-purple-900 bg-white rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
                  >
                    <span className="relative">Create Your First Project</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="glass-dark rounded-2xl shadow-xl card-hover overflow-hidden border border-white/20"
                  >
                    {project.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={project.image.startsWith('http')
                            ? project.image
                            : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${project.image}`}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <h3 className="text-xl font-black text-white mb-2 line-clamp-2">
                        {project.title}
                      </h3>

                      <p className="text-sm text-white/80 mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center gap-4 text-sm font-bold text-white/80">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {project.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {project.views || 0}
                          </span>
                        </div>
                        <Link
                          to={`/project/${project._id}`}
                          className="px-4 py-2 bg-white text-purple-600 text-sm font-black rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
