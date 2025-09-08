'use client';
import { createContext, useState, ReactNode, useEffect } from 'react';
import { produce } from 'immer';
import { useRouter } from 'next/navigation';

// --- Type Definitions ---
export type DeviceType = 'desktop' | 'mobile';
export type ThemeType = 'light' | 'dark';
export type FormType =
  | 'EndOfPost'
  | 'Sidebar'
  | 'InLine'
  | 'PopUp'
  | 'Floating'
  | 'Gated';
export type FormTrigger = 'TimeDelay' | 'Scroll' | 'ExitIntent';
export type FieldType =
  | 'Email'
  | 'ShortText'
  | 'LongText'
  | 'Phone'
  | 'Country'
  | 'Select'
  | 'MultiSelect';
export type ConfirmationButtonType = 'Close' | 'Link';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface FormState {
  formName: string;
  heading: string;
  description: string;
  formType: FormType;
  category: string;
  formTrigger: FormTrigger;
  timeDelay: number;
  scrollTrigger: number;
  isMandatory: boolean;
  fields: FormField[];
  buttonText: string;
  footnote: string;
  isMultiStep: boolean;
  confirmation: {
    heading: string;
    description: string;
    buttonText: string;
    buttonType: ConfirmationButtonType;
    url?: string;
    openInNewTab?: boolean;
  };
  embedCode: { isEnabled: boolean; code: string };
  customCode: { isEnabled: boolean; code: string };
  formValues: { [fieldId: string]: any };
}

interface FormContextType {
  // Form state
  formState: FormState;
  setFormState: (state: FormState) => void;
  updateField: <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => void;

  // Form fields management
  addField: (field: Omit<FormField, 'id' | 'order'>) => void;
  updateFormField: (field: FormField) => void;
  deleteFormField: (id: string) => void;
  setFields: (fields: FormField[]) => void;
  updateFieldValue: (fieldId: string, value: any) => void;

  // Form configuration
  setEmbedCodeEnabled: (isEnabled: boolean) => void;
  setCustomCodeEnabled: (isEnabled: boolean) => void;
  setCustomCode: (code: string) => void;

  // UI state
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  setActiveTab: (tab: string) => void;
  isConfirmationVisible: boolean;
  setIsConfirmationVisible: (visible: boolean) => void;

  // Form operations
  saveChanges: () => void;
  cancelChanges: () => void;
  refresh: () => void;

  // API state
  isSaving: boolean;
  saveMessage: string | null;
  saveError: string | null;
  formId: string | null;

  // Categories state
  categories: Category[];
  loadingCategories: boolean;
  categoriesError: string | null;
  refreshCategories: () => void;
}

export const FormContext = createContext<FormContextType>(null!);

const initialState: FormState = {
  formName: 'Newsletter form',
  heading: 'Subscribe to Our Newsletter',
  description: 'Get the latest news and updates.\nNo spam, we promise.',
  formType: 'PopUp',
  category: 'global', // Start with global as default
  formTrigger: 'TimeDelay',
  timeDelay: 0,
  scrollTrigger: 50,
  isMandatory: true,
  fields: [
    {
      id: '1',
      type: 'Email',
      label: 'Email*',
      placeholder: 'you@example.com',
      isRequired: true,
      order: 0,
    },
    {
      id: '2',
      type: 'ShortText',
      label: 'First Name',
      placeholder: 'Jane',
      isRequired: false,
      order: 1,
    },
    {
      id: '3',
      type: 'Select',
      label: 'What are you interested in?',
      isRequired: true,
      order: 2,
      options: ['Marketing', 'Design', 'Development'],
    },
  ],
  buttonText: 'Sign Up Now',
  footnote: 'By signing up, you agree to our Terms of Service.',
  isMultiStep: false,
  confirmation: {
    heading: 'Thank You!',
    description: 'Your submission has been received.',
    buttonText: 'Close',
    buttonType: 'Close',
    url: '',
    openInNewTab: true,
  },
  embedCode: { isEnabled: false, code: '' },
  customCode: { isEnabled: false, code: '' },
  formValues: {},
};

