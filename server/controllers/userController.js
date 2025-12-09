const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('projects')
      .populate('followers', 'name profilePicture college')
      .populate('following', 'name profilePicture college');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get project stats
    const projects = await Project.find({ author: user._id });
    const totalLikes = projects.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        stats: {
          projectsCount: projects.length,
          totalLikes,
          totalViews,
          followersCount: user.followers.length,
          followingCount: user.following.length
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, college, skills, degree, year, socialLinks } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (college) user.college = college;
    if (skills) user.skills = skills;
    if (degree !== undefined) user.degree = degree;
    if (year !== undefined) user.year = year;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    // Handle profile picture upload
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Follow/Unfollow user
// @route   POST /api/users/:id/follow
// @access  Private
exports.toggleFollow = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user._id);

      // Create notification
      userToFollow.notifications.push({
        type: 'follow',
        from: req.user._id,
        message: `${currentUser.name} started following you`
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save/Unsave project
// @route   POST /api/users/save/:projectId
// @access  Private
exports.toggleSaveProject = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const projectId = req.params.projectId;

    const isSaved = user.savedProjects.includes(projectId);

    if (isSaved) {
      user.savedProjects = user.savedProjects.filter(
        id => id.toString() !== projectId
      );
    } else {
      user.savedProjects.push(projectId);
    }

    await user.save();

    res.json({
      success: true,
      isSaved: !isSaved,
      savedCount: user.savedProjects.length
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get saved projects
// @route   GET /api/users/saved
// @access  Private
exports.getSavedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedProjects',
        populate: { path: 'author', select: 'name email college' }
      });

    res.json({
      success: true,
      data: user.savedProjects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Endorse skill
// @route   POST /api/users/:id/endorse
// @access  Private
exports.endorseSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already endorsed this skill
    const alreadyEndorsed = user.endorsements.find(
      e => e.skill === skill && e.from.toString() === req.user._id.toString()
    );

    if (alreadyEndorsed) {
      return res.status(400).json({
        success: false,
        message: 'You have already endorsed this skill'
      });
    }

    user.endorsements.push({
      skill,
      from: req.user._id
    });

    // Create notification
    user.notifications.push({
      type: 'endorsement',
      from: req.user._id,
      message: `endorsed your ${skill} skill`
    });

    await user.save();

    res.json({
      success: true,
      message: 'Skill endorsed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = async (req, res) => {
  try {
    const { q, skills, college } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { college: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } }
      ];
    }

    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    if (college) {
      query.college = { $regex: college, $options: 'i' };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('notifications.from', 'name profilePicture')
      .populate('notifications.project', 'title')
      .populate('notifications.teamPost', 'title');

    res.json({
      success: true,
      data: user.notifications.sort((a, b) => b.createdAt - a.createdAt)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/users/notifications/:notificationId/read
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    await user.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/users/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.notifications.forEach(notification => {
      notification.read = true;
    });

    await user.save();

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
