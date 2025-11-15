/**
 * Context Manager - Handles conversation history and context window limits
 */

const MAX_CONTEXT_TOKENS = 4000; // Approximate limit for GPT-3.5
const AVG_CHARS_PER_TOKEN = 4; // Rough estimate

class ContextManager {
  /**
   * Prepare messages for LLM with context window management
   * @param {Array} messages - Array of message objects
   * @param {String} systemPrompt - System prompt to prepend
   * @param {Number} maxTokens - Maximum context tokens allowed
   * @returns {Array} Formatted messages for LLM
   */
  static prepareContext(messages, systemPrompt = null, maxTokens = MAX_CONTEXT_TOKENS) {
    const formattedMessages = [];
    
    // Add system prompt if provided
    if (systemPrompt) {
      formattedMessages.push({
        role: 'system',
        content: systemPrompt
      });
    }

    // Calculate approximate token count
    let tokenCount = systemPrompt ? this.estimateTokens(systemPrompt) : 0;
    const maxContentTokens = maxTokens - tokenCount - 500; // Reserve 500 for response

    // Add messages from most recent, working backwards
    const reversedMessages = [...messages].reverse();
    const includedMessages = [];

    for (const msg of reversedMessages) {
      const msgTokens = this.estimateTokens(msg.content);
      
      if (tokenCount + msgTokens > maxContentTokens) {
        // Context limit reached
        break;
      }

      includedMessages.unshift({
        role: msg.role,
        content: msg.content
      });
      tokenCount += msgTokens;
    }

    formattedMessages.push(...includedMessages);

    return formattedMessages;
  }

  /**
   * Estimate token count from text
   * @param {String} text - Text to estimate
   * @returns {Number} Estimated token count
   */
  static estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / AVG_CHARS_PER_TOKEN);
  }

  /**
   * Truncate messages to fit within token limit
   * @param {Array} messages - Messages to truncate
   * @param {Number} maxTokens - Maximum tokens
   * @returns {Array} Truncated messages
   */
  static truncateMessages(messages, maxTokens = MAX_CONTEXT_TOKENS) {
    let totalTokens = 0;
    const truncated = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const msgTokens = this.estimateTokens(messages[i].content);
      
      if (totalTokens + msgTokens > maxTokens) break;
      
      truncated.unshift(messages[i]);
      totalTokens += msgTokens;
    }

    return truncated;
  }

  /**
   * Create a summary of older messages
   * @param {Array} messages - Messages to summarize
   * @returns {String} Summary text
   */
  static createSummary(messages) {
    if (messages.length === 0) return '';

    const summary = `[Previous conversation summary: ${messages.length} messages exchanged. ` +
      `First message: "${messages[0].content.substring(0, 100)}..." ` +
      `Last message: "${messages[messages.length - 1].content.substring(0, 100)}..."]`;

    return summary;
  }
}

module.exports = ContextManager;