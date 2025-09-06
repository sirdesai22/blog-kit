"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";

export default function FormAction() {
  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Action</CardTitle>
        <p className="text-sm text-muted-foreground">
          Text instructions will appear here.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg">
          <Code className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Feature Coming Soon</p>
        </div>
      </CardContent>
    </Card>
  );
}
