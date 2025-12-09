const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// @desc    Get all conversations for user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name profilePicture lastActive')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    
    // Find or create conversation
    const conversation = await Conversation.findOrCreate(
      req.user._id,
      otherUserId
    );

    // Get messages
    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversation._id,
        receiver: req.user._id,
        read: false
      },
      {
        read: true,
        readAt: Date.now()
      }
    );

    // Reset unread count
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();

    res.json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages/send/:userId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const receiverId = req.params.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(
      req.user._id,
      receiverId
    );

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      content: content.trim()
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = Date.now();
    
    // Increment unread count for receiver
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    
    await conversation.save();

    // Create notification for receiver
    receiver.notifications.push({
      type: 'message',
      from: req.user._id,
      message: `sent you a message`
    });
    await receiver.save();

    // Populate sender info
    await message.populate('sender', 'name profilePicture');
    await message.populate('receiver', 'name profilePicture');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      const unread = conv.unreadCount.get(req.user._id.toString()) || 0;
      totalUnread += unread;
    });

    res.json({
      success: true,
      data: { unreadCount: totalUnread }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
