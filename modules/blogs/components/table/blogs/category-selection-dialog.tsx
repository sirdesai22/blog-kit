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
      setSelectedCategoryIds(categoryOptions.map((category) => category.id));
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
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Select Categories
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              {/* Select All option */}
              <div className="flex items-center space-x-2 pb-2 border-b">
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
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Select All Categories
                </label>
              </div>

              {/* Individual categories */}
              <div className="max-h-60 overflow-y-auto space-y-3">
                {categoryOptions.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={category.id}
                      checked={selectedCategoryIds.includes(category.id)}
                      onCheckedChange={() => handleToggleCategory(category.id)}
                    />
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedCategoryIds.length} categor
            {selectedCategoryIds.length !== 1 ? 'ies' : 'y'} selected
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
