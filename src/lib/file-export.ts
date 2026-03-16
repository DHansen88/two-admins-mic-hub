/**
 * File export utilities for downloading generated content files.
 * Used by the admin dashboard to export content as JSON/MD files.
 */

/** Download a string as a file */
export function downloadFile(content: string, filename: string, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export a podcast episode as a JSON file */
export function exportEpisodeJson(episode: Record<string, unknown>) {
  const json = JSON.stringify(episode, null, 2);
  const slug = (episode.slug as string) || 'episode';
  downloadFile(json, `${slug}.json`, 'application/json');
}

/** Export a blog post as a Markdown file with frontmatter */
export function exportBlogMarkdown(post: {
  title: string;
  slug: string;
  author: string;
  publish_date: string;
  tags: string[];
  excerpt: string;
  featured_image?: string;
  key_takeaways: string[];
  content: string;
}) {
  const frontmatter = [
    '---',
    `title: "${post.title}"`,
    `slug: ${post.slug}`,
    `author: ${post.author}`,
    `publish_date: ${post.publish_date}`,
    `tags: ${post.tags.join(', ')}`,
    `excerpt: ${post.excerpt}`,
    post.featured_image ? `featured_image: ${post.featured_image}` : null,
    'key_takeaways:',
    ...post.key_takeaways.map((t) => `  - ${t}`),
    '---',
    '',
    post.content,
  ]
    .filter(Boolean)
    .join('\n');

  downloadFile(frontmatter, `${post.slug}.md`, 'text/markdown');
}

/** Export a newsletter draft as a text file */
export function exportNewsletterDraft(draft: { subject: string; body: string }, filename?: string) {
  const content = `Subject: ${draft.subject}\n\n${draft.body}`;
  downloadFile(content, filename || 'newsletter-draft.txt', 'text/plain');
}

/** Save content to localStorage drafts */
export function saveDraft(key: string, data: unknown) {
  const drafts = getDrafts();
  drafts[key] = { data, savedAt: new Date().toISOString() };
  localStorage.setItem('taam_drafts', JSON.stringify(drafts));
}

/** Get all drafts from localStorage */
export function getDrafts(): Record<string, { data: unknown; savedAt: string }> {
  try {
    return JSON.parse(localStorage.getItem('taam_drafts') || '{}');
  } catch {
    return {};
  }
}

/** Delete a draft */
export function deleteDraft(key: string) {
  const drafts = getDrafts();
  delete drafts[key];
  localStorage.setItem('taam_drafts', JSON.stringify(drafts));
}

/** Save published content to localStorage history */
export function saveToHistory(type: 'episode' | 'blog' | 'newsletter', item: Record<string, unknown>) {
  const history = getHistory(type);
  history.unshift({ ...item, publishedAt: new Date().toISOString() });
  localStorage.setItem(`taam_${type}_history`, JSON.stringify(history));
}

/** Get published content history */
export function getHistory(type: 'episode' | 'blog' | 'newsletter'): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem(`taam_${type}_history`) || '[]');
  } catch {
    return [];
  }
}
