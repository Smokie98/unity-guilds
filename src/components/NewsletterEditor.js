"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useCallback, useState, useEffect } from "react";

// Toolbar button component
function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      className={`tiptap-btn ${active ? "active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="tiptap-divider" />;
}

export default function NewsletterEditor({ content, onChange, title, onTitleChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "ProseMirror",
      },
    },
  });

  // Sync external content changes (e.g., loading a draft)
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const setLink = useCallback(() => {
    if (!linkUrl) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!imageUrl) { setShowImageInput(false); return; }
    const url = imageUrl.startsWith("http") ? imageUrl : `https://${imageUrl}`;
    editor?.chain().focus().setImage({ src: url }).run();
    setImageUrl("");
    setShowImageInput(false);
  }, [editor, imageUrl]);

  if (!editor) return null;

  return (
    <div className="newsletter-editor-wrap">
      {/* Title Input */}
      {onTitleChange && (
        <div className="admin-form-group" style={{ marginBottom: "16px" }}>
          <label className="admin-form-label">Newsletter Title</label>
          <input
            type="text"
            className="admin-form-input"
            placeholder="Enter newsletter title..."
            value={title || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            style={{ fontSize: "16px", fontWeight: 600 }}
          />
        </div>
      )}

      {/* Preview / Edit Toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          type="button"
          className={`admin-btn-${!showPreview ? "primary" : "secondary"}`}
          style={{ padding: "6px 16px", fontSize: "13px" }}
          onClick={() => setShowPreview(false)}
        >
          {"\u270f\ufe0f"} Edit
        </button>
        <button
          type="button"
          className={`admin-btn-${showPreview ? "primary" : "secondary"}`}
          style={{ padding: "6px 16px", fontSize: "13px" }}
          onClick={() => setShowPreview(true)}
        >
          {"\ud83d\udc41\ufe0f"} Preview
        </button>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="admin-card" style={{ padding: "32px" }}>
          <div className="admin-card-title">Preview</div>
          <div
            className="tiptap-editor"
            style={{ border: "none", background: "none", padding: 0 }}
            dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
          />
        </div>
      ) : (
        /* Editor Mode */
        <>
          {/* Toolbar */}
          <div className="tiptap-toolbar">
            {/* Text formatting */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              title="Bold"
            >
              <strong>B</strong>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              title="Italic"
            >
              <em>I</em>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive("underline")}
              title="Underline"
            >
              <span style={{ textDecoration: "underline" }}>U</span>
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive("strike")}
              title="Strikethrough"
            >
              <span style={{ textDecoration: "line-through" }}>S</span>
            </ToolbarBtn>

            <Divider />

            {/* Headings */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              H1
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              H2
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              H3
            </ToolbarBtn>

            <Divider />

            {/* Lists */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              title="Bullet List"
            >
              {"\u2022"} List
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              title="Ordered List"
            >
              1. List
            </ToolbarBtn>

            <Divider />

            {/* Block elements */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              title="Blockquote"
            >
              {"\u201c"} Quote
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive("codeBlock")}
              title="Code Block"
            >
              {"</>"} Code
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              &mdash;
            </ToolbarBtn>

            <Divider />

            {/* Alignment */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              {"\u2261"}L
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              active={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              {"\u2261"}C
            </ToolbarBtn>
            <ToolbarBtn
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              {"\u2261"}R
            </ToolbarBtn>

            <Divider />

            {/* Link */}
            <ToolbarBtn
              onClick={() => {
                if (editor.isActive("link")) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  const prev = editor.getAttributes("link").href || "";
                  setLinkUrl(prev);
                  setShowLinkInput(true);
                }
              }}
              active={editor.isActive("link")}
              title="Link"
            >
              {"\ud83d\udd17"} Link
            </ToolbarBtn>

            {/* Image */}
            <ToolbarBtn
              onClick={() => setShowImageInput(true)}
              title="Insert Image"
            >
              {"\ud83d\uddbc\ufe0f"} Image
            </ToolbarBtn>

            <Divider />

            {/* Highlight */}
            <ToolbarBtn
              onClick={() => editor.chain().focus().toggleHighlight({ color: "#fbbf24" }).run()}
              active={editor.isActive("highlight")}
              title="Highlight"
            >
              {"\ud83d\udfe1"} Highlight
            </ToolbarBtn>

            {/* Text color */}
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="color"
                style={{ width: "28px", height: "28px", border: "none", background: "none", cursor: "pointer", padding: 0 }}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                title="Text Color"
              />
            </div>
          </div>

          {/* Link Input Popover */}
          {showLinkInput && (
            <div style={{
              display: "flex", gap: "8px", padding: "10px 14px",
              background: "rgba(0,0,0,0.4)", border: "1px solid var(--border)",
              borderTop: "none", borderBottom: "none",
            }}>
              <input
                type="url"
                className="admin-form-input"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setLink()}
                style={{ flex: 1, fontSize: "13px", padding: "6px 10px" }}
                autoFocus
              />
              <button type="button" className="admin-btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={setLink}>
                Set Link
              </button>
              <button type="button" className="admin-btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}>
                Cancel
              </button>
            </div>
          )}

          {/* Image Input Popover */}
          {showImageInput && (
            <div style={{
              display: "flex", gap: "8px", padding: "10px 14px",
              background: "rgba(0,0,0,0.4)", border: "1px solid var(--border)",
              borderTop: "none", borderBottom: "none",
            }}>
              <input
                type="url"
                className="admin-form-input"
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addImage()}
                style={{ flex: 1, fontSize: "13px", padding: "6px 10px" }}
                autoFocus
              />
              <button type="button" className="admin-btn-primary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={addImage}>
                Insert Image
              </button>
              <button type="button" className="admin-btn-secondary" style={{ padding: "6px 14px", fontSize: "12px" }} onClick={() => { setShowImageInput(false); setImageUrl(""); }}>
                Cancel
              </button>
            </div>
          )}

          {/* Editor Content */}
          <div className="tiptap-editor">
            <EditorContent editor={editor} />
          </div>
        </>
      )}
    </div>
  );
}
