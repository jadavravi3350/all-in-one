"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  Phone,
  Video,
  Search,
  MoreVertical,
  Send,
  Mic,
  Smile,
  Plus,
  Settings,
  Archive,
  Star,
  Rocket,
  Users,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "me" | "other";
  time: string;
}

interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
  avatar: string;
}

export default function NexusChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChat, setActiveChat] = useState("Elena Rodriguez");
  const [isRecording, setIsRecording] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const recognitionRef = useRef<any>(null);

  // -----------------------------
  // Fake Login
  // -----------------------------
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("nexus-user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const loginGoogle = () => {
    const fakeUser = {
      name: "Ravi Jadav",
      email: "ravijadav@gmail.com",
      image:
        "https://i.pravatar.cc/150?img=3",
    };

    localStorage.setItem("nexus-user", JSON.stringify(fakeUser));
    setUser(fakeUser);
  };

  const loginMobile = () => {
    const fakeUser = {
      name: "Mobile User",
      mobile: "+91 9999999999",
      image:
        "https://i.pravatar.cc/150?img=5",
    };

    localStorage.setItem("nexus-user", JSON.stringify(fakeUser));
    setUser(fakeUser);
  };

  const logout = () => {
    localStorage.removeItem("nexus-user");
    setUser(null);
  };

  // -----------------------------
  // Load Messages
  // -----------------------------
  useEffect(() => {
    const saved = localStorage.getItem("nexus-messages");

    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const initial = [
        {
          id: 1,
          text: "That design looks incredible!",
          sender: "other",
          time: "09:15 AM",
        },
        {
          id: 2,
          text: "Thanks 🔥",
          sender: "me",
          time: "09:17 AM",
        },
      ];

      setMessages(initial);
      localStorage.setItem(
        "nexus-messages",
        JSON.stringify(initial)
      );
    }
  }, []);

  // -----------------------------
  // Send Message
  // -----------------------------
  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "me" as const,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updated = [...messages, newMessage];

    setMessages(updated);

    localStorage.setItem(
      "nexus-messages",
      JSON.stringify(updated)
    );

    setMessage("");

    // Fake reply
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        text: "Awesome 🚀",
        sender: "other" as const,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedReply = [...updated, reply];

      setMessages(updatedReply);

      localStorage.setItem(
        "nexus-messages",
        JSON.stringify(updatedReply)
      );
    }, 1200);
  };

  // -----------------------------
  // Voice Message
  // -----------------------------
  const startVoice = () => {
    //@ts-ignore
    const SpeechRecognition =
      window.SpeechRecognition ||
      //@ts-ignore
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    setIsRecording(true);

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setMessage(transcript);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  };

  const chats: Chat[] = [
    {
      id: 1,
      name: "Elena Rodriguez",
      lastMessage: "That design looks incredible!",
      time: "Just now",
      unread: 2,
      online: true,
      avatar: "https://i.pravatar.cc/150?img=11",
    },
    {
      id: 2,
      name: "Marcus Chen",
      lastMessage: "Quarterly report ready.",
      time: "10:42 AM",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
  ];

  // -----------------------------
  // LOGIN SCREEN
  // -----------------------------
  if (!user) {
    return (
      <div className="h-screen bg-[#0f1512] flex items-center justify-center px-5">
        <div className="w-full max-w-md bg-[#1b211e] border border-[#3d4a44]/20 rounded-3xl p-10">
          <div className="flex items-center gap-3 mb-10">
            <Rocket className="text-[#61dbb4]" size={38} />
            <h1 className="text-white text-3xl font-bold">
              Nexus Chat
            </h1>
          </div>

          <button
            onClick={loginGoogle}
            className="w-full bg-[#61dbb4] text-black py-4 rounded-2xl font-bold mb-4 hover:scale-[1.02] transition"
          >
            Continue with Google
          </button>

          <button
            onClick={loginMobile}
            className="w-full bg-[#252b28] text-white py-4 rounded-2xl font-bold hover:bg-[#303633]"
          >
            Continue with Mobile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1512] text-[#dee4df] h-screen overflow-hidden flex">
      {/* SIDEBAR */}
      <aside className="hidden md:flex h-screen w-20 flex-col items-center py-6 border-r border-[#3d4a44]/10 bg-[#1b211e]/40 backdrop-blur-xl">
        <div className="mb-10">
          <Rocket className="text-[#61dbb4]" size={34} />
        </div>

        <nav className="flex flex-col gap-8 flex-1">
          <button className="text-[#61dbb4] bg-[#12a480]/20 rounded-xl p-3">
            <MessageCircle />
          </button>

          <button className="text-[#bccac2] p-3 hover:text-[#61dbb4]">
            <Phone />
          </button>

          <button className="text-[#bccac2] p-3 hover:text-[#61dbb4]">
            <Video />
          </button>

          <button className="text-[#bccac2] p-3 hover:text-[#61dbb4]">
            <Star />
          </button>

          <button className="text-[#bccac2] p-3 hover:text-[#61dbb4]">
            <Archive />
          </button>
        </nav>

        <div className="flex flex-col gap-6 mt-auto">
          <button className="text-[#bccac2] p-3 hover:text-[#61dbb4]">
            <Settings />
          </button>

          <img
            src={user.image}
            className="w-11 h-11 rounded-full object-cover"
          />
        </div>
      </aside>

      {/* CHAT LIST */}
      <section className="hidden md:flex w-96 border-r border-[#3d4a44]/10 flex-col bg-[#1b211e]/30">
        <header className="p-5 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#61dbb4]">
            Messages
          </h1>

          <button
            onClick={logout}
            className="text-sm text-red-400"
          >
            Logout
          </button>
        </header>

        <div className="px-5 pb-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-[#86948d]"
              size={18}
            />

            <input
              className="w-full bg-[#090f0d] rounded-xl py-3 pl-10 pr-4 outline-none border border-[#3d4a44]/20"
              placeholder="Search chats..."
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat.name)}
              className={`p-4 flex gap-4 cursor-pointer transition ${
                activeChat === chat.name
                  ? "bg-[#12a480]/10 border-l-4 border-[#61dbb4]"
                  : "hover:bg-[#252b28]/30"
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  className="w-12 h-12 rounded-full"
                />

                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#61dbb4] rounded-full" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-bold">{chat.name}</h3>
                  <span className="text-xs text-[#61dbb4]">
                    {chat.time}
                  </span>
                </div>

                <p className="text-sm text-[#86948d] truncate">
                  {chat.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CHAT */}
      <section className="flex-1 flex flex-col">
        {/* TOP */}
        <header className="h-16 border-b border-[#3d4a44]/10 px-5 flex items-center justify-between bg-[#1b211e]/40">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=11"
              className="w-10 h-10 rounded-full"
            />

            <div>
              <h2 className="font-bold">{activeChat}</h2>

              <div className="flex items-center gap-2 text-xs text-[#86948d]">
                <div className="w-2 h-2 bg-[#61dbb4] rounded-full" />
                Online
              </div>
            </div>
          </div>

          <div className="flex gap-5 text-[#bccac2]">
            <Video className="cursor-pointer hover:text-[#61dbb4]" />
            <Phone className="cursor-pointer hover:text-[#61dbb4]" />
            <Search className="cursor-pointer hover:text-[#61dbb4]" />
            <MoreVertical className="cursor-pointer hover:text-[#61dbb4]" />
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[75%] ${
                msg.sender === "me"
                  ? "self-end"
                  : "self-start"
              }`}
            >
              <div
                className={`p-4 rounded-2xl ${
                  msg.sender === "me"
                    ? "bg-[#12a480]/20 border border-[#61dbb4]/20"
                    : "bg-[#303633]/40 border border-[#3d4a44]/20"
                }`}
              >
                <p>{msg.text}</p>
              </div>

              <span className="text-xs text-[#86948d] mt-1 block">
                {msg.time}
              </span>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <footer className="p-4 border-t border-[#3d4a44]/10 bg-[#1b211e]/20">
          <div className="flex items-center gap-4">
            <button className="w-11 h-11 rounded-full bg-[#252b28] flex items-center justify-center">
              <Plus />
            </button>

            <div className="flex-1 relative">
              <input
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) =>
                  e.key === "Enter" && sendMessage()
                }
                className="w-full bg-[#090f0d] border border-[#3d4a44]/20 rounded-2xl py-4 px-5 outline-none"
                placeholder="Type a message..."
              />

              <Smile className="absolute right-4 top-4 text-[#86948d]" />
            </div>

            {message ? (
              <button
                onClick={sendMessage}
                className="w-12 h-12 rounded-full bg-[#61dbb4] text-black flex items-center justify-center"
              >
                <Send />
              </button>
            ) : (
              <button
                onClick={startVoice}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isRecording
                    ? "bg-red-500"
                    : "bg-[#61dbb4]"
                } text-black`}
              >
                <Mic />
              </button>
            )}
          </div>
        </footer>
      </section>

      {/* RIGHT PANEL */}
      <section className="hidden xl:flex w-80 border-l border-[#3d4a44]/10 bg-[#1b211e]/20 flex-col">
        <div className="p-6 border-b border-[#3d4a44]/10">
          <div className="flex flex-col items-center">
            <img
              src="https://i.pravatar.cc/150?img=11"
              className="w-24 h-24 rounded-full mb-4"
            />

            <h2 className="text-xl font-bold">
              Elena Rodriguez
            </h2>

            <p className="text-[#86948d]">
              Senior Product Designer
            </p>
          </div>
        </div>

        <div className="p-6">
          <h4 className="text-[#86948d] uppercase text-xs mb-4">
            Common Groups
          </h4>

          <div className="space-y-3">
            <div className="bg-[#252b28]/40 rounded-2xl p-4 flex items-center gap-3">
              <Users className="text-[#61dbb4]" />
              <div>
                <p className="font-semibold">Design Ops</p>
                <span className="text-xs text-[#86948d]">
                  12 Members
                </span>
              </div>
            </div>

            <div className="bg-[#252b28]/40 rounded-2xl p-4 flex items-center gap-3">
              <Rocket className="text-[#61dbb4]" />
              <div>
                <p className="font-semibold">Launch Squad</p>
                <span className="text-xs text-[#86948d]">
                  42 Members
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}