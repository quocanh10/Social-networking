// "use client";
// import { useState } from "react";

// export default function MessageInput({ onSend }) {
//   const [input, setInput] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;
//     onSend(input);
//     setInput("");
//   };

//   return (
//     <form className="flex" onSubmit={handleSubmit}>
//       <input
//         className="flex-1 border rounded px-2"
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         placeholder="Nhập tin nhắn..."
//       />
//       <button
//         type="submit"
//         className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
//       >
//         Gửi
//       </button>
//     </form>
//   );
// }
