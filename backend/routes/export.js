const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const exportController = require('../controllers/exportController');

router.get('/:sessionId/json', auth, exportController.exportSessionJSON);
router.get('/:sessionId/markdown', auth, exportController.exportSessionMarkdown);
router.post('/import', auth, exportController.importSession);

module.exports = router;
