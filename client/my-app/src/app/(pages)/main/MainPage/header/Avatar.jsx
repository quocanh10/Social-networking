import { Avatar } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { client } from "@/app/helpers/fetch_api/client";
import { getToken } from "@/app/actions/gettoken.action";

export default function AvatarStory() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { accessToken } = await getToken();
        if (accessToken?.value) {
          client.setToken(accessToken.value);
          const Response = await client.get("/profile");
          if (Response.data.message === "Success") {
            setUser(Response.data.data.user);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div className="flex overflow-x-auto flex-row gap-6 p-2  w-full">
      <div className="pl-1"></div>
      <div
        style={{
          maxWidth: "70px",
        }}
        className="p-1"
      >
        <Avatar
          isBordered
          size="lg"
          src={user?.avatar_url}
          className="flex-shrink-0 cursor-pointer opacity-100"
          classNames={{
            img: "!opacity-100 !transition-none", // ép hiện ngay, bỏ fade
            base: "!opacity-100", // phòng trường hợp lớp base cũng set opacity
            fallback: "!opacity-100", // khi rơi vào fallback cũng không mờ
          }}
          disableAnimation
        />
        <p
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
          className="text-xs mt-2 w-full"
        >
          {user?.username}
        </p>
      </div>

      <div className="px-1"></div>
    </div>
  );
}
