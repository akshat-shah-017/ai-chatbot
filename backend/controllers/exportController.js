const Session = require('../models/Session');
const Message = require('../models/Message');

/**
 * Export session as JSON
 */
exports.exportSessionJSON = async (req, res) => {
  try {
    const { sessionId } = req.params;

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

    // Get all messages
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();

    const exportData = {
      session: {
        id: session._id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
        metadata: msg.metadata
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${session.title}_export.json"`);
    res.json(exportData);
  } catch (error) {
    console.error('Export JSON error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export session'
    });
  }
};

/**
 * Export session as Markdown
 */
exports.exportSessionMarkdown = async (req, res) => {
  try {
    const { sessionId } = req.params;

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

    // Get all messages
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();

    // Generate Markdown
    let markdown = `# ${session.title}\n\n`;
    markdown += `**Created:** ${session.createdAt.toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    for (const msg of messages) {
      const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
      const date = new Date(msg.createdAt).toLocaleString();
      
      markdown += `## ${role}\n`;
      markdown += `*${date}*\n\n`;
      markdown += `${msg.content}\n\n`;
      markdown += `---\n\n`;
    }

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${session.title}_export.md"`);
    res.send(markdown);
  } catch (error) {
    console.error('Export Markdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export session'
    });
  }
};

/**
 * Import session from JSON
 */
exports.importSession = async (req, res) => {
  try {
    const { sessionData } = req.body;

    if (!sessionData || !sessionData.messages) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session data'
      });
    }

    // Create new session
    const session = new Session({
      userId: req.user.id,
      title: sessionData.session?.title || 'Imported Chat'
    });
    await session.save();

    // Import messages
    const messages = sessionData.messages.map(msg => ({
      sessionId: session._id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt || Date.now(),
      metadata: msg.metadata || {}
    }));

    await Message.insertMany(messages);

    // Update session stats
    await Session.findByIdAndUpdate(session._id, {
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100) || ''
    });

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Import session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import session'
    });
  }
};
