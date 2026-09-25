import type { JSONContent } from "@tiptap/core";
import type { JSX, ReactNode } from "react";

type NoteRendererProps = {
  contentJson: string;
};

type Mark = NonNullable<JSONContent["marks"]>[number];

function parseDoc(contentJson: string): JSONContent | null {
  try {
    const value: unknown = JSON.parse(contentJson);
    if (typeof value === "object" && value !== null && (value as JSONContent).type === "doc") {
      return value as JSONContent;
    }
  } catch {
    // Fall through to the error state below.
  }
  return null;
}

function renderMark(mark: Mark, children: ReactNode): ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong className="font-semibold">{children}</strong>;
    case "italic":
      return <em>{children}</em>;
    case "code":
      return (
        <code className="rounded bg-neutral-100 px-1 font-mono text-[0.9em] dark:bg-neutral-800">
          {children}
        </code>
      );
    default:
      return children;
  }
}

function renderChildren(node: JSONContent): ReactNode {
  return node.content?.map((child, index) => <RenderNode key={index} node={child} />);
}

function plainText(node: JSONContent): string {
  if (node.type === "text") return node.text ?? "";
  return node.content?.map(plainText).join("") ?? "";
}

// Heading levels are shifted by one because the note title is the page's <h1>.
const HEADINGS = {
  1: { Tag: "h2", className: "mt-6 mb-2 text-2xl font-semibold tracking-tight" },
  2: { Tag: "h3", className: "mt-5 mb-2 text-xl font-semibold" },
  3: { Tag: "h4", className: "mt-4 mb-2 text-lg font-semibold" },
} as const;

function RenderNode({ node }: { node: JSONContent }): ReactNode {
  switch (node.type) {
    case "text":
      return (node.marks ?? []).reduceRight<ReactNode>(
        (children, mark) => renderMark(mark, children),
        node.text ?? "",
      );
    case "paragraph":
      return <p className="my-3">{renderChildren(node)}</p>;
    case "heading": {
      const level = Number(node.attrs?.level);
      const { Tag, className } = HEADINGS[level === 2 || level === 3 ? level : 1];
      return <Tag className={className}>{renderChildren(node)}</Tag>;
    }
    case "bulletList":
      return <ul className="my-3 list-disc pl-6">{renderChildren(node)}</ul>;
    case "listItem":
      return <li className="my-1 [&>p]:my-1">{renderChildren(node)}</li>;
    case "codeBlock":
      return (
        <pre className="my-4 overflow-x-auto rounded-md bg-neutral-900 p-4 text-sm text-neutral-100">
          <code className="font-mono">{plainText(node)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr className="my-6 border-neutral-300 dark:border-neutral-700" />;
    case "hardBreak":
      return <br />;
    default:
      return renderChildren(node);
  }
}

// Renders stored TipTap JSON as plain JSX; text is escaped by React, so no raw HTML is ever injected.
export function NoteRenderer({ contentJson }: NoteRendererProps): JSX.Element {
  const doc = parseDoc(contentJson);

  if (!doc) {
    return (
      <p role="alert" className="text-sm text-red-700 dark:text-red-400">
        This note&apos;s content could not be displayed.
      </p>
    );
  }

  if (plainText(doc).trim() === "") {
    return <p className="text-neutral-500 italic">This note is empty.</p>;
  }

  return <div className="leading-relaxed break-words">{renderChildren(doc)}</div>;
}
