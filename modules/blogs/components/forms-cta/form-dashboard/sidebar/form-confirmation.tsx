"use client";
import { useContext } from "react";
import { produce } from "immer";
import { FormContext, ConfirmationButtonType } from "../context/form-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function FormConfirmation() {
  const { formState, setFormState } = useContext(FormContext);
  const { confirmation } = formState;

  const handleConfirmationChange = (
    field: keyof typeof confirmation,
    value: any
  ) => {
    setFormState(
      produce(formState, (draft) => {
        (draft.confirmation as any)[field] = value;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="conf-heading">Heading</Label>
        <Input
          id="conf-heading"
          value={confirmation.heading}
          onChange={(e) => handleConfirmationChange("heading", e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="conf-description">Description</Label>
        <Textarea
          id="conf-description"
          value={confirmation.description}
          onChange={(e) =>
            handleConfirmationChange("description", e.target.value)
          }
        />
      </div>
      <div>
        <Label htmlFor="conf-button-text">Button Text</Label>
        <Input
          id="conf-button-text"
          value={confirmation.buttonText}
          onChange={(e) =>
            handleConfirmationChange("buttonText", e.target.value)
          }
        />
      </div>
      <div>
        <Label htmlFor="conf-button-type">Button Type</Label>
        <Select
          value={confirmation.buttonType}
          onValueChange={(v: ConfirmationButtonType) =>
            handleConfirmationChange("buttonType", v)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Close">Close</SelectItem>
            <SelectItem value="Link">Link</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {confirmation.buttonType === "Link" && (
        <>
          <div>
            <Label htmlFor="conf-url">URL</Label>
            <Input
              id="conf-url"
              value={confirmation.url}
              onChange={(e) => handleConfirmationChange("url", e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="conf-new-tab"
              checked={confirmation.openInNewTab}
              onCheckedChange={(c) =>
                handleConfirmationChange("openInNewTab", c)
              }
            />
            <Label htmlFor="conf-new-tab">Open in New Tab</Label>
          </div>
        </>
      )}
    </div>
  );
}
