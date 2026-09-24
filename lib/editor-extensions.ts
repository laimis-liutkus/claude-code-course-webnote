import StarterKit from "@tiptap/starter-kit";

// Shared by the editor and the server-side content sanitizer so both use one schema.
export const noteExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: false,
    underline: false,
    strike: false,
    blockquote: false,
    orderedList: false,
  }),
];
