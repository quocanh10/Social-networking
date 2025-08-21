import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import socket from "@/utils/socket";
import { getToken } from "@/app/actions/gettoken.action";
import { client } from "@/app/helpers/fetch_api/client";
import { Avatar } from "@nextui-org/react";

export default function ChatBox({ chat }) {
  const params = useSearchParams();
  const peerId = params.get("user");
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [userAvatars, setUserAvatars] = useState({});

  console.log("18 ChatBox mounted with chat:", chat);

  useEffect(() => {
    if (!chat || !chat.ThreadParticipants) return;
    const userInfo = {};
    chat.ThreadParticipants.forEach((tp) => {
      if (tp.user) {
        userInfo[tp.id] = {
          avatar: tp.user.avatar_url,
          name: tp.user.username,
        };
        console.log("User info for thread participant:", userInfo[tp.id]);
      }
    });
    setUserAvatars(userInfo);
  }, [chat]);

  useEffect(() => {
    const fetchUserId = async () => {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const res = await client.get("/profile");
      const userId = res.data.data.user.id;
      setUserId(userId);
      socket.emit("register", userId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const getThreadId = async () => {
      if (chat && chat.id) {
        setThreadId(chat.id);
        return;
      }
      if (peerId && userId) {
        const res = await client.post("/chat/create", {
          participantId: peerId,
        });
        setThreadId(res.data.data.thread.id);
      }
    };
    getThreadId();
  }, [chat, peerId, userId]);

  useEffect(() => {
    if (!threadId) return setMessages([]);
    const fetchMessages = async () => {
      const { accessToken } = await getToken();
      client.setToken(accessToken.value);
      const res = await client.get(`/chat/messages/${threadId}`);
      const msgs = res.data.data.messages || [];
      setMessages(res.data.data.messages || []);
      // Lấy danh sách userId gửi tin nhắn (ngoại trừ mình)
      const ids = [
        ...new Set(
          msgs.map((msg) => msg.sender_id).filter((id) => id && id !== userId)
        ),
      ];

      // Lấy thông tin cơ bản từng userId
      const userInfo = {};
      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await client.get(`/users/${id}`);
            userInfo[id] = {
              avatar: res.data.data.user.avatar_url,
              name: res.data.data.user.username,
            };
          } catch (err) {
            userInfo[id] = { avatar: "", name: `User ${id}` };
          }
        })
      );
      setUserAvatars(userInfo);
    };
    fetchMessages();
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    const handleReceive = (msg) => {
      console.log("Nhận tin nhắn từ server:", msg);
      console.log("60 Thread ID:", msg.threadId);
      if (msg.threadId === threadId) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [threadId]);

  const handleSend = async () => {
    if (!input.trim() || !threadId || !userId) return;
    socket.emit("send_message", {
      threadId,
      content: input,
      toUserId:
        peerId ||
        chat.ThreadParticipants.find((tp) => tp.user_id !== userId)?.user_id,
    });
    const { accessToken } = await getToken();
    client.setToken(accessToken.value);
    await client.post("/chat/send", {
      threadId,
      content: input,
    });
    setInput("");
  };

  if (!threadId)
    return (
      <div className="flex items-center justify-center h-full">
        Chọn một cuộc trò chuyện
      </div>
    );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 px-4">
        {messages.map((msg, idx) => {
          const isMe = msg?.sender_id === userId;
          console.log("Tin nhắn:", msg);
          return (
            <div
              key={msg.id || idx}
              className={`mb-2 flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs ${
                  isMe ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                {/* Nếu không phải mình thì hiện tên hoặc id người gửi */}
                {!isMe && (
                  <div className="flex items-center mb-1">
                    <Avatar
                      src={userAvatars[msg?.sender_id]?.avatar}
                      size="sm"
                      className="mr-2"
                      classNames={{
                        img: "!opacity-100 !transition-none", // ép hiện ngay, bỏ fade
                        base: "!opacity-100", // phòng trường hợp lớp base cũng set opacity
                        fallback: "!opacity-100", // khi rơi vào fallback cũng không mờ
                      }}
                      disableAnimation
                    />
                    <span className="text-xs font-semibold">
                      {userAvatars[msg?.sender_id]?.name ||
                        `User ${msg?.sender_id}`}
                    </span>
                  </div>
                )}
                <span>{msg.content}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 flex">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Nhập tin nhắn..."
        />
        <button
          className="ml-2 px-4 py-1 bg-blue-500 text-white rounded"
          onClick={handleSend}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}
