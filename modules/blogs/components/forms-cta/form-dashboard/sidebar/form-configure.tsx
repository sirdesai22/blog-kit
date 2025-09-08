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
import { Settings, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    loadingCategories,
    categoriesError,
    refreshCategories,
  } = useContext(FormContext);

  const {
    formName,
    formType,
    category,
    formTrigger,
    timeDelay,
    scrollTrigger,
    isMandatory,
  } = formState;

  // Get the display name for selected category
  const selectedCategoryDisplay = useMemo(() => {
    if (!category) return '';

    if (category === 'global') {
      return (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
            Global
          </span>
          Apply to all categories
        </div>
      );
    }

    const selectedCategory = categories.find((cat) => cat.id === category);
    if (selectedCategory) {
      return <div className="flex items-center">{selectedCategory.name}</div>;
    }

    return category; // fallback to raw value
  }, [category, categories]);

  const isTriggerConfigurable = ['PopUp', 'Floating', 'Gated'].includes(
    formType
  );
  const showTimeDelay =
    isTriggerConfigurable &&
    formTrigger === 'TimeDelay' &&
    ['PopUp', 'Floating', 'Gated'].includes(formType);
  const showScrollTrigger = isTriggerConfigurable && formTrigger === 'Scroll';

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

        {/* Category Selection */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Label htmlFor="category" className="text-normal">
              Category / Tag
            </Label>
            <HelpCircle className="h-4 w-4 text-gray-400" />
            {categoriesError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshCategories}
                className="ml-auto h-6 px-2"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>

          <Select
            value={category}
            onValueChange={(v: string) => updateField('category', v)}
            disabled={loadingCategories}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  loadingCategories
                    ? 'Loading categories...'
                    : 'Select a category'
                }
              >
                {loadingCategories ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading categories...
                  </div>
                ) : (
                  selectedCategoryDisplay
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {/* Global option */}
              <SelectItem value="global">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                    Global
                  </span>
                  Apply to all categories
                </div>
              </SelectItem>

              {/* Loading state */}
              {loadingCategories && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading categories...
                  </div>
                </div>
              )}

              {/* Error state */}
              {categoriesError && !loadingCategories && (
                <div className="px-2 py-1.5 text-sm text-red-500">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    {categoriesError}
                  </div>
                </div>
              )}

              {/* Categories from database */}
              {!loadingCategories && categories.length > 0 && (
                <>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center">{cat.name}</div>
                    </SelectItem>
                  ))}
                </>
              )}

              {/* No categories found */}
              {!loadingCategories &&
                !categoriesError &&
                categories.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <span className="mr-2">📁</span>
                      No categories found
                    </div>
                  </div>
                )}
            </SelectContent>
          </Select>

          {/* Helper text */}
          {!loadingCategories &&
            categories.length === 0 &&
            !categoriesError && (
              <p className="text-sm text-muted-foreground mt-1">
                Create categories in your blog settings to organize forms by
                category
              </p>
            )}

          {categoriesError && (
            <p className="text-sm text-red-500 mt-1">
              Failed to load categories.
              <button
                onClick={refreshCategories}
                className="underline ml-1 hover:no-underline"
              >
                Try again
              </button>
            </p>
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
