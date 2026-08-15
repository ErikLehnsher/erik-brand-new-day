"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";

const FONT_OPTIONS = [
  { label: "Serif", value: "Georgia" },
  { label: "Sans", value: "Arial" },
  { label: "Mono", value: "ui-monospace" }
];

const COLOR_OPTIONS = [
  { label: "Ink", value: "#2e1711" },
  { label: "Red", value: "#8f1e17" },
  { label: "Gold", value: "#b67b16" },
  { label: "Brown", value: "#5a352d" },
  { label: "Rose", value: "#a23c4d" }
];

const SLASH_COMMANDS = [
  { label: "Text", desc: "Paragraph block", action: "paragraph" as const },
  { label: "Heading", desc: "Large title block", action: "heading" as const },
  { label: "Quote", desc: "Emphasis / quote block", action: "blockquote" as const },
  { label: "List", desc: "Bulleted list", action: "bulletList" as const },
  { label: "Image", desc: "Insert image", action: "image" as const },
  { label: "Divider", desc: "Split the page", action: "divider" as const }
];

type ActionType = (typeof SLASH_COMMANDS)[number]["action"];

type Props = {
  initialSlug?: string;
  initialTitle?: string;
  onPublish: (payload: { slug: string; title: string; excerpt: string; content: string; status: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
  setError: (value: string | null) => void;
};

function getPlainText(editor: ReturnType<typeof useEditor> extends infer T ? T : never): string {
  return editor?.getText({ blockSeparator: "\n" }).trim() ?? "";
}

export function TiptapPostEditor({ initialSlug = "", initialTitle = "", onPublish, loading, error, setError }: Props) {
  const [slug, setSlug] = useState(initialSlug);
  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState("draft");
  const [color, setColor] = useState(COLOR_OPTIONS[0].value);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      TextStyle,
      Color,
      FontFamily,
      ImageExtension.configure({
        allowBase64: true
      }),
      Placeholder.configure({
        placeholder: "Write freely. Type / for commands."
      })
    ],
    content: { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "notion-editor-surface"
      },
      handleKeyDown: (_view, event) => {
        if (!slashOpen) return false;

        if (event.key === "Escape") {
          event.preventDefault();
          setSlashOpen(false);
          setSlashQuery("");
          return true;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          const command = filteredCommands[0];
          if (command) {
            runAction(command.action);
          }
          return true;
        }

        return false;
      }
    },
    onUpdate({ editor }) {
      const text = editor.getText({ blockSeparator: "\n" }).trim();
      if (!title && text) {
        setTitle(text.slice(0, 80));
      }
      if (!slug && text) {
        setSlug(
          text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48)
        );
      }
      setError(null);
    },
    onSelectionUpdate({ editor }) {
      const { $from } = editor.state.selection;
      const parentText = $from.parent.textBetween(0, $from.parentOffset, undefined, "\ufffc");
      const match = parentText.match(/(?:^|\s)\/([a-z]*)$/i);
      if (match && $from.parent.type.name === "paragraph") {
        setSlashOpen(true);
        setSlashQuery(match[1] ?? "");
      } else {
        setSlashOpen(false);
        setSlashQuery("");
      }
    }
  });

  const filteredCommands = useMemo(() => {
    const q = slashQuery.toLowerCase();
    return SLASH_COMMANDS.filter((item) => item.label.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q));
  }, [slashQuery]);

  const insertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const runAction = useCallback(
    (action: ActionType) => {
      if (!editor) return;
      const { state } = editor;
      const { $from } = state.selection;
      const from = Math.max($from.start(), $from.parentOffset - slashQuery.length - 1);
      editor.chain().focus().deleteRange({ from, to: $from.pos }).run();

      switch (action) {
        case "paragraph":
          editor.chain().focus().setParagraph().run();
          break;
        case "heading":
          editor.chain().focus().setHeading({ level: 2 }).run();
          break;
        case "blockquote":
          editor.chain().focus().setBlockquote().run();
          break;
        case "bulletList":
          editor.chain().focus().toggleBulletList().run();
          break;
        case "divider":
          editor.chain().focus().setHorizontalRule().run();
          break;
        case "image":
          insertImage();
          return;
      }

      setSlashOpen(false);
      setSlashQuery("");
    },
    [editor, insertImage, slashQuery.length]
  );

  const onPublishClick = useCallback(async () => {
    if (!editor) return;
    await onPublish({
      slug: slug.trim(),
      title: title.trim(),
      excerpt: getPlainText(editor).slice(0, 180),
      content: JSON.stringify(editor.getJSON()),
      status
    });
  }, [editor, onPublish, slug, title, status]);

  useEffect(() => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
  }, [color, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(fontFamily).run();
  }, [editor, fontFamily]);

  const handleImageFile = async (file: File | null) => {
    if (!file || !editor) return;
      const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Could not read image"));
      reader.readAsDataURL(file);
    });
    editor.chain().focus().setImage({ src: dataUrl, alt: file.name, title: file.name }).run();
  };

  return (
    <section className="hero post-create-hero">
      <form
        className="auth-card post-create-form"
        onSubmit={(event) => {
          event.preventDefault();
          void onPublishClick();
        }}
      >
        <div className="post-editor-intro">
          <p className="eyebrow">Write post</p>
          <h1 className="title">Create a post like Notion.</h1>
          <p className="subtitle">
            Write freely in blocks. Type <strong>/</strong> for commands, add images inline, and style text with font and color.
          </p>
          <div className="editor-toolbar">
            <button type="button" className="secondary-button" onClick={() => editor?.chain().focus().toggleBold().run()}>
              Bold
            </button>
            <button type="button" className="secondary-button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
              Italic
            </button>
            <button type="button" className="secondary-button" onClick={() => editor?.chain().focus().toggleStrike().run()}>
              Strike
            </button>
            <button type="button" className="secondary-button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
              List
            </button>
            <button type="button" className="secondary-button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>
              Quote
            </button>
            <button type="button" className="secondary-button" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              Divider
            </button>
            <button type="button" className="secondary-button" onClick={() => fileInputRef.current?.click()}>
              Image
            </button>
          </div>
          <div className="editor-hint">
            Slash menu supports quick blocks. This is the right base for a Notion-style writing flow.
          </div>
        </div>

        <div className="post-meta-grid">
          <label className="field">
            <span>Slug</span>
            <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="my-new-post" required minLength={3} />
          </label>

          <label className="field">
            <span>Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A new story" required minLength={3} />
          </label>

          <label className="field">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <div className="editor-style-row">
            <label className="field">
              <span>Font</span>
              <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}>
                {FONT_OPTIONS.map((font) => (
                  <option key={font.label} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Color</span>
              <select value={color} onChange={(event) => setColor(event.target.value)}>
                {COLOR_OPTIONS.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <input ref={fileInputRef} hidden type="file" accept="image/*" onChange={(event) => void handleImageFile(event.target.files?.[0] ?? null)} />

        <div className="notion-editor-shell">
          <EditorContent editor={editor} />
          {slashOpen && filteredCommands.length ? (
            <div className="slash-menu">
              {filteredCommands.map((item) => (
                <button key={item.label} type="button" className="slash-menu-item" onClick={() => runAction(item.action)}>
                  <strong>{item.label}</strong>
                  <span>{item.desc}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create post"}
        </button>
      </form>
    </section>
  );
}
