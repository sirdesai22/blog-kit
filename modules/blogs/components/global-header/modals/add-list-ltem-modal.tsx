"use client";

import { useContext, useState, useEffect } from "react";
import {
  HeaderContext,
  HeaderItem,
  SubHeaderItem,
} from "../context/header-context";
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
  parentItem: HeaderItem;
  editingSubItem: SubHeaderItem | null;
}

export default function AddListItemModal({
  isOpen,
  setIsOpen,
  parentItem,
  editingSubItem,
}: Props) {
  const { addSubItem, updateSubItem } = useContext(HeaderContext);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    if (editingSubItem) {
      setName(editingSubItem.name);
      setLink(editingSubItem.link);
      setOpenInNewTab(editingSubItem.openInNewTab);
    } else {
      setName("");
      setLink("");
      setOpenInNewTab(true);
    }
  }, [editingSubItem, isOpen]);

  const handleSave = () => {
    if (!parentItem || !name || !link) return;

    if (editingSubItem) {
      updateSubItem(parentItem.id, {
        ...editingSubItem,
        name,
        link,
        openInNewTab,
      });
    } else {
      addSubItem(parentItem.id, { name, link, openInNewTab });
    }

    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingSubItem ? "Edit" : "Add"} List Item</DialogTitle>
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
          <div className="flex items-center justify-between pl-28">
            <Label htmlFor="new-tab">Open in New Tab</Label>
            <div className="flex items-center gap-2">
              <Switch
                id="new-tab"
                checked={openInNewTab}
                onCheckedChange={setOpenInNewTab}
              />
              <span>{openInNewTab ? "ON" : "OFF"}</span>
            </div>
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
