const { User, StudentGrade } = require('../models');

const userBaseAttributes = ['id', 'name', 'email', 'role', 'cpf', 'address', 'phone', 'passwordUpdatedAt', 'createdAt', 'updatedAt'];

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: userBaseAttributes
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: StudentGrade,
          as: 'studentGrades',
          attributes: ['id', 'studentId', 'teacherId', 'subject', 'grade', 'createdAt', 'updatedAt']
        }
      ]
    });

    return res.status(200).json(users);
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: StudentGrade,
          as: 'studentGrades',
          attributes: ['id', 'studentId', 'teacherId', 'subject', 'grade', 'createdAt', 'updatedAt']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, cpf, address, phone } = req.body;

    if (!name || !email || !password || !role || !cpf || !address || !phone) {
      return res.status(400).json({ message: 'name, email, password, role, cpf, address e phone sao obrigatorios.' });
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

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cpf: user.cpf,
      address: user.address,
      phone: user.phone,
      passwordUpdatedAt: user.passwordUpdatedAt
    });
  } catch (error) {
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role, cpf, address, phone } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    if (email && email !== user.email) {
      const emailInUse = await User.findOne({ where: { email } });
      if (emailInUse) {
        return res.status(409).json({ message: 'Email ja cadastrado.' });
      }
    }

    if (cpf && cpf !== user.cpf) {
      const cpfInUse = await User.findOne({ where: { cpf } });
      if (cpfInUse) {
        return res.status(409).json({ message: 'CPF ja cadastrado.' });
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.cpf = cpf || user.cpf;
    user.address = address || user.address;
    user.phone = phone || user.phone;

    if (password) {
      user.password = password;
    }

    await user.save();

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cpf: user.cpf,
      address: user.address,
      phone: user.phone,
      passwordUpdatedAt: user.passwordUpdatedAt
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
