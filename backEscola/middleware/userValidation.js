const { body } = require('express-validator');

const passwordRules = body('password')
  .isString().withMessage('password deve ser uma string.')
  .isLength({ min: 8 }).withMessage('password deve ter no minimo 8 caracteres.')
  .matches(/[A-Z]/).withMessage('password deve conter ao menos uma letra maiuscula.')
  .matches(/[0-9]/).withMessage('password deve conter ao menos um numero.')
  .matches(/[^A-Za-z0-9]/).withMessage('password deve conter ao menos um simbolo.');

const emailRules = body('email')
  .trim()
  .notEmpty().withMessage('email e obrigatorio.')
  .isEmail().withMessage('email deve ser valido.')
  .normalizeEmail();

const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('name e obrigatorio.'),
  emailRules,
  passwordRules,
  body('role')
    .optional()
    .isIn(['student']).withMessage('role deve ser student no cadastro publico.'),
  body('cpf')
    .trim()
    .notEmpty().withMessage('cpf e obrigatorio.'),
  body('address')
    .trim()
    .notEmpty().withMessage('address e obrigatorio.'),
  body('phone')
    .trim()
    .notEmpty().withMessage('phone e obrigatorio.')
];

const loginValidation = [
  emailRules,
  body('password')
    .isString().withMessage('password deve ser uma string.')
    .notEmpty().withMessage('password e obrigatorio.')
];

const createUserValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('name e obrigatorio.'),
  emailRules,
  passwordRules,
  body('role')
    .notEmpty().withMessage('role e obrigatorio.')
    .isIn(['student', 'teacher', 'admin']).withMessage('role deve ser student, teacher ou admin.'),
  body('cpf')
    .trim()
    .notEmpty().withMessage('cpf e obrigatorio.'),
  body('address')
    .trim()
    .notEmpty().withMessage('address e obrigatorio.'),
  body('phone')
    .trim()
    .notEmpty().withMessage('phone e obrigatorio.')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('name nao pode ser vazio.'),
  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage('email nao pode ser vazio.')
    .isEmail().withMessage('email deve ser valido.')
    .normalizeEmail(),
  body('password')
    .optional()
    .isString().withMessage('password deve ser uma string.')
    .isLength({ min: 8 }).withMessage('password deve ter no minimo 8 caracteres.')
    .matches(/[A-Z]/).withMessage('password deve conter ao menos uma letra maiuscula.')
    .matches(/[0-9]/).withMessage('password deve conter ao menos um numero.')
    .matches(/[^A-Za-z0-9]/).withMessage('password deve conter ao menos um simbolo.'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'admin']).withMessage('role deve ser student, teacher ou admin.'),
  body('cpf')
    .optional()
    .trim()
    .notEmpty().withMessage('cpf nao pode ser vazio.'),
  body('address')
    .optional()
    .trim()
    .notEmpty().withMessage('address nao pode ser vazio.'),
  body('phone')
    .optional()
    .trim()
    .notEmpty().withMessage('phone nao pode ser vazio.')
];

module.exports = {
  registerValidation,
  loginValidation,
  createUserValidation,
  updateUserValidation
};