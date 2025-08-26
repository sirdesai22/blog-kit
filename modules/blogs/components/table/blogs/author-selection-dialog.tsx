'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBlogFilterOptions } from '@/modules/blogs/hooks/use-blog-filter-options';

interface AuthorSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedAuthorId: string) => void;
  workspaceSlug: string;
  pageId: string;
}

export function AuthorSelectionDialog({
  open,
  onOpenChange,
  onSave,
  workspaceSlug,
  pageId,
}: AuthorSelectionDialogProps) {
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
  
  const { authors: authorOptions, isLoading: loading } = useBlogFilterOptions(workspaceSlug, pageId);

  const handleSave = () => {
    if (selectedAuthorId) {
      onSave(selectedAuthorId);
      onOpenChange(false);
      setSelectedAuthorId('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedAuthorId('');
  };

  const selectedAuthor = authorOptions.find(author => author.id === selectedAuthorId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Select Author
          </DialogTitle>
       
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading authors...</div>
          ) : authorOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">No authors available</div>
          ) : (
            <Select value={selectedAuthorId} onValueChange={setSelectedAuthorId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an author">
                  {selectedAuthor && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={selectedAuthor.image || ''} />
                        <AvatarFallback className="text-xs">
                          {selectedAuthor.name?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedAuthor.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {authorOptions.map((author) => (
                  <SelectItem key={author.id} value={author.id}>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={author.image || ''} />
                        <AvatarFallback className="text-xs">
                          {author.name?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{author.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedAuthorId}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
