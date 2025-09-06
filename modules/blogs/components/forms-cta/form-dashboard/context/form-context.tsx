"use client";
import { createContext, useState, ReactNode } from "react";
import { produce } from "immer";

// --- Type Definitions (Unchanged) ---
export type DeviceType = "desktop" | "mobile";
export type ThemeType = "light" | "dark";
export type FormType =
  | "EndOfPost"
  | "Sidebar"
  | "InLine"
  | "PopUp"
  | "Floating"
  | "Gated";
export type FormTrigger = "TimeDelay" | "Scroll" | "ExitIntent";
export type FieldType =
  | "Email"
  | "ShortText"
  | "LongText"
  | "Phone"
  | "Country"
  | "Select"
  | "MultiSelect";
export type ConfirmationButtonType = "Close" | "Link";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  order: number;
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
  formValues: { [fieldId: string]: any }; // NEW: To store user input
}

interface FormContextType {
  formState: FormState;
  setFormState: (state: FormState) => void;
  updateField: <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => void;
  addField: (field: Omit<FormField, "id" | "order">) => void;
  updateFormField: (field: FormField) => void;
  deleteFormField: (id: string) => void;
  setFields: (fields: FormField[]) => void;
  setEmbedCodeEnabled: (isEnabled: boolean) => void;
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  device: DeviceType;
  setDevice: (d: DeviceType) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  refresh: () => void;
  setActiveTab: (tab: string) => void;
  updateFieldValue: (fieldId: string, value: any) => void; // NEW: Function to update form values
  isConfirmationVisible: boolean; // NEW: State for confirmation visibility
  setIsConfirmationVisible: (visible: boolean) => void; // NEW: Setter for confirmation
}

export const FormContext = createContext<FormContextType>(null!);

const initialState: FormState = {
  formName: "Newsletter form",
  heading: "Subscribe to Our Newsletter",
  description: "Get the latest news and updates.\nNo spam, we promise.",
  formType: "PopUp",
  category: "Global",
  formTrigger: "TimeDelay",
  timeDelay: 0,
  scrollTrigger: 50,
  isMandatory: true,
  fields: [
    {
      id: "1",
      type: "Email",
      label: "Email*",
      placeholder: "you@example.com",
      isRequired: true,
      order: 0,
    },
    {
      id: "2",
      type: "ShortText",
      label: "First Name",
      placeholder: "Jane",
      isRequired: false,
      order: 1,
    },
    {
      id: "3",
      type: "Select",
      label: "What are you interested in?",
      isRequired: true,
      order: 2,
      options: ["Marketing", "Design", "Development"],
    },
  ],
  buttonText: "Sign Up Now",
  footnote: "By signing up, you agree to our Terms of Service.",
  isMultiStep: false,
  confirmation: {
    heading: "Thank You!",
    description: "Your submission has been received.",
    buttonText: "Close",
    buttonType: "Close",
    url: "",
    openInNewTab: true,
  },
  embedCode: { isEnabled: false, code: "" },
  formValues: {}, // NEW: Initialize form values as an empty object
};

export const FormProvider = ({
  children,
  passedSetActiveTab,
}: {
  children: ReactNode;
  passedSetActiveTab: (tab: string) => void;
}) => {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [theme, setTheme] = useState<ThemeType>("light");
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false); // NEW

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
  const addField = (field: Omit<FormField, "id" | "order">) => {
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

  // NEW: Function to handle live input changes from the user
  const updateFieldValue = (fieldId: string, value: any) => {
    setFormState(
      produce((draft) => {
        draft.formValues[fieldId] = value;
      })
    );
  };

  const saveChanges = () =>
    console.log("Saved:", { config: formState, values: formState.formValues });
  const cancelChanges = () => console.log("Cancelled changes");
  const refresh = () => console.log("Refreshed preview!");

  return (
    <FormContext.Provider
      value={{
        formState,
        setFormState,
        updateField,
        addField,
        updateFormField,
        deleteFormField,
        setFields,
        setEmbedCodeEnabled,
        theme,
        setTheme,
        device,
        setDevice,
        saveChanges,
        cancelChanges,
        refresh,
        setActiveTab: passedSetActiveTab,
        updateFieldValue,
        isConfirmationVisible,
        setIsConfirmationVisible, // NEW: Pass new state and functions
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
