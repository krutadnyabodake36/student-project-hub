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
  const [showImageModal, setShowImageModal] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const response = await projectsAPI.getOne(id);
      const proj = response.data.data;
      setProject(proj);

      await projectsAPI.incrementView(id);

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
      navigate('/');
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
      toast.success('Comment added!');
      setCommentText('');
      fetchProject();
    } catch (error) {
      toast.error('Failed to add comment');
      console.error(error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleRequestJoin = async () => {
    if (!user) {
      toast.error('Please login to request join');
      return;
    }

    try {
      await projectsAPI.requestJoin(id, 'I would like to join this project!');
      toast.success('Join request sent!');
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const handleToggleLike = async () => {
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
          <p className="text-white font-bold text-xl">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const imageUrl = project.image
    ? (project.image.startsWith('http') ? project.image : `${api.defaults.baseURL.replace(/\/api\/?$/, '')}${project.image}`)
    : null;

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white hover:text-yellow-300 font-bold mb-6 group transition-colors"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Projects
        </Link>

        {/* Hero Image */}
        {imageUrl && (
          <div className="mb-8 relative group">
            <img
              src={imageUrl}
              alt={project.title}
              className="w-full h-[400px] object-cover rounded-3xl shadow-2xl cursor-pointer"
              onClick={() => setShowImageModal(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <button
                onClick={() => setShowImageModal(true)}
                className="text-white font-bold flex items-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                View Full Size
              </button>
            </div>
          </div>
        )}

        {/* Project Header Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 mb-6 border-2 border-white/20">
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 ${project.status === 'Open'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-500 text-white shadow-lg'
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {project.status}
              </span>

              {project.category && (
                <span className={`px-4 py-2 rounded-full font-black text-sm shadow-lg ${project.category === 'Web Development' ? 'bg-blue-500/20 text-blue-300 border-2 border-blue-400' :
                    project.category === 'Mobile App' ? 'bg-green-500/20 text-green-300 border-2 border-green-400' :
                      project.category === 'Machine Learning' ? 'bg-purple-500/20 text-purple-300 border-2 border-purple-400' :
                        project.category === 'IoT' ? 'bg-orange-500/20 text-orange-300 border-2 border-orange-400' :
                          project.category === 'Data Science' ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-400' :
                            'bg-gray-500/20 text-gray-300 border-2 border-gray-400'
                  }`}>
                  {project.category}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              {project.title}
            </h1>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6 text-white/80">
              <span className="flex items-center gap-2 font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {project.views || 0} views
              </span>
              <span className="flex items-center gap-2 font-bold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {project.comments?.length || 0} comments
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-white/20">
            <button
              onClick={handleToggleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black transition-all transform hover:scale-105 shadow-lg ${liked
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
                  : 'glass text-white border-2 border-white/30'
                }`}
            >
              <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </button>

            {user?._id !== project.author?._id && project.status === 'Open' && (
              <button
                onClick={handleRequestJoin}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Request to Join
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="px-6 py-3 glass text-white font-black rounded-xl hover:bg-white/30 transition-all border-2 border-white/30 shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Link
            </button>

            {user?._id === project.author?._id && (
              <Link
                to={`/edit-project/${project._id}`}
                className="px-6 py-3 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Project
              </Link>
            )}
          </div>
        </div>

        {/* Author Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 mb-6 border-2 border-white/20">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Created By
          </h2>
          <Link
            to={`/user/${project.author?._id}`}
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/10 transition-all group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-transform">
              {project.author?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-black text-xl text-white group-hover:text-yellow-300 transition">
                {project.author?.name}
              </p>
              <p className="text-sm text-white/70">{project.author?.email}</p>
              <p className="text-sm text-white/60 flex items-center gap-1 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {project.author?.college}
              </p>
            </div>
            <svg className="w-6 h-6 text-white/50 group-hover:text-white group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Description Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 mb-6 border-2 border-white/20">
          <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            About This Project
          </h2>
          <p className="text-white/90 text-lg leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* Tech Stack Card */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="glass rounded-3xl shadow-2xl p-8 mb-6 border-2 border-white/20">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-3">
              {project.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-5 py-3 bg-white/10 text-white rounded-xl font-black border-2 border-white/30 hover:border-white/60 transition-all transform hover:scale-105 shadow-lg"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* GitHub Link Card */}
        {project.githubLink && (
          <div className="glass rounded-3xl shadow-2xl p-8 mb-6 border-2 border-white/20">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Source Code
            </h2>
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all transform hover:scale-105 font-black shadow-lg"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        )}

        {/* Comments Section */}
        <div className="glass rounded-3xl shadow-2xl p-8 border-2 border-white/20">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments <span className="text-yellow-300">({project.comments?.length || 0})</span>
          </h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-black flex-shrink-0 shadow-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts about this project..."
                    rows="4"
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all resize-none font-medium"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="relative px-8 py-3 text-lg font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl disabled:opacity-50 transform hover:scale-105 transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                      <span className="relative">{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 mb-8 glass-dark rounded-xl border-2 border-white/30">
              <p className="text-white font-bold mb-4">Please login to leave a comment</p>
              <Link
                to="/login"
                className="inline-block relative px-8 py-3 text-lg font-black text-purple-900 bg-white rounded-xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
              >
                <span className="relative">Login to Comment</span>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {project.comments?.length === 0 ? (
              <div className="text-center py-16 glass-dark rounded-xl">
                <svg className="w-16 h-16 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-white text-xl font-black mb-2">No comments yet</p>
                <p className="text-white/70">Be the first to share your thoughts!</p>
              </div>
            ) : (
              project.comments?.map((comment) => (
                <div key={comment._id} className="flex gap-4 p-6 rounded-xl hover:bg-white/10 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-black flex-shrink-0 shadow-lg">
                    {comment.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-black text-white">
                        {comment.user?.name}
                      </span>
                      <span className="text-sm text-white/60">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/90 bg-white/10 rounded-xl p-4 border border-white/20">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && imageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white glass-dark rounded-full p-3 hover:bg-white/30 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={imageUrl}
            alt={project.title}
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
