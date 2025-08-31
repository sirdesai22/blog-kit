"use client";
import { useContext, useState, useRef, useMemo } from "react";
import {
  FooterContext,
  ThemeType,
  FooterColumn,
  FooterLink,
  SocialLink,
} from "../context/footer-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Upload, ImageIcon, Trash2, GripVertical } from "lucide-react";
import AddEditColumnModal from "../modals/add-edit-column-modal";
import AddEditLinkModal from "../modals/add-edit-link-modal";
import { ConfirmationDialog } from "@/components/models/confirmation-dialog";
import { SortableFooterColumn } from "./sortable-footer-column";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Separator } from "@/components/ui/separator";

export default function FooterItems() {
  const {
    footerColumns,
    setFooterColumns,
    logoUrls,
    setLogoUrl,
    logoUrl,
    setLogoUrlLink,
    description,
    setDescription,
    socialLinks,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    footnote,
    setFootnote,
    theme,
    setTheme,
  } = useContext(FooterContext);

  const [newSocialLink, setNewSocialLink] = useState("");

  const [isColModalOpen, setColModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columnIds = useMemo(
    () => footerColumns.map((c) => c.id),
    [footerColumns]
  );

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(theme, reader.result as string);
      reader.readAsDataURL(files[0]);
    }
  };

  const handleAddNewSocialLink = () => {
    addSocialLink(newSocialLink);
    setNewSocialLink("");
  };

  const handleSaveColumn = (colData: { title: string }) => {
    if (editingColumn) {
      setFooterColumns(
        footerColumns.map((c) =>
          c.id === editingColumn.id ? { ...c, title: colData.title } : c
        )
      );
    } else {
      const newColumn: FooterColumn = {
        id: Date.now().toString(),
        title: colData.title,
        order: footerColumns.length,
        links: [],
      };
      setFooterColumns([...footerColumns, newColumn]);
    }
    setEditingColumn(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    setConfirmState({
      isOpen: true,
      title: "Delete Column?",
      description:
        "Are you sure you want to delete this column and all its links? This action cannot be undone.",
      onConfirm: () => {
        setFooterColumns(footerColumns.filter((c) => c.id !== columnId));
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;
    const activeParentId = active.data.current?.parentId;
    const overParentId = over.data.current?.parentId;

    if (activeType === "column" && overType === "column") {
      const oldIndex = footerColumns.findIndex((c) => c.id === active.id);
      const newIndex = footerColumns.findIndex((c) => c.id === over.id);
      const reordered = arrayMove(footerColumns, oldIndex, newIndex);
      setFooterColumns(
        reordered.map((item, index) => ({ ...item, order: index }))
      );
    }

    if (
      activeType === "link" &&
      overType === "link" &&
      activeParentId === overParentId
    ) {
      const parentColumn = footerColumns.find((c) => c.id === activeParentId);
      if (!parentColumn) return;

      const oldIndex = parentColumn.links.findIndex((l) => l.id === active.id);
      const newIndex = parentColumn.links.findIndex((l) => l.id === over.id);
      const reorderedLinks = arrayMove(parentColumn.links, oldIndex, newIndex);

      const updatedColumns = footerColumns.map((col) => {
        if (col.id === activeParentId) {
          return {
            ...col,
            links: reorderedLinks.map((link, index) => ({
              ...link,
              order: index,
            })),
          };
        }
        return col;
      });
      setFooterColumns(updatedColumns);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="p-4 space-y-4">
        {/* Left Section */}
        <Card className="bg-transparent border-none shadow-none p-0">
          <CardHeader className="p-0">
            <CardTitle className="text-normal font-medium">
              Left Section
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="text-normal">Logo</CardTitle>
                <Select
                  value={theme}
                  onValueChange={(v: ThemeType) => setTheme(v)}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="dark">Dark Mode</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="link"
                  className="p-0 h-auto text-small !pl-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-1 h-3 w-3" /> Upload
                </Button>
              </div>
              <div
                className="w-full ml-2 h-20 flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoUrls[theme] ? (
                  <img
                    src={logoUrls[theme]}
                    alt={`${theme} logo`}
                    className="max-h-16 object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 text-small">
                    <ImageIcon className="h-8 w-8 mb-1" /> Upload Image
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label
                htmlFor="logoUrl"
                className="text-normal font-normal whitespace-nowrap"
              >
                Logo URL
              </label>
              <Input
                id="logoUrl"
                placeholder="Enter logo URL"
                value={logoUrl}
                onChange={(e) => setLogoUrlLink(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-normal font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-normal font-medium">Social Icons</label>
              {socialLinks.map((social) => (
                <div key={social.id} className="flex items-center gap-2">
                  <Input
                    value={social.link}
                    onChange={(e) =>
                      updateSocialLink(social.id, e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteSocialLink(social.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add new social link..."
                  value={newSocialLink}
                  onChange={(e) => setNewSocialLink(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewSocialLink}
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-4" />

        {/* Footer Items Section */}
        <Card className="bg-transparent border-none shadow-none p-0">
          <CardHeader className="flex flex-row items-center justify-between p-0">
            <CardTitle className="text-normal font-medium">
              Footer Items
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingColumn(null);
                setColModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <div className="space-y-2">
              <SortableContext
                items={columnIds}
                strategy={verticalListSortingStrategy}
              >
                {footerColumns.map((col) => (
                  <SortableFooterColumn
                    key={col.id}
                    column={col}
                    onEditColumn={() => {
                      setEditingColumn(col);
                      setColModalOpen(true);
                    }}
                    onDeleteColumn={() => handleDeleteColumn(col.id)}
                  />
                ))}
              </SortableContext>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-4" />

        {/* Footnote */}
        <Card className="bg-transparent border-none shadow-none p-0">
          <CardHeader className="p-0">
            <CardTitle className="text-normal font-medium">Footnote</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2">
            <Textarea
              value={footnote}
              onChange={(e) => setFootnote(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {isColModalOpen && (
          <AddEditColumnModal
            isOpen={isColModalOpen}
            setIsOpen={setColModalOpen}
            onSave={handleSaveColumn}
            column={editingColumn}
          />
        )}

        {confirmState?.isOpen && (
          <ConfirmationDialog
            open={confirmState.isOpen}
            onOpenChange={(open) => !open && setConfirmState(null)}
            title={confirmState.title}
            description={confirmState.description}
            onConfirm={() => {
              confirmState.onConfirm();
              setConfirmState(null);
            }}
            theme="danger"
            confirmButtonLabel="Delete"
          />
        )}
      </div>
    </DndContext>
  );
}
