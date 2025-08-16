"use client";

import { Box, TextField } from "@mui/material";
import Image from "next/image";
import { Avatar, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { client } from "@/app/helpers/fetch_api/client";
import { getToken } from "../../../../../actions/gettoken.action";
import { showToast } from "@/app/helpers/Toastify";

export default function CommentSection({
  postId,
  isOpen,
  onClose,
  commentsCount,
  post,
  onCommentAdded,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch comments khi mở modal
  useEffect(() => {
    if (isOpen) {
      setComments([]); // Reset comments khi mở modal
      setPage(1);
      setHasMore(true);
      fetchComments(1);
    }
  }, [isOpen, postId]);

  const fetchComments = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { accessToken } = await getToken();

      client.setToken(accessToken.value);
      const { data } = await client.get(
        `/posts/${postId}/comments?page=${pageNum}&limit=10`
      );

      if (data.message === "Lấy danh sách bình luận thành công") {
        const commentsData = data.data.comments || [];
        if (pageNum === 1) {
          setComments(commentsData);
        } else {
          setComments((prev) => [...prev, ...commentsData]);
        }
        const pagination = data.data.pagination;
        setHasMore(pagination.current_page < pagination.total_pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
      showToast("error", "Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") {
      showToast("error", "Bình luận không được để trống");
      return;
    }

    setIsSubmitting(true);
    try {
      const { accessToken } = await getToken();

      client.setToken(accessToken.value);
      const { data } = await client.post(`/posts/${postId}/comments`, {
        content: newComment.trim(),
      });

      if (data.status === 201) {
        const newCommentData = {
          id: data.data.id,
          content: data.data.content,
          created_at: data.data.created_at,
          user: data.data.user,
        };
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");

        if (onCommentAdded) {
          onCommentAdded();
        }

        showToast("success", "Đã thêm bình luận!");
      } else {
        showToast("error", data.message || "Có lỗi xảy ra khi thêm bình luận");
      }
    } catch (error) {
      console.error("Submit comment error:", error);
      if (error.response?.status === 401) {
        showToast("error", "Phiên đăng nhập đã hết hạn");
      } else {
        showToast("error", "Có lỗi xảy ra khi thêm bình luận");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMoreComments = () => {
    if (!loading && hasMore) {
      fetchComments(page + 1);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <Box className="bg-white rounded-lg w-full max-w-[800px] max-h-[80vh] overflow-hidden flex">
        {/* Left: Post Image */}
        <Box className="flex-shrink-0 w-[300px] h-full">
          {" "}
          {/* Make the height equal to the modal height */}
          <Image
            src={post.image_url}
            width={300}
            height={0} // Let the height auto adjust based on the container
            className="w-full h-full object-cover rounded-md"
            alt="Post Image"
          />
        </Box>

        {/* Right: Post Info and Comments */}
        <Box className="flex-1 p-4 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
          {/* Post Info */}
          <Box className="flex flex-col">
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar
                size="sm"
                src={post.user?.avatar_url}
                name={post.user?.username?.[0]?.toUpperCase()}
              />
              <div>
                <span className="font-semibold text-sm cursor-pointer">
                  {post.user?.username}
                </span>
                <p className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            <p className="font-semibold text-sm text-blue-600 mt-2 cursor-pointer">
              {post.user?.username}
            </p>
            <p className="text-sm text-gray-800 mt-1">{post.content}</p>
          </Box>

          {/* Comments Section */}
          <Box className="flex-1 overflow-y-auto mt-4">
            {loading && comments.length === 0 ? (
              <Box className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </Box>
            ) : comments.length === 0 ? (
              <Box className="text-center text-gray-500 py-8">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg font-medium">Chưa có bình luận nào</p>
                <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
              </Box>
            ) : (
              <Box className="space-y-4">
                {comments.map((comment, index) => (
                  <Box
                    key={`${comment.id}-${index}`}
                    className="flex gap-3 animate-fade-in"
                  >
                    <Avatar
                      size="sm"
                      src={comment.user?.avatar_url}
                      name={comment.user?.username?.[0]?.toUpperCase()}
                      className="flex-shrink-0 cursor-pointer"
                    />
                    <Box className="flex-1">
                      <Box className="bg-gray-100 rounded-lg px-3 py-2">
                        <p className="font-semibold text-sm text-blue-600 cursor-pointer">
                          {comment.user?.username || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-800 mt-1">
                          {comment.content}
                        </p>
                      </Box>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.created_at).toLocaleString("vi-VN")}
                      </p>
                    </Box>
                  </Box>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <Box className="text-center pt-4">
                    <button
                      onClick={loadMoreComments}
                      disabled={loading}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium px-4 py-2 rounded-full border border-blue-200 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          Đang tải...
                        </span>
                      ) : (
                        "Xem thêm bình luận"
                      )}
                    </button>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Comment Input */}
          <Box className="border-t p-4 bg-gray-50">
            <form onSubmit={handleSubmitComment}>
              <Box className="flex gap-2">
                <TextField
                  placeholder="Thêm bình luận..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  maxRows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="bg-white"
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  color="primary"
                  size="sm"
                  disabled={newComment.trim() === "" || isSubmitting}
                  isLoading={isSubmitting}
                  className="min-w-[60px] h-10"
                >
                  {isSubmitting ? "" : "Đăng"}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
