const Session = require('../models/Session');
const Message = require('../models/Message');

/**
 * Create a new session
 */
exports.createSession = async (req, res) => {
  try {
    const { title } = req.body;
    
    const session = new Session({
      userId: req.user.id,
      title: title || 'New Chat'
    });

    await session.save();

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create session'
    });
  }
};

/**
 * Get all sessions for a user
 */
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .select('title lastMessage messageCount createdAt updatedAt')
      .limit(100);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
};

/**
 * Get a specific session
 */
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

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

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session'
    });
  }
};

/**
 * Update session (rename)
 */
exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, userId: req.user.id },
      { title, updatedAt: Date.now() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update session'
    });
  }
};

/**
 * Delete a session and its messages
 */
exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOneAndDelete({
      _id: sessionId,
      userId: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Delete all messages in this session
    await Message.deleteMany({ sessionId });

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session'
    });
  }
};