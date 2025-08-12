import { useEffect } from "react";

const Blocked = () => {
  useEffect(()=>{ document.title = "Account blocked — Randomly"; }, []);
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-3xl font-bold">Your account is blocked</h1>
        <p className="text-muted-foreground">Please contact support if you believe this is a mistake.</p>
        <a href="/" className="underline">Return home</a>
      </div>
    </div>
  );
};

export default Blocked;
