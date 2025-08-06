"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("follows", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      follower_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      following_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Thêm unique constraint để tránh follow duplicate
    await queryInterface.addIndex("follows", ["follower_id", "following_id"], {
      unique: true,
      name: "unique_follow_relationship",
    });

    // Thêm index cho performance
    await queryInterface.addIndex("follows", ["follower_id"], {
      name: "idx_follows_follower_id",
    });

    await queryInterface.addIndex("follows", ["following_id"], {
      name: "idx_follows_following_id",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa indexes trước
    await queryInterface.removeIndex("follows", "unique_follow_relationship");
    await queryInterface.removeIndex("follows", "idx_follows_follower_id");
    await queryInterface.removeIndex("follows", "idx_follows_following_id");

    // Xóa table
    await queryInterface.dropTable("follows");
  },
};
