import { useRef, useEffect } from "react";
import socket from "@/utils/socket";

export default function VideoCall({ threadId, peerId, onClose }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    // Bắt đầu lấy stream từ camera
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        // Tạo peer connection
        peerConnection.current = new RTCPeerConnection();
        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        console.log("Video call initiated", peerConnection.current);
        // Xử lý ICE candidate
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("26 Sending ICE candidate:", event.candidate);
            socket.emit("video_ice_candidate", {
              threadId,
              candidate: event.candidate,
              toUserId: peerId,
            });
          }
        };

        // Nhận stream từ đối phương
        peerConnection.current.ontrack = (event) => {
          remoteVideoRef.current.srcObject = event.streams[0];
        };

        // Tạo offer và gửi qua socket
        peerConnection.current.createOffer().then((offer) => {
          peerConnection.current.setLocalDescription(offer);
          console.log("42 Sending video_offer:", {
            threadId,
            offer,
            toUserId: peerId,
          });
          socket.emit("video_offer", {
            threadId,
            offer,
            toUserId: peerId,
          });
        });
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
        alert(
          "Không thể truy cập camera hoặc micro. Vui lòng kiểm tra quyền truy cập."
        );
      });

    // Nhận answer từ đối phương
    socket.on("video_answer", ({ answer }) => {
      if (
        peerConnection.current &&
        peerConnection.current.signalingState === "have-local-offer"
      ) {
        peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } else {
        console.warn(
          "Không thể setRemoteDescription(answer) khi signalingState là:",
          peerConnection.current?.signalingState
        );
      }
    });

    // Nhận ICE candidate từ đối phương
    socket.on("video_ice_candidate", ({ candidate }) => {
      if (peerConnection.current) {
        peerConnection.current
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((error) =>
            console.error("Lỗi khi thêm ICE candidate:", error)
          );
      } else {
        console.warn(
          "peerConnection chưa được khởi tạo khi nhận ICE candidate!"
        );
      }
    });
    // Nhận offer từ đối phương (nếu là người nhận)
    socket.on("video_offer", async ({ offer, fromUserId }) => {
      if (fromUserId !== peerId) return;
      if (!peerConnection.current) {
        peerConnection.current = new RTCPeerConnection();
      }
      peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
      localVideoRef.current.srcObject = stream;
      const answer = await peerConnection.current.createAnswer();
      peerConnection.current.setLocalDescription(answer);
      socket.emit("video_answer", {
        threadId,
        answer,
        toUserId: fromUserId,
      });
    });

    return () => {
      socket.off("video_answer");
      socket.off("video_ice_candidate");
      socket.off("video_offer");
      peerConnection.current?.close();
      peerConnection.current = null;
      // Giải phóng camera và mic
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [threadId, peerId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
      <div className="flex gap-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-64 h-48 bg-gray-800"
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-64 h-48 bg-gray-800"
        />
      </div>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={onClose}
      >
        Kết thúc cuộc gọi
      </button>
    </div>
  );
}
