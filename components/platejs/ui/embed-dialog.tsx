'use client';

import * as React from 'react';
import { Link } from 'lucide-react';
import { isUrl } from 'platejs';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmbedDialog } from './embed-dialog-context';

export function EmbedDialog() {
  const { isOpen, closeDialog, onInsert } = useEmbedDialog();
  const [url, setUrl] = React.useState('');

  const handleInsert = React.useCallback(() => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!isUrl(url)) {
      toast.error('Invalid URL. Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    if (onInsert) {
      onInsert(url.trim());
    }
    setUrl('');
    closeDialog();
  }, [url, onInsert, closeDialog]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUrl('');
      closeDialog();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      // Reset URL and focus the input when dialog opens
      setUrl('');
      setTimeout(() => {
        const input = document.getElementById('embed-url-input');
        input?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="size-4" />
            Insert Embed
          </DialogTitle>
          <DialogDescription>
            Paste a link to embed rich media content (YouTube, Twitter, etc.)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="embed-url-input">URL</Label>
            <Input
              id="embed-url-input"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleInsert();
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!url.trim()}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

