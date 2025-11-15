const Message = require('../models/Message');
const Session = require('../models/Session');
const llmService = require('../utils/llmService');
const StreamHandler = require('../utils/streamHandler');
const User = require('../models/User');

/**
 * Send a chat message (non-streaming)
 */
/**
 * Send a chat message (non-streaming)
 */
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, content, fileIds } = req.body;

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

    // Get user preferences
    const user = await User.findById(req.user.id);
    const { temperature, model, systemPrompt } = user.preferences.modelSettings;

    // Format file attachments properly
    let fileAttachments = [];
    if (fileIds && fileIds.length > 0) {
      const FileUpload = require('../models/FileUpload');
      const files = await FileUpload.find({ _id: { $in: fileIds } });
      
      fileAttachments = files.map(file => ({
        fileId: file._id,
        fileName: file.fileName,
        fileType: file.fileType
      }));
    }

    // Save user message
    const userMessage = new Message({
      sessionId,
      role: 'user',
      content,
      fileAttachments: fileAttachments
    });
    await userMessage.save();

    // Get conversation history
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .select('role content')
      .lean();

    // If there are file attachments, inject their content into the context
    if (fileAttachments.length > 0) {
      const FileUpload = require('../models/FileUpload');
      const files = await FileUpload.find({ 
        _id: { $in: fileAttachments.map(f => f.fileId) } 
      });
      
      let fileContext = '\n\n[Attached Files Content]:\n';
      files.forEach(file => {
        fileContext += `\n--- ${file.fileName} ---\n${file.extractedText}\n`;
      });
      
      // Append file content to the last user message
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        lastUserMessage.content += fileContext;
      }
    }

    // Prepare messages for LLM
    const formattedMessages = llmService.prepareMessages(messages, systemPrompt);

    // Get LLM response
    const response = await llmService.chat(formattedMessages, {
      model,
      temperature,
      maxTokens: 2000
    });

    // Save assistant message
    const assistantMessage = new Message({
      sessionId,
      role: 'assistant',
      content: response.content,
      metadata: {
        model: response.model,
        temperature,
        tokens: response.usage?.total_tokens
      }
    });
    await assistantMessage.save();

    // Update session
    await Session.findByIdAndUpdate(sessionId, {
      lastMessage: content.substring(0, 100),
      messageCount: await Message.countDocuments({ sessionId }),
      updatedAt: Date.now()
    });

    res.json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

/**
 * Send a chat message with streaming response
 */
exports.streamMessage = async (req, res) => {
  try {
    const { sessionId, content, fileIds } = req.body;

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

    // Get user preferences
    const user = await User.findById(req.user.id);
    const { temperature, model, systemPrompt } = user.preferences.modelSettings;

    // Format file attachments properly
    let fileAttachments = [];
    if (fileIds && fileIds.length > 0) {
      const FileUpload = require('../models/FileUpload');
      const files = await FileUpload.find({ _id: { $in: fileIds } });
      
      fileAttachments = files.map(file => ({
        fileId: file._id,
        fileName: file.fileName,
        fileType: file.fileType
      }));
    }

    // Save user message with properly formatted attachments
    const userMessage = new Message({
      sessionId,
      role: 'user',
      content,
      fileAttachments: fileAttachments
    });
    await userMessage.save();

    // Get conversation history
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .select('role content')
      .lean();

    // If there are file attachments, inject their content into the context
    if (fileAttachments.length > 0) {
      const FileUpload = require('../models/FileUpload');
      const files = await FileUpload.find({ 
        _id: { $in: fileAttachments.map(f => f.fileId) } 
      });
      
      let fileContext = '\n\n[Attached Files Content]:\n';
      files.forEach(file => {
        fileContext += `\n--- ${file.fileName} ---\n${file.extractedText}\n`;
      });
      
      // Append file content to the last user message
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        lastUserMessage.content += fileContext;
      }
    }

    // Prepare messages for LLM
    const formattedMessages = llmService.prepareMessages(messages, systemPrompt);

    // Setup SSE
    StreamHandler.setupSSE(res);

    // Get streaming response
    const stream = await llmService.streamChat(formattedMessages, {
      model,
      temperature,
      maxTokens: 2000
    });

    // Handle stream and save complete message
    let fullContent = '';
    
    await StreamHandler.handleStream(stream, res, async (content) => {
      fullContent = content;

      // Save assistant message
      const assistantMessage = new Message({
        sessionId,
        role: 'assistant',
        content: fullContent,
        metadata: {
          model,
          temperature
        }
      });
      await assistantMessage.save();

      // Update session
      await Session.findByIdAndUpdate(sessionId, {
        lastMessage: userMessage.content.substring(0, 100),
        messageCount: await Message.countDocuments({ sessionId }),
        updatedAt: Date.now()
      });
    });

  } catch (error) {
    console.error('Stream message error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to stream message'
      });
    }
  }
};

/**
 * Regenerate last assistant response
 */
exports.regenerateResponse = async (req, res) => {
  try {
    const { sessionId } = req.body;

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

    // Get last assistant message
    const lastAssistantMessage = await Message.findOne({
      sessionId,
      role: 'assistant'
    }).sort({ createdAt: -1 });

    if (!lastAssistantMessage) {
      return res.status(404).json({
        success: false,
        message: 'No assistant message to regenerate'
      });
    }

    // Delete last assistant message
    await lastAssistantMessage.deleteOne();

    // Get user preferences
    const user = await User.findById(req.user.id);
    const { temperature, model, systemPrompt } = user.preferences.modelSettings;

    // Get conversation history (without deleted message)
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .select('role content')
      .lean();

    // Prepare messages for LLM
    const formattedMessages = llmService.prepareMessages(messages, systemPrompt);

    // Get new LLM response
    const response = await llmService.chat(formattedMessages, {
      model,
      temperature,
      maxTokens: 2000
    });

    // Save new assistant message
    const newAssistantMessage = new Message({
      sessionId,
      role: 'assistant',
      content: response.content,
      metadata: {
        model: response.model,
        temperature,
        tokens: response.usage?.total_tokens
      }
    });
    await newAssistantMessage.save();

    res.json({
      success: true,
      data: newAssistantMessage
    });
  } catch (error) {
    console.error('Regenerate response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate response'
    });
  }
};