export const FormProvider = ({
  children,
  passedSetActiveTab,
  pageId,
  formId = null,
}: {
  children: ReactNode;
  passedSetActiveTab: (tab: string) => void;
  pageId: string;
  formId?: string | null;
}) => {
  // Form state
  const [formState, setFormState] = useState<FormState>(initialState);
  const [theme, setTheme] = useState<ThemeType>('light');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);

  // API state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const router = useRouter();

  // Load categories and form data on mount
  useEffect(() => {
    loadCategories();
    if (formId) {
      loadFormData(formId);
    }
  }, [pageId, formId]);

  // Categories management
  const loadCategories = async () => {
    if (!pageId) return;

    try {
      setLoadingCategories(true);
      setCategoriesError(null);

      const response = await fetch(`/api/blogs/${pageId}/forms`);
      const result = await response.json();

      if (result.success) {
        setCategories(result.data.availableCategories || []);
      } else {
        setCategoriesError('Failed to load categories');
        console.error('Failed to load categories:', result.error);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategoriesError('Error loading categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const refreshCategories = () => {
    loadCategories();
  };

  // Form data management
  const loadFormData = async (formIdToLoad: string) => {
    try {
      const response = await fetch(
        `/api/blogs/${pageId}/forms/${formIdToLoad}`
      );
      const result = await response.json();

      if (result.success) {
        setFormState(result.data.form.config);
      } else {
        setSaveError('Failed to load form data');
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      setSaveError('Error loading form data');
    }
  };

  // Form state management functions
  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState(
      produce((draft) => {
        (draft as any)[field] = value;
      })
    );
  };

  const addField = (field: Omit<FormField, 'id' | 'order'>) => {
    setFormState(
      produce((draft) => {
        draft.fields.push({
          ...field,
          id: Date.now().toString(),
          order: draft.fields.length,
        });
      })
    );
  };

  const updateFormField = (updatedField: FormField) => {
    setFormState(
      produce((draft) => {
        const index = draft.fields.findIndex((f) => f.id === updatedField.id);
        if (index !== -1) draft.fields[index] = updatedField;
      })
    );
  };

  const deleteFormField = (id: string) => {
    setFormState(
      produce((draft) => {
        draft.fields = draft.fields.filter((f) => f.id !== id);
      })
    );
  };

  const setFields = (fields: FormField[]) => {
    setFormState(
      produce((draft) => {
        draft.fields = fields;
      })
    );
  };

  const setEmbedCodeEnabled = (isEnabled: boolean) => {
    setFormState(
      produce((draft) => {
        draft.embedCode.isEnabled = isEnabled;
      })
    );
  };

  const setCustomCodeEnabled = (isEnabled: boolean) => {
    setFormState(
      produce((draft) => {
        draft.customCode.isEnabled = isEnabled;
      })
    );
  };

  const setCustomCode = (code: string) => {
    setFormState(
      produce((draft) => {
        draft.customCode.code = code;
      })
    );
  };

  const updateFieldValue = (fieldId: string, value: any) => {
    setFormState(
      produce((draft) => {
        draft.formValues[fieldId] = value;
      })
    );
  };

  // Form operations
  const saveChanges = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      const payload = {
        config: formState,
        values: formState.formValues,
      };

      let response;

      if (formId) {
        // Update existing form
        response = await fetch(`/api/blogs/${pageId}/forms`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formId: formId,
            config: formState,
          }),
        });
      } else {
        // Create new form
        response = await fetch(`/api/blogs/${pageId}/forms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result.success) {
        setSaveMessage(result.data.message || 'Form saved successfully!');

        // If creating new form, redirect to edit mode
        if (!formId && result.data.form?.id) {
          setTimeout(() => {
            router.push(
              `${window.location.pathname}?formId=${result.data.form.id}`
            );
          }, 1000);
        }
      } else {
        setSaveError(result.error || 'Failed to save form');
        if (result.details) {
          console.error('Validation errors:', result.details);
        }
      }
    } catch (error) {
      console.error('Error saving form:', error);
      setSaveError('Network error. Please try again.');
    } finally {
      setIsSaving(false);

      // Clear messages after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
        setSaveError(null);
      }, 3000);
    }
  };

  const cancelChanges = () => {
    setFormState(initialState);
    setSaveMessage(null);
    setSaveError(null);
    router.back();
  };

  const refresh = () => {
    if (formId) {
      loadFormData(formId);
    }
    loadCategories();
  };

  return (
    <FormContext.Provider
      value={{
        // Form state
        formState,
        setFormState,
        updateField,

        // Form fields management
        addField,
        updateFormField,
        deleteFormField,
        setFields,
        updateFieldValue,

        // Form configuration
        setEmbedCodeEnabled,
        setCustomCodeEnabled,
        setCustomCode,

        // UI state
        theme,
        setTheme,
        device,
        setDevice,
        setActiveTab: passedSetActiveTab,
        isConfirmationVisible,
        setIsConfirmationVisible,

        // Form operations
        saveChanges,
        cancelChanges,
        refresh,

        // API state
        isSaving,
        saveMessage,
        saveError,
        formId,

        // Categories state
        categories,
        loadingCategories,
        categoriesError,
        refreshCategories,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
