const TeamPost = require('../models/TeamPost');
const User = require('../models/User');

// @desc    Get all team posts
// @route   GET /api/team-posts
// @access  Public
exports.getTeamPosts = async (req, res) => {
  try {
    const { status, category, skills } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (skills) {
      const skillsArray = skills.split(',');
      query.skillsNeeded = { $in: skillsArray };
    }

    const teamPosts = await TeamPost.find(query)
      .populate('author', 'name profilePicture college')
      .populate('teamMembers', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teamPosts.length,
      data: teamPosts
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single team post
// @route   GET /api/team-posts/:id
// @access  Public
exports.getTeamPost = async (req, res) => {
  try {
    const teamPost = await TeamPost.findById(req.params.id)
      .populate('author', 'name profilePicture college email')
      .populate('teamMembers', 'name profilePicture college')
      .populate('applications.user', 'name profilePicture college skills')
      .populate('projectLink');

    if (!teamPost) {
      return res.status(404).json({
        success: false,
        message: 'Team post not found'
      });
    }

    // Increment views
    teamPost.views += 1;
    await teamPost.save();

    res.json({
      success: true,
      data: teamPost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create team post
// @route   POST /api/team-posts
// @access  Private
exports.createTeamPost = async (req, res) => {
  try {
    const { title, description, category, skillsNeeded, rolesNeeded, deadline } = req.body;

    if (!title || !description || !category || !skillsNeeded) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const teamPost = await TeamPost.create({
      title,
      description,
      category,
      skillsNeeded,
      rolesNeeded: rolesNeeded || [],
      deadline,
      author: req.user._id
    });

    await teamPost.populate('author', 'name profilePicture college');

    res.status(201).json({
      success: true,
      message: 'Team post created successfully',
      data: teamPost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update team post
// @route   PUT /api/team-posts/:id
// @access  Private
exports.updateTeamPost = async (req, res) => {
  try {
    let teamPost = await TeamPost.findById(req.params.id);

    if (!teamPost) {
      return res.status(404).json({
        success: false,
        message: 'Team post not found'
      });
    }

    // Check ownership
    if (teamPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    teamPost = await TeamPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name profilePicture college');

    res.json({
      success: true,
      message: 'Team post updated successfully',
      data: teamPost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete team post
// @route   DELETE /api/team-posts/:id
// @access  Private
exports.deleteTeamPost = async (req, res) => {
  try {
    const teamPost = await TeamPost.findById(req.params.id);

    if (!teamPost) {
      return res.status(404).json({
        success: false,
        message: 'Team post not found'
      });
    }

    // Check ownership
    if (teamPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await teamPost.deleteOne();

    res.json({
      success: true,
      message: 'Team post deleted'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Apply to team post
// @route   POST /api/team-posts/:id/apply
// @access  Private
exports.applyToTeamPost = async (req, res) => {
  try {
    const { message } = req.body;
    const teamPost = await TeamPost.findById(req.params.id);

    if (!teamPost) {
      return res.status(404).json({
        success: false,
        message: 'Team post not found'
      });
    }

    // Check if already applied
    const alreadyApplied = teamPost.applications.find(
      app => app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this post'
      });
    }

    // Check if already a team member
    if (teamPost.teamMembers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a team member'
      });
    }

    teamPost.applications.push({
      user: req.user._id,
      message: message || 'I would like to join your team'
    });

    await teamPost.save();

    // Create notification for author
    const author = await User.findById(teamPost.author);
    author.notifications.push({
      type: 'team_invite',
      from: req.user._id,
      teamPost: teamPost._id,
      message: `applied to join your team post: ${teamPost.title}`
    });
    await author.save();

    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept/Reject application
// @route   PUT /api/team-posts/:id/application/:applicationId
// @access  Private
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const teamPost = await TeamPost.findById(req.params.id);

    if (!teamPost) {
      return res.status(404).json({
        success: false,
        message: 'Team post not found'
      });
    }

    // Check ownership
    if (teamPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const application = teamPost.applications.id(req.params.applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;

    // If accepted, add to team members
    if (status === 'accepted') {
      teamPost.teamMembers.push(application.user);

      // Create notification
      const applicant = await User.findById(application.user);
      applicant.notifications.push({
        type: 'team_invite',
        from: req.user._id,
        teamPost: teamPost._id,
        message: `accepted your application for: ${teamPost.title}`
      });
      await applicant.save();
    }

    await teamPost.save();

    res.json({
      success: true,
      message: `Application ${status}`,
      data: teamPost
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Like/Unlike team post
// @route   POST /api/team-posts/:id/like
// @access  Private
exports.toggleLikeTeamPost = async (req, res) => {
  try {
    const teamPost = await TeamPost.findById(req.params.id);

    if (!teamPost) {
      return res.status(404).json({
        success: false,
        message: 'Team post not found'
      });
    }

    const isLiked = teamPost.likes.includes(req.user._id);

    if (isLiked) {
      teamPost.likes = teamPost.likes.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      teamPost.likes.push(req.user._id);
    }

    await teamPost.save();

    res.json({
      success: true,
      liked: !isLiked,
      likesCount: teamPost.likes.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
