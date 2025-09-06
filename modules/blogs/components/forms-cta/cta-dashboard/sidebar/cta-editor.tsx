"use client";
import { useContext } from "react";
import { CtaContext } from "../context/cta-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Menu, Bold, Italic, Underline, Link } from "lucide-react";
import { produce } from "immer";

export default function CtaEditor() {
  const { ctaState, updateContentField, saveChanges, setActiveTab } =
    useContext(CtaContext);
  const { content } = ctaState;

  // Handler for nested button objects
  const handleButtonChange = (
    button: "primaryButton" | "secondaryButton",
    field: "text" | "url",
    value: string
  ) => {
    const newButtonState = produce(content[button], (draft) => {
      draft[field] = value;
    });
    updateContentField(button, newButtonState);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-main">CTA</h1>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        <div className="space-y-2">
          <Label htmlFor="cta-heading">Heading</Label>
          <Input
            id="cta-heading"
            value={content.heading}
            onChange={(e) => updateContentField("heading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta-desc">Description</Label>
          <Textarea
            id="cta-desc"
            value={content.description}
            onChange={(e) => updateContentField("description", e.target.value)}
            className="rounded-t-none"
          />
        </div>
        <div className="space-y-2">
          <Label>Primary Button</Label>
          <Input
            placeholder="Button Text"
            value={content.primaryButton.text}
            onChange={(e) =>
              handleButtonChange("primaryButton", "text", e.target.value)
            }
          />
          <Input
            placeholder="Button URL"
            value={content.primaryButton.url}
            onChange={(e) =>
              handleButtonChange("primaryButton", "url", e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Secondary Button</Label>
          <Input
            placeholder="Button Text"
            value={content.secondaryButton.text}
            onChange={(e) =>
              handleButtonChange("secondaryButton", "text", e.target.value)
            }
          />
          <Input
            placeholder="Button URL"
            value={content.secondaryButton.url}
            onChange={(e) =>
              handleButtonChange("secondaryButton", "url", e.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta-footnote">Footnote</Label>
          <Textarea
            id="cta-footnote"
            value={content.footnote}
            onChange={(e) => updateContentField("footnote", e.target.value)}
            className="rounded-t-none"
          />
        </div>
      </div>
      <div className="flex justify-between mt-auto pt-4 border-t">
        <Button variant="outline" onClick={() => setActiveTab("configure")}>
          &lt;- Back
        </Button>
        <Button onClick={saveChanges}>Save</Button>
      </div>
    </div>
  );
}
