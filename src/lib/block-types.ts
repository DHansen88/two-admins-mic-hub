/**
 * Blog Block Types
 * Structured content blocks for the blog editor and renderer.
 */

export type BlockType =
  | "heading"
  | "paragraph"
  | "list"
  | "quote"
  | "callout"
  | "image"
  | "divider"
  | "takeaways"
  | "embed";

export interface HeadingBlock {
  type: "heading";
  id: string;
  level: 2 | 3 | 4;
  text: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  id: string;
  text: string;
}

export interface ListBlock {
  type: "list";
  id: string;
  style: "bullet" | "numbered";
  items: string[];
}

export interface QuoteBlock {
  type: "quote";
  id: string;
  text: string;
  attribution?: string;
}

export interface CalloutBlock {
  type: "callout";
  id: string;
  title?: string;
  text: string;
}

export interface ImageBlock {
  type: "image";
  id: string;
  src: string;
  caption?: string;
  alt?: string;
}

export interface DividerBlock {
  type: "divider";
  id: string;
}

export interface TakeawaysBlock {
  type: "takeaways";
  id: string;
  items: string[];
}

export interface EmbedBlock {
  type: "embed";
  id: string;
  url: string;
  caption?: string;
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | QuoteBlock
  | CalloutBlock
  | ImageBlock
  | DividerBlock
  | TakeawaysBlock
  | EmbedBlock;

export interface BlockBlogPost {
  title: string;
  slug: string;
  author: string;
  publish_date: string;
  tags: string[];
  excerpt: string;
  featured_image?: string;
  key_takeaways?: string[];
  blocks: ContentBlock[];
}

/** Generate a unique block ID */
export function createBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Create a new empty block of the given type */
export function createEmptyBlock(type: BlockType): ContentBlock {
  const id = createBlockId();
  switch (type) {
    case "heading":
      return { type: "heading", id, level: 2, text: "" };
    case "paragraph":
      return { type: "paragraph", id, text: "" };
    case "list":
      return { type: "list", id, style: "bullet", items: [""] };
    case "quote":
      return { type: "quote", id, text: "" };
    case "callout":
      return { type: "callout", id, title: "💡 Tip", text: "" };
    case "image":
      return { type: "image", id, src: "", caption: "" };
    case "divider":
      return { type: "divider", id };
    case "takeaways":
      return { type: "takeaways", id, items: [""] };
    case "embed":
      return { type: "embed", id, url: "" };
  }
}

/** Convert blocks to markdown (for backward compatibility) */
export function blocksToMarkdown(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `${"#".repeat(block.level)} ${block.text}`;
        case "paragraph":
          return block.text;
        case "list":
          return block.items
            .map((item, i) =>
              block.style === "numbered" ? `${i + 1}. ${item}` : `- ${item}`
            )
            .join("\n");
        case "quote":
          return `> ${block.text}${block.attribution ? `\n> — ${block.attribution}` : ""}`;
        case "callout":
          return `> **${block.title || "💡 Tip"}**\n> ${block.text}`;
        case "image":
          return `![${block.alt || block.caption || ""}](${block.src})${block.caption ? `\n*${block.caption}*` : ""}`;
        case "divider":
          return "---";
        case "takeaways":
          return `**Key Takeaways:**\n${block.items.map((i) => `- ${i}`).join("\n")}`;
        case "embed":
          return block.url;
        default:
          return "";
      }
    })
    .join("\n\n");
}

/** Convert markdown to blocks (for importing existing content) */
export function markdownToBlocks(markdown: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = markdown.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{2,4})\s+(.+)/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        id: createBlockId(),
        level: Math.min(4, headingMatch[1].length) as 2 | 3 | 4,
        text: headingMatch[2],
      });
      i++;
      continue;
    }

    // Divider
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line)) {
      blocks.push({ type: "divider", id: createBlockId() });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      let quoteText = "";
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteText += (quoteText ? "\n" : "") + lines[i].trim().slice(2);
        i++;
      }
      // Check if it's a callout (starts with bold)
      const calloutMatch = quoteText.match(/^\*\*(.+?)\*\*\n?(.*)/s);
      if (calloutMatch) {
        blocks.push({
          type: "callout",
          id: createBlockId(),
          title: calloutMatch[1],
          text: calloutMatch[2].trim(),
        });
      } else {
        blocks.push({ type: "quote", id: createBlockId(), text: quoteText });
      }
      continue;
    }

    // Lists
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const isNumbered = /^\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trim();
        if (isNumbered ? /^\d+\.\s+/.test(l) : /^[-*]\s+/.test(l)) {
          items.push(l.replace(/^[-*]\s+|^\d+\.\s+/, ""));
          i++;
        } else break;
      }
      blocks.push({
        type: "list",
        id: createBlockId(),
        style: isNumbered ? "numbered" : "bullet",
        items,
      });
      continue;
    }

    // Image
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      blocks.push({
        type: "image",
        id: createBlockId(),
        src: imgMatch[2],
        alt: imgMatch[1],
        caption: imgMatch[1],
      });
      i++;
      continue;
    }

    // Default: paragraph
    let paraText = line;
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith(">") && !lines[i].trim().startsWith("-") && !/^\d+\./.test(lines[i].trim()) && !/^(-{3,}|_{3,}|\*{3,})$/.test(lines[i].trim())) {
      paraText += "\n" + lines[i].trim();
      i++;
    }
    blocks.push({ type: "paragraph", id: createBlockId(), text: paraText });
  }

  return blocks;
}
