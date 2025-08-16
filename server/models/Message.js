"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Message thuộc về một Thread
      Message.belongsTo(models.Thread, {
        foreignKey: "thread_id",
        as: "thread",
      });
      // Message thuộc về một User (người gửi)
      Message.belongsTo(models.User, {
        foreignKey: "sender_id",
        as: "sender",
      });
    }
  }
  Message.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      thread_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("text"),
        defaultValue: "text",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      seen_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return Message;
};
