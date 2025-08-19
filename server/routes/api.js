var express = require("express");
const authController = require("../controllers/api/v1/auth.controller");
const verifyController = require("../controllers/api/v1/verify.controller");
const userController = require("../controllers/api/v1/user.controller");
const cloudinaryRoutes = require("./cloudinary/delete-image");
const authMiddleware = require("../middlewares/api/auth.middleware");
const imageController = require("../controllers/api/v1/cloudinary/image.controller");
const postController = require("../controllers/api/v1/post.controller");
const Multer = require("multer");
const storage = new Multer.memoryStorage();
const likeController = require("../controllers/api/v1/like.controller");
const commentController = require("../controllers/api/v1/comment.controller");
const followController = require("../controllers/api/v1/follow.controller");
const upload = Multer({
  storage,
});
const chatController = require("../controllers/api/v1/chat.controller");

var router = express.Router();

// Auth
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/check-email", authController.checkEmail);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/logout", authMiddleware, authController.logout);
// Verify account
router.post("/auth/verify", verifyController.verifyAccount);
router.post("/auth/resend-otp", verifyController.resendOTP);
router.post("/auth/get-expires-token", verifyController.getExpiresToken);

// Authenticate
router.post("/auth/verify-token", authMiddleware);
router.post("/auth/refresh", authController.refresh);

// User
router.get("/profile", authMiddleware, userController.profile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.get("/users/search", authMiddleware, userController.searchUsers);
router.get(
  "/profile/:username",
  authMiddleware,
  userController.getProfileByUsername
);
router.get("/users", authMiddleware, userController.getAllUsers);

// Cloudinary
// router.use("/cloudinary", cloudinaryRoutes);
router.delete(
  "/cloudinary/delete-image/:public_id",
  authMiddleware,
  imageController.deleteImage
);

router.post(
  "/cloudinary/upload-image",
  authMiddleware,
  upload.single("my_file"),
  imageController.uploadImage
);

// Post
router.post("/posts", authMiddleware, postController.createPost);
router.get("/posts", authMiddleware, postController.getPosts);
router.get("/posts/:id", authMiddleware, postController.getPostById);
router.put("/posts/:id", authMiddleware, postController.updatePost);
router.delete("/posts/:id", authMiddleware, postController.deletePost);
router.get(
  "/posts/user/:userId",
  authMiddleware,
  postController.getPostsByUserId
);
router.get("/feed/following", authMiddleware, postController.getFollowingFeed);

// FOLLOW
// POST /api/follow/:userId - Follow user
router.post("/follow/:userId", authMiddleware, followController.followUser);

// DELETE /api/follow/:userId - Unfollow user
router.delete("/follow/:userId", authMiddleware, followController.unfollowUser);

// GET /api/follow/:userId/following - Lấy danh sách following
router.get(
  "/follow/:userId/following",
  authMiddleware,
  followController.getFollowing
);

// GET /api/follow/:userId/followers - Lấy danh sách followers
router.get(
  "/follow/:userId/followers",
  authMiddleware,
  followController.getFollowers
);

// GET /api/follow/:userId/status - Kiểm tra follow status
router.get(
  "/follow/:userId/status",
  authMiddleware,
  followController.getFollowStatus
);

// LIKE routes
router.post("/posts/:postId/like", authMiddleware, likeController.toggleLike);
router.get("/posts/:postId/likes", authMiddleware, likeController.getLikes);
router.get(
  "/posts/:postId/like/status",
  authMiddleware,
  likeController.checkLikeStatus
);

// COMMENT routes
router.post(
  "/posts/:postId/comments",
  authMiddleware,
  commentController.createComment
);
router.get(
  "/posts/:postId/comments",
  authMiddleware,
  commentController.getComments
);
router.delete(
  "/comments/:commentId",
  authMiddleware,
  commentController.deleteComment
);

// Chat
router.get("/chat/threads", authMiddleware, chatController.getThreads);
router.get(
  "/chat/messages/:threadId",
  authMiddleware,
  chatController.getMessages
);
router.post("/chat/send", authMiddleware, chatController.sendMessage);
router.post("/chat/create", authMiddleware, chatController.createThread);
router.post("/chat/group", authMiddleware, chatController.createGroup);

module.exports = router;
