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
import { X } from 'lucide-react';
import { useBlogFilterOptions } from '@/modules/blogs/hooks/use-blog-filter-options';

interface TagSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedTagIds: string[]) => void;
  workspaceSlug: string;
  pageId: string;
}

export function TagSelectionDialog({
  open,
  onOpenChange,
  onSave,
  workspaceSlug,
  pageId,
}: TagSelectionDialogProps) {
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { tags: tagOptions, isLoading: loading } = useBlogFilterOptions(
    workspaceSlug,
    pageId
  );

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = () => {
    onSave(selectedTagIds);
    onOpenChange(false);
    setSelectedTagIds([]);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTagIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Select Tags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading tags...</div>
          ) : tagOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No tags available
            </div>
          ) : (
            tagOptions.map((tag) => (
              <div key={tag.id} className="flex items-center space-x-2">
                <Checkbox
                  id={tag.id}
                  checked={selectedTagIds.includes(tag.id)}
                  onCheckedChange={() => handleToggleTag(tag.id)}
                />
                <label
                  htmlFor={tag.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {tag.name}
                </label>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
