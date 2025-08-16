"use client";
import { useState } from "react";
export default function MessageInput({ onSend }) {
  const [value, setValue] = useState("");
  const handleSend = () => {
    if (value.trim()) {
      onSend(value);
      setValue("");
    }
  };
  return (
    <div className="flex">
      <input
        className="flex-1 border rounded px-2 py-1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
  );
}
