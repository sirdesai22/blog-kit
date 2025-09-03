'use client';

import * as React from 'react';

import {
  BaselineIcon,
  BoldIcon,
  Code2Icon,
  ItalicIcon,
  StrikethroughIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import {
  useEditorReadOnly,
  useEditorRef,
  useEditorSelector,
} from 'platejs/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { AIToolbarButton } from './ai-toolbar-button';
import { CommentToolbarButton } from './comment-toolbar-button';
import { InlineEquationToolbarButton } from './equation-toolbar-button';
import { LinkToolbarButton } from './link-toolbar-button';
import { MarkToolbarButton } from './mark-toolbar-button';
import { MoreToolbarButton } from './more-toolbar-button';
import { SuggestionToolbarButton } from './suggestion-toolbar-button';
import { ToolbarButton, ToolbarGroup } from './toolbar';
import { TurnIntoToolbarButton } from './turn-into-toolbar-button';

// Color palette - flattened for better grid layout
const COLOR_PALETTE = [
  // Grays
  '#000000',
  '#434343',
  '#666666',
  '#999999',
  '#B7B7B7',
  // Vibrant colors
  '#FE0000',
  '#FE9900',
  '#FEFF00',
  '#00FF00',
  '#00FFFF',
  '#4B85E8',
  '#9900FF',
  '#FF00FF',
];

function FloatingFontColorButton() {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState<string>();

  const selectionDefined = useEditorSelector(
    (editor) => !!editor.selection,
    []
  );

  const color = useEditorSelector(
    (editor) => editor.api.mark(KEYS.color) as string,
    [KEYS.color]
  );

  const updateColor = React.useCallback(
    (color: string) => {
      if (editor.selection) {
        editor.tf.select(editor.selection);
        editor.tf.focus();
        editor.tf.addMark(KEYS.color, color);
      }
    },
    [editor]
  );

  const updateColorAndClose = React.useCallback(
    (color: string) => {
      updateColor(color);
      setOpen(false);
    },
    [updateColor]
  );

  const clearColor = React.useCallback(() => {
    if (editor.selection) {
      editor.tf.select(editor.selection);
      editor.tf.focus();
      editor.tf.removeMarks(KEYS.color);
      setOpen(false);
    }
  }, [editor]);

  React.useEffect(() => {
    if (selectionDefined) {
      setSelectedColor(color);
    }
  }, [color, selectionDefined]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Text color">
          <BaselineIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.tf.focus();
        }}
        align="start"
      >
        <div className="p-2 w-44">
          {/* Color grid */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {COLOR_PALETTE.map((hexColor) => (
              <button
                key={hexColor}
                className="relative w-6 h-6 rounded-full hover:scale-110 transition-transform duration-150"
                style={{ backgroundColor: hexColor }}
                onClick={() => updateColorAndClose(hexColor)}
                title={hexColor}
              >
                {selectedColor === hexColor && (
                  <div className="absolute inset-0 border-2 border-white rounded-full shadow-sm" />
                )}
              </button>
            ))}
          </div>

          {/* Remove color button */}
          <button
            onClick={clearColor}
            className="w-full text-xs py-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            Remove color
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FloatingToolbarButtons() {
  const readOnly = useEditorReadOnly();

  return (
    <>
      {!readOnly && (
        <>
          <ToolbarGroup>
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
              Ask AI
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <TurnIntoToolbarButton />

            <MarkToolbarButton nodeType={KEYS.bold} tooltip="Bold (⌘+B)">
              <BoldIcon />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={KEYS.italic} tooltip="Italic (⌘+I)">
              <ItalicIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={KEYS.underline}
              tooltip="Underline (⌘+U)"
            >
              <UnderlineIcon />
            </MarkToolbarButton>

            <MarkToolbarButton
              nodeType={KEYS.strikethrough}
              tooltip="Strikethrough (⌘+⇧+M)"
            >
              <StrikethroughIcon />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={KEYS.code} tooltip="Code (⌘+E)">
              <Code2Icon />
            </MarkToolbarButton>

            <FloatingFontColorButton />

            <InlineEquationToolbarButton />

            <LinkToolbarButton />
          </ToolbarGroup>
        </>
      )}
      {/* 
      <ToolbarGroup>
        <CommentToolbarButton />
        <SuggestionToolbarButton />

        {!readOnly && <MoreToolbarButton />}
      </ToolbarGroup> */}
    </>
  );
}
