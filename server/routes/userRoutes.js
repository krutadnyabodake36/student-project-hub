const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserProfile);

// Protected routes
router.put('/profile', protect, upload.single('profilePicture'), userController.updateProfile);
router.post('/:id/follow', protect, userController.toggleFollow);
router.post('/save/:projectId', protect, userController.toggleSaveProject);
router.get('/saved/projects', protect, userController.getSavedProjects);
router.post('/:id/endorse', protect, userController.endorseSkill);

// Notifications
router.get('/notifications/all', protect, userController.getNotifications);
router.put('/notifications/read-all', protect, userController.markAllNotificationsRead);
router.put('/notifications/:notificationId/read', protect, userController.markNotificationRead);

module.exports = router;
