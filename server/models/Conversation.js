const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure only 2 participants and no duplicates
conversationSchema.index({ participants: 1 }, { unique: true });

// Find or create conversation between two users
conversationSchema.statics.findOrCreate = async function(user1Id, user2Id) {
  const participants = [user1Id, user2Id].sort();
  
  let conversation = await this.findOne({
    participants: { $all: participants, $size: 2 }
  });
  
  if (!conversation) {
    conversation = await this.create({
      participants,
      unreadCount: {
        [user1Id]: 0,
        [user2Id]: 0
      }
    });
  }
  
  return conversation;
};

module.exports = mongoose.model('Conversation', conversationSchema);
