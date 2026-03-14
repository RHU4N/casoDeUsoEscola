const path = require('path');
const { Log } = require('../models');

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    await Log.create({
      userId: req.user.id,
      action: 'upload',
      ip: req.ip,
      details: JSON.stringify({
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        relativePath: path.posix.join('uploads', req.file.filename)
      })
    });

    return res.status(201).json({
      message: 'Arquivo enviado com sucesso.',
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadFile
};
