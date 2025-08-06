const { Like, Post, User } = require("../../../models");
const { errorResponse, successResponse } = require("../../../utils/response");

// Toggle like/unlike bài viết
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Kiểm tra bài viết tồn tại
    const post = await Post.findByPk(postId);
    if (!post) {
      return errorResponse(res, 404, "Bài viết không tồn tại");
    }

    // Kiểm tra đã like chưa
    const existingLike = await Like.findOne({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    if (existingLike) {
      // Unlike: Xóa like
      await existingLike.destroy();

      // Giảm số lượt thích trong bảng Post
      await post.decrement("likes_count", { by: 1 });

      return successResponse(res, 200, "Đã bỏ thích bài viết", {
        isLiked: false,
        action: "unlike",
      });
    } else {
      // Like: Thêm like
      await Like.create({
        user_id: userId,
        post_id: postId,
      });

      // Tăng số lượt thích trong bảng Post
      await post.increment("likes_count", { by: 1 });

      return successResponse(res, 200, "Đã thích bài viết", {
        isLiked: true,
        action: "like",
      });
    }
  } catch (error) {
    console.error("Toggle like error:", error);
    return errorResponse(res, 500, "Đã có lỗi xảy ra");
  }
};

// Lấy danh sách người like bài viết
const getLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const likes = await Like.findAndCountAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "fullname", "avatar_url", "tick_blue"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    const result = {
      likes: likes.rows.map((like) => like.user),
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(likes.count / limit),
        total_likes: likes.count,
        per_page: parseInt(limit),
      },
    };

    return successResponse(res, 200, "Lấy danh sách thích thành công", result);
  } catch (error) {
    console.error("Get likes error:", error);
    return errorResponse(res, 500, "Đã có lỗi xảy ra");
  }
};

// Kiểm tra trạng thái like của user
const checkLikeStatus = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const like = await Like.findOne({
      where: {
        user_id: userId,
        post_id: postId,
      },
    });

    return successResponse(res, 200, "Kiểm tra trạng thái thích", {
      isLiked: !!like,
    });
  } catch (error) {
    console.error("Check like status error:", error);
    return errorResponse(res, 500, "Đã có lỗi xảy ra");
  }
};

module.exports = {
  toggleLike,
  getLikes,
  checkLikeStatus,
};
