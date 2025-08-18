import { io } from "socket.io-client";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:9000",
  {
    auth: {
      userId:
        typeof window !== "undefined"
          ? localStorage.getItem("userId")
          : undefined,
    },
    transports: ["websocket"],
  }
);

export default socket;
