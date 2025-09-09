'use client';

import * as React from 'react';

import type { TLinkElement } from 'platejs';

import {
  type UseVirtualFloatingOptions,
  flip,
  offset,
} from '@platejs/floating';
import { getLinkAttributes } from '@platejs/link';
import {
  type LinkFloatingToolbarState,
  FloatingLinkUrlInput,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from '@platejs/link/react';
import { cva } from 'class-variance-authority';
import { Check, ExternalLink, Link, Trash2, Unlink } from 'lucide-react';
import { KEYS } from 'platejs';
import {
  useEditorRef,
  useEditorSelection,
  useFormInputProps,
  usePluginOption,
} from 'platejs/react';

import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { normalizeUrl } from '@/lib/url-utils';

const popoverVariants = cva(
  'z-50 w-auto rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-hidden'
);

const inputVariants = cva(
  'flex h-[32px] w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
);

// Enhanced URL input that normalizes URLs
function EnhancedUrlInput({
  className,
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const editor = useEditorRef();
  const [internalValue, setInternalValue] = React.useState('');

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInternalValue(value);
      // Call the original onChange if it exists
      if (props.onChange) {
        props.onChange(e);
      }
    },
    [props]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        // Normalize URL before submitting
        const normalizedUrl = normalizeUrl(internalValue);
        if (normalizedUrl !== internalValue) {
          // Update the input value with normalized URL
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: normalizedUrl },
          } as React.ChangeEvent<HTMLInputElement>;
          if (props.onChange) {
            props.onChange(syntheticEvent);
          }
        }
      }
      // Call the original onKeyDown if it exists
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    },
    [internalValue, props]
  );

  return (
    <input
      {...props}
      className={className}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      value={internalValue || props.value || ''}
    />
  );
}

// Custom nofollow manager
function NofollowManager() {
  const editor = useEditorRef();
  const [nofollow, setNofollow] = React.useState(false);

  // Check current link's nofollow status
  React.useEffect(() => {
    const entry = editor.api.node<TLinkElement>({
      match: { type: editor.getType(KEYS.link) },
    });
    if (entry) {
      const [element] = entry;
      const attrs = getLinkAttributes(editor, element);
      setNofollow(attrs.rel?.includes('nofollow') || false);
    }
  }, [editor]);

  const handleNofollowChange = React.useCallback(
    (checked: boolean) => {
      setNofollow(checked);

      // Update existing link immediately
      const entry = editor.api.node<TLinkElement>({
        match: { type: editor.getType(KEYS.link) },
      });
      if (entry) {
        const [, path] = entry;
        editor.tf.setNodes(
          { rel: checked ? 'nofollow' : undefined },
          { at: path }
        );
      }
    },
    [editor]
  );

  return (
    <div className="flex items-center space-x-2 mt-2">
      <Checkbox
        id="nofollow"
        checked={nofollow}
        onCheckedChange={handleNofollowChange}
      />
      <label
        htmlFor="nofollow"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Mark as nofollow
      </label>
    </div>
  );
}

export function CustomLinkFloatingToolbar({
  state,
}: {
  state?: LinkFloatingToolbarState;
}) {
  const activeCommentId = usePluginOption({ key: KEYS.comment }, 'activeId');
  const activeSuggestionId = usePluginOption(
    { key: KEYS.suggestion },
    'activeId'
  );

  const floatingOptions: UseVirtualFloatingOptions = React.useMemo(() => {
    return {
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
          padding: 12,
        }),
      ],
      placement:
        activeSuggestionId || activeCommentId ? 'top-start' : 'bottom-start',
    };
  }, [activeCommentId, activeSuggestionId]);

  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    hidden,
    props: insertProps,
    ref: insertRef,
    textInputProps,
  } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    editButtonProps,
    props: editProps,
    ref: editRef,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);

  const inputProps = useFormInputProps({
    preventDefaultOnEnterKeydown: true,
  });

  if (hidden) return null;

  const input = (
    <div className="flex flex-col gap-3 min-w-[300px]" {...inputProps}>
      {/* URL Input Row */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Link className="h-4 w-4 text-muted-foreground" />
          <FloatingLinkUrlInput
            className={inputVariants()}
            placeholder="Google.com"
            data-plate-focus
          />
        </div>

        {/* Save indicator - we'll let PlateJS handle the actual saving */}
        <div className="flex items-center text-xs text-muted-foreground">
          Press Enter to save
        </div>
      </div>

      {/* Nofollow checkbox */}
      <NofollowManager />
    </div>
  );

  const editContent = editState.isEditing ? (
    input
  ) : (
    <div className="box-content flex items-center">
      <button
        className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        type="button"
        {...editButtonProps}
      >
        Edit link
      </button>

      <Separator orientation="vertical" />

      <LinkOpenButton />

      <Separator orientation="vertical" />

      <button
        className={buttonVariants({
          size: 'sm',
          variant: 'ghost',
        })}
        type="button"
        {...unlinkButtonProps}
      >
        <Unlink width={18} />
      </button>
    </div>
  );

  return (
    <>
      <div ref={insertRef} className={popoverVariants()} {...insertProps}>
        {input}
      </div>

      <div ref={editRef} className={popoverVariants()} {...editProps}>
        {editContent}
      </div>
    </>
  );
}

function LinkOpenButton() {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const attributes = React.useMemo(() => {
    const entry = editor.api.node<TLinkElement>({
      match: { type: editor.getType(KEYS.link) },
    });
    if (!entry) {
      return {};
    }
    const [element] = entry;
    return getLinkAttributes(editor, element);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, selection]);

  return (
    <a
      {...attributes}
      className={buttonVariants({
        size: 'sm',
        variant: 'ghost',
      })}
      onMouseOver={(e) => {
        e.stopPropagation();
      }}
      aria-label="Open link in a new tab"
      target="_blank"
    >
      <ExternalLink width={18} />
    </a>
  );
}
