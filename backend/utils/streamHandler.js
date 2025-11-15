/**
 * Stream Handler - Manages SSE streaming for chat responses
 */
class StreamHandler {
  /**
   * Process LLM stream and send to client
   * @param {Stream} stream - LLM response stream
   * @param {Response} res - Express response object
   * @param {Function} onComplete - Callback when stream completes
   */
  static async handleStream(stream, res, onComplete) {
    let fullContent = '';

    stream.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        
        if (message === '[DONE]') {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          if (onComplete) onComplete(fullContent);
          return;
        }

        try {
          const parsed = JSON.parse(message);
          const content = parsed.choices[0]?.delta?.content;
          
          if (content) {
            fullContent += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (error) {
          // Skip malformed JSON
          continue;
        }
      }
    });

    stream.on('end', () => {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      if (onComplete) onComplete(fullContent);
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
      res.end();
    });
  }

  /**
   * Setup SSE headers
   * @param {Response} res - Express response object
   */
  static setupSSE(res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
  }
}

module.exports = StreamHandler;