"use client";
import { useEffect, useState } from "react";
import { socket } from "@/utils/socket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });
    return () => socket.off("receive_message");
  }, []);

  const handleSend = (content) => {
    socket.emit("send_message", { content });
  };

  return (
    <div className="flex flex-col h-full p-4">
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
