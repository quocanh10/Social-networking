"use client";

import { useState, useEffect } from "react";
import { Avatar, Button } from "@nextui-org/react";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import SettingsIcon from "@mui/icons-material/Settings";
import { getToken } from "@/app/actions/gettoken.action";
import { client } from "@/app/helpers/fetch_api/client";

export default function ProfileHeader({ profileData, isOwn, postsCount }) {
  // const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    if (!isOwn && profileData?.id) {
      checkFollowStatus();
    }
    if (profileData?.id) {
      fetchFollowCounts();
    }
  }, [profileData, isOwn]);

  // Kiểm tra trạng thái follow
  const checkFollowStatus = async () => {
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const res = await client.get(`/follow/${profileData.id}/status`);
      setIsFollowing(res.data.isFollowing);
    } catch (err) {
      setIsFollowing(false);
    }
  };

  // Lấy số lượng followers/following
  const fetchFollowCounts = async () => {
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const followersRes = await client.get(
        `/follow/${profileData.id}/followers`
      );
      const followingRes = await client.get(
        `/follow/${profileData.id}/following`
      );
      setFollowersCount(followersRes.data.totalFollowers);
      setFollowingCount(followingRes.data.totalFollowing);
    } catch (err) {
      setFollowersCount(0);
      setFollowingCount(0);
    }
  };

  // Theo dõi
  const handleFollow = async () => {
    setLoadingFollow(true);
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      await client.post(`/follow/${profileData.id}`);
      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
    } catch (err) {
      // Xử lý lỗi nếu cần
    } finally {
      setLoadingFollow(false);
    }
  };

  // Bỏ theo dõi
  const handleUnfollow = async () => {
    setLoadingFollow(true);
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      await client.delete(`/follow/${profileData.id}`);
      setIsFollowing(false);
      setFollowersCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (err) {
      // Xử lý lỗi nếu cần
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!profileData) {
    return <div>Loading profile header...</div>;
  }

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
            {isOwn ? (
              <Button
                size="sm"
                variant="ghost"
                as={Link}
                href="/main/profile/edit"
              >
                Chỉnh sửa trang cá nhân
              </Button>
            ) : isFollowing ? (
              <Button
                size="sm"
                variant="bordered"
                className="border border-gray-300 text-black font-medium hover:bg-gray-50"
                disabled={loadingFollow}
                onClick={handleUnfollow}
              >
                Đang theo dõi
              </Button>
            ) : (
              <Button
                size="sm"
                variant="solid"
                color="primary"
                disabled={loadingFollow}
                onClick={handleFollow}
              >
                Theo dõi
              </Button>
            )}
            {isOwn ? (
              <Button variant="ghost" size="sm" className="px-6">
                Xem kho lưu trữ
              </Button>
            ) : (
              <Button
                variant="solid"
                size="sm"
                className="px-6"
                as={Link}
                href={`/chat?user=${profileData.id}`}
              >
                Nhắn tin
              </Button>
            )}
            <SettingsIcon className="cursor-pointer" />
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          <span>
            <strong>{postsCount}</strong> bài viết
          </span>
          <span>
            <strong>{followersCount}</strong> người theo dõi
          </span>
          <span>
            <strong>{followingCount}</strong> đang theo dõi
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
