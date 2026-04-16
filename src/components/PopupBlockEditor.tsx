import { useState } from "react";
import {
  type PopupContentBlock,
  type PopupBlockType,
  createEmptyPopupBlock,
  getVideoEmbedUrl,
} from "@/data/popupBlockTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Type,
  ImageIcon,
  Video,
  MousePointerClick,
  Minus,
  MoveVertical,
  Code,
  Mail,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Plus,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";

const BLOCK_TYPES: { type: PopupBlockType; label: string; icon: React.ElementType }[] = [
  { type: "richtext", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "video", label: "Video", icon: Video },
  { type: "button", label: "Button", icon: MousePointerClick },
  { type: "newsletter", label: "Newsletter", icon: Mail },
  { type: "spacer", label: "Spacer", icon: MoveVertical },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "html", label: "HTML Embed", icon: Code },
];

interface PopupBlockEditorProps {
  blocks: PopupContentBlock[];
  onChange: (blocks: PopupContentBlock[]) => void;
}

const PopupBlockEditor = ({ blocks, onChange }: PopupBlockEditorProps) => {
  const addBlock = (type: PopupBlockType) => {
    onChange([...blocks, createEmptyPopupBlock(type)]);
  };

  const updateBlock = (index: number, updated: PopupContentBlock) => {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Popup Content Blocks</label>

      {blocks.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-4 text-center border border-dashed border-border rounded-lg">
          No blocks yet. Add one below.
        </p>
      )}

      {blocks.map((block, i) => (
        <div key={block.id} className="border border-border rounded-lg bg-muted/20">
          {/* Block header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50">
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex-1">
              {BLOCK_TYPES.find((b) => b.type === block.type)?.label || block.type}
            </span>
            <button onClick={() => moveBlock(i, -1)} disabled={i === 0} className="p-1 hover:bg-muted rounded disabled:opacity-30">
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} className="p-1 hover:bg-muted rounded disabled:opacity-30">
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => removeBlock(i)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Block body */}
          <div className="p-3">
            <BlockBody block={block} onChange={(b) => updateBlock(i, b)} />
          </div>
        </div>
      ))}

      {/* Add block row */}
      <div className="flex flex-wrap gap-2 pt-2">
        {BLOCK_TYPES.map((bt) => (
          <Button key={bt.type} variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => addBlock(bt.type)}>
            <Plus className="h-3 w-3" />
            <bt.icon className="h-3.5 w-3.5" />
            {bt.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

/* ── Individual block editors ── */

function BlockBody({ block, onChange }: { block: PopupContentBlock; onChange: (b: PopupContentBlock) => void }) {
  switch (block.type) {
    case "richtext":
      return <RichTextBlockEditor block={block} onChange={onChange} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case "video":
      return <VideoBlockEditor block={block} onChange={onChange} />;
    case "button":
      return <ButtonBlockEditor block={block} onChange={onChange} />;
    case "divider":
      return <p className="text-xs text-muted-foreground italic">Horizontal divider — no settings.</p>;
    case "spacer":
      return <SpacerBlockEditor block={block} onChange={onChange} />;
    case "html":
      return <HtmlBlockEditor block={block} onChange={onChange} />;
    case "newsletter":
      return <NewsletterBlockEditor block={block} onChange={onChange} />;
    default:
      return null;
  }
}

/* Rich Text */
function RichTextBlockEditor({ block, onChange }: { block: Extract<PopupContentBlock, { type: "richtext" }>; onChange: (b: PopupContentBlock) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: block.html,
    onUpdate: ({ editor: e }) => {
      onChange({ ...block, html: e.getHTML() });
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="B" className="font-bold" />
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" className="italic" />
        <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} label="U" className="underline" />
        <span className="w-px bg-border mx-1" />
        {([1, 2, 3, 4] as const).map((lvl) => (
          <ToolBtn key={lvl} active={editor.isActive("heading", { level: lvl })} onClick={() => editor.chain().focus().toggleHeading({ level: lvl }).run()} label={`H${lvl}`} />
        ))}
        <span className="w-px bg-border mx-1" />
        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="•" />
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1." />
        <span className="w-px bg-border mx-1" />
        {(["left", "center", "right"] as const).map((a) => (
          <ToolBtn key={a} active={editor.isActive({ textAlign: a })} onClick={() => editor.chain().focus().setTextAlign(a).run()} label={a === "left" ? "⬅" : a === "center" ? "⬌" : "➡"} />
        ))}
        <span className="w-px bg-border mx-1" />
        <ToolBtn
          active={editor.isActive("link")}
          onClick={() => {
            if (editor.isActive("link")) {
              editor.chain().focus().unsetLink().run();
            } else {
              const url = prompt("Enter URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          label="🔗"
        />
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none min-h-[80px] border border-border rounded-md p-3 bg-background focus-within:ring-2 focus-within:ring-ring [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[60px]" />
    </div>
  );
}

function ToolBtn({ active, onClick, label, className = "" }: { active: boolean; onClick: () => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded ${className} ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
    >
      {label}
    </button>
  );
}

/* Image */
function ImageBlockEditor({ block, onChange }: { block: Extract<PopupContentBlock, { type: "image" }>; onChange: (b: PopupContentBlock) => void }) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Try uploading to the PHP backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", "blog");

    try {
      const res = await fetch("/api/content.php?action=upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (data?.url) {
        onChange({ ...block, src: data.url });
        return;
      }
    } catch {
      // Fallback to local blob URL for preview environment
    }

    // Fallback: use local blob URL
    const blobUrl = URL.createObjectURL(file);
    onChange({ ...block, src: blobUrl });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Image</label>
        <div className="flex gap-2">
          <Input value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })} placeholder="https://example.com/image.jpg" className="flex-1" />
          <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border border-border bg-background hover:bg-muted cursor-pointer transition-colors shrink-0">
            <ImageIcon className="h-3.5 w-3.5" />
            Upload
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>
      {block.src && <img src={block.src} alt={block.caption || ""} className="max-h-32 rounded border border-border object-contain" />}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Caption</label>
          <Input value={block.caption || ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} placeholder="Optional caption" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Width (%)</label>
          <Input type="number" min={25} max={100} value={block.width || 100} onChange={(e) => onChange({ ...block, width: Number(e.target.value) })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Link URL (optional)</label>
        <Input value={block.linkUrl || ""} onChange={(e) => onChange({ ...block, linkUrl: e.target.value })} placeholder="Link when image is clicked" />
      </div>
    </div>
  );
}

/* Video */
function VideoBlockEditor({ block, onChange }: { block: Extract<PopupContentBlock, { type: "video" }>; onChange: (b: PopupContentBlock) => void }) {
  const embedUrl = getVideoEmbedUrl(block.url);
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium">YouTube / Vimeo URL</label>
        <Input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
      </div>
      {embedUrl && (
        <div className="aspect-video rounded overflow-hidden border border-border">
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
        </div>
      )}
      {block.url && !embedUrl && <p className="text-xs text-destructive">Unsupported video URL. Use YouTube or Vimeo.</p>}
    </div>
  );
}

/* Button */
function ButtonBlockEditor({ block, onChange }: { block: Extract<PopupContentBlock, { type: "button" }>; onChange: (b: PopupContentBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Button Text</label>
          <Input value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Shop Now" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Style</label>
          <select
            value={block.style}
            onChange={(e) => onChange({ ...block, style: e.target.value as "primary" | "secondary" })}
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Destination URL</label>
        <Input value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} placeholder="https://... or /merch" />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <Switch checked={block.openNewTab} onCheckedChange={(v) => onChange({ ...block, openNewTab: v })} />
        Open in new tab
      </label>
    </div>
  );
}

/* HTML Embed */
function HtmlBlockEditor({ block, onChange }: { block: Extract<PopupContentBlock, { type: "html" }>; onChange: (b: PopupContentBlock) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium">HTML / Embed Code</label>
      <Textarea
        value={block.code}
        onChange={(e) => onChange({ ...block, code: e.target.value })}
        rows={5}
        placeholder="Paste embed code, iframe, or HTML here..."
        className="font-mono text-xs"
      />
    </div>
  );
}

/* Newsletter */
function NewsletterBlockEditor({ block, onChange }: { block: Extract<PopupContentBlock, { type: "newsletter" }>; onChange: (b: PopupContentBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Heading</label>
        <Input value={block.heading} onChange={(e) => onChange({ ...block, heading: e.target.value })} placeholder="Newsletter heading" />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Description</label>
        <Textarea value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} rows={3} placeholder="Short description..." />
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-medium">Button Text</label>
        <Input value={block.buttonText} onChange={(e) => onChange({ ...block, buttonText: e.target.value })} placeholder="Subscribe" />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <Switch checked={block.showConantLeadership} onCheckedChange={(v) => onChange({ ...block, showConantLeadership: v })} />
        Show ConantLeadership Newsletter checkbox
      </label>
      {block.showConantLeadership && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Checkbox Label</label>
          <Input value={block.conantLeadershipLabel} onChange={(e) => onChange({ ...block, conantLeadershipLabel: e.target.value })} placeholder="Also subscribe to ConantLeadership Newsletter" />
        </div>
      )}
    </div>
  );
}

export default PopupBlockEditor;
