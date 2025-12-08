const TeamRequest = require('../models/TeamRequest');

// @desc    Get all team requests
// @route   GET /api/teams
// @access  Public
exports.getTeamRequests = async (req, res) => {
  try {
    const teamRequests = await TeamRequest.find({ status: 'Open' })
      .populate('author', 'name email college skills')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teamRequests.length,
      data: teamRequests
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single team request
// @route   GET /api/teams/:id
// @access  Public
exports.getTeamRequest = async (req, res) => {
  try {
    const teamRequest = await TeamRequest.findById(req.params.id)
      .populate('author', 'name email college skills')
      .populate('applicants.user', 'name email skills');

    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found'
      });
    }

    res.json({
      success: true,
      data: teamRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create team request
// @route   POST /api/teams
// @access  Private
exports.createTeamRequest = async (req, res) => {
  try {
    const { projectIdea, description, skillsNeeded } = req.body;

    // Validation
    if (!projectIdea || !description || !skillsNeeded || !Array.isArray(skillsNeeded) || skillsNeeded.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide projectIdea, description, and at least one skill'
      });
    }

    const teamRequest = await TeamRequest.create({
      projectIdea,
      description,
      skillsNeeded,
      author: req.user._id
    });

    res.status(201).json({
      success: true,
      data: teamRequest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Apply to team request
// @route   POST /api/teams/:id/apply
// @access  Private
exports.applyToTeam = async (req, res) => {
  try {
    const teamRequest = await TeamRequest.findById(req.params.id);

    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found'
      });
    }

    // Check if already applied
    const alreadyApplied = teamRequest.applicants.find(
      applicant => applicant.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this team'
      });
    }

    teamRequest.applicants.push({
      user: req.user._id,
      message: req.body.message || 'I would like to join your team'
    });

    await teamRequest.save();

    res.json({
      success: true,
      message: 'Application sent successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete team request
// @route   DELETE /api/teams/:id
// @access  Private
exports.deleteTeamRequest = async (req, res) => {
  try {
    const teamRequest = await TeamRequest.findById(req.params.id);

    if (!teamRequest) {
      return res.status(404).json({
        success: false,
        message: 'Team request not found'
      });
    }

    // Check if user is author
    if (teamRequest.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await teamRequest.deleteOne();

    res.json({
      success: true,
      message: 'Team request removed'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
