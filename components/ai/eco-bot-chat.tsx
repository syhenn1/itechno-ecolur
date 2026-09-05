"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, BookOpen, HelpCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  // A ref-based counter rather than Date.now()/crypto.randomUUID() calls scattered through the
  // handler — react-hooks/purity flags calling those directly, since a function defined in
  // component scope can't always be proven to only ever run from an event handler. A ref mutation
  // is the sanctioned escape hatch for exactly this kind of imperative bookkeeping.
  const idCounter = useRef(0);
  const nextId = (prefix: string) => `${prefix}-${++idCounter.current}`;

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
      id: nextId("user"),
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
        id: nextId("bot"),
        role: "assistant",
        text: data.answer,
        sources: data.sources,
        matchedTerms: data.matchedTerms,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: nextId("err"),
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
    <div className="flex flex-col h-[700px] w-full rounded-md border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">EcoBot</h2>
            <p className="text-xs text-slate-500">
              Didukung basis data regulasi ESDM, tarif PLN, dan SOP Bojong Kulur
            </p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={handleClear} title="Reset Percakapan" className="h-8 w-8">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
        <div className="flex items-start gap-2.5 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500 mt-0.5" />
          <div>
            Jawaban EcoBot merujuk pada dokumen resmi regulasi energi dan tata kota. Untuk keputusan resmi, tetap
            konfirmasikan ke petugas desa atau kantor PLN setempat.
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSourcesFor(showSourcesFor === msg.id ? null : msg.id)}
                    className="h-auto px-0 py-0 text-emerald-700"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {showSourcesFor === msg.id
                        ? "Sembunyikan Sumber Rujukan"
                        : `Lihat ${msg.sources.length} Dokumen Rujukan RAG`}
                    </span>
                  </Button>

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
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="h-auto bg-slate-50 py-1 font-normal"
              >
                {prompt}
              </Button>
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
          <Button type="submit" variant="primary" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
