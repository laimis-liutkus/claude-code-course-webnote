'use client';

import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from '@tiptap/react';
import type { JSX, ReactNode } from 'react';
import { noteExtensions } from '@/lib/editor-extensions';

type NoteEditorProps = {
  initialContent?: JSONContent;
  onChange: (json: JSONContent) => void;
  labelledBy: string;
  describedBy?: string;
};

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  paragraph: boolean;
  h1: boolean;
  h2: boolean;
  h3: boolean;
  bulletList: boolean;
  code: boolean;
  codeBlock: boolean;
};

const CONTENT_CLASSES = [
  'min-h-64 px-4 py-3 text-sm leading-relaxed outline-none',
  '[&_h1]:mt-4 [&_h1]:mb-2 [&_h1]:text-2xl [&_h1]:font-semibold',
  '[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold',
  '[&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold',
  '[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6',
  '[&_:not(pre)>code]:rounded [&_:not(pre)>code]:bg-neutral-100 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:font-mono dark:[&_:not(pre)>code]:bg-neutral-800',
  '[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-neutral-900 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-neutral-100',
  '[&_hr]:my-4 [&_hr]:border-neutral-300 dark:[&_hr]:border-neutral-700',
].join(' ');

function selectToolbarState({ editor }: { editor: Editor | null }): ToolbarState | null {
  if (!editor) return null;
  return {
    bold: editor.isActive('bold'),
    italic: editor.isActive('italic'),
    paragraph: editor.isActive('paragraph'),
    h1: editor.isActive('heading', { level: 1 }),
    h2: editor.isActive('heading', { level: 2 }),
    h3: editor.isActive('heading', { level: 3 }),
    bulletList: editor.isActive('bulletList'),
    code: editor.isActive('code'),
    codeBlock: editor.isActive('codeBlock'),
  };
}

type ToolbarButtonProps = {
  label: string;
  pressed?: boolean;
  onPress: () => void;
  children: ReactNode;
};

function ToolbarButton({ label, pressed, onPress, children }: ToolbarButtonProps): JSX.Element {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      // Keep focus in the editor so keystrokes right after a click aren't lost.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPress}
      className='min-w-8 rounded px-2 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-white motion-safe:transition-colors dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus-visible:outline-neutral-100 dark:aria-pressed:bg-neutral-100 dark:aria-pressed:text-neutral-900'
    >
      {children}
    </button>
  );
}

function Separator(): JSX.Element {
  return (
    <span
      role='separator'
      aria-orientation='vertical'
      className='mx-1 h-5 w-px bg-neutral-300 dark:bg-neutral-700'
    />
  );
}

function Toolbar({ editor }: { editor: Editor }): JSX.Element {
  const state = useEditorState({ editor, selector: selectToolbarState });

  function run(command: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) {
    return () => command(editor.chain().focus()).run();
  }

  return (
    <div
      role='toolbar'
      aria-label='Formatting'
      className='flex flex-wrap items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 dark:border-neutral-800 dark:bg-neutral-900'
    >
      <ToolbarButton label='Bold' pressed={state?.bold} onPress={run((c) => c.toggleBold())}>
        <span className='font-bold'>B</span>
      </ToolbarButton>
      <ToolbarButton label='Italic' pressed={state?.italic} onPress={run((c) => c.toggleItalic())}>
        <span className='italic'>I</span>
      </ToolbarButton>
      <Separator />
      <ToolbarButton
        label='Paragraph'
        pressed={state?.paragraph}
        onPress={run((c) => c.setParagraph())}
      >
        P
      </ToolbarButton>
      <ToolbarButton
        label='Heading 1'
        pressed={state?.h1}
        onPress={run((c) => c.toggleHeading({ level: 1 }))}
      >
        H1
      </ToolbarButton>
      <ToolbarButton
        label='Heading 2'
        pressed={state?.h2}
        onPress={run((c) => c.toggleHeading({ level: 2 }))}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        label='Heading 3'
        pressed={state?.h3}
        onPress={run((c) => c.toggleHeading({ level: 3 }))}
      >
        H3
      </ToolbarButton>
      <Separator />
      <ToolbarButton
        label='Bullet list'
        pressed={state?.bulletList}
        onPress={run((c) => c.toggleBulletList())}
      >
        • List
      </ToolbarButton>
      <ToolbarButton label='Inline code' pressed={state?.code} onPress={run((c) => c.toggleCode())}>
        <span className='font-mono'>{'<>'}</span>
      </ToolbarButton>
      <ToolbarButton
        label='Code block'
        pressed={state?.codeBlock}
        onPress={run((c) => c.toggleCodeBlock())}
      >
        <span className='font-mono'>{'{ }'}</span>
      </ToolbarButton>
      <ToolbarButton label='Horizontal rule' onPress={run((c) => c.setHorizontalRule())}>
        ―
      </ToolbarButton>
    </div>
  );
}

export function NoteEditor({
  initialContent,
  onChange,
  labelledBy,
  describedBy,
}: NoteEditorProps): JSX.Element {
  const editor = useEditor({
    extensions: noteExtensions,
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: CONTENT_CLASSES,
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': labelledBy,
        ...(describedBy && { 'aria-describedby': describedBy }),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  return (
    <div className='overflow-hidden rounded-md border border-neutral-300 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-900/20 dark:border-neutral-700 dark:focus-within:border-neutral-100 dark:focus-within:ring-neutral-100/20'>
      {editor ? (
        <Toolbar editor={editor} />
      ) : (
        <div
          aria-hidden='true'
          className='h-10 border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900'
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
