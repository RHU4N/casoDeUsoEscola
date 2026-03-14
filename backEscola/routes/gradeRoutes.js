const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  listGrades,
  listMyGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade
} = require('../controllers/gradeController');

const router = express.Router();

router.use(authenticateToken);

router.get('/my', authorizeRoles('student'), listMyGrades);
router.get('/', listGrades);
router.get('/:id', getGradeById);
router.post('/', authorizeRoles('teacher'), createGrade);
router.put('/:id', authorizeRoles('teacher'), updateGrade);
router.delete('/:id', authorizeRoles('teacher'), deleteGrade);

module.exports = router;
