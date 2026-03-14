const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadFile } = require('../controllers/uploadController');

const router = express.Router();

router.use(authenticateToken);
router.post('/', upload.single('file'), uploadFile);

module.exports = router;
