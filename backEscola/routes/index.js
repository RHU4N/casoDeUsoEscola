const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const gradeRoutes = require('./gradeRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'backEscola' });
});

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/grades', gradeRoutes);
router.use('/notas', gradeRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
