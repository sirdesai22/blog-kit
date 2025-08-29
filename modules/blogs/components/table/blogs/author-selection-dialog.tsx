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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBlogFilterOptions } from '@/modules/blogs/hooks/use-blog-filter-options';

interface AuthorSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedAuthorIds: string[]) => void; // Changed to array
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
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]); // Changed to array

  const { authors: authorOptions, isLoading: loading } = useBlogFilterOptions(
    workspaceSlug,
    pageId
  );

  const handleToggleAuthor = (authorId: string) => {
    setSelectedAuthorIds((prev) =>
      prev.includes(authorId)
        ? prev.filter((id) => id !== authorId)
        : [...prev, authorId]
    );
  };

  const handleSave = () => {
    onSave(selectedAuthorIds);
    onOpenChange(false);
    setSelectedAuthorIds([]);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedAuthorIds([]);
  };

  const handleSelectAll = () => {
    if (selectedAuthorIds.length === authorOptions.length) {
      setSelectedAuthorIds([]);
    } else {
      setSelectedAuthorIds(authorOptions.map((author) => author.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Select Authors
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">
              Loading authors...
            </div>
          ) : authorOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No authors available
            </div>
          ) : (
            <>
              {/* Select All option */}
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id="select-all"
                  checked={selectedAuthorIds.length === authorOptions.length}
                  ref={(el: any) => {
                    if (el) {
                      el.indeterminate =
                        selectedAuthorIds.length > 0 &&
                        selectedAuthorIds.length < authorOptions.length;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All Authors
                </label>
              </div>

              {/* Individual authors */}
              <div className="max-h-60 overflow-y-auto space-y-3">
                {authorOptions.map((author) => (
                  <div key={author.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={author.id}
                      checked={selectedAuthorIds.includes(author.id)}
                      onCheckedChange={() => handleToggleAuthor(author.id)}
                    />
                    <label
                      htmlFor={author.id}
                      className="flex items-center space-x-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={author.image || ''} />
                        <AvatarFallback className="text-xs">
                          {author.name?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{author.name}</span>
                      {author.email && (
                        <span className="text-xs text-muted-foreground">
                          ({author.email})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedAuthorIds.length} author
            {selectedAuthorIds.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
