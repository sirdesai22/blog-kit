"use client";

import { useState, useContext, useEffect } from "react";
import { HeaderContext, HeaderItem } from "../context/HeaderContext";
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
import { Switch } from "@/components/ui/switch";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  parentItem: HeaderItem | null; // The 'List' item we're adding to
}

// Define a more specific type for sub-items if needed
interface ListItem {
  id: string;
  name: string;
  link: string;
  openInNewTab: boolean;
}

export default function AddListItemModal({
  isOpen,
  setIsOpen,
  parentItem,
}: Props) {
  const { updateItem } = useContext(HeaderContext);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Reset state when the modal is closed or the parent item changes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setLink("");
      setOpenInNewTab(true);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!parentItem || !name || !link) {
      // Add some validation feedback if necessary
      return;
    }

    const newListItem: ListItem = {
      id: `sub-${Date.now().toString()}`,
      name,
      link,
      openInNewTab,
    };

    // Create an updated version of the parent item
    const updatedParentItem = {
      ...parentItem,
      // Ensure children array exists before spreading
      children: [...(parentItem.children || []), newListItem],
    };

    // Update the context state
    // updateItem(updatedParentItem);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add List Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Enter name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right">
              Link
            </Label>
            <Input
              id="link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
              placeholder="Enter link"
            />
          </div>
          <div className="flex items-center justify-between pl-12 pr-4">
            <Label htmlFor="new-tab">Open in New Tab</Label>
            <Switch
              id="new-tab"
              checked={openInNewTab}
              onCheckedChange={setOpenInNewTab}
            />
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
