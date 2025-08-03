"use client";

import textLogo from "@/app/assets/images/text-logo.png";
import Image from "next/image";
import Link from "next/link";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SearchIcon from "@mui/icons-material/Search";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { Avatar } from "@heroui/react";
import { useState } from "react";
import { Box } from "@mui/material";
import CreatePost from "@/app/controllers/createpost/CreatePost";

export default function NavBar() {
  const [create, setCreate] = useState(false);

  const handleOpenCreatePost = () => {
    setCreate(true);
  };

  return (
    <div>
      <div
        className="py-8 px-5 flex flex-col fixed"
        style={{
          minWidth: "220px",
          borderRight: "1px solid #ccc",
          minHeight: "100vh",
          maxHeight: "100vh",
        }}
      >
        <div className="mb-2 p-2">
          <Link href="/">
            <Image
              src={textLogo}
              alt="icon trang chủ"
              style={{ maxWidth: "103px", maxHeight: "29px" }}
              priority
            />
          </Link>
        </div>
        <nav className="flex flex-col gap-4 mb-auto">
          <Link
            href="/"
            className="flex gap-2 items-center p-2 rounded hover:bg-gray-300 "
          >
            <HomeOutlinedIcon
              fontSize="large"
              color="inherit"
              className="text-black"
            />
            <span className="text-md">Trang chủ</span>
          </Link>
          <button className="flex gap-2 items-center p-2 rounded hover:bg-gray-300">
            <SearchIcon
              fontSize="large"
              color="inherit"
              className="text-black"
            />
            <span className="text-md">Tìm kiếm</span>
          </button>
          <Link
            href="/"
            className="flex gap-2 items-center p-2 rounded hover:bg-gray-300"
          >
            <ExploreOutlinedIcon fontSize="large" color="inherit" />
            <span className="text-md">Khám phá</span>
          </Link>
          <Link
            href="/"
            className="flex gap-2 items-center p-2 rounded hover:bg-gray-300"
          >
            <OndemandVideoOutlinedIcon fontSize="large" color="inherit" />
            <span className="text-md">Reels</span>
          </Link>
          <div
            href="/"
            className="flex gap-2 items-center p-2 rounded hover:bg-gray-300"
          >
            <svg
              aria-label="Messenger"
              className="flex justify-center items-center"
              fill="currentColor"
              height="35"
              role="img"
              viewBox="0 0 27 27"
              width="35"
            >
              <path
                d="M12.003 2.001a9.705 9.705 0 1 1 0 19.4 10.876 10.876 0 0 1-2.895-.384.798.798 0 0 0-.533.04l-1.984.876a.801.801 0 0 1-1.123-.708l-.054-1.78a.806.806 0 0 0-.27-.569 9.49 9.49 0 0 1-3.14-7.175 9.65 9.65 0 0 1 10-9.7Z"
                fill="none"
                stroke="currentColor"
                strokeMiterlimit="10"
                strokeWidth="1.739"
                className=""
              ></path>
              <path
                d="M17.79 10.132a.659.659 0 0 0-.962-.873l-2.556 2.05a.63.63 0 0 1-.758.002L11.06 9.47a1.576 1.576 0 0 0-2.277.42l-2.567 3.98a.659.659 0 0 0 .961.875l2.556-2.049a.63.63 0 0 1 .759-.002l2.452 1.84a1.576 1.576 0 0 0 2.278-.42Z"
                fillRule="evenodd"
              ></path>
            </svg>
            <span className="text-md">Tin nhắn</span>
          </div>
          <Link
            href="/"
            className="flex gap-2 items-center p-2 rounded hover:bg-gray-300"
          >
            <FavoriteBorderOutlinedIcon fontSize="large" color="inherit" />
            <span className="text-md">Thông báo</span>
          </Link>
          <Box
            onClick={handleOpenCreatePost}
            className="flex gap-2 items-center p-2 rounded hover:bg-gray-300 cursor-pointer"
          >
            <AddBoxOutlinedIcon fontSize="large" color="inherit" />
            <span className="text-md">Tạo</span>
          </Box>
          <Link
            href="/main/profile"
            className="flex gap-2 items-center p-2 rounded hover:bg-gray-300"
          >
            <Avatar
              size="sm"
              src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              className="flex-shrink-0"
            />
            <span className="text-md">Trang cá nhân</span>
          </Link>
        </nav>
        <button className="self-start flex gap-2 items-center rounded hover:bg-gray-300 w-full p-2 ">
          <MenuRoundedIcon fontSize="large" />
          <span className="text-md">Xem thêm</span>
        </button>
      </div>
      {create && <CreatePost setCreate={setCreate} />}
    </div>
  );
}
