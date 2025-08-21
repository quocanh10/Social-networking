import { useEffect, useState } from "react";
import { getToken } from "@/app/actions/gettoken.action";
import { client } from "@/app/helpers/fetch_api/client";
import { Avatar } from "@nextui-org/react";
import { showToast } from "@/app/helpers/Toastify";
import socket from "@/utils/socket";

export default function Sidebar({ onSelectChat, selectedChat }) {
  const [threads, setThreads] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const { accessToken } = await getToken();
        client.setToken(accessToken.value);
        const res = await client.get("/profile");
        setUserId(res.data.data.user.id);
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    };
    fetchUserId();
  }, []);

  const fetchThreads = async () => {
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const res = await client.get("/chat/threads");
      // Sắp xếp theo updated_at mới nhất
      const sorted = (res.data.data.threads || []).sort(
        (a, b) =>
          new Date(b.updated_at || b.last_message_at) -
          new Date(a.updated_at || a.last_message_at)
      );
      setThreads(sorted);
    } catch (err) {
      setThreads([]);
    }
  };

  useEffect(() => {
    fetchThreads();
    // Lắng nghe sự kiện tin nhắn mới
    const handleReceive = () => fetchThreads();
    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, []);

  // Lấy danh sách tất cả user để chọn thành viên nhóm
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const { accessToken } = await getToken();
        client.setToken(accessToken.value);
        const res = await client.get("/users"); // API trả về danh sách user
        setAllUsers(res.data.data.users || []);
      } catch (err) {
        setAllUsers([]);
      }
    };
    if (showCreateGroup) fetchAllUsers();
  }, [showCreateGroup]);

  const getOtherUsers = (thread) => {
    if (!thread.ThreadParticipants) return [];
    return thread.ThreadParticipants.filter((tp) => tp.user_id !== userId).map(
      (tp) => tp.user
    );
  };

  // Xử lý tạo nhóm chat
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 2) {
      showToast("error", "Tên nhóm không hợp lệ hoặc chưa chọn đủ thành viên.");
      return;
    }
    try {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const res = await client.post("/chat/group", {
        name: groupName,
        participantIds: selectedMembers,
      });
      setThreads((prev) => [...prev, res.data.data.thread]);
      await fetchThreads();
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedMembers([]);
    } catch (err) {
      showToast("error", "Tạo nhóm thất bại!");
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold mb-4">Danh sách chat</h2>
      <button
        className="mb-4 px-3 py-2 bg-blue-500 text-white rounded"
        onClick={() => setShowCreateGroup(true)}
      >
        + Tạo nhóm chat
      </button>
      {showCreateGroup && (
        <div className="mb-4 p-3 border rounded bg-white shadow">
          <div className="mb-2 font-semibold">Tạo nhóm mới</div>
          <input
            className="mb-2 w-full border rounded px-2 py-1"
            placeholder="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="mb-2">Chọn thành viên:</div>
          <div className="flex flex-wrap gap-2 mb-2">
            {allUsers
              .filter((u) => u.id !== userId)
              .map((u) => (
                <label key={u.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers((prev) => [...prev, u.id]);
                      } else {
                        setSelectedMembers((prev) =>
                          prev.filter((id) => id !== u.id)
                        );
                      }
                    }}
                  />
                  <Avatar src={u.avatar_url} size="sm" />
                  <span>{u.username}</span>
                </label>
              ))}
          </div>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={handleCreateGroup}
          >
            Tạo nhóm
          </button>
          <button
            className="ml-2 px-3 py-1 bg-gray-300 rounded"
            onClick={() => setShowCreateGroup(false)}
          >
            Hủy
          </button>
        </div>
      )}
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
                {thread.is_group
                  ? thread.name // Nếu là nhóm thì hiện tên nhóm
                  : others.map((user) => user.username).join(", ") ||
                    "Nhóm chat"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
