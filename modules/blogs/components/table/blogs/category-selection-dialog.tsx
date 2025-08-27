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
      <DialogContent className="">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Select Categories
          </DialogTitle>
        
        </DialogHeader>

        <div className="space-y-3 py-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">
              Loading categories...
            </div>
          ) : categoryOptions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No categories available
            </div>
          ) : (
            categoryOptions.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategoryIds.includes(category.id)}
                  onCheckedChange={() => handleToggleCategory(category.id)}
                />
                <label
                  htmlFor={category.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category.name}
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
