"use client";
import { useContext, useState, useEffect, KeyboardEvent } from "react";
import { FormContext, FormField, FieldType } from "../context/form-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X, PlusCircle } from "lucide-react";
import { produce } from "immer";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  field: FormField | null;
}

const defaultState: Omit<FormField, "id" | "order"> = {
  label: "",
  type: "ShortText",
  placeholder: "",
  isRequired: false,
  options: [],
};

export default function AddEditFieldModal({ isOpen, setIsOpen, field }: Props) {
  const { addField, updateFormField } = useContext(FormContext);
  const [formState, setFormState] = useState(defaultState);
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    if (field) {
      setFormState({
        label: field.label,
        type: field.type,
        placeholder: field.placeholder || "",
        isRequired: field.isRequired,
        options: field.options || [],
      });
    } else {
      setFormState(defaultState);
    }
  }, [field, isOpen]);

  const handleSave = () => {
    if (field) {
      updateFormField({ ...field, ...formState });
    } else {
      addField(formState);
    }
    setIsOpen(false);
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormState(
        produce((draft) => {
          draft.options = [...(draft.options || []), newOption.trim()];
        })
      );
      setNewOption("");
    }
  };

  const handleDeleteOption = (index: number) => {
    setFormState(
      produce((draft) => {
        draft.options?.splice(index, 1);
      })
    );
  };

  const handleOptionKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
  };

  const showOptionsEditor =
    formState.type === "Select" || formState.type === "MultiSelect";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{field ? "Edit" : "Add"} Field</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={formState.type}
              onValueChange={(v: FieldType) =>
                setFormState((p) => ({ ...p, type: v }))
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="ShortText">Short Text</SelectItem>
                <SelectItem value="LongText">Long Text</SelectItem>
                <SelectItem value="Phone">Phone</SelectItem>
                <SelectItem value="Country">Country</SelectItem>
                <SelectItem value="Select">Select</SelectItem>
                <SelectItem value="MultiSelect">Multi Select</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              value={formState.label}
              onChange={(e) =>
                setFormState((p) => ({ ...p, label: e.target.value }))
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="placeholder" className="text-right">
              Placeholder
            </Label>
            <Input
              id="placeholder"
              value={formState.placeholder}
              onChange={(e) =>
                setFormState((p) => ({ ...p, placeholder: e.target.value }))
              }
              className="col-span-3"
            />
          </div>

          {showOptionsEditor && (
            <div className="col-span-4 space-y-3 p-3 border rounded-md bg-muted/50">
              <Label>Options</Label>
              <div className="space-y-2">
                {formState.options?.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={opt} readOnly className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Add new option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={handleOptionKeyDown}
                />
                <Button onClick={handleAddOption}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Checkbox
              id="required"
              checked={formState.isRequired}
              onCheckedChange={(c) =>
                setFormState((p) => ({ ...p, isRequired: !!c }))
              }
            />
            <Label htmlFor="required">Required</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
