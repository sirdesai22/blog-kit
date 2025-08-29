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

  const handleSelectAll = () => {
    if (selectedTagIds.length === tagOptions.length) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(tagOptions.map((tag) => tag.id));
    }
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
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Select Tags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading tags...</div>
          ) : tagOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No tags available
            </div>
          ) : (
            <>
              {/* Select All option */}
              <div className="flex items-center space-x-2 pb-2 border-b">
                <Checkbox
                  id="select-all-tags"
                  checked={selectedTagIds.length === tagOptions.length}
                  ref={(el: any) => {
                    if (el) {
                      el.indeterminate =
                        selectedTagIds.length > 0 &&
                        selectedTagIds.length < tagOptions.length;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all-tags"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All Tags
                </label>
              </div>

              {/* Individual tags */}
              <div className="max-h-60 overflow-y-auto space-y-3">
                {tagOptions.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag.id}
                      checked={selectedTagIds.includes(tag.id)}
                      onCheckedChange={() => handleToggleTag(tag.id)}
                    />
                    <label
                      htmlFor={tag.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center space-x-2"
                    >
                      <span>{tag.name}</span>
                      {tag.usageCount && (
                        <span className="text-xs text-muted-foreground">
                          ({tag.usageCount} posts)
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
            {selectedTagIds.length} tag{selectedTagIds.length !== 1 ? 's' : ''}{' '}
            selected
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
