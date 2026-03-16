/**
 * BlogBlockEditor
 * Admin-side block editor for composing blog posts with structured blocks.
 */

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heading2,
  AlignLeft,
  List,
  ListOrdered,
  Quote,
  Lightbulb,
  Image,
  Minus,
  Star,
  Video,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Type,
} from "lucide-react";
import {
  type ContentBlock,
  type BlockType,
  createEmptyBlock,
} from "@/lib/block-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: typeof Heading2 }[] = [
  { type: "heading", label: "Heading", icon: Heading2 },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft },
  { type: "list", label: "Bullet List", icon: List },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "callout", label: "Callout", icon: Lightbulb },
  { type: "image", label: "Image", icon: Image },
  { type: "divider", label: "Divider", icon: Minus },
  { type: "takeaways", label: "Key Takeaways", icon: Star },
  { type: "embed", label: "Embed", icon: Video },
];

const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  list: "List",
  quote: "Quote",
  callout: "Callout",
  image: "Image",
  divider: "Divider",
  takeaways: "Key Takeaways",
  embed: "Embed",
};

const BlockEditor = ({ blocks, onChange }: BlockEditorProps) => {
  const [showInsert, setShowInsert] = useState<number | null>(null);

  const updateBlock = useCallback(
    (index: number, updated: ContentBlock) => {
      const newBlocks = [...blocks];
      newBlocks[index] = updated;
      onChange(newBlocks);
    },
    [blocks, onChange]
  );

  const insertBlock = useCallback(
    (type: BlockType, afterIndex: number) => {
      const newBlock = createEmptyBlock(type);
      const newBlocks = [...blocks];
      newBlocks.splice(afterIndex + 1, 0, newBlock);
      onChange(newBlocks);
      setShowInsert(null);
    },
    [blocks, onChange]
  );

  const removeBlock = useCallback(
    (index: number) => {
      onChange(blocks.filter((_, i) => i !== index));
    },
    [blocks, onChange]
  );

  const moveBlock = useCallback(
    (index: number, direction: "up" | "down") => {
      const newBlocks = [...blocks];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      onChange(newBlocks);
    },
    [blocks, onChange]
  );

  const renderBlockEditor = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case "heading":
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select
                value={String(block.level)}
                onValueChange={(v) =>
                  updateBlock(index, { ...block, level: Number(v) as 2 | 3 | 4 })
                }
              >
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={block.text}
                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                placeholder="Heading text..."
                className="h-8 text-sm font-semibold"
              />
            </div>
          </div>
        );

      case "paragraph":
        return (
          <Textarea
            value={block.text}
            onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
            placeholder="Write your paragraph... (supports **bold**, *italic*, [links](url))"
            rows={3}
            className="text-sm"
          />
        );

      case "list":
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={block.style === "bullet" ? "default" : "outline"}
                onClick={() => updateBlock(index, { ...block, style: "bullet" })}
                className="h-7 text-xs gap-1"
              >
                <List className="h-3 w-3" /> Bullet
              </Button>
              <Button
                type="button"
                size="sm"
                variant={block.style === "numbered" ? "default" : "outline"}
                onClick={() => updateBlock(index, { ...block, style: "numbered" })}
                className="h-7 text-xs gap-1"
              >
                <ListOrdered className="h-3 w-3" /> Numbered
              </Button>
            </div>
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-5 text-right shrink-0">
                  {block.style === "numbered" ? `${i + 1}.` : "•"}
                </span>
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[i] = e.target.value;
                    updateBlock(index, { ...block, items: newItems });
                  }}
                  placeholder="List item..."
                  className="h-8 text-sm"
                />
                {block.items.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      const newItems = block.items.filter((_, j) => j !== i);
                      updateBlock(index, { ...block, items: newItems });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-muted-foreground"
              onClick={() =>
                updateBlock(index, { ...block, items: [...block.items, ""] })
              }
            >
              <Plus className="h-3 w-3" /> Add Item
            </Button>
          </div>
        );

      case "quote":
        return (
          <div className="space-y-2">
            <Textarea
              value={block.text}
              onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
              placeholder="Quote text..."
              rows={2}
              className="text-sm italic border-l-4 border-accent/40 rounded-l-none"
            />
            <Input
              value={block.attribution || ""}
              onChange={(e) => updateBlock(index, { ...block, attribution: e.target.value })}
              placeholder="Attribution (optional) — e.g., John Maxwell"
              className="h-8 text-sm"
            />
          </div>
        );

      case "callout":
        return (
          <div className="space-y-2 bg-accent/5 rounded-lg p-3 border border-accent/20">
            <Input
              value={block.title || ""}
              onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
              placeholder="Callout title (e.g., 💡 Leadership Tip)"
              className="h-8 text-sm font-semibold"
            />
            <Textarea
              value={block.text}
              onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
              placeholder="Callout content..."
              rows={2}
              className="text-sm"
            />
          </div>
        );

      case "image":
        return (
          <div className="space-y-2">
            <Input
              value={block.src}
              onChange={(e) => updateBlock(index, { ...block, src: e.target.value })}
              placeholder="Image URL or path (e.g., /assets/images/photo.jpg)"
              className="h-8 text-sm"
            />
            <Input
              value={block.caption || ""}
              onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
              placeholder="Caption (optional)"
              className="h-8 text-sm"
            />
            {block.src && (
              <img
                src={block.src}
                alt={block.caption || "Preview"}
                className="max-h-32 rounded-md object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
              />
            )}
          </div>
        );

      case "divider":
        return (
          <div className="py-2">
            <hr className="border-none h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            <p className="text-[10px] text-muted-foreground text-center mt-1">Section Divider</p>
          </div>
        );

      case "takeaways":
        return (
          <div className="space-y-2 bg-accent/5 rounded-lg p-3 border border-accent/20">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-foreground">Key Takeaways</span>
            </div>
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <Input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[i] = e.target.value;
                    updateBlock(index, { ...block, items: newItems });
                  }}
                  placeholder="Takeaway point..."
                  className="h-8 text-sm"
                />
                {block.items.length > 1 && (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      const newItems = block.items.filter((_, j) => j !== i);
                      updateBlock(index, { ...block, items: newItems });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-muted-foreground"
              onClick={() =>
                updateBlock(index, { ...block, items: [...block.items, ""] })
              }
            >
              <Plus className="h-3 w-3" /> Add Takeaway
            </Button>
          </div>
        );

      case "embed":
        return (
          <div className="space-y-2">
            <Input
              value={block.url}
              onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
              placeholder="Paste YouTube, Spotify, or other embed URL..."
              className="h-8 text-sm"
            />
            <Input
              value={block.caption || ""}
              onChange={(e) => updateBlock(index, { ...block, caption: e.target.value })}
              placeholder="Caption (optional)"
              className="h-8 text-sm"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getBlockIcon = (type: BlockType) => {
    const opt = BLOCK_OPTIONS.find((o) => o.type === type);
    return opt ? opt.icon : Type;
  };

  return (
    <div className="space-y-2">
      {blocks.length === 0 && (
        <Card className="bg-muted/30 border-dashed border-border">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Start building your blog post by adding content blocks.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {BLOCK_OPTIONS.map((opt) => (
                <Button
                  key={opt.type}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1.5 h-8"
                  onClick={() => insertBlock(opt.type, -1)}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                  {opt.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {blocks.map((block, index) => {
        const BlockIcon = getBlockIcon(block.type);
        return (
          <div key={block.id}>
            {/* Block Card */}
            <Card className="bg-card border-border group relative">
              <CardContent className="py-3 px-4">
                {/* Block Header */}
                <div className="flex items-center gap-2 mb-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab" />
                  <BlockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {BLOCK_TYPE_LABELS[block.type]}
                  </span>
                  <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => moveBlock(index, "up")}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => moveBlock(index, "down")}
                      disabled={index === blocks.length - 1}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeBlock(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Block Content Editor */}
                {renderBlockEditor(block, index)}
              </CardContent>
            </Card>

            {/* Insert Point */}
            <div className="relative h-6 flex items-center justify-center">
              {showInsert === index ? (
                <div className="flex flex-wrap gap-1 bg-card border border-border rounded-lg p-2 shadow-md z-10 absolute">
                  {BLOCK_OPTIONS.map((opt) => (
                    <Button
                      key={opt.type}
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-[10px] gap-1 h-7 px-2"
                      onClick={() => insertBlock(opt.type, index)}
                    >
                      <opt.icon className="h-3 w-3" />
                      {opt.label}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-[10px] h-7 px-2 text-muted-foreground"
                    onClick={() => setShowInsert(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInsert(index)}
                  className="opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  style={{ opacity: blocks.length <= 1 ? 1 : undefined }}
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Bottom insert bar (always visible) */}
      {blocks.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {BLOCK_OPTIONS.map((opt) => (
            <Button
              key={opt.type}
              type="button"
              size="sm"
              variant="outline"
              className="text-xs gap-1 h-7"
              onClick={() => insertBlock(opt.type, blocks.length - 1)}
            >
              <opt.icon className="h-3 w-3" />
              {opt.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockEditor;
