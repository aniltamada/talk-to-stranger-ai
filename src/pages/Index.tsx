import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import VideoChat from "@/components/video/VideoChat";
import ChatPanel from "@/components/chat/ChatPanel";
import HelpBot from "@/components/chat/HelpBot";
import ReportDialog from "@/components/ReportDialog";

const Index = () => {
  useEffect(() => {
    document.title = "Randomly — Omegle-style video chat";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Randomly: video + chat + AI summaries. Registered users only.");
  }, []);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="font-bold text-xl">Randomly</a>
          <nav className="flex items-center gap-3">
            <a href="/login" className="text-sm hover:underline">Log in</a>
            <Button asChild variant="hero" size="sm"><a href="/signup">Sign up</a></Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[1fr_420px]">
        <h1 className="sr-only">Randomly — Omegle-style random video chat</h1>
        <section aria-label="Video chat" className="min-h-[480px] md:min-h-[480px]">
          <VideoChat onReport={() => { /* opened via inline report button */ }} />
        </section>
        <aside aria-label="Text & media chat" className="min-h-[480px] md:min-h-[480px]">
          <ChatPanel onGenerateSummary={() => { /* placeholder */ }} />
        </aside>
      </main>

      <Separator />
      <footer className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
        <p>Randomly respects your privacy. Reports are reviewed by admins. Connect Supabase to enable auth, storage, and AI summaries.</p>
      </footer>

      <HelpBot onOpenGuide={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
    </div>
  );
};

export default Index;
