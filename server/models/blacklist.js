"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class BlackList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  BlackList.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      token: {
        type: DataTypes.STRING(255),
      },
      expire: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "BlackList",
      tableName: "blacklist",
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  return BlackList;
};
