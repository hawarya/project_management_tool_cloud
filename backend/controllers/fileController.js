const multer = require('multer');
const path = require('path');
const File = require('../models/File');
const fs = require('fs');

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10000000 },
});

const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.body;
    
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const newFile = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      projectId,
      uploader: req.user._id
    });
    
    const populatedFile = await File.findById(newFile._id).populate('uploader', 'name email');
    res.status(201).json(populatedFile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const files = await File.find({ projectId: req.params.projectId }).populate('uploader', 'name email');
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { upload, uploadFile, getFiles };
