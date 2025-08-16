"use client";
export default function MessageList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto mb-2">
      {messages.map((msg, idx) => (
        <div key={idx} className="mb-1">
          <span className="px-2 py-1 bg-gray-200 rounded">{msg.content}</span>
        </div>
      ))}
    </div>
  );
}
