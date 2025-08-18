import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import socket from "@/utils/socket";
import { getToken } from "@/app/actions/gettoken.action";
import { client } from "@/app/helpers/fetch_api/client";
import { Avatar } from "@nextui-org/react";

export default function ChatBox({ chat }) {
  const params = useSearchParams();
  const peerId = params.get("user");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [threadId, setThreadId] = useState(null);

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
      setMessages(res.data.data.messages || []);
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
          // Nếu có sender_id thì dùng, nếu không thì so sánh toUserId
          const isMe =
            (msg.sender && msg.sender.id === userId) ||
            msg.sender_id === userId ||
            (!msg.sender_id && !msg.sender && msg.toUserId !== userId);

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
                <span>{msg.content}</span>
              </div>
            </div>
          );
        })}
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
