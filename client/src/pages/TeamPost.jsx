import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context';
import { teamPostAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

const TeamPost = () => {
  const { user, isAuthenticated } = useAuth();
  const [teamPosts, setTeamPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    skillsNeeded: '',
    rolesNeeded: '',
    deadline: ''
  });

  useEffect(() => {
    fetchTeamPosts();
  }, [selectedCategory, fetchTeamPosts]);

  const fetchTeamPosts = useCallback(async () => {
    try {
      const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
      const response = await teamPostAPI.getAll(params);
      setTeamPosts(response.data.data);
    } catch (err) {
      console.error('Failed to load team posts', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      const data = {
        ...formData,
        skillsNeeded: formData.skillsNeeded.split(',').map(s => s.trim()),
        rolesNeeded: formData.rolesNeeded ? formData.rolesNeeded.split(',').map(r => ({
          role: r.trim(),
          count: 1
        })) : []
      };

      await teamPostAPI.create(data);
      toast.success('Team post created! 🎉');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        category: 'Web Development',
        skillsNeeded: '',
        rolesNeeded: '',
        deadline: ''
      });
      fetchTeamPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleApply = async (postId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    const message = prompt('Why do you want to join this team?');
    if (!message) return;

    try {
      await teamPostAPI.apply(postId, message);
      toast.success('Application sent! 🚀');
      fetchTeamPosts();
    } catch (err) {
      console.error('Team post error:', err);
      toast.error('Failed to apply');
    }
  };

  const handleLike = async (postId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      await teamPostAPI.toggleLike(postId);
      fetchTeamPosts();
    } catch (err) {
      console.error('Like error:', err);
      toast.error('Failed to like post');
    }
  };

  const categories = ['All', 'Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Data Science', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Find Your Team 👥</h1>
            <p className="text-gray-600 mt-2">Connect with students looking for collaborators</p>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                setShowAuthModal(true);
              } else {
                setShowCreateModal(true);
              }
            }}
            className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
          >
            + Post Team Request
          </button>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter:</span>
            {categories.map((category) => (
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

        {/* Team Posts Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : teamPosts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No team posts yet</h3>
            <p className="text-gray-600 mb-6">Be the first to post a team request!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
            >
              Create Team Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        to={`/user/${post.author._id}`}
                        className="font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {post.author.name}
                      </Link>
                      <p className="text-xs text-gray-500">{post.author.college}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    post.status === 'Open' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {post.description}
                </p>

                {/* Category */}
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 bg-purple-100 text-purple-700">
                  {post.category}
                </span>

                {/* Skills Needed */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">SKILLS NEEDED</p>
                  <div className="flex flex-wrap gap-2">
                    {post.skillsNeeded.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {post.skillsNeeded.length > 3 && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        +{post.skillsNeeded.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="flex items-center space-x-1 hover:text-red-500 transition"
                  >
                    <span>❤️</span>
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <span className="flex items-center space-x-1">
                    <span>👥</span>
                    <span>{post.teamMembers?.length || 0} members</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>📝</span>
                    <span>{post.applications?.length || 0} applications</span>
                  </span>
                </div>

                {/* Action Button */}
                <div className="flex items-center space-x-2">
                  {user?._id === post.author._id ? (
                    <Link
                      to={`/team-post/${post._id}`}
                      className="flex-1 px-4 py-2 text-center bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                    >
                      Manage Applications
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleApply(post._id)}
                      disabled={post.applications?.some(app => app.user === user?._id)}
                      className="flex-1 px-4 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {post.applications?.some(app => app.user === user?._id) ? 'Applied' : 'Apply to Join'}
                    </button>
                  )}
                </div>

                {post.deadline && (
                  <p className="text-xs text-gray-500 mt-3">
                    Deadline: {new Date(post.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Team Post</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Looking for React Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Describe your project and what kind of team members you need..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills Needed (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.skillsNeeded}
                  onChange={(e) => setFormData({ ...formData, skillsNeeded: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="React, Node.js, MongoDB"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roles Needed (comma separated, optional)
                </label>
                <input
                  type="text"
                  value={formData.rolesNeeded}
                  onChange={(e) => setFormData({ ...formData, rolesNeeded: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Frontend Developer, Backend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600"
                >
                  Create Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
};

export default TeamPost;
