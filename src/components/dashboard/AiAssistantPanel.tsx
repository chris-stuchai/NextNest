"use client";

import { useState, useRef, useEffect, useCallback, useMemo, type FormEvent } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Send, Loader2, Bot, User, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getMessageText(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

type VoiceStatus = "idle" | "connecting" | "connected" | "error";

interface AiAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Full-height slide-out AI assistant panel with text chat and Retell voice mode. */
export function AiAssistantPanel({ open, onClose }: AiAssistantPanelProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const retellClientRef = useRef<RetellWebClientType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const welcomeMessage: UIMessage = {
    id: "welcome",
    role: "assistant" as const,
    parts: [
      {
        type: "text" as const,
        text: "Hi! I'm your AI Move Advisor. I know the details of your upcoming move and I'm here to help with anything — packing tips, neighborhood research, budget questions, or just moral support. What's on your mind?",
      },
    ],
  };

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai/chat" }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    id: "move-advisor",
    transport,
    messages: [welcomeMessage],
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const stopVoiceCall = useCallback(async () => {
    try {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
        retellClientRef.current = null;
      }
    } catch {
      /* ignore cleanup errors */
    }
    setVoiceStatus("idle");
    setIsMuted(false);
  }, []);

  async function startVoiceCall() {
    setVoiceStatus("connecting");
    try {
      const res = await fetch("/api/retell/web-call", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.accessToken) {
        setVoiceStatus("error");
        return;
      }

      const { RetellWebClient } = await import("retell-client-js-sdk");
      const client = new RetellWebClient();
      retellClientRef.current = client;

      client.on("call_started", () => setVoiceStatus("connected"));
      client.on("call_ended", () => stopVoiceCall());
      client.on("error", () => {
        setVoiceStatus("error");
        retellClientRef.current = null;
      });

      await client.startCall({ accessToken: data.accessToken });
    } catch {
      setVoiceStatus("error");
    }
  }

  function toggleMute() {
    if (retellClientRef.current && voiceStatus === "connected") {
      setIsMuted((prev) => {
        retellClientRef.current?.toggleMicrophone?.(!prev);
        return !prev;
      });
    }
  }

  useEffect(() => {
    return () => {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
        retellClientRef.current = null;
      }
    };
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[420px] flex-col border-l bg-background shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Move Advisor</h2>
                  <p className="text-xs text-muted-foreground">
                    {mode === "voice" && voiceStatus === "connected"
                      ? "Listening..."
                      : "AI-powered assistant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Mode toggle */}
                <Button
                  variant={mode === "voice" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (mode === "voice") {
                      stopVoiceCall();
                      setMode("text");
                    } else {
                      setMode("voice");
                    }
                  }}
                  title={mode === "voice" ? "Switch to text" : "Switch to voice"}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {mode === "text" ? (
              <>
                {/* Text chat messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm"
                        )}
                      >
                        {getMessageText(message)}
                      </div>
                    </div>
                  ))}
                  {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                    <div className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground rounded-tl-sm">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                      Something went wrong. Please try again.
                    </div>
                  )}
                </div>

                {/* Text input */}
                <form onSubmit={handleSubmit} className="border-t p-4">
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about your move..."
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      disabled={isStreaming}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isStreaming || !input.trim()}
                      className="h-8 w-8 shrink-0 rounded-lg"
                      aria-label="Send message"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              /* Voice mode UI */
              <div className="flex flex-1 flex-col items-center justify-center p-8">
                <div className="relative mb-8">
                  {/* Animated rings when connected */}
                  {voiceStatus === "connected" && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full bg-primary/20"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                        className="absolute inset-0 rounded-full bg-primary/15"
                      />
                    </>
                  )}
                  <div
                    className={cn(
                      "relative flex h-24 w-24 items-center justify-center rounded-full",
                      voiceStatus === "connected"
                        ? "bg-primary text-primary-foreground"
                        : voiceStatus === "connecting"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {voiceStatus === "connecting" ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : voiceStatus === "connected" ? (
                      <Mic className="h-8 w-8" />
                    ) : (
                      <Phone className="h-8 w-8" />
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold">
                  {voiceStatus === "idle" && "Voice Assistant"}
                  {voiceStatus === "connecting" && "Connecting..."}
                  {voiceStatus === "connected" && "Listening"}
                  {voiceStatus === "error" && "Connection Failed"}
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  {voiceStatus === "idle" &&
                    "Talk to your move advisor hands-free. Ask questions, get advice, and plan your move with voice."}
                  {voiceStatus === "connecting" && "Setting up your voice connection..."}
                  {voiceStatus === "connected" && "Speak naturally — your advisor is listening."}
                  {voiceStatus === "error" && "Could not connect. Please try again."}
                </p>

                <div className="mt-8 flex items-center gap-3">
                  {voiceStatus === "idle" || voiceStatus === "error" ? (
                    <Button
                      onClick={startVoiceCall}
                      size="lg"
                      className="gap-2 rounded-full px-8"
                    >
                      <Phone className="h-4 w-4" />
                      Start Voice Call
                    </Button>
                  ) : voiceStatus === "connected" ? (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={toggleMute}
                      >
                        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-12 w-12 rounded-full"
                        onClick={stopVoiceCall}
                      >
                        <PhoneOff className="h-5 w-5" />
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RetellWebClientType = any;
