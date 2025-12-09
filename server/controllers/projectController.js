const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('author', 'name email college skills')
      .populate('likes', '_id')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('author', 'name email college skills')
      .populate('collaborators.user', 'name email skills')
      .populate('comments.user', 'name');
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // also populate likes with just ids for client convenience
    await project.populate('likes', '_id');

    // Increment views
    project.views += 1;
    await project.save();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Like or unlike a project (toggle)
// @route   POST /api/projects/:id/like
// @access  Private
exports.likeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = project.likes.find(l => l.toString() === userId);

    let liked;
    if (alreadyLiked) {
      // Unlike
      project.likes = project.likes.filter(l => l.toString() !== userId);
      liked = false;
    } else {
      // Like
      project.likes.push(req.user._id);
      liked = true;
    }

    await project.save();

    res.json({
      success: true,
      liked,
      likesCount: project.likes.length,
      data: project
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Increment views (separate endpoint)
// @route   POST /api/projects/:id/view
// @access  Private
exports.incrementViews = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.views = (project.views || 0) + 1;
    await project.save();

    res.json({ success: true, views: project.views });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { title, description, techStack, category, githubLink } = req.body;

    // Handle techStack whether it's a string or array
    let techStackArray = techStack;
    if (typeof techStack === 'string') {
      techStackArray = techStack.split(',').map(tech => tech.trim());
    }

    if (!title || !description || !techStackArray || techStackArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and at least one technology'
      });
    }

    const projectData = {
      title,
      description,
      techStack: techStackArray,
      category,
      githubLink,
      author: req.user._id
    };

    // Handle image if uploaded
    if (req.file) {
      projectData.image = `/uploads/${req.file.filename}`;
    }

    const project = await Project.create(projectData);

    await project.populate('author', 'name email college');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is project owner
    if (project.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project'
      });
    }

    // Prepare update data
    const updateData = {
      title: req.body.title || project.title,
      description: req.body.description || project.description,
      category: req.body.category || project.category,
      githubLink: req.body.githubLink !== undefined ? req.body.githubLink : project.githubLink,
      status: req.body.status || project.status,
    };

    // Handle techStack whether it's a string or array
    if (req.body.techStack) {
      if (typeof req.body.techStack === 'string') {
        updateData.techStack = req.body.techStack.split(',').map(tech => tech.trim());
      } else {
        updateData.techStack = req.body.techStack;
      }
    }

    // Handle image update
    if (req.file) {
      // New image uploaded
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (req.body.removeImage === 'true') {
      // User wants to remove image
      updateData.image = null;
    }
    // If neither, keep existing image (don't update image field)

    project = await Project.findByIdAndUpdate(
      req.params.id, 
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('author', 'name email college');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user is project owner
    if (project.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project'
      });
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project removed'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Request to join project
// @route   POST /api/projects/:id/join
// @access  Private
exports.requestToJoin = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if already requested
    const alreadyRequested = project.joinRequests.find(
      request => request.user.toString() === req.user._id.toString()
    );

    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested to join this project'
      });
    }

    // Check if already a collaborator
    const isCollaborator = project.collaborators.find(
      collab => collab.user.toString() === req.user._id.toString()
    );

    if (isCollaborator) {
      return res.status(400).json({
        success: false,
        message: 'You are already a collaborator'
      });
    }

    project.joinRequests.push({
      user: req.user._id,
      message: req.body.message || 'Would like to join your project'
    });

    await project.save();

    res.json({
      success: true,
      message: 'Join request sent successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please add comment text'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project.comments.push({
      user: req.user._id,
      text
    });

    await project.save();

    res.json({
      success: true,
      data: project.comments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload project image
// @route   POST /api/projects/:id/image
// @access  Private (project owner)
exports.uploadImage = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only project author can upload/change image
    if (project.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload image for this project' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Save the file path (serve via /uploads)
    project.image = `/uploads/${req.file.filename}`;
    await project.save();

    res.json({ success: true, data: { image: project.image } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
