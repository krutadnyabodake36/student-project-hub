import { useState, useEffect, useCallback } from 'react';
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

  const fetchTeams = useCallback(async () => {
    try {
      const response = await teamsAPI.getAll();
      setTeams(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      toast.error('Failed to load team requests');
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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
      toast.success('Team request posted successfully!');
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
      toast.success('Application sent successfully!');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-5xl font-black text-white mb-2">Find Your Team</h1>
              <p className="text-white/90 text-lg font-medium">
                Connect with students looking for teammates or post your own request
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="relative px-8 py-4 text-lg font-black text-purple-900 rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
              <span className="relative flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post Team Request
              </span>
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-10 h-10 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : teams.length === 0 ? (
          <div className="glass rounded-3xl shadow-2xl p-12 text-center">
            <svg className="w-24 h-24 mx-auto mb-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-3xl font-black text-white mb-3">
              No team requests yet
            </h3>
            <p className="text-white/80 text-lg mb-8">
              Be the first to post a team request!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="relative px-10 py-4 text-lg font-black text-purple-900 rounded-2xl overflow-hidden group shadow-2xl transform hover:scale-105 transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
              <span className="relative">Post Team Request</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team._id}
                className="glass rounded-2xl shadow-xl card-hover p-6 border border-white/20"
              >
                {/* Team Header */}
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-white mb-2">
                    {team.projectIdea}
                  </h3>
                  <p className="text-sm text-white/80 mb-4">
                    {team.description}
                  </p>
                </div>

                {/* Skills Needed */}
                <div className="mb-4">
                  <p className="text-xs font-black text-white/60 mb-2">
                    SKILLS REQUIRED
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {team.skillsNeeded?.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-bold bg-green-500/20 text-green-300 rounded-full border border-green-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {team.author?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {team.author?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-white/60">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {user?._id?.toString() !== team.author?._id?.toString() && (
                      <button
                        onClick={() => handleApply(team._id)}
                        className="px-5 py-2 text-sm font-black text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {/* Applicants Count */}
                  {team.applicants && team.applicants.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-white/70 font-medium">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="glass-dark rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-white">
                  Post Team Request
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/70 hover:text-white transition-all hover:rotate-90 transform duration-300"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Project Idea *
                  </label>
                  <input
                    type="text"
                    name="projectIdea"
                    required
                    value={formData.projectIdea}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                    placeholder="AI-Powered Study Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all resize-none font-medium"
                    placeholder="Describe your project idea and what you're looking for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Skills Needed (comma separated) *
                  </label>
                  <input
                    type="text"
                    name="skillsNeeded"
                    required
                    value={formData.skillsNeeded}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-yellow-400 focus:bg-white/20 transition-all font-medium"
                    placeholder="React, Python, Machine Learning, UI/UX Design"
                  />
                  <p className="text-xs text-white/60 mt-2 font-medium">
                    List the skills you're looking for in team members
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-4 glass text-white font-black rounded-xl hover:bg-white/30 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="relative flex-1 px-6 py-4 text-lg font-black text-purple-900 rounded-xl overflow-hidden group shadow-2xl disabled:opacity-50 transform hover:scale-105 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-110 transition-transform"></div>
                    <span className="relative">{submitting ? 'Posting...' : 'Post Request'}</span>
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
