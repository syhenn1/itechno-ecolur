"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceCitation {
  title: string;
  source: string;
  category: string;
  relevanceScore: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: SourceCitation[];
  matchedTerms?: string[];
  timestamp: Date;
}

const SAMPLE_PROMPTS = [
  "Berapa tarif listrik PLN 900 VA dan 1300 VA?",
  "Bagaimana syarat pasang solar panel di rumah (Permen ESDM)?",
  "Tips menghemat konsumsi listrik AC dan kulkas",
  "SOP perbaikan jalan rusak di Bojong Kulur",
  "Jadwal pengangkutan sampah di area Bojong Kulur",
  "Bagaimana cara mendapatkan XP dan hadiah di EcoLur?",
];

export function EcoBotChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Halo! Saya **EcoBot**, asisten cerdas EcoLur. Saya siap membantu Anda dengan informasi resmi seputar **regulasi energi, tarif PLN, panduan PLTS Atap, tips hemat listrik**, serta **SOP layanan publik & infrastruktur di Bojong Kulur**.\n\nApa yang ingin Anda tanyakan hari ini?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSourcesFor, setShowSourcesFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText ?? input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi asisten AI.");
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        text: data.answer,
        sources: data.sources,
        matchedTerms: data.matchedTerms,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        text: err instanceof Error ? err.message : "Terjadi kesalahan koneksi. Silakan coba lagi.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        text: "Riwayat percakapan telah direset. Silakan ajukan pertanyaan baru!",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[700px] w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-200">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">EcoBot Assistant</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                <Sparkles className="h-3 w-3" /> RAG Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Didukung basis data regulasi ESDM, tarif PLN, & SOP Bojong Kulur
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          title="Reset Percakapan"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
        {/* RAG Banner info */}
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-900">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
          <div>
            <span className="font-semibold">Transparansi RAG (Retrieval-Augmented Generation):</span> Setiap jawaban
            disaring menggunakan struktur data <em>Inverted Index</em> &amp; <em>Priority Queue (Max-Heap)</em> dari dokumen resmi regulasi energi &amp; tata kota.
          </div>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col",
              msg.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-emerald-600 text-white rounded-br-none shadow-sm"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs"
              )}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* RAG Sources Section */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      setShowSourcesFor(showSourcesFor === msg.id ? null : msg.id)
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {showSourcesFor === msg.id
                        ? "Sembunyikan Sumber Rujukan"
                        : `Lihat ${msg.sources.length} Dokumen Rujukan RAG`}
                    </span>
                  </button>

                  {showSourcesFor === msg.id && (
                    <div className="mt-2 space-y-1.5 animate-fade-in-up">
                      {msg.sources.map((src, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg bg-slate-50 border border-slate-200/80 p-2 text-xs"
                        >
                          <div className="font-medium text-slate-900 flex items-center justify-between">
                            <span>{src.title}</span>
                            <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-1.5 py-0.5 rounded">
                              Skor: {src.relevanceScore}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Sumber: {src.source}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {msg.timestamp.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 max-w-[80%] rounded-2xl rounded-bl-none border border-slate-200 bg-white px-4 py-3 shadow-xs">
            <div className="flex space-x-1.5 items-center">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="text-xs text-slate-500 ml-2">
              EcoBot sedang menelusuri basis data &amp; mensintesis jawaban...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips */}
      {messages.length <= 2 && (
        <div className="border-t border-slate-100 bg-white px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
            <span>Pertanyaan yang sering diajukan:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan tarif PLN, hemat listrik, solar panel, atau laporan warga..."
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
