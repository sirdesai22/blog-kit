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

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (selectedCategoryIds: string[]) => void;
  workspaceSlug: string;
  pageId: string;
}

export function CategorySelectionDialog({
  open,
  onOpenChange,
  onSave,
  workspaceSlug,
  pageId,
}: CategorySelectionDialogProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const { categories: categoryOptions, isLoading: loading } =
    useBlogFilterOptions(workspaceSlug, pageId);

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategoryIds.length === categoryOptions.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categoryOptions.map((c) => c.id));
    }
  };

  const handleSave = () => {
    onSave(selectedCategoryIds);
    onOpenChange(false);
    setSelectedCategoryIds([]);
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedCategoryIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" w-fit p-4">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-base font-medium">
            Select Categories
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {loading ? (
            <div className="text-sm text-muted-foreground">
              Loading categories...
            </div>
          ) : categoryOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No categories available
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center gap-1.5 pb-2 border-b">
                <Checkbox
                  id="select-all-categories"
                  checked={
                    selectedCategoryIds.length === categoryOptions.length
                  }
                  ref={(el: any) => {
                    if (el) {
                      el.indeterminate =
                        selectedCategoryIds.length > 0 &&
                        selectedCategoryIds.length < categoryOptions.length;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all-categories"
                  className="text-sm cursor-pointer"
                >
                  Select All
                </label>
              </div>

              {/* Category list */}
              <div className="max-h-48 overflow-y-auto space-y-2">
                {categoryOptions.map((category) => (
                  <div key={category.id} className="flex items-center gap-1.5">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategoryIds.includes(category.id)}
                      onCheckedChange={() => handleToggleCategory(category.id)}
                    />
                    <label
                      htmlFor={category.id}
                      className="text-sm cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {selectedCategoryIds.length} selected
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
