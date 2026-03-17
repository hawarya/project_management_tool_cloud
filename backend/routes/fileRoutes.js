const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, uploadFile, getFiles } = require('../controllers/fileController');

router.route('/').post(protect, upload.single('file'), uploadFile);
router.route('/project/:projectId').get(protect, getFiles);

module.exports = router;
