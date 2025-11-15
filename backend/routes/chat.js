const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const chatController = require('../controllers/chatController');

router.post('/send', auth, chatController.sendMessage);
router.post('/stream', auth, chatController.streamMessage);
router.post('/regenerate', auth, chatController.regenerateResponse);

module.exports = router;
