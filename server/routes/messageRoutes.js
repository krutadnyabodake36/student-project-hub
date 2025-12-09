const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/conversations', messageController.getConversations);
router.get('/conversation/:userId', messageController.getMessages);
router.post('/send/:userId', messageController.sendMessage);
router.delete('/:messageId', messageController.deleteMessage);
router.get('/unread-count', messageController.getUnreadCount);

module.exports = router;
