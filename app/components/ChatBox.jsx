"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useTranslation } from "@/app/contexts/TranslationContext";

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { t, currentLang, LANGUAGES } = useTranslation();
  const preferredLangName = LANGUAGES.find((l) => l.code === currentLang)?.name || "English";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          messages: updated,
          preferredLang: preferredLangName,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sorry, something went wrong." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const suggestions = [
    "How do I send USDC?",
    "What is an airdrop?",
    "Explain gas fees",
  ];

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50 hover:scale-105"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-140px)] bg-white rounded-3xl shadow-xl border border-gray-200 flex flex-col overflow-hidden z-40">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bot size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">SolShield AI</p>
                <p className="text-xs text-gray-400">{t("poweredBy")}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center pt-12 px-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot size={28} className="text-blue-500" />
                </div>
                <p className="text-gray-500 text-sm mb-5">{t("askAnything")}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-full text-xs font-medium transition-colors border border-gray-200 hover:border-blue-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-400 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("typeMessage")}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isLoading || !input.trim()
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}