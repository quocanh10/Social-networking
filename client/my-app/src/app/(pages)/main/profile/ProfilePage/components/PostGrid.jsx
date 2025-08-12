"use client";

import { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, Backdrop, Fade } from "@mui/material";
import { Spinner } from "@heroui/react";
import { Avatar } from "@heroui/react";
import { client } from "@/app/helpers/fetch_api/client"; // Đảm bảo client fetch API đã được định nghĩa trước
import { getToken } from "../../../../../actions/gettoken.action"; // Lấy token từ API
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkOutlined";
export default function PostGrid({ profileData }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null); // Lưu trữ bài viết được chọn để hiển thị trong modal
  const [userId, setUserId] = useState(null); // Lưu trữ userId

  useEffect(() => {
    fetchPosts(profileData.id);
  }, [profileData]);

  // Fetch danh sách bài viết của người dùng bằng userId động
  const fetchPosts = async (userId) => {
    setLoading(true);
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const res = await client.get(`/posts/user/${userId}`);
      const data = res.data.data.posts;
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      alert("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị modal khi click vào ảnh
  const openModal = (post) => {
    setSelectedPost(post);
    console.log("58 Selected post:", post);
  };

  // Đóng modal
  const closeModal = () => {
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Grid hiển thị bài viết */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <div
            key={post.id}
            className="aspect-square bg-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
            onClick={() => openModal(post)}
          >
            <img
              src={post.image_url}
              alt={`Post ${post.id}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Modal hiển thị chi tiết bài viết */}
      <Modal
        open={!!selectedPost}
        onClose={closeModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
        aria-labelledby="post-modal-title"
        aria-describedby="post-modal-description"
      >
        <Fade in={!!selectedPost}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: "80%", md: "60%" },
              maxHeight: "94vh",
              bgcolor: "background.paper",
              borderRadius: 1,
              boxShadow: 24,
              overflow: "hidden",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Image panel */}
            <Box
              sx={{
                width: { xs: "100%", md: "60%" },
                backgroundColor: "black",
                position: "relative",
              }}
            >
              {selectedPost?.image_url && (
                <img
                  src={selectedPost.image_url}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>

            {/* Info panel */}
            <Box
              sx={{
                width: { xs: "100%", md: "40%" },
                display: "flex",
                flexDirection: "column",
                p: 2,
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar src={selectedPost?.user.avatar_url} />
                <Typography variant="subtitle1" ml={1}>
                  {selectedPost?.user.username}
                </Typography>
              </Box>

              {/* Content */}
              <Typography variant="body2" mb={2}>
                <strong>{selectedPost?.user.username}</strong>{" "}
                {selectedPost?.content}
              </Typography>

              {/* Timestamp */}
              <Typography variant="caption" color="text.secondary" mb={2}>
                {new Date(selectedPost?.created_at).toLocaleString()}
              </Typography>

              {/* Likes / Comments Counts */}
              <Typography variant="body2" mb={1}>
                <FavoriteOutlinedIcon
                  sx={{ fontSize: "28px" }}
                  className="text-red-500"
                />{" "}
                {selectedPost?.likes_count} lượt thích
              </Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{ display: "flex", alignItems: "center", mb: 2 }}
              >
                <svg
                  aria-label="Bình luận"
                  fill="currentColor"
                  height="20"
                  viewBox="0 0 24 24"
                  width="20"
                  style={{ marginRight: 6 }}
                >
                  <path
                    d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  ></path>
                </svg>
                {selectedPost?.comments_count} bình luận
              </Typography>

              {/* Comments list */}
              <Box flexGrow={1} overflow="auto" mb={2}>
                {selectedPost?.comments?.map((cm) => (
                  <Typography key={cm.id} variant="body2" mb={1}>
                    <strong>{cm.user.username}</strong> {cm.text}
                  </Typography>
                ))}
              </Box>

              {/* Button đóng */}
              <Button variant="outlined" onClick={closeModal}>
                Đóng
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
