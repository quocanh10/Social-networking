"use client";

import { Box, Container, TextField } from "@mui/material";
import { Avatar, Tooltip } from "@heroui/react";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Image from "next/image";
import imageTest from "@/app/assets/images/image-test.jpg";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarkOutlinedIcon from "@mui/icons-material/BookmarkOutlined";
import SentimentSatisfiedOutlinedIcon from "@mui/icons-material/SentimentSatisfiedOutlined";
import SendIcon from "@mui/icons-material/Send";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { showToast } from "@/app/helpers/Toastify";
import { client } from "@/app/helpers/fetch_api/client";
import { getToken } from "../../../../../actions/gettoken.action";

const ariaLabel = { "aria-label": "description" };

const Picker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);

export default function Post({ post }) {
  if (!post) return null;

  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReacted, setIsReacted] = useState(false);
  const [text, setText] = useState("");
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);
  const [likeCount, setLikesCount] = useState(post.likes_count);

  // Check like status khi component mount
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const { accessToken } = await getToken();
        if (!accessToken) return;

        client.setToken(accessToken.value);
        const { data } = await client.get(`/posts/${post.id}/like/status`);
        if (data.status === 200) {
          setIsLiked(data.data.isLiked);
        }
      } catch (error) {
        console.error("Check like status error:", error);
      }
    };

    checkLikeStatus();
  }, [post.id]);

  const handleLike = async () => {
    // setIsLiked(!isLiked);
    try {
      const { accessToken } = await getToken();
      if (!{ accessToken }) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }

      client.setToken(accessToken.value);

      const response = await client.post(`/posts/${post.id}/like`);

      if (response.data.status === 200) {
        // Cập nhật trạng thái like
        setIsLiked(response.data.data.isLiked);

        // Sau khi like/unlike, gọi lại API để lấy thông tin bài viết cập nhật
        const postResponse = await client.get(`/posts/${post.id}`);
        if (postResponse.data.status === 200) {
          // Cập nhật post state với dữ liệu mới nhất từ API
          setLikesCount(postResponse.data.data.likes_count);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      showToast("error", "Có lỗi xảy ra khi thả tim");
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const toggleReaction = () => {
    setIsReacted(!isReacted);
  };

  const handleReaction = (emojiObject) => {
    setText(text + emojiObject.emoji);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const comment = formData.get("comment");
    if (comment === "") {
      showToast("error", "Bình luận không được để trống");
      return;
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsReacted(false); // Set isReacted về false khi click ngoài
      }
    }

    // Thêm listener vào document
    document.addEventListener("mousedown", handleClickOutside);

    // Dọn dẹp khi component unmount hoặc trước khi effect chạy lại
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Chỉ chạy một lần khi component mount

  return (
    <Container sx={{ width: "480px" }} className="mt-6 relative">
      <Box className="flex justify-between items-center ">
        <Box className="flex items-center">
          <Avatar
            isBordered
            size="md"
            src={post.user.avatar_url}
            className="flex-shrink-0 cursor-pointer"
          />
          <span className="after:content-['•'] font-semibold ml-3">
            {post.user.username}
          </span>
          <span className="ml-1 text-gray-500">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </Box>
        <Box className="cursor-pointer">
          <MoreHorizIcon />
        </Box>
      </Box>

      {/* Box đăng ảnh, video */}
      <Box>
        <Image
          src={post.image_url}
          width={468}
          height={623.675}
          priority
          style={{ width: "auto", height: "100%" }}
          className="mt-3 rounded-sm"
          alt="post-image"
        />
      </Box>

      {/* Box tym,comment,share... */}
      <Box className="mt-2 flex justify-between">
        {/* Box options tương tác */}
        <Box className="flex items-center gap-4">
          {/* Box thả tym */}
          <Tooltip
            content="Thả tim"
            delay={0}
            closeDelay={0}
            motionProps={{
              variants: {
                exit: {
                  opacity: 0,
                  transition: {
                    duration: 0.1,
                    ease: "easeIn",
                  },
                },
                enter: {
                  opacity: 1,
                  transition: {
                    duration: 0.15,
                    ease: "easeOut",
                  },
                },
              },
            }}
            color="danger"
            size="sm"
            placement="bottom"
            offset={0}
          >
            <Box className="cursor-pointer" onClick={handleLike}>
              {isLiked ? (
                <FavoriteOutlinedIcon
                  sx={{ fontSize: "28px" }}
                  className="text-red-500"
                />
              ) : (
                <FavoriteBorderOutlinedIcon
                  className="hover:text-gray-500"
                  sx={{ fontSize: "28px" }}
                />
              )}
            </Box>
          </Tooltip>

          {/* Box bình luận */}
          <Tooltip
            content="Bình luận"
            delay={0}
            closeDelay={0}
            motionProps={{
              variants: {
                exit: {
                  opacity: 0,
                  transition: {
                    duration: 0.1,
                    ease: "easeIn",
                  },
                },
                enter: {
                  opacity: 1,
                  transition: {
                    duration: 0.15,
                    ease: "easeOut",
                  },
                },
              },
            }}
            color="primary"
            size="sm"
            placement="bottom"
            offset={0}
          >
            <Box className="cursor-pointer">
              <svg
                aria-label="Bình luận"
                fill="currentColor"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
                className="hover:text-gray-500"
              >
                <path
                  d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </Box>
          </Tooltip>

          {/* Box chia sẻ */}
          <Tooltip
            content="Chia sẻ"
            delay={0}
            closeDelay={0}
            motionProps={{
              variants: {
                exit: {
                  opacity: 0,
                  transition: {
                    duration: 0.1,
                    ease: "easeIn",
                  },
                },
                enter: {
                  opacity: 1,
                  transition: {
                    duration: 0.15,
                    ease: "easeOut",
                  },
                },
              },
            }}
            color="secondary"
            size="sm"
            placement="bottom"
            offset={0}
          >
            <Box className="cursor-pointer hover:text-gray-500">
              <svg
                aria-label="Chia sẻ bài viết"
                fill="currentColor"
                height="24"
                role="img"
                viewBox="0 0 24 24"
                width="24"
              >
                <line
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  x1="22"
                  x2="9.218"
                  y1="3"
                  y2="10.083"
                ></line>
                <polygon
                  fill="none"
                  points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></polygon>
              </svg>
            </Box>
          </Tooltip>
        </Box>
        <Tooltip
          content="Lưu bài viết"
          delay={0}
          closeDelay={0}
          motionProps={{
            variants: {
              exit: {
                opacity: 0,
                transition: {
                  duration: 0.1,
                  ease: "easeIn",
                },
              },
              enter: {
                opacity: 1,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              },
            },
          }}
          color="warning"
          size="sm"
          placement="bottom"
          offset={0}
        >
          <Box className="cursor-pointer" onClick={handleBookmark}>
            {isBookmarked ? (
              <BookmarkOutlinedIcon
                sx={{ fontSize: "28px" }}
                className="text-orange-400"
              />
            ) : (
              <BookmarkBorderOutlinedIcon
                className="hover:text-gray-500"
                sx={{ fontSize: "28px" }}
              />
            )}
          </Box>
        </Tooltip>
      </Box>

      {/* Box số lượt thích, bình luận */}
      <Box className="text-sm">
        <Box className="mt-2">
          <p className="font-semibold">
            {likeCount} <span>lượt thích</span>
          </p>
        </Box>

        <Box className="mt-2 flex">
          <p>
            <span className="font-semibold">{post.user.username} </span>
            {post.content}
          </p>

          {/* hashtag */}
          <p></p>
        </Box>

        {/* Xem comment */}
        <Box className="mt-2">
          <p className="text-gray-500">
            Xem tất cả <span>{post.comments_count}</span> bình luận
          </p>
        </Box>

        {/* Comment */}
        <form onSubmit={handleSend}>
          <Box className="mt-2 flex justify-between">
            <TextField
              id="filled-multiline-flexible"
              placeholder="Thêm bình luận..."
              className="w-full h-auto"
              multiline
              maxRows={4}
              variant="standard"
              inputProps={ariaLabel}
              value={text}
              onChange={(e) => setText(e.target.value)}
              name="comment"
            />

            <Box className="cursor-pointer" ref={buttonRef}>
              <SentimentSatisfiedOutlinedIcon onClick={toggleReaction} />
            </Box>
            {isReacted && (
              <Box className="absolute top-1/3 left-full" ref={pickerRef}>
                <Picker onEmojiClick={handleReaction} emojiStyle="twitter" />
              </Box>
            )}
          </Box>
          <Button
            type="submit"
            size="sm"
            color="primary"
            className="text-md mt-2"
          >
            Đăng
          </Button>
        </form>
      </Box>
    </Container>
  );
}
