"use client";
import { useContext, useState, useMemo } from "react";
import { FormContext, FormField } from "../context/form-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { ConfirmationDialog } from "@/components/models/confirmation-dialog";
import AddEditFieldModal from "../modals/add-edit-field-modal";
import { SortableFormField } from "./sortable-form-field";
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

export default function FormFields() {
  const { formState, updateField, setFields, deleteFormField } =
    useContext(FormContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FormField | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const fieldIds = useMemo(
    () => formState.fields.map((f) => f.id),
    [formState.fields]
  );

  const handleAddNew = () => {
    setEditingField(null);
    setIsModalOpen(true);
  };
  const handleEdit = (field: FormField) => {
    setEditingField(field);
    setIsModalOpen(true);
  };
  const handleDelete = (field: FormField) => {
    setConfirmDelete(field);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = formState.fields.findIndex((f) => f.id === active.id);
      const newIndex = formState.fields.findIndex((f) => f.id === over.id);
      const reordered = arrayMove(formState.fields, oldIndex, newIndex);
      setFields(reordered.map((field, index) => ({ ...field, order: index })));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* --- Content Section --- */}
        <div className="space-y-4">
          <h3 className="text-main">Content</h3>
          <div className="space-y-2">
            <Label htmlFor="heading">Heading</Label>
            <Input
              id="heading"
              value={formState.heading}
              onChange={(e) => updateField("heading", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formState.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </div>

        {/* --- Fields Section --- */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-main ">Fields</h3>
            <Button variant="outline" size="sm" onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
          <div className="space-y-2 p-2 border rounded-md bg-muted/50 min-h-[100px]">
            <SortableContext
              items={fieldIds}
              strategy={verticalListSortingStrategy}
            >
              {[...formState.fields]
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <SortableFormField
                    key={field.id}
                    field={field}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
            </SortableContext>
          </div>
        </div>

        {/* --- Submission Section --- */}
        <div className="space-y-4">
          <h3 className="text-main">Submission</h3>
          <div className="space-y-2">
            <Label htmlFor="button-text">Button Text</Label>
            <Input
              id="button-text"
              value={formState.buttonText}
              onChange={(e) => updateField("buttonText", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="footnote">Footnote</Label>
            <Textarea
              id="footnote"
              value={formState.footnote}
              onChange={(e) => updateField("footnote", e.target.value)}
            />
          </div>
        </div>

        {/* Modals */}
        {isModalOpen && (
          <AddEditFieldModal
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            field={editingField}
          />
        )}
        {confirmDelete && (
          <ConfirmationDialog
            open={!!confirmDelete}
            onOpenChange={() => setConfirmDelete(null)}
            title="Delete Form Field?"
            description={`Are you sure you want to delete the "${confirmDelete.label}" field?`}
            onConfirm={() => {
              deleteFormField(confirmDelete.id);
              setConfirmDelete(null);
            }}
            theme="danger"
            confirmButtonLabel="Delete"
          />
        )}
      </div>
    </DndContext>
  );
}
