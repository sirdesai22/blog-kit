"use client";
import { useContext, useState } from "react";
import { HeaderContext, HeaderItem } from "../context/HeaderContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, Pencil, Trash2, Plus, ListPlus } from "lucide-react";
import AddEditItemModal from "../modals/AddEditItemModal";
import AddListItemModal from "../modals/AddListItemModal";

export default function HeaderItems() {
  const { headerItems, deleteItem } = useContext(HeaderContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeaderItem | null>(null);

  const handleEdit = (item: HeaderItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Logo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Placeholder for Logo Upload */}
          <div className="w-full h-24 border-2 border-dashed rounded-md flex items-center justify-center text-sm text-muted-foreground">
            <p>Drag or click to upload</p>
          </div>
          <Input placeholder="Logo URL" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-md">Header Items</CardTitle>
          <Button variant="outline" size="sm" onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {headerItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 p-2 border rounded-md bg-zinc-50 dark:bg-zinc-800"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.type}</p>
              </div>
              {item.type === "List" && (
                <Button
                  variant="ghost"
                  size="icon"
                  // onClick={() => handleAddSubItem(item)}
                >
                  <ListPlus className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <AddEditItemModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        item={editingItem}
      />
    </div>
  );
}
