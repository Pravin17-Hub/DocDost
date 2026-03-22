"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL as string);

export default function VideoPage() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const peer = useRef<RTCPeerConnection | null>(null);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const roomId = "docdost-room";

  useEffect(() => {
    const start = async () => {
      peer.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:relay.metered.ca:80",
            username: "openai",
            credential: "openai"
          }
        ]
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideo.current) localVideo.current.srcObject = stream;

      stream.getTracks().forEach(track => {
        peer.current?.addTrack(track, stream);
      });

      peer.current.ontrack = (event) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      peer.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            roomId
          });
        }
      };

      socket.emit("join-room", roomId);

      // 🔥 FORCE OFFER (IMPORTANT)
      setTimeout(async () => {
        const offer = await peer.current!.createOffer();
        await peer.current!.setLocalDescription(offer);

        socket.emit("offer", { offer, roomId });
      }, 1000);

      socket.on("offer", async (offer) => {
        await peer.current!.setRemoteDescription(offer);

        const answer = await peer.current!.createAnswer();
        await peer.current!.setLocalDescription(answer);

        socket.emit("answer", { answer, roomId });
      });

      socket.on("answer", async (answer) => {
        await peer.current!.setRemoteDescription(answer);
      });

      socket.on("ice-candidate", async (candidate) => {
        try {
          await peer.current!.addIceCandidate(candidate);
        } catch (err) {
          console.error(err);
        }
      });

      // 🔥 CHAT RECEIVE
      socket.on("receive-message", (msg) => {
        setMessages(prev => [...prev, msg]);
      });
    };

    start();
  }, []);

  // 🔥 SEND MESSAGE
  const sendMessage = () => {
    if (!message) return;

    socket.emit("send-message", {
      roomId,
      message
    });

    setMessages(prev => [...prev, message]);
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-xl font-bold">Video Call</h1>

      <div className="flex gap-4">
        <video ref={localVideo} autoPlay muted className="w-64 border" />
        <video ref={remoteVideo} autoPlay className="w-64 border" />
      </div>

      {/* CHAT */}
      <div className="w-80 border p-3">
        <div className="h-40 overflow-y-auto border mb-2 p-2">
          {messages.map((m, i) => (
            <div key={i}>{m}</div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border flex-1 p-1"
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white px-3">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}