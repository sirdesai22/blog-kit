'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { useRouter } from 'next/navigation';
import Navbar from './_components/navbar';

export default function OnboardingPage() {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceAddress, setWorkspaceAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const router = useRouter();

  const handleCreateWorkspace = async () => {
    if (!workspaceName || !workspaceAddress) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workspaceName,
          slug: workspaceAddress,
          description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Something went wrong');
        return;
      }

      const data = await response.json();
      // Redirect to the specific workspace that was created
      router.push(`/${data.workspace.slug}`);
    } catch (error) {
      setError('Something went wrong');
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
          'This name is already taken. Only letters and numbers allowed'
        );
      } else {
        setError('');
      }
    } catch (error) {
      console.error('Error checking slug:', error);
    }
  };

  const handleWorkspaceAddressChange = (value: string) => {
    // Only allow letters and numbers
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    setWorkspaceAddress(cleanValue);

    if (cleanValue) {
      checkSlugAvailability(cleanValue);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <Navbar />
      {/* Main Content */}
      <div className="flex items-center  justify-center px-4 py-8">
        <div className="max-w-lg w-full">
          <Card className=" border-none">
            <CardHeader className="pb-4 pt-6">
              <div className="text-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Create Workspace
                </h1>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6">
              {/* Workspace Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Workspace Name*
                </label>
                <Input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Workspace Address */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Workspace Address*
                </label>
                <div className="flex">
                  <Input
                    type="text"
                    value={workspaceAddress}
                    onChange={(e) =>
                      handleWorkspaceAddressChange(e.target.value)
                    }
                    className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-r-none border-r-0 text-sm"
                  />
                  <div className="h-9 px-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md flex items-center text-xs text-gray-600">
                    .blogkit.com
                  </div>
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="text-xs text-gray-500">
                  Auto-generate from my website
                </p>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-20 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none text-sm"
                />
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateWorkspace}
                disabled={
                  !workspaceName || !workspaceAddress || loading || !!error
                }
                className="w-full h-9 bg-black hover:bg-gray-800 text-white text-sm"
              >
                {loading ? 'Creating...' : 'Create Workspace >'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
