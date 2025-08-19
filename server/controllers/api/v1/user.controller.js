const { successResponse } = require("../../../utils/response");
const { User } = require("../../../models/index");
const { Op } = require("sequelize");

module.exports = {
  profile: async (req, res) => {
    const { userId, exp } = req.user;
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password"],
      },
    });
    if (!user || user.is_blocked) {
      return errorResponse(res, 404, "Người dùng đã bị khóa");
    }

    return successResponse(res, 200, "Success", { user, exp });
  },
  updateProfile: async (req, res) => {
    try {
      const { userId } = req.user;
      const {
        fullname,
        username,
        email,
        telnumber,
        intro,
        profile,
        avatar_url,
        gender,
        birthday,
        is_private,
      } = req.body;

      // Tìm user hiện tại
      const user = await User.findByPk(userId);
      if (!user || user.is_blocked) {
        return errorResponse(
          res,
          404,
          "Người dùng không tồn tại hoặc đã bị khóa"
        );
      }

      // Kiểm tra username đã tồn tại chưa (nếu thay đổi)
      if (username && username !== user.username) {
        const existingUser = await User.findOne({
          where: { username },
          attributes: ["id"],
        });
        if (existingUser && existingUser.id !== userId) {
          return errorResponse(res, 400, "Tên người dùng đã tồn tại");
        }
      }

      // Kiểm tra email đã tồn tại chưa (nếu thay đổi)
      if (email && email !== user.email) {
        const existingEmail = await User.findOne({
          where: { email },
          attributes: ["id"],
        });
        if (existingEmail && existingEmail.id !== userId) {
          return errorResponse(res, 400, "Email đã được sử dụng");
        }
      }

      // Validate dữ liệu
      const updateData = {};

      if (fullname !== undefined) {
        if (fullname.length > 40) {
          return errorResponse(res, 400, "Tên không được vượt quá 40 ký tự");
        }
        updateData.fullname = fullname;
      }

      if (username !== undefined) {
        if (username.length > 20) {
          return errorResponse(
            res,
            400,
            "Tên người dùng không được vượt quá 20 ký tự"
          );
        }
        updateData.username = username;
      }

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return errorResponse(res, 400, "Email không hợp lệ");
        }
        updateData.email = email;
      }

      if (telnumber !== undefined) {
        if (telnumber && telnumber.length > 14) {
          return errorResponse(
            res,
            400,
            "Số điện thoại không được vượt quá 14 ký tự"
          );
        }
        updateData.telnumber = telnumber;
      }

      if (intro !== undefined) {
        if (intro && intro.length > 100) {
          return errorResponse(
            res,
            400,
            "Tiểu sử không được vượt quá 100 ký tự"
          );
        }
        updateData.intro = intro;
      }

      if (profile !== undefined) {
        if (profile && profile.length > 150) {
          return errorResponse(
            res,
            400,
            "Profile không được vượt quá 150 ký tự"
          );
        }
        updateData.profile = profile;
      }

      if (avatar_url !== undefined) {
        updateData.avatar_url = avatar_url;
      }

      if (gender !== undefined) {
        const validGenders = ["male", "female", "other", ""];
        if (gender && !validGenders.includes(gender)) {
          return errorResponse(res, 400, "Giới tính không hợp lệ");
        }
        updateData.gender = gender;
      }

      if (birthday !== undefined) {
        if (birthday && new Date(birthday) > new Date()) {
          return errorResponse(
            res,
            400,
            "Ngày sinh không được là ngày trong tương lai"
          );
        }
        updateData.birthday = birthday;
      }

      if (is_private !== undefined) {
        updateData.is_private = Boolean(is_private);
      }

      // Cập nhật user
      await user.update(updateData);

      // Lấy user đã cập nhật (loại bỏ password)
      const updatedUser = await User.findByPk(userId, {
        attributes: {
          exclude: ["password"],
        },
      });

      return successResponse(res, 200, "Cập nhật thông tin thành công", {
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return errorResponse(res, 500, "Lỗi server", error.message);
    }
  },
  searchUsers: async (req, res) => {
    try {
      const { q, limit = 10, offset = 0 } = req.query;
      const userId = req.user.userId; // User hiện tại

      if (!q || q.trim().length === 0) {
        return successResponse(res, 200, "Kết quả tìm kiếm", {
          users: [],
          total: 0,
        });
      }

      const searchTerm = `%${q.trim()}%`;

      // Tìm kiếm theo username, fullname hoặc email
      const users = await User.findAndCountAll({
        where: {
          [Op.and]: [
            {
              id: {
                [Op.ne]: userId, // Không hiển thị chính mình
              },
            },
            {
              is_blocked: false,
              is_private: false, // Chỉ hiển thị tài khoản public
            },
            {
              [Op.or]: [
                {
                  username: {
                    [Op.iLike]: searchTerm,
                  },
                },
                {
                  fullname: {
                    [Op.iLike]: searchTerm,
                  },
                },
                {
                  email: {
                    [Op.iLike]: searchTerm,
                  },
                },
              ],
            },
          ],
        },
        attributes: [
          "id",
          "username",
          "fullname",
          "avatar_url",
          "tick_blue",
          "intro",
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["tick_blue", "DESC"],
          ["username", "ASC"],
        ],
      });

      return successResponse(res, 200, "Tìm kiếm thành công", {
        users: users.rows,
        total: users.count,
        hasMore: parseInt(offset) + parseInt(limit) < users.count,
      });
    } catch (error) {
      console.error("Search users error:", error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  getProfileByUsername: async (req, res) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({
        where: { username },
        attributes: { exclude: ["password"] },
      });
      if (!user || user.is_blocked) {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
      return successResponse(res, 200, "Success", { user });
    } catch (error) {
      console.error("Get profile by username error:", error);
      return res.status(500).json({ message: "Lỗi server." });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        where: {
          is_blocked: false,
          is_private: false,
        },
        attributes: [
          "id",
          "username",
          "fullname",
          "avatar_url",
          "tick_blue",
          "intro",
        ],
        order: [
          ["tick_blue", "DESC"],
          ["username", "ASC"],
        ],
      });
      return successResponse(res, 200, "Danh sách user", { users });
    } catch (error) {
      console.error("Get all users error:", error);
      return res.status(500).json({ message: "Lỗi server." });
    }
  },
};
