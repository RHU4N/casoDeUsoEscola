const { StudentGrade, User } = require('../models');

const userAttributes = ['id', 'name', 'email', 'role', 'cpf', 'address', 'phone', 'passwordUpdatedAt'];

const gradeIncludes = [
  {
    model: User,
    as: 'student',
    attributes: userAttributes
  },
  {
    model: User,
    as: 'teacher',
    attributes: userAttributes
  }
];

const listGrades = async (req, res, next) => {
  try {
    const grades = await StudentGrade.findAll({
      include: gradeIncludes
    });

    return res.status(200).json(grades);
  } catch (error) {
    return next(error);
  }
};

const listMyGrades = async (req, res, next) => {
  try {
    const grades = await StudentGrade.findAll({
      where: { studentId: req.user.id },
      include: gradeIncludes,
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(grades);
  } catch (error) {
    return next(error);
  }
};

const getGradeById = async (req, res, next) => {
  try {
    const grade = await StudentGrade.findByPk(req.params.id, {
      include: gradeIncludes
    });

    if (!grade) {
      return res.status(404).json({ message: 'Nota nao encontrada.' });
    }

    return res.status(200).json(grade);
  } catch (error) {
    return next(error);
  }
};

const createGrade = async (req, res, next) => {
  try {
    const { studentId, subject, grade } = req.body;
    const teacherId = req.user.id;

    if (!studentId || !subject || grade === undefined) {
      return res.status(400).json({ message: 'studentId, subject e grade sao obrigatorios.' });
    }

    const student = await User.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Aluno nao encontrado para esta nota.' });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'studentId deve pertencer a um usuario com role student.' });
    }

    const teacher = await User.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Professor nao encontrado para esta nota.' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(403).json({ message: 'Apenas professores podem criar notas.' });
    }

    const studentGrade = await StudentGrade.create({ studentId, teacherId, subject, grade });
    const createdGrade = await StudentGrade.findByPk(studentGrade.id, {
      include: gradeIncludes
    });

    return res.status(201).json(createdGrade);
  } catch (error) {
    return next(error);
  }
};

const updateGrade = async (req, res, next) => {
  try {
    const { studentId, subject, grade: gradeValue } = req.body;
    const teacherId = req.user.id;
    const grade = await StudentGrade.findByPk(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Nota nao encontrada.' });
    }

    if (grade.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Voce so pode editar notas criadas por voce.' });
    }

    if (studentId) {
      const student = await User.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Aluno nao encontrado para esta nota.' });
      }
      if (student.role !== 'student') {
        return res.status(400).json({ message: 'studentId deve pertencer a um usuario com role student.' });
      }
      grade.studentId = studentId;
    }

    grade.subject = subject || grade.subject;
    if (gradeValue !== undefined) {
      grade.grade = gradeValue;
    }

    await grade.save();
    const updatedGrade = await StudentGrade.findByPk(grade.id, {
      include: gradeIncludes
    });

    return res.status(200).json(updatedGrade);
  } catch (error) {
    return next(error);
  }
};

const deleteGrade = async (req, res, next) => {
  try {
    const grade = await StudentGrade.findByPk(req.params.id);

    if (!grade) {
      return res.status(404).json({ message: 'Nota nao encontrada.' });
    }

    if (grade.teacherId !== req.user.id) {
      return res.status(403).json({ message: 'Voce so pode excluir notas criadas por voce.' });
    }

    await grade.destroy();
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listGrades,
  listMyGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade
};
