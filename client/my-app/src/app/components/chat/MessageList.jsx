"use client";
import { useEffect, useState } from "react";
import { getToken } from "@/app/actions/gettoken.action";
import { client } from "@/app/helpers/fetch_api/client";
import { Avatar } from "@nextui-org/react";

export default function MessageList({ messages }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const res = await client.get("/profile");
      setUserId(res.data.data.user.id);
    };
    fetchUserId();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto mb-4">
      {messages.map((msg, idx) => {
        const isMe =
          (msg.sender && msg.sender.id === userId) || msg.sender_id === userId;
        return (
          <div
            key={idx}
            className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            {isMe ? (
              // Tin nhắn của mình: chỉ hiển thị nội dung
              <div className="px-3 py-2 rounded-lg bg-blue-500 text-white max-w-xs">
                <span>{msg.content}</span>
              </div>
            ) : (
              // Tin nhắn của bạn: hiển thị avatar và nội dung
              <div className="flex items-center">
                <Avatar
                  src={msg.sender?.avatar_url}
                  name={msg.sender?.username}
                  size="sm"
                  className="mr-2"
                />
                <div className="px-3 py-2 rounded-lg bg-gray-200 text-black max-w-xs">
                  <span className="font-semibold"></span>{" "}
                  <span>{msg.content}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
