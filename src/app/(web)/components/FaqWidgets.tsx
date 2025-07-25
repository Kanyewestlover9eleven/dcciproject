// src/components/FaqWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X } from "lucide-react";

const faqs = [
  { q: "How do I register as a contractor?", a: "Go to the Contact page and fill out the registration form." },
  { q: "How do I know what activities are there?", a: "Go to the Activities page and click on any upcoming event to see details." },
  { q: "How do I contact DCCI?", a: "You can either send an inquiry through the Contact page or email us at dcci.secretariat@gmail.com." },
  // …add as many as you need
];

type Msg = { sender: "user" | "bot"; text: string };

export default function FaqWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { sender: "bot", text: "Hi there! Ask me anything about DCCI." },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { sender: "user", text: userMsg }]);
    setInput("");

    // find matching FAQ
    const lower = userMsg.toLowerCase();
    const match = faqs.find((f) => f.q.toLowerCase().includes(lower) || lower.includes(f.q.toLowerCase()));
    const reply = match
      ? match.a
      : "Sorry, I don't have an answer for that. Please check our Contact page for more help.";
    // slight delay to simulate thinking
    setTimeout(() => {
      setMessages((m) => [...m, { sender: "bot", text: reply }]);
    }, 500);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          fixed bottom-6 right-6 z-50 
          w-14 h-14 rounded-full bg-[#4B5043] 
          text-white flex items-center justify-center 
          shadow-lg hover:bg-[#4B5043] transition
        "
        aria-label="Open Chat"
      >
        <Bot size={24} />
      </button>

      {/* Chat window */}
      {open && (
        <div
          className="
            fixed bottom-24 right-6 z-50 
            w-80 max-h-[70vh] flex flex-col 
            bg-white rounded-lg shadow-xl
          "
        >
          {/* header */}
          <div className="flex items-center justify-between bg-[#4B5043] text-white p-3 rounded-t-lg">
            <span className="font-medium">Jang AI</span>
            <button onClick={() => setOpen(false)} aria-label="Close Chat">
              <X size={20} />
            </button>
          </div>

          {/* messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "bot" ? "" : "justify-end"}`}
              >
                <div
                  className={`
                    px-3 py-2 rounded-lg 
                    ${m.sender === "bot" ? "bg-gray-200 text-gray-800" : "bg-[#4B5043] text-white"}
                    max-w-[70%]
                  `}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* input area */}
          <div className="p-2 border-t">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              placeholder="Type your question…"
              className="w-full resize-none border rounded-md px-2 py-1 focus:outline-blue-500"
            />
            <button
              onClick={send}
              className="mt-1 w-full bg-[#4B5043] text-white py-1 rounded hover:bg-[#4B5043] transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
