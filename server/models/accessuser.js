"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AccessUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AccessUser.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  AccessUser.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      device_name: {
        type: DataTypes.STRING(100),
      },
      refresh_token: {
        type: DataTypes.STRING(255),
      },
      otp: {
        type: DataTypes.STRING(255),
      },
      expired_otp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "AccessUser",
      tableName: "access_user",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return AccessUser;
};
