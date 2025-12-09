const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes (no authentication required)
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);

// Protected routes (authentication required)
router.post('/', protect, upload.single('image'), projectController.createProject);
router.put('/:id', protect, upload.single('image'), projectController.updateProject);
router.delete('/:id', protect, projectController.deleteProject);
router.post('/:id/comments', protect, projectController.addComment);
router.post('/:id/join', protect, projectController.requestToJoin);
router.post('/:id/like', protect, projectController.likeProject);
router.post('/:id/view', projectController.incrementViews); // Public - anyone can view
router.post('/:id/image', protect, upload.single('image'), projectController.uploadImage);

module.exports = router;
