const { Post, User, Follow } = require("../../../models/index");
const { errorResponse, successResponse } = require("../../../utils/response");
const { Op } = require("sequelize");

module.exports = {
  // Tạo bài viết mới
  createPost: async (req, res) => {
    try {
      const { content, image_url, hashtags } = req.body;
      const user_id = req.user.userId; // Lấy từ auth middleware
      console.log("10 req.user:", req.user);
      console.log("11 req.user.id:", user_id);
      // Kiểm tra cơ bản
      if (!content && !image_url) {
        return errorResponse(
          res,
          400,
          "Bài viết phải có nội dung hoặc hình ảnh"
        );
      }

      // Tạo bài viết mới
      const newPost = await Post.create({
        user_id,
        content: content || null,
        image_url: image_url || null,
        hashtags: hashtags ? JSON.stringify(hashtags) : null,
      });

      // Lấy thông tin bài viết vừa tạo kèm thông tin user
      const post = await Post.findByPk(newPost.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "avatar_url", "fullname"],
          },
        ],
      });

      return successResponse(res, 201, "Success", post);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  // Lấy danh sách bài viết
  getPosts: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const posts = await Post.findAndCountAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "avatar_url", "fullname"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const result = {
        posts: posts.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(posts.count / limit),
          total_posts: posts.count,
          per_page: parseInt(limit),
        },
      };

      return successResponse(
        res,
        200,
        "Lấy danh sách bài viết thành công",
        result
      );
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  // Lấy bài viết theo ID
  getPostById: async (req, res) => {
    try {
      const { id } = req.params;

      const post = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "avatar_url", "fullname"],
          },
        ],
      });

      if (!post) {
        return errorResponse(res, 404, "Bài viết không tồn tại");
      }

      return successResponse(res, 200, "Lấy bài viết thành công", post);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  // Cập nhật bài viết
  updatePost: async (req, res) => {
    try {
      const { id } = req.params;
      const { content, image_url, hashtags } = req.body;
      const user_id = req.user.userId; // Lấy từ auth middleware

      // Tìm bài viết
      const post = await Post.findByPk(id);
      if (!post) {
        return errorResponse(res, 404, "Bài viết không tồn tại");
      }

      // Kiểm tra quyền sở hữu
      if (post.user_id !== user_id) {
        return errorResponse(
          res,
          403,
          "Bạn không có quyền chỉnh sửa bài viết này"
        );
      }

      // Cập nhật bài viết
      await Post.update(
        {
          content: content || post.content,
          image_url: image_url || post.image_url,
          hashtags: hashtags ? JSON.stringify(hashtags) : post.hashtags,
          updated_at: new Date(),
        },
        {
          where: { id },
        }
      );

      // Lấy bài viết đã cập nhật
      const updatedPost = await Post.findByPk(id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "avatar_url", "fullname"],
          },
        ],
      });

      return successResponse(
        res,
        200,
        "Cập nhật bài viết thành công",
        updatedPost
      );
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  // Xóa bài viết
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.userId; // Lấy từ auth middleware

      // Tìm bài viết
      const post = await Post.findByPk(id);
      if (!post) {
        return errorResponse(res, 404, "Bài viết không tồn tại");
      }

      // Kiểm tra quyền sở hữu
      if (post.user_id !== user_id) {
        return errorResponse(res, 403, "Bạn không có quyền xóa bài viết này");
      }

      // Xóa bài viết
      await Post.destroy({
        where: { id },
      });

      return successResponse(res, 200, "Xóa bài viết thành công");
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  // Lấy danh sách bài viết theo userId
  getPostsByUserId: async (req, res) => {
    try {
      const { userId } = req.params; // Lấy userId từ URL
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const posts = await Post.findAndCountAll({
        where: { user_id: userId },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username", "avatar_url", "fullname"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const result = {
        posts: posts.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(posts.count / limit),
          total_posts: posts.count,
          per_page: parseInt(limit),
        },
      };

      return successResponse(res, 200, "Success", result);
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },

  getFollowingFeed: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Lấy danh sách ID của những người mà user đang follow
      const followingIds = await Follow.findAll({
        where: { follower_id: userId },
        attributes: ["following_id"],
        raw: true,
      });

      // Extract array của following IDs
      const followingUserIds = followingIds.map((f) => f.following_id);

      // Thêm chính user hiện tại để hiển thị bài viết của mình
      followingUserIds.push(userId);

      // Lấy bài viết từ những user đang follow
      const posts = await Post.findAndCountAll({
        where: {
          user_id: {
            [Op.in]: followingUserIds,
          },
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "id",
              "username",
              "avatar_url",
              "fullname",
              "tick_blue",
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const result = {
        posts: posts.rows,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(posts.count / limit),
          total_posts: posts.count,
          per_page: parseInt(limit),
        },
      };

      return successResponse(
        res,
        200,
        "Lấy feed từ following thành công",
        result
      );
    } catch (error) {
      console.log(error);
      return errorResponse(res, 500, "Đã có lỗi xảy ra");
    }
  },
};
