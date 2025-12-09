import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { projectsAPI } from '../utils/api';
import { useAuth } from '../context';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [liking, setLiking] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsAPI.getOne(id);
      const proj = response.data.data;
      setProject(proj);

      // compute likes state
      const likesArr = proj.likes || [];
      setLikesCount(likesArr.length || 0);
      if (user) {
        const userId = user._id || user.id;
        const isLiked = likesArr.some(l => {
          if (!l) return false;
          if (typeof l === 'string') return l === userId;
          if (l._id) return l._id === userId;
          return false;
        });
        setLiked(isLiked);
      }
    } catch (error) {
      toast.error('Failed to load project');
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      await projectsAPI.addComment(id, commentText);
      toast.success('Comment added! 💬');
      setCommentText('');
      fetchProject(); // Reload project to show new comment
    } catch (error) {
      toast.error('Failed to add comment');
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRequestJoin = async () => {
    try {
      await projectsAPI.requestJoin(id, 'I would like to join this project!');
      toast.success('Join request sent! ✅');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard! 📋');
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing project: ${project.title}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-6"
        >
          ← Back to Projects
        </Link>

        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          {project.image && (
            <div className="mb-6">
              <img
                src={(project.image.startsWith('http') ? project.image : `${api.defaults.baseURL.replace(/\/api\/?$/,'')}${project.image}`)}
                alt={project.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  project.status === 'Open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
                {project.category && (
                  <span className={`px-3 py-1 rounded-full font-semibold ${
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
                <span className="flex items-center space-x-1">
                  <span>👁️</span>
                  <span>{project.views || 0} views</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>💬</span>
                  <span>{project.comments?.length || 0} comments</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  if (!user) {
                    toast.error('Please login to like projects');
                    return;
                  }

                  try {
                    setLiking(true);
                    const res = await projectsAPI.toggleLike(id);
                    setLiked(res.data.liked);
                    setLikesCount(res.data.likesCount);
                    fetchProject();
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to toggle like');
                    console.error(err);
                  } finally {
                    setLiking(false);
                  }
                }}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition ${
                  liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={liking}
              >
                {liked ? '❤️' : '🤍'} {likesCount}
              </button>

              {user?._id !== project.author?._id && (
                <button
                  onClick={handleRequestJoin}
                  className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
                >
                  Request to Join
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                📋 Copy Link
              </button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Share:</span>
            <button
              onClick={() => handleShare('twitter')}
              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition text-sm font-medium"
            >
              🐦 Twitter
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              💼 LinkedIn
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
            >
              💬 WhatsApp
            </button>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-3 py-4 border-b border-gray-200 mb-6">
            <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {project.author?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">{project.author?.name}</p>
              <p className="text-sm text-gray-600">{project.author?.email}</p>
              <p className="text-sm text-gray-500">{project.author?.college}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              📝 Description
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              🛠️ Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack?.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-medium border border-blue-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* GitHub Link */}
          {project.githubLink && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                💻 Repository
              </h2>
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
          )}
        </div>

        {/* Project Stats Card */}
        <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <h3 className="text-lg font-bold mb-4">📊 Project Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{likesCount}</div>
              <div className="text-sm text-blue-100">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{project.comments?.length || 0}</div>
              <div className="text-sm text-blue-100">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{project.views || 0}</div>
              <div className="text-sm text-blue-100">Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{project.techStack?.length || 0}</div>
              <div className="text-sm text-blue-100">Technologies</div>
            </div>
          </div>
        </div>

        {/* Related Projects Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🔍 Related Projects
          </h2>
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg mb-2">Discover more {project.category} projects!</p>
            <p className="text-sm mb-4">Explore similar projects created by other students</p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
            >
              Browse All Projects →
            </Link>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            💬 Comments ({project.comments?.length || 0})
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 mb-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-3">Please login to comment</p>
              <Link
                to="/login"
                className="inline-block px-6 py-2 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
              >
                Login
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {project.comments?.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-5xl mb-3">💬</div>
                <p className="text-gray-500 text-lg">No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              project.comments?.map((comment) => (
                <div key={comment._id} className="flex space-x-4 pb-6 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {comment.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {comment.user?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;
