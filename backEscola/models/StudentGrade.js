const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StudentGrade = sequelize.define(
    'StudentGrade',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: false
      },
      grade: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
          min: 0,
          max: 10
        }
      }
    },
    {
      tableName: 'student_grades',
      timestamps: true
    }
  );

  return StudentGrade;
};
