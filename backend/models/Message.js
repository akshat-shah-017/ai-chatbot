const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 50000
  },
  fileAttachments: [{
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FileUpload'
    },
    fileName: String,
    fileType: String
  }],
  metadata: {
    model: String,
    temperature: Number,
    tokens: Number,
    isEdited: {
      type: Boolean,
      default: false
    },
    originalContent: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound index for efficient message retrieval
messageSchema.index({ sessionId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);