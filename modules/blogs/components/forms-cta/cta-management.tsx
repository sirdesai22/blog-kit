'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CTAManagement() {
  const params = useParams();
  const { workspaceSlug, blogId } = params;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CTA Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your call-to-action elements.
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>CTA management coming soon...</p>
            <Link
              href={`/${workspaceSlug}/blogs/${blogId}/forms-cta/cta-dashboard`}
            >
              <Button variant="outline" className="mt-2">
                View CTA Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
