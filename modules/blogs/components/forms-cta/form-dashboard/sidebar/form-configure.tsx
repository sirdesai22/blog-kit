'use client';
import React, { useContext, useMemo } from 'react';
import { FormContext, FormType, FormTrigger } from '../context/form-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';
import {
  Settings,
  HelpCircle,
  Loader2,
  RefreshCw,
  Tag,
  Folder,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, X } from 'lucide-react';

// SVGs for Form Types (Unchanged)
const EndOfPostIcon = () => (
  <svg viewBox="0 0 80 50">
    <rect x="5" y="5" width="70" height="40" rx="3" fill="#E5E7EB" />
    <rect x="15" y="10" width="50" height="4" rx="2" fill="#D1D5DB" />
    <rect x="15" y="18" width="50" height="4" rx="2" fill="#D1D5DB" />
    <rect x="15" y="32" width="50" height="10" rx="2" fill="#F97316" />
  </svg>
);
const SidebarIcon = () => (
  <svg viewBox="0 0 80 50">
    <rect x="5" y="5" width="70" height="40" rx="3" fill="#E5E7EB" />
    <rect x="10" y="10" width="40" height="4" rx="2" fill="#D1D5DB" />
    <rect x="10" y="18" width="40" height="4" rx="2" fill="#D1D5DB" />
    <rect x="55" y="10" width="15" height="30" rx="2" fill="#F97316" />
  </svg>
);
const InLineIcon = () => (
  <svg viewBox="0 0 80 50">
    <rect x="5" y="5" width="70" height="40" rx="3" fill="#E5E7EB" />
    <rect x="15" y="10" width="50" height="4" rx="2" fill="#D1D5DB" />
    <rect x="15" y="20" width="50" height="10" rx="2" fill="#F97316" />
    <rect x="15" y="34" width="50" height="4" rx="2" fill="#D1D5DB" />
  </svg>
);
const PopUpIcon = () => (
  <svg viewBox="0 0 80 50">
    <rect
      x="5"
      y="5"
      width="70"
      height="40"
      rx="3"
      fill="#E5E7EB"
      opacity="0.6"
    />
    <rect
      x="20"
      y="12.5"
      width="40"
      height="25"
      rx="3"
      stroke="#F97316"
      strokeWidth="2"
      fill="#F3F4F6"
    />
  </svg>
);
const FloatingIcon = () => (
  <svg viewBox="0 0 80 50">
    <rect x="5" y="5" width="70" height="40" rx="3" fill="#E5E7EB" />
    <rect x="15" y="10" width="50" height="4" rx="2" fill="#D1D5DB" />
    <rect x="45" y="28" width="25" height="12" rx="2" fill="#F97316" />
  </svg>
);
const GatedIcon = () => (
  <svg viewBox="0 0 80 50">
    <rect x="5" y="5" width="70" height="40" rx="3" fill="#E5E7EB" />
    <rect
      x="5"
      y="5"
      width="70"
      height="40"
      rx="3"
      fill="black"
      opacity="0.5"
    />
    <rect x="20" y="12.5" width="40" height="25" rx="3" fill="#F3F4F6" />
  </svg>
);

const icons: Record<FormType, React.ReactNode> = {
  EndOfPost: <EndOfPostIcon />,
  Sidebar: <SidebarIcon />,
  InLine: <InLineIcon />,
  PopUp: <PopUpIcon />,
  Floating: <FloatingIcon />,
  Gated: <GatedIcon />,
};

const FormTypeCard = ({
  type,
  label,
  isActive,
  onSelect,
}: {
  type: FormType;
  label: string;
  isActive: boolean;
  onSelect: (type: FormType) => void;
}) => (
  <div
    onClick={() => onSelect(type)}
    className={cn(
      'p-2 border-2 rounded-lg text-center cursor-pointer transition-all duration-200',
      {
        'border-blue-500 bg-blue-50 dark:bg-blue-900/50': isActive,
        'border-gray-200 hover:border-gray-400 dark:border-zinc-700 dark:hover:border-zinc-500':
          !isActive,
      }
    )}
  >
    <div className="h-16 bg-gray-100 dark:bg-zinc-800 mb-2 rounded-md flex items-center justify-center overflow-hidden">
      {icons[type]}
    </div>
    <p className="text-small  text-gray-700 dark:text-gray-300">{label}</p>
  </div>
);

