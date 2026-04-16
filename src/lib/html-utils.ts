/**
 * Minimal HTML helpers for rendering rich-text fields safely in lists vs detail views.
 */

/** Strip all HTML tags and decode common entities. Use in list/card views for clean truncation. */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns true if the string appears to contain HTML tags. */
export function looksLikeHtml(text: string | undefined | null): boolean {
  if (!text) return false;
  return /<\/?[a-z][\s\S]*?>/i.test(text);
}
