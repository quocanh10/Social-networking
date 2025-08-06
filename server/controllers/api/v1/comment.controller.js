const { Comment, Post, User } = require("../../../models");
const { errorResponse, successResponse } = require("../../../utils/response");

// Tạo comment mới
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!content || content.trim() === "") {
      return errorResponse(res, 400, "Nội dung bình luận không được để trống");
    }

    // Kiểm tra bài viết tồn tại
    const post = await Post.findByPk(postId);
    if (!post) {
      return errorResponse(res, 404, "Bài viết không tồn tại");
    }

    // Tạo comment
    const comment = await Comment.create({
      user_id: userId,
      post_id: postId,
      content: content.trim(),
    });

    await post.increment("comments_count", { by: 1 });
    // Lấy comment với thông tin user
    const newComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "fullname", "avatar_url", "tick_blue"],
        },
      ],
    });

    return successResponse(res, 201, "Tạo bình luận thành công", newComment);
  } catch (error) {
    console.error("Create comment error:", error);
    return errorResponse(res, 500, "Đã có lỗi xảy ra");
  }
};

// Lấy danh sách comments của bài viết
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const comments = await Comment.findAndCountAll({
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
      comments: comments.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(comments.count / limit),
        total_comments: comments.count,
        per_page: parseInt(limit),
      },
    };

    return successResponse(
      res,
      200,
      "Lấy danh sách bình luận thành công",
      result
    );
  } catch (error) {
    console.error("Get comments error:", error);
    return errorResponse(res, 500, "Đã có lỗi xảy ra");
  }
};

// Xóa comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    // 1. Lấy comment
    const comment = await Comment.findByPk(commentId);
    if (!comment) return errorResponse(res, 404, "Bình luận không tồn tại");

    // 2. Nếu không phải chủ comment thì kiểm tra chủ bài viết
    if (comment.user_id !== userId) {
      const post = await Post.findByPk(comment.post_id, {
        attributes: ["user_id"],
      });
      if (!post || post.user_id !== userId) {
        return errorResponse(res, 403, "Bạn không có quyền xóa bình luận này");
      }
    }

    // 3. Xoá
    await comment.destroy();
    await Post.decrement("comments_count", {
      by: 1,
      where: { id: comment.post_id },
    });

    return successResponse(res, 200, "Xóa bình luận thành công");
  } catch (err) {
    console.error("Delete comment error:", err);
    return errorResponse(res, 500, "Đã có lỗi xảy ra");
  }
};

module.exports = {
  createComment,
  getComments,
  deleteComment,
};
