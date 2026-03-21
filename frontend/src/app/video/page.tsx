"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_API_URL as string);

export default function VideoPage() {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const peer = useRef<RTCPeerConnection | null>(null);

  const roomId = "docdost-room"; // same for both users

  useEffect(() => {
    const startCall = async () => {
      // 🔥 Create peer connection
      peer.current = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }
        ]
      });

      // 🔥 Get camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      // 🔥 Add tracks
      stream.getTracks().forEach(track => {
        peer.current?.addTrack(track, stream);
      });

      // 🔥 Receive remote stream
      peer.current.ontrack = (event) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = event.streams[0];
        }
      };

      // 🔥 ICE candidates
      peer.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            roomId
          });
        }
      };

      // 🔥 Join room
      socket.emit("join-room", roomId, "user");

      // 🔥 If new user joins → create offer
      socket.on("user-connected", async () => {
        const offer = await peer.current!.createOffer();
        await peer.current!.setLocalDescription(offer);

        socket.emit("offer", { offer, roomId });
      });

      // 🔥 Receive offer
      socket.on("offer", async (data) => {
        await peer.current!.setRemoteDescription(data.offer);

        const answer = await peer.current!.createAnswer();
        await peer.current!.setLocalDescription(answer);

        socket.emit("answer", { answer, roomId });
      });

      // 🔥 Receive answer
      socket.on("answer", async (data) => {
        await peer.current!.setRemoteDescription(data.answer);
      });

      // 🔥 Receive ICE
      socket.on("ice-candidate", async (data) => {
        try {
          await peer.current!.addIceCandidate(data.candidate);
        } catch (err) {
          console.error(err);
        }
      });
    };

    startCall();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-xl font-bold">Video Call</h1>

      <video
        ref={localVideo}
        autoPlay
        muted
        className="w-64 border"
      />

      <video
        ref={remoteVideo}
        autoPlay
        className="w-64 border"
      />
    </div>
  );
}