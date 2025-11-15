const Session = require('../models/Session');
const Message = require('../models/Message');

/**
 * Get user analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total sessions
    const totalSessions = await Session.countDocuments({ userId });

    // Total messages
    const sessions = await Session.find({ userId }).select('_id');
    const sessionIds = sessions.map(s => s._id);
    const totalMessages = await Message.countDocuments({
      sessionId: { $in: sessionIds }
    });

    // Messages by role
    const userMessages = await Message.countDocuments({
      sessionId: { $in: sessionIds },
      role: 'user'
    });

    const assistantMessages = await Message.countDocuments({
      sessionId: { $in: sessionIds },
      role: 'assistant'
    });

    // Most active sessions
    const topSessions = await Session.find({ userId })
      .sort({ messageCount: -1 })
      .limit(5)
      .select('title messageCount updatedAt');

    // Messages over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messagesByDay = await Message.aggregate([
      {
        $match: {
          sessionId: { $in: sessionIds },
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Average messages per session
    const avgMessagesPerSession = totalSessions > 0
      ? (totalMessages / totalSessions).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        totalSessions,
        totalMessages,
        userMessages,
        assistantMessages,
        avgMessagesPerSession,
        topSessions,
        messagesByDay
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics'
    });
  }
};
