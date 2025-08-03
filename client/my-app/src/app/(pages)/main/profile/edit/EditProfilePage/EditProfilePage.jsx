"use client";

import { useState, useEffect } from "react";
import { Avatar, Button, Input, Textarea } from "@heroui/react";
import { useRouter } from "next/navigation";
import { getToken } from "../../../../../actions/gettoken.action";

export default function EditProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    avatar: "",
    fullname: "",
    username: "",
    telnumber: "",
    email: "",
    intro: "",
    bio: "",
    gender: "",
    birthday: "",
  });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false); // THÊM DÒNG NÀY

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = await getToken();
      console.log("31 token:", token.accessToken.value);
      const response = await fetch("http://localhost:9000/api/v1/profile", {
        headers: {
          Authorization: `Bearer ${token.accessToken.value}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      console.log("Full response:", response);
      const data = await response.json();
      console.log("Profile data:", data);
      if (data.message === "Success") {
        const userData = data.data.user;
        console.log("User data:", userData);
        // Map API response fields to component state
        console.log("fullname:", userData.fullname);
        setProfileData({
          avatar: userData.avatar_url || "", // API trả về avatar_url
          fullname: userData.fullname || "",
          username: userData.username || "",
          telnumber: userData.telnumber || "",
          email: userData.email || "",
          intro: userData.intro || "",
          bio: userData.profile || "", // API trả về field 'profile' thay vì 'bio'
          gender: userData.gender || "",
          birthday: userData.birthday ? userData.birthday.split("T")[0] : "", // Format date từ ISO string
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadImageToServer = async (file) => {
    const formData = new FormData();
    formData.append("my_file", file); // Tên field phải là 'my_file' như trong router

    try {
      const token = await getToken();

      if (!token || !token.accessToken) {
        throw new Error("No access token available");
      }

      const response = await fetch(
        "http://localhost:9000/api/v1/cloudinary/upload-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.accessToken.value}`,
            // Không set Content-Type, để browser tự set cho FormData
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await response.json();
      console.log("Upload response:", data);

      // Trả về URL của ảnh đã upload (tùy thuộc vào response structure từ server)
      return data.data.url;
    } catch (error) {
      console.error("Server upload error:", error);
      throw error;
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarUrl = profileData.avatar;

      //Upload avatar to server if user selected new image
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          avatarUrl = await uploadImageToServer(avatarFile);
          console.log("Avatar uploaded successfully:", avatarUrl);

          // Cập nhật avatar preview với URL mới
          setProfileData((prev) => ({
            ...prev,
            avatar: avatarUrl,
          }));
        } catch (error) {
          alert("Lỗi upload ảnh: " + error.message);
          return;
        } finally {
          setUploadingAvatar(false);
        }
      }

      // Prepare data for API
      const updateData = {
        fullname: profileData.fullname,
        username: profileData.username,
        telnumber: profileData.telnumber,
        email: profileData.email,
        intro: profileData.intro,
        profile: profileData.bio, // API expects 'profile' field
        gender: profileData.gender,
        birthday: profileData.birthday,
        avatar_url: avatarUrl, // API expects 'avatar_url'
      };

      // Call update profile API
      const token = await getToken();
      const response = await fetch("http://localhost:9000/api/v1/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.accessToken.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.message === "Cập nhật thông tin thành công") {
        alert("Cập nhật profile thành công!");
        router.push("/main/profile");
      } else {
        alert("Lỗi cập nhật profile: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Lỗi khi lưu thông tin: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật handleAvatarChange để thêm validation tốt hơn
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh.");
        e.target.value = ""; // Reset input
        return;
      }

      setAvatarFile(file);

      // Preview image locally
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          avatar: e.target.result, // Preview local
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    router.push("/main/profile");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light mb-2">Chỉnh sửa trang cá nhân</h1>
        <div className="h-px bg-gray-300"></div>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <Avatar
          size="xl"
          src={
            profileData.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              profileData.fullname || profileData.username || "User"
            )}&background=random&size=150`
          }
          className="w-20 h-20"
        />
        <div>
          <h3 className="font-semibold text-lg">{profileData.username}</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            id="avatar-upload"
          />
          <label
            htmlFor="avatar-upload"
            className="text-blue-500 hover:text-blue-700 cursor-pointer text-sm font-medium"
          >
            Thay đổi ảnh đại diện
          </label>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Tên</label>
          <Input
            value={profileData.fullname}
            onChange={(e) => handleInputChange("fullname", e.target.value)}
            placeholder="Nhập tên đầy đủ"
            variant="bordered"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tên của bạn chỉ có thể được thay đổi hai lần trong vòng 14 ngày.
          </p>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên người dùng
          </label>
          <Input
            value={profileData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            placeholder="Nhập tên người dùng"
            variant="bordered"
          />
          <p className="text-xs text-gray-500 mt-1">
            Trong hầu hết trường hợp, bạn sẽ có thể thay đổi tên người dùng của
            mình trong vòng 14 ngày.
          </p>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Số điện thoại
          </label>
          <Input
            value={profileData.telnumber}
            onChange={(e) => handleInputChange("telnumber", e.target.value)}
            placeholder="Nhập số điện thoại"
            variant="bordered"
            type="tel"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            value={profileData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Nhập email"
            variant="bordered"
            type="email"
          />
        </div>

        {/* Intro */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Giới thiệu ngắn
          </label>
          <Input
            value={profileData.intro}
            onChange={(e) => handleInputChange("intro", e.target.value)}
            placeholder="Giới thiệu ngắn về bản thân"
            variant="bordered"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mô tả ngắn gọn về bạn (vd: Developer, Designer, Student...)
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Mô tả cá nhân
          </label>
          <Textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
            placeholder="Viết mô tả về bản thân..."
            variant="bordered"
            rows={3}
            maxLength={150}
          />
          <p className="text-xs text-gray-500 mt-1">
            {profileData.bio?.length || 0}/150
          </p>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium mb-2">Giới tính</label>
          <select
            value={profileData.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
            <option value="prefer_not_say">Không muốn tiết lộ</option>
          </select>
        </div>

        {/* Birthday */}
        <div>
          <label className="block text-sm font-medium mb-2">Ngày sinh</label>
          <Input
            value={profileData.birthday}
            onChange={(e) => handleInputChange("birthday", e.target.value)}
            placeholder="dd/mm/yyyy"
            variant="bordered"
            type="date"
          />
          <p className="text-xs text-gray-500 mt-1">
            Thông tin này sẽ không hiển thị công khai trên trang cá nhân của
            bạn.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-300">
        <Button
          color="primary"
          onClick={handleSave}
          isLoading={loading}
          className="px-8"
        >
          {loading ? "Đang lưu..." : "Gửi"}
        </Button>
        <Button
          variant="light"
          onClick={handleCancel}
          disabled={loading}
          className="px-8"
        >
          Hủy
        </Button>
      </div>
    </div>
  );
}
