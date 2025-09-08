"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

interface SelectionViewProps {
  title: string;
  onBack: () => void;
}

const SelectionViewHeader = ({ title, onBack }: SelectionViewProps) => (
  <div className="flex items-center gap-2 p-2 border-b sticky top-0 bg-white z-10">
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
      <ArrowLeft className="h-4 w-4" />
    </Button>
    <h3 className="text-base font-medium">{title}</h3>
  </div>
);

interface SelectionFooterProps {
  selectedCount: number;
  onBack: () => void;
  onSave: () => void;
}

const SelectionViewFooter = ({
  selectedCount,
  onBack,
  onSave,
}: SelectionFooterProps) => (
  <div className="flex justify-between items-center p-2 border-t sticky bottom-0 bg-white z-10">
    <div className="text-xs text-muted-foreground">
      {selectedCount} selected
    </div>
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onBack}>
        Cancel
      </Button>
      <Button size="sm" onClick={onSave} disabled={selectedCount === 0}>
        Save
      </Button>
    </div>
  </div>
);

interface Category {
  id: string;
  name: string;
}

interface CategorySelectionViewProps {
  options: Category[];
  loading: boolean;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  onSave: () => void;
  onBack: () => void;
}

export function CategorySelectionView({
  options,
  loading,
  selectedIds,
  setSelectedIds,
  onSave,
  onBack,
}: CategorySelectionViewProps) {
  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col">
      <SelectionViewHeader title="Change Category" onBack={onBack} />
      <div className="h-48 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {options.map((category) => (
              <div key={category.id} className="flex items-center gap-1.5">
                <Checkbox
                  id={`cat-${category.id}`}
                  checked={selectedIds.includes(category.id)}
                  onCheckedChange={() => handleToggle(category.id)}
                />
                <label
                  htmlFor={`cat-${category.id}`}
                  className="text-sm cursor-pointer"
                >
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      <SelectionViewFooter
        selectedCount={selectedIds.length}
        onBack={onBack}
        onSave={onSave}
      />
    </div>
  );
}
