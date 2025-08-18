"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Thread extends Model {
    static associate(models) {
      // Thread có nhiều participants (users)
      Thread.belongsToMany(models.User, {
        through: models.ThreadParticipant,
        foreignKey: "thread_id",
        otherKey: "user_id",
        as: "participants",
      });
      // Thread có nhiều messages
      Thread.hasMany(models.Message, {
        foreignKey: "thread_id",
        as: "messages",
      });
      Thread.hasMany(models.ThreadParticipant, {
        foreignKey: "thread_id",
        as: "ThreadParticipants",
      });
    }
  }
  Thread.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      is_group: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      last_message_at: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Thread",
      tableName: "threads",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Thread;
};
