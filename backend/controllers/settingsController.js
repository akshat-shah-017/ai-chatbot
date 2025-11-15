const User = require('../models/User');

/**
 * Get user settings
 */
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');

    res.json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

/**
 * Update user settings
 */
exports.updateSettings = async (req, res) => {
  try {
    const { theme, modelSettings } = req.body;

    const updateData = {};

    if (theme) {
      updateData['preferences.theme'] = theme;
    }

    if (modelSettings) {
      if (modelSettings.temperature !== undefined) {
        updateData['preferences.modelSettings.temperature'] = Math.max(0, Math.min(2, modelSettings.temperature));
      }
      if (modelSettings.model) {
        updateData['preferences.modelSettings.model'] = modelSettings.model;
      }
      if (modelSettings.systemPrompt !== undefined) {
        updateData['preferences.modelSettings.systemPrompt'] = modelSettings.systemPrompt;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('preferences');

    res.json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};
