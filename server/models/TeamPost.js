const mongoose = require('mongoose');

const teamPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Web Development', 'Mobile App', 'Machine Learning', 'IoT', 'Data Science', 'Other'],
    required: true
  },
  skillsNeeded: [{
    type: String,
    required: true
  }],
  rolesNeeded: [{
    role: String,
    count: Number,
    filled: {
      type: Number,
      default: 0
    }
  }],
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open'
  },
  applications: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  projectLink: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  deadline: {
    type: Date
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
teamPostSchema.index({ author: 1, status: 1 });
teamPostSchema.index({ skillsNeeded: 1 });
teamPostSchema.index({ category: 1 });

module.exports = mongoose.model('TeamPost', teamPostSchema);
