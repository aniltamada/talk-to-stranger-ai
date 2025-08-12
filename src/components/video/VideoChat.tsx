import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Video, PhoneOff, Users } from "lucide-react";
import ReportDialog from "@/components/ReportDialog";

interface VideoChatProps {
  onReport?: () => void;
  onEnd?: () => void;
}

const STUN_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] },
  // TURN recommended to be configured later via Supabase Edge Function + Secrets
];

export const VideoChat: React.FC<VideoChatProps> = ({ onReport, onEnd }) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStarting, setIsStarting] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [status, setStatus] = useState<"idle" | "queue" | "matched">("idle");

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startPreview = async () => {
    try {
      setIsStarting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localRef.current) {
        localRef.current.srcObject = stream;
        await localRef.current.play();
      }
      setStatus("queue");
      toast({
        title: "Waiting for a match…",
        description: "Connect Supabase to enable real matching and signaling.",
      });
      // Demo: no signaling yet. We keep remote as placeholder.
      setInCall(true);
    } catch (e) {
      console.error(e);
      toast({ title: "Camera/Mic access denied", description: "Please allow permissions to start video." });
    } finally {
      setIsStarting(false);
    }
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setInCall(false);
    setStatus("idle");
    onEnd?.();
  };

  return (
    <Card className="relative overflow-hidden border rounded-lg h-full">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(1200px_400px_at_10%_-20%,hsl(var(--primary)/.10),transparent)]" />
      <div className="relative grid grid-rows-[1fr_auto] h-full">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-3 p-3">
          <div className="relative aspect-video bg-muted/60 rounded-md overflow-hidden">
            <video ref={remoteRef} className="w-full h-full object-cover" playsInline />
            {!inCall && (
              <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Users className="opacity-70" /> Waiting for match</div>
              </div>
            )}
            <video ref={localRef} muted className="absolute bottom-3 right-3 w-36 h-24 object-cover rounded-md border" playsInline />
          </div>
          <aside className="hidden md:flex flex-col justify-between">
            <div className="text-sm">
              <h2 className="font-semibold">How it works</h2>
              <ol className="list-decimal ml-4 mt-2 space-y-1 text-muted-foreground">
                <li>Click Start Video to enter the queue.</li>
                <li>We match you when another user starts.</li>
                <li>Use Report if you encounter issues.</li>
              </ol>
            </div>
            <div className="text-xs text-muted-foreground">
              STUN ready. Add TURN via Supabase secrets later for reliability.
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-center gap-3 p-3 border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          {inCall ? (
            <>
              <Button variant="destructive" size="lg" onClick={endCall}>
                <PhoneOff /> End
              </Button>
              <ReportDialog
                onSubmit={(reason) => {
                  if (reason) {
                    toast({ title: "Report submitted", description: "Admins will review your report." });
                  }
                  onReport?.();
                }}
                trigger={<Button variant="outline" size="lg">Report user</Button>}
              />
            </>
          ) : (
            <Button variant="hero" size="lg" onClick={startPreview} disabled={isStarting}>
              <Video /> {isStarting ? "Starting…" : "Start Video"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VideoChat;
