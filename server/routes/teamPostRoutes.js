const express = require('express');
const router = express.Router();
const teamPostController = require('../controllers/teamPostController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', teamPostController.getTeamPosts);
router.get('/:id', teamPostController.getTeamPost);

// Protected routes
router.post('/', protect, teamPostController.createTeamPost);
router.put('/:id', protect, teamPostController.updateTeamPost);
router.delete('/:id', protect, teamPostController.deleteTeamPost);
router.post('/:id/apply', protect, teamPostController.applyToTeamPost);
router.put('/:id/application/:applicationId', protect, teamPostController.updateApplicationStatus);
router.post('/:id/like', protect, teamPostController.toggleLikeTeamPost);

module.exports = router;
