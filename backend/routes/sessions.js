const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sessionController = require('../controllers/sessionController');

router.post('/', auth, sessionController.createSession);
router.get('/', auth, sessionController.getSessions);
router.get('/:sessionId', auth, sessionController.getSession);
router.put('/:sessionId', auth, sessionController.updateSession);
router.delete('/:sessionId', auth, sessionController.deleteSession);

module.exports = router;
