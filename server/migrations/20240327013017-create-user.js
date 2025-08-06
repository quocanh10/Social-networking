"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      fullname: {
        allowNull: false,
        type: Sequelize.STRING(40),
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING(20),
      },
      telnumber: {
        type: Sequelize.STRING(14),
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(50),
        unique: true,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(100),
      },
      register_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      last_login: Sequelize.DATE,
      intro: Sequelize.STRING(100),
      profile: Sequelize.STRING(150),
      avatar_url: Sequelize.STRING(255),
      gender: Sequelize.STRING(10),
      birthday: Sequelize.DATE,
      tick_blue: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      is_reported: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_blocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
