import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  useEffect(() => {
    document.title = "Log in — Randomly";
  }, []);

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <Card className="w-full max-w-sm p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="text-sm text-muted-foreground">Registered users only.</p>
        </div>
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full" onClick={()=>toast({title:"Connect Supabase", description:"Enable Lovable Auth to log in."})}>Log in</Button>
        </div>
        <p className="text-xs text-muted-foreground">Don’t have an account? <a href="/signup" className="underline">Sign up</a></p>
      </Card>
    </div>
  );
};

export default Login;
