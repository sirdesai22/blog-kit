"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useBlogFilterOptions } from "@/modules/blogs/hooks/use-blog-filter-options";

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
      <DialogContent className=" w-fit p-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-base font-medium">
            Select Tags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading tags...</div>
          ) : tagOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No tags available
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-2 pb-2 border-b">
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
                  className="text-sm cursor-pointer"
                >
                  Select All
                </label>
              </div>

              {/* Tag list */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {tagOptions.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2">
                    <Checkbox
                      id={tag.id}
                      checked={selectedTagIds.includes(tag.id)}
                      onCheckedChange={() => handleToggleTag(tag.id)}
                    />
                    <label
                      htmlFor={tag.id}
                      className="text-sm cursor-pointer flex items-center gap-1"
                    >
                      <span>{tag.name}</span>
                      {tag.usageCount && (
                        <span className="text-xs text-muted-foreground">
                          ({tag.usageCount})
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {selectedTagIds.length} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
