"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { PromptDialog } from "./PromptDialog";

interface RichTextEditorProps {
  content: string;
  fallbackHtml?: string;
  onChange: (json: string, html: string) => void;
  placeholder?: string;
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url;
}

function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition ${
        active ? "bg-blue text-white" : "text-gray-800 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ content, fallbackHtml, onChange, placeholder }: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDefaultValue, setLinkDefaultValue] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Введите текст..." }),
    ],
    content: (() => {
      if (!content) return fallbackHtml || undefined;
      try {
        const parsed = JSON.parse(content);
        if (parsed?.type === "doc") return parsed;
        return fallbackHtml || undefined;
      } catch {
        return fallbackHtml || undefined;
      }
    })(),
    onUpdate: ({ editor: ed }) => {
      onChange(JSON.stringify(ed.getJSON()), ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (content) {
      try {
        const parsed = JSON.parse(content);
        if (parsed?.type === "doc") {
          const current = JSON.stringify(editor.getJSON());
          if (current !== content) {
            editor.commands.setContent(parsed);
          }
          return;
        }
      } catch {
        // fall through to HTML fallback
      }
    }

    if (fallbackHtml && editor.getHTML() !== fallbackHtml) {
      editor.commands.setContent(fallbackHtml);
    }
  }, [content, fallbackHtml, editor]);

  const addImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        alert("Не удалось загрузить изображение");
      }
    };
    input.click();
  };

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded border border-gray-200">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <ToolbarButton
          title="Жирный"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="Курсив"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="Подчёркнутый"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </ToolbarButton>
        <span className="mx-1 w-px bg-gray-200" />
        <ToolbarButton
          title="Заголовок 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="Заголовок 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="Заголовок 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>
        <span className="mx-1 w-px bg-gray-200" />
        <ToolbarButton
          title="Маркированный список"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •
        </ToolbarButton>
        <ToolbarButton
          title="Нумерованный список"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1.
        </ToolbarButton>
        <span className="mx-1 w-px bg-gray-200" />
        <ToolbarButton
          title="По левому краю"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          title="По центру"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          title="По правому краю"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          ≡
        </ToolbarButton>
        <span className="mx-1 w-px bg-gray-200" />
        <ToolbarButton title="Вставить изображение" onClick={addImage}>
          <MaterialIcon name="image" size={18} />
        </ToolbarButton>
        <ToolbarButton
          title="Ссылка"
          active={editor.isActive("link")}
          onClick={() => {
            setLinkDefaultValue(editor.getAttributes("link").href ?? "");
            setLinkDialogOpen(true);
          }}
        >
          <MaterialIcon name="link" size={18} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="tiptap-editor" />

      <PromptDialog
        open={linkDialogOpen}
        title="Добавить ссылку"
        message="Вставьте полный адрес страницы — он откроется при нажатии в тексте."
        label="Адрес (URL)"
        placeholder="https://example.com"
        defaultValue={linkDefaultValue}
        confirmLabel={editor.isActive("link") ? "Сохранить" : "Добавить"}
        onConfirm={(url) => {
          editor.chain().focus().setLink({ href: url }).run();
          setLinkDialogOpen(false);
        }}
        onCancel={() => setLinkDialogOpen(false)}
      />
    </div>
  );
}
