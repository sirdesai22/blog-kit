"use client";
import { useContext, useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  item: HeaderItem | null;
}

export default function AddEditItemModal({ isOpen, setIsOpen, item }: Props) {
  const { addItem, updateItem } = useContext(HeaderContext);
  const [name, setName] = useState("");
  const [type, setType] = useState<"Link" | "List" | "Button">("Link");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setType(item.type);
      setLink(item.link || "");
    } else {
      setName("");
      setType("Link");
      setLink("");
    }
  }, [item, isOpen]);

  const handleSave = () => {
    const newItem: HeaderItem = {
      id: item?.id || Date.now().toString(),
      name,
      type,
      link,
    };
    if (item) {
      updateItem(newItem);
    } else {
      addItem(newItem);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "Add"} Header Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Link">Link</SelectItem>
                <SelectItem value="List">List</SelectItem>
                <SelectItem value="Button">Button</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          {type !== "List" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Link
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
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
