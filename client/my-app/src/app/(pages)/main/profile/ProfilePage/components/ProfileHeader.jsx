"use client";

import { Avatar, Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SettingsIcon from "@mui/icons-material/Settings";

export default function ProfileHeader({ profileData }) {
  const router = useRouter();

  if (!profileData) {
    return <div>Loading profile header...</div>;
  }

  const handleEditProfile = () => {
    router.push("/main/profile/edit");
  };

  return (
    <div className="flex items-center gap-6 mb-5">
      {/* Avatar */}
      <div className="flex justify-center md:justify-start">
        <Avatar
          size="xl"
          src={
            profileData.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profileData.fullname || profileData.username || "User"
            )}&background=random&size=150`
          }
          className="w-32 h-32"
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col">
        {/* Username và Edit Button */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-xl font-light">{profileData.username}</h1>
            <Button
              size="sm"
              variant="ghost"
              as={Link}
              href="/main/profile/edit"
            >
              Chỉnh sửa trang cá nhân
            </Button>
            <Button variant="ghost" size="sm" className="px-6">
              Xem kho lưu trữ
            </Button>
            <SettingsIcon className="cursor-pointer" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          <span>
            <strong>0</strong> bài viết
          </span>
          <span>
            <strong>0</strong> người theo dõi
          </span>
          <span>
            <strong>0</strong> đang theo dõi
          </span>
        </div>

        {/* Bio - Chỉ hiển thị tên và mô tả */}
        <div className="space-y-1">
          {profileData.fullname && (
            <p className="font-semibold">{profileData.fullname}</p>
          )}
          {profileData.intro && (
            <p className="text-gray-600">{profileData.intro}</p>
          )}
          {profileData.profile && (
            <p className="text-gray-700">{profileData.profile}</p>
          )}
        </div>

        {/* Verification Badge */}
        {profileData.tick_blue && (
          <div className="flex items-center gap-2">
            <span className="text-blue-500">✓</span>
            <span className="text-sm text-gray-600">Tài khoản đã xác minh</span>
          </div>
        )}
      </div>
    </div>
  );
}
