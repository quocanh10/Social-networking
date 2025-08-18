import { useEffect, useState } from "react";
import { getToken } from "@/app/actions/gettoken.action";
import { client } from "@/app/helpers/fetch_api/client";
import { Avatar } from "@nextui-org/react";

export default function Sidebar({ onSelectChat, selectedChat }) {
  const [threads, setThreads] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { accessToken } = await getToken();
        client.setToken(accessToken.value);
        const res = await client.get("/profile");
        console.log("15 User ID:", res.data.data.user.id);
        setUserId(res.data.data.user.id);
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const { accessToken } = await getToken();
        client.setToken(accessToken.value);
        const res = await client.get("/chat/threads");
        console.log("19 Fetched threads:", res.data.data.threads);
        setThreads(res.data.data.threads || []);
      } catch (err) {
        setThreads([]);
      }
    };
    fetchThreads();
  }, []);

  // Hàm lấy tên các thành viên khác mình
  const getOtherUsers = (thread) => {
    if (!thread.ThreadParticipants) return [];
    return thread.ThreadParticipants.filter((tp) => tp.user_id !== userId).map(
      (tp) => tp.user
    );
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Danh sách chat</h2>
      <ul>
        {threads.map((thread) => {
          const others = getOtherUsers(thread);
          const isSelected = selectedChat && thread.id === selectedChat.id;
          return (
            <li
              key={thread.id}
              className={`cursor-pointer py-2 border-b flex items-center gap-2 ${
                isSelected ? "bg-blue-100" : ""
              }`}
              onClick={() => onSelectChat(thread)}
            >
              {others.map((user) => (
                <Avatar
                  key={user.id}
                  src={user.avatar_url}
                  name={user.username}
                  size="sm"
                  className="mr-1"
                />
              ))}
              <span>
                {others.map((user) => user.username).join(", ") || "Nhóm chat"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
