const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('student', 'teacher', 'admin'),
        allowNull: false,
        defaultValue: 'student'
      },
      cpf: {
        type: DataTypes.STRING(14),
        allowNull: false,
        unique: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      passwordUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'usuarios',
      timestamps: true,
      hooks: {
        async beforeCreate(user) {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
            user.passwordUpdatedAt = new Date();
          }
        },
        async beforeUpdate(user) {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
            user.passwordUpdatedAt = new Date();
          }
        }
      }
    }
  );

  User.prototype.comparePassword = function comparePassword(rawPassword) {
    return bcrypt.compare(rawPassword, this.password);
  };

  return User;
};
