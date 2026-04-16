/**
 * Popup Content Block Types
 * Rich content blocks for the popup editor and renderer.
 */

export type PopupBlockType =
  | "richtext"
  | "image"
  | "video"
  | "button"
  | "divider"
  | "spacer"
  | "html"
  | "newsletter";

export interface RichTextPopupBlock {
  type: "richtext";
  id: string;
  html: string;
  textAlign?: "left" | "center" | "right";
}

export interface ImagePopupBlock {
  type: "image";
  id: string;
  src: string;
  caption?: string;
  width?: number;
  linkUrl?: string;
}

export interface VideoPopupBlock {
  type: "video";
  id: string;
  url: string;
}

export interface ButtonPopupBlock {
  type: "button";
  id: string;
  text: string;
  url: string;
  openNewTab: boolean;
  style: "primary" | "secondary";
}

export interface DividerPopupBlock {
  type: "divider";
  id: string;
}

export interface SpacerPopupBlock {
  type: "spacer";
  id: string;
  height: number; // pixels
}

export interface HtmlEmbedPopupBlock {
  type: "html";
  id: string;
  code: string;
}

export interface NewsletterPopupBlock {
  type: "newsletter";
  id: string;
  heading: string;
  description: string;
  buttonText: string;
  showConantLeadership: boolean;
  conantLeadershipLabel: string;
}

export type PopupContentBlock =
  | RichTextPopupBlock
  | ImagePopupBlock
  | VideoPopupBlock
  | ButtonPopupBlock
  | DividerPopupBlock
  | SpacerPopupBlock
  | HtmlEmbedPopupBlock
  | NewsletterPopupBlock;

export function createPopupBlockId(): string {
  return `pb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyPopupBlock(type: PopupBlockType): PopupContentBlock {
  const id = createPopupBlockId();
  switch (type) {
    case "richtext":
      return { type: "richtext", id, html: "", textAlign: "left" };
    case "image":
      return { type: "image", id, src: "", width: 100 };
    case "video":
      return { type: "video", id, url: "" };
    case "button":
      return { type: "button", id, text: "Click Here", url: "", openNewTab: true, style: "primary" };
    case "divider":
      return { type: "divider", id };
    case "spacer":
      return { type: "spacer", id, height: 24 };
    case "html":
      return { type: "html", id, code: "" };
    case "newsletter":
      return {
        type: "newsletter",
        id,
        heading: "Two Admins And A Mic",
        description: "The podcast celebrating the power, creativity, and leadership of administrative professionals. One real story at a time.",
        buttonText: "Subscribe",
        showConantLeadership: true,
        conantLeadershipLabel: "Also subscribe to ConantLeadership Newsletter",
      };
  }
}

/** Convert a YouTube/Vimeo URL to an embed URL */
export function getVideoEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}
