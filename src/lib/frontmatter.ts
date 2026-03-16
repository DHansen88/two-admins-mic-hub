/**
 * Simple frontmatter parser for Markdown files.
 * Supports key: value pairs, inline arrays [a, b], and YAML-style list arrays.
 */
export interface FrontMatterData {
  [key: string]: string | string[] | undefined;
}

export function parseFrontMatter(raw: string): { data: FrontMatterData; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const frontMatter: FrontMatterData = {};
  const lines = match[1].split('\n');
  let currentKey = '';
  let currentArray: string[] | null = null;

  for (const line of lines) {
    // Key: value line
    const kvMatch = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kvMatch) {
      // Save any pending array
      if (currentArray && currentKey) {
        frontMatter[currentKey] = currentArray;
        currentArray = null;
      }
      const [, key, value] = kvMatch;
      currentKey = key;

      // Inline array: [item1, item2]
      const inlineArray = value.match(/^\[(.+)\]$/);
      if (inlineArray) {
        frontMatter[key] = inlineArray[1]
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''));
      } else if (!value || value.trim() === '') {
        // Start of a list
        currentArray = [];
      } else {
        frontMatter[key] = value.replace(/^["']|["']$/g, '');
      }
    } else if (line.match(/^\s+-\s+/)) {
      // List item
      const item = line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, '');
      if (!currentArray) currentArray = [];
      currentArray.push(item);
    }
  }

  // Save final pending array
  if (currentArray && currentKey) {
    frontMatter[currentKey] = currentArray;
  }

  return { data: frontMatter, content: match[2].trim() };
}
