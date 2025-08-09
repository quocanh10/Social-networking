"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models) {
      // Người theo dõi
      Follow.belongsTo(models.User, {
        foreignKey: "follower_id",
        as: "follower",
      });

      // Người được theo dõi
      Follow.belongsTo(models.User, {
        foreignKey: "following_id",
        as: "following",
      });
    }
  }

  Follow.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Follow",
      tableName: "follows",
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["follower_id", "following_id"],
        },
      ],
    }
  );

  return Follow;
};
