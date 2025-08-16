import React, { useState } from "react";

// Danh sách cuộc trò chuyện mẫu
const sampleChats = [
  { id: 1, name: "Alice", lastMessage: "Hi there!" },
  { id: 2, name: "Bob", lastMessage: "How are you?" },
  { id: 3, name: "Charlie", lastMessage: "Let's meet up." },
];

const Sidebar = ({ onSelectChat }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  const handleSelect = (chat) => {
    setSelectedChat(chat.id);
    if (onSelectChat) onSelectChat(chat);
  };

  return (
    <aside className="w-64 h-full bg-gray-100 border-r flex flex-col">
      <div className="p-4 font-bold text-lg border-b">Chats</div>
      <ul className="flex-1 overflow-y-auto">
        {sampleChats.map((chat) => (
          <li
            key={chat.id}
            className={`p-4 cursor-pointer hover:bg-gray-200 transition ${
              selectedChat === chat.id ? "bg-gray-300" : ""
            }`}
            onClick={() => handleSelect(chat)}
          >
            <div className="font-semibold">{chat.name}</div>
            <div className="text-sm text-gray-500">{chat.lastMessage}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
