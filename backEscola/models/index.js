const { sequelize } = require('../config/database');
const UserModel = require('./User');
const StudentGradeModel = require('./StudentGrade');
const LogModel = require('./Log');

const User = UserModel(sequelize);
const StudentGrade = StudentGradeModel(sequelize);
const Log = LogModel(sequelize);

User.hasMany(StudentGrade, {
  foreignKey: 'studentId',
  as: 'studentGrades',
  onDelete: 'CASCADE'
});

User.hasMany(StudentGrade, {
  foreignKey: 'teacherId',
  as: 'assignedGrades',
  onDelete: 'CASCADE'
});

StudentGrade.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

StudentGrade.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher'
});

User.hasMany(Log, {
  foreignKey: 'userId',
  as: 'logs',
  onDelete: 'CASCADE'
});

Log.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  StudentGrade,
  Log,
  Grade: StudentGrade
};
