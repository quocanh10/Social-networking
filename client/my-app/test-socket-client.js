const { io } = require("socket.io-client");
const socket = io("http://localhost:9000");

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
  socket.emit("send_message", { content: "Hello server!" });
});

socket.on("receive_message", (data) => {
  console.log("Received message:", data);
});
