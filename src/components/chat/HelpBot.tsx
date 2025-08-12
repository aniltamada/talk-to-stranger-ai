import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Bot, HelpCircle } from "lucide-react";

interface HelpBotProps {
  onOpenGuide?: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const HelpBot: React.FC<HelpBotProps> = ({ onOpenGuide }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging || !ref.current) return;
      const rect = ref.current.parentElement?.getBoundingClientRect();
      const nx = clamp(e.clientX - 120, 8, (rect?.width ?? window.innerWidth) - 240);
      const ny = clamp(e.clientY - 40, 8, (rect?.height ?? window.innerHeight) - 160);
      setPos({ x: nx, y: ny });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  if (!open) return null;

  return (
    <div ref={ref} style={{ left: pos.x, top: pos.y }} className="fixed z-40" aria-live="polite">
      <Card className="w-72 shadow-xl border backdrop-blur bg-background/90">
        <div className="flex items-center justify-between p-3 border-b cursor-grab active:cursor-grabbing select-none" onMouseDown={() => setDragging(true)}>
          <div className="flex items-center gap-2 font-semibold"><Bot /> Randomly Guide</div>
          <button aria-label="Close" onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity"><X /></button>
        </div>
        <div className="p-3 text-sm space-y-2">
          <p>Welcome! Click <b>Start Video</b> to join the queue. Chat on the right with text or images.</p>
          <p>After a chat, generate a private <b>AI summary</b>. Report unsafe behavior any time.</p>
          <Button variant="link" className="p-0" onClick={onOpenGuide}><HelpCircle className="mr-1" /> Learn more</Button>
        </div>
      </Card>
    </div>
  );
};

export default HelpBot;
