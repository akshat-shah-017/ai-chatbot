const Message = require('../models/Message');
const Session = require('../models/Session');

/**
 * Get messages for a session
 */
exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const query = { sessionId };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

/**
 * Delete a specific message
 */
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: message.sessionId,
      userId: req.user.id
    });

    if (!session) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await message.deleteOne();

    // Update session message count
    const messageCount = await Message.countDocuments({ sessionId: message.sessionId });
    await Session.findByIdAndUpdate(message.sessionId, { messageCount });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

/**
 * Edit a user message
 */
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: message.sessionId,
      userId: req.user.id
    });

    if (!session) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Only allow editing user messages
    if (message.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit usermessages'
});
}
// Store original content if not already edited
if (!message.metadata.isEdited) {
  message.metadata.originalContent = message.content;
}

message.content = content;
message.metadata.isEdited = true;
await message.save();

res.json({
  success: true,
  data: message
});
} catch (error) {
console.error('Edit message error:', error);
res.status(500).json({
success: false,
message: 'Failed to edit message'
});
}
};