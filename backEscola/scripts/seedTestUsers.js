require('dotenv').config();

const { Op } = require('sequelize');
const { ensureDatabaseExists } = require('../config/database');
const { sequelize, User, StudentGrade } = require('../models');

const TEST_PASSWORD = 'Escola@2026';

const usersToSeed = [
  {
    key: 'admin',
    name: 'Admin Escola',
    email: 'admin@escola.com',
    role: 'admin',
    cpf: '11111111111',
    address: 'Rua Central, 100',
    phone: '11999990000'
  },
  {
    key: 'teacher',
    name: 'Professor Carlos',
    email: 'professor@escola.com',
    role: 'teacher',
    cpf: '22222222222',
    address: 'Rua das Acacias, 200',
    phone: '11999990001'
  },
  {
    key: 'studentA',
    name: 'Aluno Bruno',
    email: 'aluno1@escola.com',
    role: 'student',
    cpf: '33333333333',
    address: 'Rua das Flores, 10',
    phone: '11999990002'
  },
  {
    key: 'studentB',
    name: 'Alunoa Ana',
    email: 'aluno2@escola.com',
    role: 'student',
    cpf: '44444444444',
    address: 'Avenida Brasil, 500',
    phone: '11999990003'
  }
];

const findUser = async (profile) => {
  return User.findOne({
    where: {
      [Op.or]: [
        { email: profile.email },
        { cpf: profile.cpf }
      ]
    }
  });
};

const createOrUpdateUser = async (profile) => {
  const existingUser = await findUser(profile);

  if (!existingUser) {
    const created = await User.create({
      name: profile.name,
      email: profile.email,
      password: TEST_PASSWORD,
      role: profile.role,
      cpf: profile.cpf,
      address: profile.address,
      phone: profile.phone
    });

    return created;
  }

  existingUser.name = profile.name;
  existingUser.email = profile.email;
  existingUser.password = TEST_PASSWORD;
  existingUser.role = profile.role;
  existingUser.cpf = profile.cpf;
  existingUser.address = profile.address;
  existingUser.phone = profile.phone;

  await existingUser.save();
  return existingUser;
};

const ensureGrade = async ({ studentId, teacherId, subject, grade }) => {
  const existing = await StudentGrade.findOne({
    where: {
      studentId,
      teacherId,
      subject
    }
  });

  if (!existing) {
    await StudentGrade.create({ studentId, teacherId, subject, grade });
    return;
  }

  existing.grade = grade;
  await existing.save();
};

const seed = async () => {
  try {
    await ensureDatabaseExists();
    await sequelize.authenticate();
    await sequelize.sync();

    const usersByKey = {};

    for (const profile of usersToSeed) {
      usersByKey[profile.key] = await createOrUpdateUser(profile);
    }

    await ensureGrade({
      studentId: usersByKey.studentA.id,
      teacherId: usersByKey.teacher.id,
      subject: 'Matematica',
      grade: 8.5
    });

    await ensureGrade({
      studentId: usersByKey.studentB.id,
      teacherId: usersByKey.teacher.id,
      subject: 'Matematica',
      grade: 7.25
    });

    console.log('Usuarios e notas de teste preparados com sucesso.');
    console.log('Credenciais padrao (senha unica):');
    console.log(`- admin@escola.com / ${TEST_PASSWORD}`);
    console.log(`- professor@escola.com / ${TEST_PASSWORD}`);
    console.log(`- aluno1@escola.com / ${TEST_PASSWORD}`);
    console.log(`- aluno2@escola.com / ${TEST_PASSWORD}`);
  } catch (error) {
    console.error('Falha ao preparar dados de teste:', error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seed();