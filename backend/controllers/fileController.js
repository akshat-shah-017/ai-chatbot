const multer = require('multer');
const FileUpload = require('../models/FileUpload');
const FileParser = require('../utils/fileParser');
const Session = require('../models/Session');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

/**
 * Upload and process a file
 */
exports.uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided'
        });
      }

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

      // Validate file
      const validation = FileParser.validateFile(
        req.file.size,
        req.file.mimetype
      );

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }

      // Extract text from file
      const extractedText = await FileParser.parseFile(
        req.file.buffer,
        req.file.mimetype
      );

      // Save file metadata
      const fileUpload = new FileUpload({
        sessionId,
        userId: req.user.id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        extractedText
      });

      await fileUpload.save();

      res.json({
        success: true,
        data: {
          fileId: fileUpload._id,
          fileName: fileUpload.fileName,
          fileType: fileUpload.fileType,
          fileSize: fileUpload.fileSize,
          extractedText: extractedText.substring(0, 500) + '...' // Preview
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload file'
      });
    }
  }
];

/**
 * Get files for a session
 */
exports.getSessionFiles = async (req, res) => {
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

    const files = await FileUpload.find({ sessionId })
      .select('fileName fileType fileSize uploadedAt')
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files'
    });
  }
};

/**
 * Delete a file
 */
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await FileUpload.findById(fileId);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Verify user owns the file
    if (file.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    await file.deleteOne();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};