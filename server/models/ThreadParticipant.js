"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ThreadParticipant extends Model {
    static associate(models) {
      ThreadParticipant.belongsTo(models.Thread, {
        foreignKey: "thread_id",
        as: "thread",
      });
      // Liên kết với User
      ThreadParticipant.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  ThreadParticipant.init(
    {
      thread_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: "ThreadParticipant",
      tableName: "thread_participants",
      timestamps: false,
    }
  );
  return ThreadParticipant;
};
