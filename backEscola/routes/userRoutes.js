const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const handleValidationErrors = require('../middleware/validationMiddleware');
const { createUserValidation, updateUserValidation } = require('../middleware/userValidation');
const {
  getMyProfile,
  listUsers,
  listStudents,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticateToken);

router.get('/me', getMyProfile);
router.get('/alunos', authorizeRoles('teacher', 'admin'), listStudents);

router.use(authorizeRoles('admin'));

router.get('/', listUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, handleValidationErrors, createUser);
router.put('/:id', updateUserValidation, handleValidationErrors, updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
