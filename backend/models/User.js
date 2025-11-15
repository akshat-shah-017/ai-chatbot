const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  preferences: {
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light'
  },
  modelSettings: {
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    model: {
      type: String,
      default: 'openai/gpt-3.5-turbo'  // Or any OpenRouter model
    },
    systemPrompt: {
      type: String,
      default: 'You are a helpful assistant.'
    }
  }
},
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);