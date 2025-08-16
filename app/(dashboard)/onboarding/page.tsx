"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/custom/Button";
import { Input } from "@/components/custom/Input";
import { Textarea } from "@/components/custom/TextArea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight } from "lucide-react"

import { useRouter } from "next/navigation";
import Navbar from "./_components/navbar";

export default function OnboardingPage() {
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceAddress, setWorkspaceAddress] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateWorkspace = async () => {
    if (!workspaceName || !workspaceAddress) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceAddress,
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Something went wrong");
        return;
      }

      const data = await response.json();
      // Redirect to the specific workspace that was created
      router.push(`/${data.workspace.slug}`);
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug) return;

    try {
      const response = await fetch(`/api/workspace/check-slug?slug=${slug}`);
      const data = await response.json();

      if (!data.available) {
        setError(
          "This name is already taken. Only letters and numbers allowed"
        );
      } else {
        setError("");
      }
    } catch (error) {
      console.error("Error checking slug:", error);
    }
  };

  const handleWorkspaceAddressChange = (value: string) => {
    // Only allow letters and numbers
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    setWorkspaceAddress(cleanValue);

    if (cleanValue) {
      checkSlugAvailability(cleanValue);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <Navbar />
      {/* Main Content */}
      <div className="flex items-center  justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <Card className="border-none shadow-none">
            <CardHeader className="pb-4 pt-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-primary">
                  Create Workspace
                </h1>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              {/* Workspace Name */}
              <div className="space-y-1">
                <Input
                  type="text"
                  placeholder="Workspace Name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>

              {/* Workspace Address */}
              <div className="space-y-1">
                <Input
                  type="text"
                  value={workspaceAddress}
                  placeholder="Workspace Address"
                  onChange={(e) => handleWorkspaceAddressChange(e.target.value)}
                  suffix=".blogkit.com"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {/* Description */}
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                label="Description"
                helperText="Auto-generate from my website"
              />

              {/* Create Button */}
            <Button
  onClick={handleCreateWorkspace}
  disabled={!workspaceName || !workspaceAddress || loading || !!error}
>
  {loading ? (
    "Creating..."
  ) : (
    <>
      Create Workspace
      <ArrowRight className="ml-2 h-4 w-4" />
    </>
  )}
</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
