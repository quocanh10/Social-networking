"use client";

import { Box } from "@mui/material";
import ImageUploadToCloudinary from "./ImageUploadToCloudinary";
import { useState } from "react";
import Image from "next/image";
import KeyboardBackspaceRoundedIcon from "@mui/icons-material/KeyboardBackspaceRounded";
import { client } from "@/app/helpers/fetch_api/client";
import { getToken } from "@/app/actions/gettoken.action";
import { showToast } from "@/app/helpers/Toastify";
import Loading from "@/app/components/Loading/Loading";
import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import CropIcon from "@mui/icons-material/Crop";
import { Tooltip } from "@nextui-org/react";
import ImageCropper from "@/app/controllers/ImageCropper";
import { TextField, Button } from "@mui/material";
import { Avatar } from "@nextui-org/react";
import React, { useEffect } from "react";

export default function CreatePost({ setCreate }) {
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [back, setBack] = useState(false); // quay trở lại phần choose file
  const [confirmBack, setConfirmBack] = useState(false); // xác nhận quay trở lại phần choose file
  const [cutUI, setCutUI] = useState(false); // cắt ảnh
  const [displayUIBack, setDisplayUIBack] = useState(false); // hiển thị UI quay lại chọn ảnh
  const [displayUIWritePost, setDisplayUIWritePost] = useState(false); // hiển thị UI viết bài viết
  const [isLoading, setIsLoading] = useState(false);
  const [openEditImage, setOpenEditImage] = useState(false);
  const [imageAfterCrop, setImageAfterCrop] = useState("");
  const [publicIdAfterCrop, setPublicIdAfterCrop] = useState("");
  const [editPost, setEditPost] = useState(false); // Chỉnh sửa bài viết
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const { accessToken } = await getToken();
        client.setToken(accessToken.value);
        const response = await client.get("/profile");
        console.log("User profile response:", response);
        if (response.data.message === "Success") {
          setUserProfile(response.data.data.user);
        }
      } catch (error) {
        console.log("Error getting user profile:", error);
      }
    };

    getUserProfile();
  }, []);

  const handleGetData = (data) => {
    console.log("data: ", data);
    if (data) {
      setCutUI(true);
      if (data?.resource_type) {
        if (data?.resource_type === "image") {
          setImageUrl(data?.secure_url);
          setPublicId(data?.public_id);
        } else {
          setVideoUrl(data?.secure_url);
          setPublicId(data?.public_id);
        }
      }
    }
  };

  const addHashtag = (tag) => {
    const cleanTag = tag.trim().replace("#", "");
    if (cleanTag && !hashtags.includes(cleanTag) && hashtags.length < 10) {
      setHashtags([...hashtags, cleanTag]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (indexToRemove) => {
    setHashtags(hashtags.filter((_, index) => index !== indexToRemove));
  };

  const handleHashtagKeyPress = (e) => {
    if (e.key === "Enter" || e.key === " " || e.key === ",") {
      e.preventDefault();
      if (hashtagInput.trim()) {
        addHashtag(hashtagInput);
      }
    }
  };

  const handleBack = () => {
    setBack(true);
  };

  const handleConfirmBack = () => {
    setConfirmBack(true);
    handleBack();
  };

  const handleUIBack = () => {
    setDisplayUIBack(true);
  };

  const handleDeleteImageFromCloudinary = async (publicId) => {
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      setIsLoading(true);
      const response = await client.delete(
        `/cloudinary/delete-image/${publicId}`
      );

      if (response.data.status !== 200) {
        showToast("error", "Có lỗi xảy ra, vui lòng thử lại sau!");
      }

      if (publicIdAfterCrop) {
        await client.delete(`/cloudinary/delete-image/${publicIdAfterCrop}`);
      }
      setImageUrl("");
      setPublicId("");
      setCutUI(false);
      setDisplayUIBack(false);
      setDisplayUIWritePost(false);
      setIsLoading(false);
      setImageAfterCrop("");
      setPublicIdAfterCrop("");
    } catch (error) {
      console.log("error: ", error);
      setIsLoading(false);
    }
  };

  const handleToggleEditImage = () => {
    setOpenEditImage(!openEditImage);
  };

  const handleOffEditImage = () => {
    setOpenEditImage(false);
  };

  const validatePost = () => {
    if (!content.trim() && !imageUrl && !videoUrl) {
      showToast("error", "Bài viết phải có nội dung hoặc hình ảnh/video!");
      return false;
    }
    if (content.length > 2000) {
      showToast("error", "Nội dung không được vượt quá 2000 ký tự!");
      return false;
    }
    return true;
  };

  // Tạo bài viết
  const handleCreatePost = async () => {
    if (!validatePost()) return;

    setIsPosting(true);
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);

      const postData = {
        content: content.trim(),
        image_url: imageAfterCrop || imageUrl || null,
        hashtags: hashtags.length > 0 ? hashtags : null,
      };

      const response = await client.post("/posts", postData);

      if (response.data.message === "Success") {
        showToast("success", "Đăng bài thành công!");
        setCreate(false); // Đóng modal
        // Reset form
        setContent("");
        setHashtags([]);
        setHashtagInput("");
      } else {
        showToast("error", "Có lỗi xảy ra khi đăng bài!");
      }
    } catch (error) {
      console.log("Error creating post:", error);
      showToast("error", "Có lỗi xảy ra khi đăng bài!");
    } finally {
      setIsPosting(false);
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const onCropDone = (imgCroppedArea) => {
    // Tạo 1 canvas để vẽ ảnh đã cắt
    const canvasEle = document.createElement("canvas");
    canvasEle.width = imgCroppedArea.width;
    canvasEle.height = imgCroppedArea.height;

    const context = canvasEle.getContext("2d");

    const imageObj = new window.Image();
    imageObj.crossOrigin = "anonymous";

    imageObj.onload = async function () {
      context.drawImage(
        imageObj,
        imgCroppedArea.x,
        imgCroppedArea.y,
        imgCroppedArea.width,
        imgCroppedArea.height,
        0,
        0,
        imgCroppedArea.width,
        imgCroppedArea.height
      );
      try {
        const dataURL = canvasEle.toDataURL("image/jpeg");

        const file = dataURLtoFile(dataURL, "cropped-image.jpg");
        const formData = new FormData();
        formData.append("my_file", file);

        const { accessToken } = await getToken();
        setIsLoading(true);

        if (publicIdAfterCrop) {
          client.setToken(accessToken.value);
          setIsLoading(true);
          await client.delete(`/cloudinary/delete-image/${publicIdAfterCrop}`);
        } // Xóa ảnh crop cũ (ko phải ảnh gốc)

        await fetch("http://localhost:9000/api/v1/cloudinary/upload-image", {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken.value}`, // Đính kèm token vào header
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setPublicIdAfterCrop(data.public_id);
            setImageAfterCrop(data.secure_url);
            setOpenEditImage(false);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error:", error);
            setIsLoading(false);
          });
      } catch (err) {
        console.error("Không thể xuất canvas:", err);
        setIsLoading(false);
      }
    };
    imageObj.src = imageUrl;
  };

  const onCropCancel = () => {
    setOpenEditImage(false);
  };

  return (
    <>
      {isLoading && <Loading />}
      <Box className="fixed left-1/2 top-1/2" style={{ zIndex: "99999" }}>
        <Box
          style={{
            zIndex: "999999",
            minHeight: "555px",
            minWidth: `${displayUIWritePost ? "853px" : "513px"}`,
            transition: "min-width 0.3s ease-in-out",
          }}
          className="bg-white absolute -translate-x-1/2 -translate-y-1/2 rounded-md"
        >
          {!imageUrl.length ? (
            <h1 className="text-center py-2 font-semibold border-b-1 h-max">
              Tạo bài viết mới
            </h1>
          ) : cutUI ? (
            <Box className="text-center py-2 font-semibold border-b-1 h-max flex justify-between">
              <KeyboardBackspaceRoundedIcon
                className="ml-2 cursor-pointer"
                onClick={handleUIBack}
              />
              {editPost ? (
                <>
                  <h1>Chỉnh sửa bài viết</h1>
                  <span
                    className={`mr-2 cursor-pointer ${
                      (!content.trim() && !imageUrl && !videoUrl) || isPosting
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-500 hover:text-blue-700"
                    }`}
                    onClick={
                      (!content.trim() && !imageUrl && !videoUrl) || isPosting
                        ? undefined
                        : handleCreatePost
                    }
                  >
                    {isPosting ? "Đang đăng..." : "Chia sẻ"}
                  </span>
                </>
              ) : (
                <>
                  <h1>Cắt</h1>
                  <span
                    className="mr-2 text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={() => {
                      setEditPost(true);
                      setDisplayUIWritePost(true);
                    }}
                  >
                    Tiếp
                  </span>
                </>
              )}
            </Box>
          ) : (
            ""
          )}

          {!imageUrl.length ? (
            <Box
              className="flex justify-center items-center"
              style={{ minHeight: "calc(555px - 40.8px)" }}
            >
              <Box>
                <Box className="flex flex-col justify-center items-center gap-2">
                  <svg
                    aria-label="Biểu tượng thể hiện file phương tiện, chẳng hạn như hình ảnh hoặc video"
                    fill="currentColor"
                    height="77"
                    role="img"
                    viewBox="0 0 97.6 77.3"
                    width="96"
                  >
                    <title>
                      Biểu tượng thể hiện file phương tiện, chẳng hạn như hình
                      ảnh hoặc video
                    </title>
                    <path
                      d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z"
                      fill="currentColor"
                    ></path>
                    <path
                      d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z"
                      fill="currentColor"
                    ></path>
                    <path
                      d="M78.2 41.6 61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z"
                      fill="currentColor"
                    ></path>
                  </svg>
                  <h2 className="text-lg">Chọn ảnh và video yêu thích</h2>
                  {/* <ImageUpload onGetData={handleGetData} /> */}

                  <Box>
                    <ImageUploadToCloudinary onGetData={handleGetData} />
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              style={{
                maxHeight: "calc(555px - 40.8px)",
                minHeight: "calc(555px - 40.8px)",
                position: "relative",
                width: "100%",
                overflow: "hidden",
              }}
            >
              {imageUrl.length && (
                <Box>
                  <Image
                    src={imageAfterCrop || imageUrl}
                    priority
                    fill
                    style={{
                      objectFit: "contain",
                      maxWidth: "513px",
                    }}
                    className="rounded-b-md absolute"
                    alt="Ảnh bài viết"
                  />
                  <Box>
                    <Tooltip
                      placement="bottom"
                      color="primary"
                      content="Chỉnh sửa ảnh"
                    >
                      <Box
                        onClick={() => handleToggleEditImage()}
                        className="absolute bottom-5 left-5 p-2 bg-gray-700 rounded-full cursor-pointer hover:bg-gray-500"
                      >
                        <CropIcon className="text-white" />
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              )}

              {displayUIWritePost ? (
                <Box
                  className="absolute right-0 top-0 h-full bg-white rounded-br-md overflow-y-auto"
                  style={{ width: "340px" }}
                >
                  <Box className="p-4 h-full flex flex-col">
                    {/* Header với avatar */}
                    <Box className="flex items-center gap-3 mb-4">
                      <Avatar
                        src={userProfile?.avatar_url || ""}
                        alt={userProfile?.username || "User"}
                        size="sm"
                      />
                      <span className="font-medium text-sm">
                        {userProfile?.username || "User"}
                      </span>
                    </Box>

                    {/* Form nhập content */}
                    <Box className="flex-1 flex flex-col">
                      <TextField
                        multiline
                        rows={6}
                        placeholder="Viết chú thích..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        variant="standard"
                        fullWidth
                        InputProps={{
                          disableUnderline: true,
                          style: { fontSize: "14px" },
                        }}
                        sx={{
                          "& .MuiInputBase-root": {
                            padding: 0,
                          },
                        }}
                      />

                      {/* Character counter */}
                      <Box className="text-right text-xs text-gray-500 mt-2">
                        {content.length}/2000
                      </Box>

                      {/* Hashtag input */}
                      <Box className="mt-4">
                        <TextField
                          placeholder="Thêm hashtags (nhấn Enter để thêm)"
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyDown={handleHashtagKeyPress}
                          variant="standard"
                          fullWidth
                          InputProps={{
                            disableUnderline: true,
                            style: { fontSize: "14px" },
                          }}
                        />

                        {/* Hiển thị hashtags */}
                        {hashtags.length > 0 && (
                          <Box className="flex flex-wrap gap-1 mt-2">
                            {hashtags.map((tag, index) => (
                              <Box
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                              >
                                #{tag}
                                <button
                                  onClick={() => removeHashtag(index)}
                                  className="text-red-500 hover:text-red-700 ml-1"
                                >
                                  ×
                                </button>
                              </Box>
                            ))}
                          </Box>
                        )}

                        {/* Hashtag counter */}
                        <Box className="text-right text-xs text-gray-500 mt-1">
                          {hashtags.length}/10 hashtags
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                ""
              )}
            </Box>
          )}
        </Box>
        <Box
          className="bg-gray-400 opacity-80 w-screen h-screen fixed inset-0"
          // style={{ zIndex: "9999" }}
          onClick={() => {
            if (cutUI) {
            } else {
              setCreate(false);
            }
          }}
        />
        {openEditImage && (
          <Box
            className="absolute top-1/2 left-1/2 w-screen h-screen -translate-x-1/2 -translate-y-1/2"
            style={{
              zIndex: "9999999999",
              // width: "513px",
            }}
          >
            <ImageCropper
              image={imageUrl}
              onCropDone={onCropDone}
              onCropCancel={onCropCancel}
              onOpenEditImage={handleOffEditImage}
            />
          </Box>
        )}
        {displayUIBack && (
          <>
            <Box
              className="fixed top-1/2 left-1/2 bg-white -translate-x-1/2 -translate-y-1/2 rounded-md"
              style={{ zIndex: "9999999" }}
            >
              <Box className="flex flex-col justify-between items-center p-10">
                <Box className="flex flex-col">
                  <h1 className="text-center text-xl">Bỏ bài viết?</h1>
                  <p
                    style={{
                      fontSize: "14px",
                    }}
                    className="text-slate-400"
                  >
                    Nếu rời đi, bạn sẽ mất những gì vừa chỉnh sửa{" "}
                  </p>
                </Box>
              </Box>
              <Box
                onClick={() => handleDeleteImageFromCloudinary(publicId)}
                className="w-full flex justify-center hover:bg-red-500  hover:text-white border-t-1 p-3 cursor-pointer transition-all ease-in-out"
              >
                <button>Xác nhận</button>
              </Box>
              <Box
                onClick={() => {
                  setDisplayUIBack(false);
                }}
                className="w-full flex justify-center hover:bg-blue-500 hover:text-white border-t-1 p-3 cursor-pointer transition-all ease-in-out rounded-b-sm"
              >
                <button>Hủy</button>
              </Box>
            </Box>
            <Box
              className="bg-gray-800 opacity-80 w-screen h-screen fixed inset-0"
              style={{ zIndex: "999999" }}
              onClick={() => {
                setDisplayUIBack(false);
              }}
            />
          </>
        )}
      </Box>
    </>
  );
}
