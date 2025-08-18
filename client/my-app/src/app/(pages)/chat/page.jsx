"use client";

import { useState } from "react";
import NavBar from "@/app/(pages)/navbar/NavBar";
import Sidebar from "@/app/components/chat/Sidebar";
import ChatBox from "@/app/components/chat/ChatBox";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex h-screen">
      {/* NavBar bên trái */}
      <div className="w-64">
        <NavBar />
      </div>
      {/* Sidebar ở giữa */}
      <div className="w-64 border-r">
        <Sidebar onSelectChat={setSelectedChat} selectedChat={selectedChat} />
      </div>
      {/* ChatBox bên phải */}
      <div className="flex-1">
        <ChatBox chat={selectedChat} />
      </div>
    </div>
  );
}
