const { User, Follow } = require("../../../models/index");
const { Op } = require("sequelize");

// Follow user
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    // Không thể follow chính mình
    if (followerId == userId) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể theo dõi chính mình",
      });
    }

    // Kiểm tra user tồn tại
    const userToFollow = await User.findByPk(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // Kiểm tra đã follow chưa
    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: userId,
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: "Bạn đã theo dõi người này rồi",
      });
    }

    // Tạo follow mới
    await Follow.create({
      follower_id: followerId,
      following_id: userId,
    });

    res.status(200).json({
      success: true,
      message: "Đã theo dõi thành công",
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId;

    const follow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: userId,
      },
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: "Bạn chưa theo dõi người này",
      });
    }

    await follow.destroy();

    res.status(200).json({
      success: true,
      message: "Đã hủy theo dõi thành công",
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ...existing code...

// Lấy danh sách following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Sử dụng Follow model để query trực tiếp
    const followingData = await Follow.findAndCountAll({
      where: {
        follower_id: userId,
      },
      include: [
        {
          model: User,
          as: "following",
          attributes: ["id", "username", "fullname", "avatar_url", "tick_blue"],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    // Extract user data from the results
    const following = followingData.rows.map((follow) => follow.following);

    res.status(200).json({
      success: true,
      data: following,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(followingData.count / limit),
        totalItems: followingData.count,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ...existing code...

// Lấy danh sách followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Sử dụng Follow model để query trực tiếp
    const followersData = await Follow.findAndCountAll({
      where: {
        following_id: userId,
      },
      include: [
        {
          model: User,
          as: "follower",
          attributes: ["id", "username", "fullname", "avatar_url", "tick_blue"],
        },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["created_at", "DESC"]],
    });

    // Extract user data from the results
    const followers = followersData.rows.map((follow) => follow.follower);

    res.status(200).json({
      success: true,
      data: followers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(followersData.count / limit),
        totalItems: followersData.count,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// Kiểm tra follow status
const getFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const isFollowing = await Follow.findOne({
      where: {
        follower_id: currentUserId,
        following_id: userId,
      },
    });

    res.status(200).json({
      success: true,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error("Get follow status error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFollowStatus,
};
