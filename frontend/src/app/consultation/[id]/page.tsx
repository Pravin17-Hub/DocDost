"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Send, FilePenLine } from "lucide-react";
import { motion } from "framer-motion";

export default function ConsultationPage() {
  const params = useParams();
  const roomId = params.id as string;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [prescription, setPrescription] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (!token || !u) return router.push("/login");
    
    const parsedUser = JSON.parse(u);
    setUser(parsedUser);

    const s = io(`${process.env.NEXT_PUBLIC_API_URL}`);
    setSocket(s);

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        localStreamRef.current = stream;
        
        s.emit("join-room", roomId, parsedUser.id);
        
        // Simulating the signaling logic for WebRTC visually...
        // Note: For a true 1:1 call, an ICE/SDP exchange via socket would be required here.
        // But for this UI phase, we just show the local stream. 
      } catch (err) {
        console.error("Camera access denied");
      }
    };

    initMedia();

    s.on("user-connected", (userId) => {
      console.log("User connected:", userId);
      // In full implementation, we create Offer here.
    });

    s.on("createMessage", (message, senderId) => {
      setMessages((prev) => [...prev, { text: message, senderId }]);
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      s.disconnect();
    };
  }, [roomId, router]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (msgInput.trim() && socket) {
      socket.emit("message", msgInput);
      setMsgInput("");
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = audioMuted;
      setAudioMuted(!audioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = videoOff;
      setVideoOff(!videoOff);
    }
  };

  const endCall = () => {
    router.push("/dashboard");
  };

  if (!user) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-7xl h-[90vh] grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* WebRTC Video Area */}
        <div className="lg:col-span-3 rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden relative flex flex-col">
          {/* Main Video (Remote) */}
          <div className="flex-1 w-full bg-slate-100 flex items-center justify-center relative">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover opacity-50"></video>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <p className="text-slate-500 font-medium">Waiting for participant...</p>
            </div>
          </div>
          
          {/* Local Video PIP */}
          <div className="absolute top-6 right-6 w-48 h-32 bg-slate-50 rounded-2xl border-2 border-slate-200 overflow-hidden shadow-2xl z-10">
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover"></video>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/80 backdrop-blur text-[10px] text-slate-900 rounded-md">You</div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-4 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl flex items-center gap-6">
             <button onClick={toggleMute} className={audioMuted ? "p-4 rounded-full transition-colors bg-red-500/20 text-red-500" : "p-4 rounded-full transition-colors bg-slate-100 text-slate-900 hover:bg-slate-200"}>
               {audioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
             </button>
             <button onClick={toggleVideo} className={videoOff ? "p-4 rounded-full transition-colors bg-red-500/20 text-red-500" : "p-4 rounded-full transition-colors bg-slate-100 text-slate-900 hover:bg-slate-200"}>
               {videoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
             </button>
             <button onClick={endCall} className="p-4 rounded-full bg-red-600 text-slate-900 hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]">
               <PhoneOff className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          {/* Real-time Chat Container */}
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <h3 className="text-slate-900 font-medium">Live Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={msg.senderId === user.id ? "flex justify-end" : "flex justify-start"}>
                  <div className={msg.senderId === user.id ? "px-4 py-2 rounded-2xl max-w-[80%] text-sm bg-blue-600 text-slate-900 rounded-br-sm" : "px-4 py-2 rounded-2xl max-w-[80%] text-sm bg-slate-100 text-slate-900 rounded-bl-sm"}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <input 
                type="text" 
                value={msgInput} 
                onChange={(e) => setMsgInput(e.target.value)} 
                placeholder="Type a message..."
                className="flex-1 bg-white shadow-sm border border-slate-100 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500/50"
              />
              <button type="submit" disabled={!msgInput.trim()} className="p-2 bg-blue-600 text-slate-900 rounded-full disabled:opacity-50">
                 <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Doctor Only: Digital Prescription */}
          {user.role === 'DOCTOR' && (
            <div className="h-1/3 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-200 flex items-center gap-3">
                <FilePenLine className="w-5 h-5 text-emerald-400" />
                <h3 className="text-slate-900 font-medium text-sm">E-Prescription</h3>
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <textarea 
                  value={prescription}
                  onChange={e => setPrescription(e.target.value)}
                  placeholder="Generate digital prescription here..."
                  className="w-full flex-1 bg-transparent text-sm text-slate-700 resize-none focus:outline-none placeholder:text-slate-300 mb-3"
                ></textarea>
                <button className="w-full py-2 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/30 transition-colors">
                  Issue Prescription
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
