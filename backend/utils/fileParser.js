const pdfParse = require('pdf-parse');

/**
 * File Parser - Extracts text from uploaded files
 */
class FileParser {
  /**
   * Parse file and extract text content
   * @param {Buffer} fileBuffer - File buffer
   * @param {String} fileType - MIME type
   * @returns {String} Extracted text
   */
  static async parseFile(fileBuffer, fileType) {
    try {
      switch (fileType) {
        case 'application/pdf':
          return await this.parsePDF(fileBuffer);
        
        case 'text/plain':
        case 'text/markdown':
        case 'text/csv':
          return fileBuffer.toString('utf-8');
        
        case 'application/json':
          return JSON.stringify(JSON.parse(fileBuffer.toString('utf-8')), null, 2);
        
        case 'text/html':
          return this.stripHTML(fileBuffer.toString('utf-8'));
        
        // Code files
        case 'text/javascript':
        case 'text/jsx':
        case 'text/typescript':
        case 'text/python':
        case 'text/java':
        case 'text/cpp':
        case 'text/css':
        case 'application/x-javascript':
        case 'application/x-python':
          return fileBuffer.toString('utf-8');
        
        default:
          // Try to read as text
          try {
            return fileBuffer.toString('utf-8');
          } catch {
            throw new Error('Unsupported file type');
          }
      }
    } catch (error) {
      console.error('File parsing error:', error);
      throw new Error(`Failed to parse file: ${error.message}`);
    }
  }

  /**
   * Parse PDF file
   * @param {Buffer} buffer - PDF buffer
   * @returns {String} Extracted text
   */
  static async parsePDF(buffer) {
    const data = await pdfParse(buffer);
    return data.text;
  }

  /**
   * Strip HTML tags from text
   * @param {String} html - HTML content
   * @returns {String} Plain text
   */
  static stripHTML(html) {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Validate file size and type
   * @param {Number} fileSize - Size in bytes
   * @param {String} fileType - MIME type
   * @returns {Object} Validation result
   */
  static validateFile(fileSize, fileType) {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'text/html',
      'text/javascript',
      'text/jsx',
      'text/typescript',
      'text/python',
      'text/java',
      'text/cpp',
      'text/css',
      'application/x-javascript',
      'application/x-python'
    ];

    if (fileSize > MAX_SIZE) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }
}

module.exports = FileParser;