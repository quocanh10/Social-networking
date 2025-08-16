"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ThreadParticipant extends Model {
    static associate(models) {
      // Không cần khai báo quan hệ ở đây, đã đủ ở các model khác
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