export default function FormConfigure() {
  const {
    formState,
    updateField,
    setActiveTab,
    categories,
    tags,
    loadingCategories,
    loadingTags,
    categoriesError,
    tagsError,
    refreshCategories,
    refreshTags,
  } = useContext(FormContext);

  const {
    formName,
    formType,
    categories: selectedCategoriesRaw,
    tags: selectedTagsRaw,
    formTrigger,
    timeDelay,
    scrollTrigger,
    isMandatory,
  } = formState;

  // Add safety checks to ensure arrays
  const selectedCategories = Array.isArray(selectedCategoriesRaw)
    ? selectedCategoriesRaw
    : [];
  const selectedTags = Array.isArray(selectedTagsRaw) ? selectedTagsRaw : [];

  // Combine categories and tags for multiselect
  const allOptions = useMemo(() => {
    const categoryOptions = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      label: cat.name,
      type: 'category' as const,
    }));

    const tagOptions = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      label: tag.name,
      type: 'tag' as const,
    }));

    return [...categoryOptions, ...tagOptions];
  }, [categories, tags]);

  const selectedValues = useMemo(() => {
    return [...selectedCategories, ...selectedTags];
  }, [selectedCategories, selectedTags]);

  const handleSelectionChange = (values: string[]) => {
    const newCategories: string[] = [];
    const newTags: string[] = [];

    values.forEach((value) => {
      if (categories.some((cat) => cat.id === value)) {
        newCategories.push(value);
      } else if (tags.some((tag) => tag.id === value)) {
        newTags.push(value);
      }
    });

    updateField('categories', newCategories);
    updateField('tags', newTags);
  };

  const isTriggerConfigurable = ['PopUp', 'Floating', 'Gated'].includes(
    formType
  );
  const showTimeDelay =
    isTriggerConfigurable &&
    formTrigger === 'TimeDelay' &&
    ['PopUp', 'Floating', 'Gated'].includes(formType);
  const showScrollTrigger = isTriggerConfigurable && formTrigger === 'Scroll';

  // Create a custom multiselect component
  const CategoriesTagsMultiSelect = () => {
    const [open, setOpen] = useState(false);

    // Combine categories and tags for multiselect
    const allOptions = useMemo(() => {
      const categoryOptions = (categories || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        label: cat.name,
        type: 'category' as const,
      }));

      const tagOptions = (tags || []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        label: tag.name,
        type: 'tag' as const,
      }));

      return [...categoryOptions, ...tagOptions];
    }, [categories, tags]);

    const selectedValues = useMemo(() => {
      return [...selectedCategories, ...selectedTags];
    }, [selectedCategories, selectedTags]);

    const handleSelectionChange = (value: string) => {
      const newCategories = [...selectedCategories];
      const newTags = [...selectedTags];

      // Check if it's a category
      const isCategory = categories?.some((cat) => cat.id === value);
      const isTag = tags?.some((tag) => tag.id === value);

      if (isCategory) {
        const index = newCategories.indexOf(value);
        if (index > -1) {
          newCategories.splice(index, 1);
        } else {
          newCategories.push(value);
        }
        updateField('categories', newCategories);
      } else if (isTag) {
        const index = newTags.indexOf(value);
        if (index > -1) {
          newTags.splice(index, 1);
        } else {
          newTags.push(value);
        }
        updateField('tags', newTags);
      }
    };

    const removeItem = (value: string) => {
      const newCategories = selectedCategories.filter((id) => id !== value);
      const newTags = selectedTags.filter((id) => id !== value);
      updateField('categories', newCategories);
      updateField('tags', newTags);
    };

    const getSelectedItemsDisplay = () => {
      const selectedItems = [];

      selectedCategories.forEach((catId) => {
        const cat = categories?.find((c) => c.id === catId);
        if (cat) {
          selectedItems.push({ id: catId, name: cat.name, type: 'category' });
        }
      });

      selectedTags.forEach((tagId) => {
        const tag = tags?.find((t) => t.id === tagId);
        if (tag) {
          selectedItems.push({ id: tagId, name: tag.name, type: 'tag' });
        }
      });

      return selectedItems;
    };

    const selectedItems = getSelectedItemsDisplay();

    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between min-h-10"
              disabled={loadingCategories || loadingTags}
            >
              <div className="flex flex-wrap gap-1">
                {selectedItems.length === 0 ? (
                  <span className="text-muted-foreground">
                    {loadingCategories || loadingTags
                      ? 'Loading...'
                      : 'Select categories and tags...'}
                  </span>
                ) : (
                  selectedItems.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                    >
                      {item.type === 'category' ? (
                        <Folder className="h-3 w-3 text-blue-500" />
                      ) : (
                        <Tag className="h-3 w-3 text-green-500" />
                      )}
                      {item.name}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                      />
                    </span>
                  ))
                )}
                {selectedItems.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{selectedItems.length - 3} more
                  </span>
                )}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search categories and tags..." />
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {allOptions.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.id}
                      onSelect={() => handleSelectionChange(option.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="mr-2 h-4 w-4 border border-muted-foreground rounded flex items-center justify-center">
                          {selectedValues.includes(option.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {option.type === 'category' ? (
                            <Folder className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Tag className="h-3 w-3 text-green-500" />
                          )}
                          <span className="text-sm">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            ({option.type})
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Selected items display */}
        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedItems.map((item) => (
              <span
                key={item.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
              >
                {item.type === 'category' ? (
                  <Folder className="h-3 w-3 text-blue-500" />
                ) : (
                  <Tag className="h-3 w-3 text-green-500" />
                )}
                {item.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                />
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-1" />
        <div>
          <h1 className="text-main">Configure Form</h1>
          <p className="text-small">
            Set the core behavior and appearance of your form.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Form Name */}
        <div>
          <Label htmlFor="form-name" className="text-normal mb-2 block">
            Form Name
          </Label>
          <Input
            id="form-name"
            value={formName}
            placeholder="e.g. Blog Post Lead Magnet"
            onChange={(e) => updateField('formName', e.target.value)}
          />
        </div>

        {/* Form Type */}
        <div>
          <Label className="text-normal mb-2 block">Type</Label>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(icons).map((key) => (
              <FormTypeCard
                key={key}
                type={key as FormType}
                label={key.replace(/([A-Z])/g, ' $1').trim()}
                isActive={formType === key}
                onSelect={(t) => updateField('formType', t)}
              />
            ))}
          </div>
        </div>

        {/* Categories and Tags Selection */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Label htmlFor="categories-tags" className="text-normal">
              Categories & Tags
            </Label>
            <HelpCircle className="h-4 w-4 text-gray-400" />
            {(categoriesError || tagsError) && (
              <div className="ml-auto flex gap-1">
                {categoriesError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshCategories}
                    className="h-6 px-2"
                    title="Refresh categories"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
                {tagsError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshTags}
                    className="h-6 px-2"
                    title="Refresh tags"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>

          <CategoriesTagsMultiSelect />

          {/* Helper text */}
          {!loadingCategories && !loadingTags && allOptions.length === 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Create categories and tags in your blog settings to organize forms
            </p>
          )}

          {(categoriesError || tagsError) && (
            <div className="mt-1 space-y-1">
              {categoriesError && (
                <p className="text-sm text-red-500">
                  Failed to load categories.
                  <button
                    onClick={refreshCategories}
                    className="underline ml-1 hover:no-underline"
                  >
                    Try again
                  </button>
                </p>
              )}
              {tagsError && (
                <p className="text-sm text-red-500">
                  Failed to load tags.
                  <button
                    onClick={refreshTags}
                    className="underline ml-1 hover:no-underline"
                  >
                    Try again
                  </button>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Form Trigger Configuration */}
        {isTriggerConfigurable && (
          <div className="space-y-3 p-3 border rounded-md bg-muted/30 dark:border-zinc-700 dark:bg-zinc-900/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Label htmlFor="form-trigger" className="font-semibold">
                Form trigger
              </Label>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
            <Select
              value={formTrigger}
              onValueChange={(v: FormTrigger) => updateField('formTrigger', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Time delay / Scroll trigger / Exit Intent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TimeDelay">Time delay</SelectItem>
                <SelectItem value="Scroll">Scroll trigger</SelectItem>
                {formType === 'PopUp' && (
                  <SelectItem value="ExitIntent">Exit Intent</SelectItem>
                )}
              </SelectContent>
            </Select>

            {showTimeDelay && (
              <div className="flex items-center gap-2 mt-3">
                <Label className="text-small whitespace-nowrap">
                  Time Delay
                </Label>
                <Input
                  className="w-16 h-8 text-center"
                  type="number"
                  value={timeDelay}
                  onChange={(e) =>
                    updateField('timeDelay', parseInt(e.target.value, 10))
                  }
                />
                <span className="text-small text-muted-foreground">
                  Seconds
                </span>
              </div>
            )}

            {showScrollTrigger && (
              <div className="flex items-center gap-2 mt-3">
                <Label className="text-small whitespace-nowrap">
                  Scroll Trigger
                </Label>
                <Input
                  className="w-16 h-8 text-center"
                  type="number"
                  value={scrollTrigger}
                  onChange={(e) =>
                    updateField('scrollTrigger', parseInt(e.target.value, 10))
                  }
                />
                <span className="text-small text-muted-foreground">
                  % of post page
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mandatory Form & Next Button */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Label className="font-semibold">Mandatory Form</Label>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
            <Checkbox
              id="mandatory"
              checked={isMandatory}
              onCheckedChange={(c) => updateField('isMandatory', !!c)}
            />
            <label htmlFor="mandatory" className="text-small">
              Yes
            </label>
          </div>
          <Button onClick={() => setActiveTab('form')}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
