import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReportDialogProps {
  trigger?: React.ReactNode;
  onSubmit?: (reason: string) => void;
}

export const ReportDialog: React.FC<ReportDialogProps> = ({ trigger, onSubmit }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? <Button variant="outline">Report user</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report user</DialogTitle>
        </DialogHeader>
        <Textarea placeholder="Describe the issue…" value={reason} onChange={(e)=>setReason(e.target.value)} />
        <DialogFooter>
          <Button onClick={()=>{ onSubmit?.(reason.trim()); setOpen(false); setReason(""); }}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
