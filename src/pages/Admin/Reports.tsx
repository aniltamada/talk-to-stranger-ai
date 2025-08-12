import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Placeholder admin view; will be wired to Supabase after integration.
const Reports = () => {
  useEffect(()=>{ document.title = "Admin — Reports | Randomly"; }, []);
  const sample = [
    { id: "r1", userId: "u123", reason: "Inappropriate language", at: new Date().toLocaleString() },
  ];
  return (
    <div className="min-h-screen p-6 container mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sample.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.userId}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell>{r.at}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Reports;
