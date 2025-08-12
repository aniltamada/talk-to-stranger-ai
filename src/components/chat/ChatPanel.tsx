import React, { useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Image as ImageIcon, Smile, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  sender: "me" | "peer" | "system";
  type: "text" | "image" | "system";
  content: string;
  at: number;
}

interface ChatPanelProps {
  onGenerateSummary?: () => void;
}

const EMOJIS = ["😀","😂","😊","😉","😍","😘","😜","🤗","🤔","😎","😭","😡","👍","👏","🙏","🔥","💯","🎉","🚀","🌟"];

export const ChatPanel: React.FC<ChatPanelProps> = ({ onGenerateSummary }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = useMemo(() => [...messages].sort((a,b)=>a.at-b.at), [messages]);

  const sendText = () => {
    const value = text.trim();
    if (!value) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), sender: "me", type: "text", content: value, at: Date.now() }]);
    setText("");
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/image\/(png|jpe?g)/i.test(file.type)) {
      toast({ title: "Unsupported file", description: "Please upload a PNG or JPG image." });
      return;
    }
    const url = URL.createObjectURL(file);
    setMessages((m) => [...m, { id: crypto.randomUUID(), sender: "me", type: "image", content: url, at: Date.now() }]);
    e.target.value = "";
  };

  return (
    <Card className="h-full grid grid-rows-[auto_1fr_auto]">
      <header className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold">Chat</h3>
        <Button variant="outline" size="sm" onClick={() => {
          onGenerateSummary?.();
          toast({ title: "AI Summaries", description: "Connect Supabase + Gemini to enable." });
        }}>Generate summary</Button>
      </header>
      <ScrollArea className="p-3">
        <ul className="space-y-3">
          {sorted.map((m) => (
            <li key={m.id} className={m.sender === "me" ? "flex justify-end" : "flex justify-start"}>
              <div className={"max-w-[80%] rounded-md border px-3 py-2 " + (m.sender === "me" ? "bg-primary/10" : "bg-secondary") }>
                {m.type === "text" && <p className="text-sm leading-relaxed">{m.content}</p>}
                {m.type === "image" && (
                  <img src={m.content} alt="chat image upload" className="rounded-md max-h-64" loading="lazy" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <footer className="p-3 border-t flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onPickImage} />
        <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()} aria-label="Upload image">
          <ImageIcon />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Emoji picker">
              <Smile />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 grid grid-cols-8 gap-1">
            {EMOJIS.map((e) => (
              <button key={e} className="text-xl p-1 hover:bg-accent rounded" onClick={() => setText((t) => t + e)} aria-label={`Insert ${e}`}>
                {e}
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <Input placeholder="Type a message…" value={text} onChange={(e)=>setText(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') sendText(); }} />
        <Button onClick={sendText} aria-label="Send message"><Send /></Button>
      </footer>
    </Card>
  );
};

export default ChatPanel;
