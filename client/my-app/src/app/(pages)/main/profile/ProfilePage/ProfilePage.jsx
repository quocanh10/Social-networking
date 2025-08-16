"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getToken } from "../../../../actions/gettoken.action";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import PostGrid from "./components/PostGrid";
import { Spinner } from "@nextui-org/react"; // Thay thế Spinner bằng component từ NextUI
import { client } from "@/app/helpers/fetch_api/client";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postsCount, setPostsCount] = useState(0);

  const { username } = useParams(); // lấy [username] từ URL, ví dụ /main/profile/johndoe
  const [isOwn, setIsOwn] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const { accessToken } = await getToken();

      if (!accessToken.value) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }

      client.setToken(accessToken.value);

      // 1) Lấy user hiện tại để biết có phải xem trang của mình không
      const meRes = await client.get("/profile");
      const meOk = meRes?.data?.message === "Success";
      const meUser = meOk ? meRes.data.data.user : null;

      // 2) Nếu không có username trên URL -> trang của mình
      if (!username) {
        if (!meUser) {
          setError("Không thể tải thông tin tài khoản của bạn.");
          return;
        }
        setIsOwn(true);
        setProfileData(meUser);
        // Lấy tổng bài viết của mình
        const postsRes = await client.get(`/posts/user/${meUser.id}`);
        setPostsCount(postsRes.data.data.pagination?.total_posts || 0);

        return;
      }

      // 3) Có username trên URL
      // - Nếu username === me.username -> vẫn là trang của mình
      if (meUser && meUser.username === username) {
        setIsOwn(true);
        setProfileData(meUser);
        console.log("64 current Profile:", meUser);
        // Lấy tổng bài viết của mình
        const postsRes = await client.get(`/posts/user/${meUser.id}`);
        setPostsCount(postsRes.data.data.pagination?.total_posts || 0);
        return;
      }

      // - Ngược lại, gọi API lấy profile public theo username
      //   Đổi endpoint này theo backend của anh: ví dụ "/users/{username}" hoặc "/users/profile?username="
      const targetRes = await client.get(
        `/profile/${encodeURIComponent(username)}`
      );
      const ok = targetRes?.data?.message === "Success";

      if (!ok || !targetRes.data?.data?.user) {
        setError("Không tìm thấy người dùng.");
        return;
      }

      setIsOwn(false);
      setProfileData(targetRes.data.data.user);
      // Lấy tổng bài viết của mình
      const postsRes = await client.get(
        `/posts/user/${targetRes.data.data.user.id}`
      );
      setPostsCount(postsRes.data.data.pagination?.total_posts || 0);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải trang cá nhân...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProfileData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header với avatar, username, follow button */}
      <ProfileHeader
        profileData={profileData}
        isOwn={isOwn}
        postsCount={postsCount}
      />

      {/* Stats: Posts, Followers, Following */}
      {/* <ProfileStats profileData={profileData} /> */}

      {/* Tabs: Posts, Reels, Tagged */}
      <ProfileTabs />

      {/* Grid posts */}
      <PostGrid profileData={profileData} />
    </div>
  );
}
