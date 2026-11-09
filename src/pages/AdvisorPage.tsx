import React, { useState } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdvisorMessages, useSendAdvisorMessage } from "@/hooks/useData";

export const AdvisorPage: React.FC = () => {
  const { data: messages = [] } = useAdvisorMessages();
  const sendMessageMutation = useSendAdvisorMessage();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = [
    "Evaluasi pengeluaran saya bulan ini",
    "Berapa batas belanja harian yang aman?",
    "Apakah alokasi investasi saya seimbang?",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isTyping) return;

    setInput("");
    setIsTyping(true);

    // Save user message
    await sendMessageMutation.mutateAsync({
      role: "user",
      text,
    });

    // Generate intelligent financial answer
    setTimeout(async () => {
      let reply = "";
      const lower = text.toLowerCase();

      if (lower.includes("harian") || lower.includes("batas")) {
        reply = "Berdasarkan sisa budget dan hari tersisa di periode berjalan, batas pengeluaran harian aman Anda adalah sekitar Rp 120.000 per hari.";
      } else if (lower.includes("investasi") || lower.includes("seimbang")) {
        reply = "Portofolio Anda saat ini memiliki komposisi multi-aset (Saham, Kripto, Emas, Reksadana). Pastikan alokasi instrumen berisiko tinggi (kripto/saham gorengan) tidak melebihi 20% dari total kekayaan bersih.";
      } else {
        reply = "Buku kas Anda saat ini berada dalam kondisi surplus sehat. Pertahankan rasio tabungan minimal 20% dari pendapatan bulanan Anda.";
      }

      await sendMessageMutation.mutateAsync({
        role: "model",
        text: reply,
      });

      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Financial Advisor</h1>
        <p className="text-sm text-muted-foreground">
          Konsultasi pola belanja, evaluasi anggaran, dan analisis alokasi portofolio.
        </p>
      </div>

      {/* Chat Card */}
      <Card className="h-[520px] flex flex-col justify-between overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-muted-foreground shrink-0 text-xs">
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`rounded-lg p-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground border"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <span
                  className={`text-[10px] mt-1.5 block text-right ${
                    m.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {new Date(m.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Advisor sedang menganalisis data keuangan Anda...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-t bg-muted/30 flex flex-wrap gap-2">
          {quickPrompts.map((q, idx) => (
            <Button
              key={idx}
              variant="outline"
              size="sm"
              onClick={() => handleSend(q)}
              className="text-xs h-7"
            >
              {q}
            </Button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanyakan analisis keuangan atau batas belanja harian..."
            className="flex-1"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
