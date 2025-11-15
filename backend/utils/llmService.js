const axios = require('axios');
const ContextManager = require('./contextManager');

/**
 * LLM Service - Handles interactions with OpenRouter API
 */
class LLMService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.siteName = process.env.SITE_NAME || 'AI Chatbot';
    this.siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  }

  /**
   * Send a chat completion request
   * @param {Array} messages - Conversation history
   * @param {Object} options - Model settings
   * @returns {Object} Response from LLM
   */
  async chat(messages, options = {}) {
    const {
      model = 'openai/gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 1000,
      stream = false
    } = options;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.siteUrl,
            'X-Title': this.siteName
          },
          responseType: stream ? 'stream' : 'json'
        }
      );

      if (stream) {
        return response.data; // Return stream
      }

      return {
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model
      };
    } catch (error) {
      console.error('LLM Service Error:', error.response?.data || error.message);
      throw new Error('Failed to get response from LLM');
    }
  }

  /**
   * Stream a chat completion
   * @param {Array} messages - Conversation history
   * @param {Object} options - Model settings
   * @returns {Stream} Response stream
   */
  async streamChat(messages, options = {}) {
    const {
      model = 'openai/gpt-3.5-turbo',
      temperature = 0.7,
      maxTokens = 1000
    } = options;

    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': this.siteUrl,
            'X-Title': this.siteName
          },
          responseType: 'stream'
        }
      );

      return response.data;
    } catch (error) {
      console.error('LLM Stream Error:', error.response?.data || error.message);
      throw new Error('Failed to stream response from LLM');
    }
  }

  /**
   * Prepare messages with context management
   * @param {Array} dbMessages - Messages from database
   * @param {String} systemPrompt - System prompt
   * @returns {Array} Formatted messages
   */
  prepareMessages(dbMessages, systemPrompt = null) {
    return ContextManager.prepareContext(dbMessages, systemPrompt);
  }
}

module.exports = new LLMService();