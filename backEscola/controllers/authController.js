const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');

const serializeAuthUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role
});

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', cpf, address, phone } = req.body;

    if (!name || !email || !password || !cpf || !address || !phone) {
      return res.status(400).json({ message: 'name, email, password, cpf, address e phone sao obrigatorios.' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(409).json({ message: 'Email ja cadastrado.' });
    }

    const cpfExists = await User.findOne({ where: { cpf } });
    if (cpfExists) {
      return res.status(409).json({ message: 'CPF ja cadastrado.' });
    }

    const user = await User.create({ name, email, password, role, cpf, address, phone });
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Usuario criado com sucesso.',
      usuario: serializeAuthUser(user),
      token
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email e password sao obrigatorios.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais invalidas.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais invalidas.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login realizado com sucesso.',
      usuario: serializeAuthUser(user),
      token
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login
};
