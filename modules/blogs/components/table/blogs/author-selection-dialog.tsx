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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBlogFilterOptions } from "@/modules/blogs/hooks/use-blog-filter-options";

interface AuthorSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedAuthorIds: string[]) => void;
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
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);

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
      <DialogContent className="w-fit p-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-base font-medium">
            Select Authors
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
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
              <div className="flex items-center gap-2 pb-2 border-b">
                <Checkbox
                  id="select-all-authors"
                  checked={
                    selectedAuthorIds.length === authorOptions.length
                      ? true
                      : selectedAuthorIds.length === 0
                      ? false
                      : "indeterminate"
                  }
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all-authors"
                  className="text-sm cursor-pointer"
                >
                  Select All
                </label>
              </div>

              {/* Author list */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {authorOptions.map((author) => (
                  <div key={author.id} className="flex items-center gap-2">
                    <Checkbox
                      id={author.id}
                      checked={selectedAuthorIds.includes(author.id)}
                      onCheckedChange={() => handleToggleAuthor(author.id)}
                    />
                    <label
                      htmlFor={author.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={author.image || ""} />
                        <AvatarFallback className="text-xs">
                          {author.name?.charAt(0).toUpperCase() || "A"}
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

        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {selectedAuthorIds.length} selected
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
