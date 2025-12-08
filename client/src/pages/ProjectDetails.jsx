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
  }, [id, navigate]);

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
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            </div>
          )}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className={`px-3 py-1 rounded-full font-semibold ${
                  project.status === 'Open' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
                {project.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {project.category}
                  </span>
                )}
                <span>👁️ {project.views || 0} views</span>
              </div>
            </div>

            {user?._id !== project.author?._id && (
              <button
                onClick={handleRequestJoin}
                className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
              >
                Request to Join
              </button>
            )}
            <div className="ml-4 flex items-center space-x-2">
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
                    // optionally refresh project comments/other data
                    fetchProject();
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to toggle like');
                    console.error(err);
                  } finally {
                    setLiking(false);
                  }
                }}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition ${liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}
                disabled={liking}
              >
                {liked ? '♥' : '♡'} {likesCount}
              </button>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-3 py-4 border-t border-b border-gray-200 my-6">
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {project.author?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{project.author?.name}</p>
              <p className="text-sm text-gray-600">{project.author?.college}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack?.map((tech, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* GitHub Link */}
          {project.githubLink && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Repository</h2>
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({project.comments?.length || 0})
          </h2>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-8">
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
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {project.comments?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment! 💬
              </p>
            ) : (
              project.comments?.map((comment) => (
                <div key={comment._id} className="flex space-x-4 pb-6 border-b border-gray-100 last:border-0">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {comment.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {comment.user?.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
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
