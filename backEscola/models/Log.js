const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Log = sequelize.define(
    'Log',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        }
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ip: {
        type: DataTypes.STRING(45),
        allowNull: true
      },
      details: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      tableName: 'logs',
      timestamps: true,
      updatedAt: false
    }
  );

  return Log;
};