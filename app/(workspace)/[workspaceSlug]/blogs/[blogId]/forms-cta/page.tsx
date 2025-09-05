import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page({
  params,
}: {
  params: { workspaceSlug: string; blogId: string };
}) {
  const { workspaceSlug, blogId } = params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="text-center">Forms CTA Creating Page</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link
            href={`/${workspaceSlug}/blogs/${blogId}/forms-cta/form-dashboard`}
          >
            <Button className="w-full">View Form Dashboard</Button>
          </Link>

          <Link
            href={`/${workspaceSlug}/blogs/${blogId}/forms-cta/cta-dashboard`}
          >
            <Button className="w-full">View CTA Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
