const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/:sessionId', auth, messageController.getMessages);
router.delete('/:messageId', auth, messageController.deleteMessage);
router.put('/:messageId', auth, messageController.editMessage);

module.exports = router;
