const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');

router.post('/upload', auth, fileController.uploadFile);
router.get('/:sessionId', auth, fileController.getSessionFiles);
router.delete('/:fileId', auth, fileController.deleteFile);

module.exports = router;