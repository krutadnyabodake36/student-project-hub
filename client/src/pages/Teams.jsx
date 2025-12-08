import { useState, useEffect } from 'react';
import { useAuth } from '../context';
import { teamsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    projectIdea: '',
    description: '',
    skillsNeeded: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await teamsAPI.getAll();
      setTeams(response.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load team requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const teamData = {
        ...formData,
        skillsNeeded: formData.skillsNeeded.split(',').map(skill => skill.trim()),
      };

      await teamsAPI.create(teamData);
      toast.success('Team request posted! 🎉');
      setShowCreateModal(false);
      setFormData({ projectIdea: '', description: '', skillsNeeded: '' });
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (teamId) => {
    try {
      await teamsAPI.apply(teamId, 'I would like to join your team!');
      toast.success('Application sent! ✅');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Your Team 👥</h1>
              <p className="text-gray-600 mt-2">
                Connect with students looking for teammates or post your own request
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
            >
              + Post Team Request
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No team requests yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to post a team request!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition"
            >
              Post Team Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100"
              >
                {/* Team Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {team.projectIdea}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {team.description}
                  </p>
                </div>

                {/* Skills Needed */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    LOOKING FOR
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {team.skillsNeeded?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {team.author?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {team.author?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {user?._id !== team.author?._id && (
                      <button
                        onClick={() => handleApply(team._id)}
                        className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {/* Applicants Count */}
                  {team.applicants && team.applicants.length > 0 && (
                    <div className="mt-3 text-xs text-gray-500">
                      {team.applicants.length} {team.applicants.length === 1 ? 'applicant' : 'applicants'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Post Team Request
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Idea *
                  </label>
                  <input
                    type="text"
                    name="projectIdea"
                    required
                    value={formData.projectIdea}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="AI-Powered Study Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition resize-none"
                    placeholder="Describe your project idea and what you're looking for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Needed (comma separated) *
                  </label>
                  <input
                    type="text"
                    name="skillsNeeded"
                    required
                    value={formData.skillsNeeded}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="React, Python, Machine Learning, UI/UX Design"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    List the skills you're looking for in team members
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
                  >
                    {submitting ? 'Posting...' : 'Post Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
