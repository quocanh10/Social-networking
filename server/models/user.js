"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.AccessUser, {
        foreignKey: "user_id",
        as: "access_user",
      });

      // Người mà user này đang follow
      User.hasMany(models.Follow, {
        foreignKey: "follower_id",
        as: "following_relations",
      });

      // Người đang follow user này
      User.hasMany(models.Follow, {
        foreignKey: "following_id",
        as: "follower_relations",
      });

      // Many-to-many relationships
      User.belongsToMany(models.User, {
        through: models.Follow,
        foreignKey: "follower_id",
        otherKey: "following_id",
        as: "following",
      });

      User.belongsToMany(models.User, {
        through: models.Follow,
        foreignKey: "following_id",
        otherKey: "follower_id",
        as: "followers",
      });

      // Chat: User tham gia nhiều Thread (hội thoại)
      User.belongsToMany(models.Thread, {
        through: models.ThreadParticipant,
        foreignKey: "user_id",
        otherKey: "thread_id",
        as: "threads",
      });

      // Chat: User gửi nhiều Message
      User.hasMany(models.Message, {
        foreignKey: "sender_id",
        as: "messages",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fullname: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      telnumber: {
        type: DataTypes.STRING(14),
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      register_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      last_login: DataTypes.DATE,
      intro: DataTypes.STRING(100),
      profile: DataTypes.STRING(150),
      avatar_url: DataTypes.STRING(255),
      gender: DataTypes.STRING(10),
      birthday: DataTypes.DATE,
      tick_blue: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_reported: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // hooks: {
      //   afterCreate: async (user, options) => {
      //     try {
      //       const accessUser = await sequelize.models.AccessUser.create({
      //         user_id: user.id,
      //         user_agent: options.user_agent,
      //       });
      //     } catch (error) {
      //       console.error("Đã có lỗi xảy ra: ", error);
      //     }
      //   },
      // },
    }
  );
  return User;
};
