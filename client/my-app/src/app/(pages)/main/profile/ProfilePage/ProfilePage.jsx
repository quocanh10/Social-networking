"use client";

import { useState, useEffect } from "react";
import { getToken } from "../../../../actions/gettoken.action";
import ProfileHeader from "./components/ProfileHeader";
import ProfileTabs from "./components/ProfileTabs";
import PostGrid from "./components/PostGrid";
import { Spinner } from "@heroui/react";
import { client } from "@/app/helpers/fetch_api/client";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const { accessToken } = await getToken();

      if (!{ accessToken }) {
        setError("Không tìm thấy token. Vui lòng đăng nhập lại.");
        return;
      }

      client.setToken(accessToken.value);
      const Res = await client.get("/profile");
      console.log("Response from profile API:", Res);

      const data = Res.data;
      console.log("Profile data:", data);

      if (Res.response.ok && data.message == "Success") {
        setProfileData(data.data.user);
      } else {
        setError(data.message || "Không thể tải thông tin profile");
      }
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
      <ProfileHeader profileData={profileData} />

      {/* Stats: Posts, Followers, Following */}
      {/* <ProfileStats profileData={profileData} /> */}

      {/* Tabs: Posts, Reels, Tagged */}
      <ProfileTabs />

      {/* Grid posts */}
      <PostGrid />
    </div>
  );
}
