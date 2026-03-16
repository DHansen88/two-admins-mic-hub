/**
 * Content generation utilities for the admin dashboard.
 * Template-based generation that works entirely client-side.
 */

/** Calculate reading time from word count */
export function calculateReadingTime(content: string): string {
  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

/** Generate a URL-friendly slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Auto-generate an excerpt from content */
export function generateExcerpt(content: string, maxLength = 150): string {
  const plain = content
    .replace(/^#{1,6}\s+.*/gm, '')
    .replace(/[*_~`>\-\[\]()!]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/** Generate SEO meta description */
export function generateSEODescription(title: string, excerpt: string): string {
  const desc = `${excerpt} | Two Admins and a Mic`;
  return desc.length > 160 ? desc.substring(0, 157) + '...' : desc;
}

/** Extract key takeaways from content (template-based) */
export function generateKeyTakeaways(content: string): string[] {
  const takeaways: string[] = [];

  // Extract from headers (## or ###)
  const headers = content.match(/^#{2,3}\s+(.+)$/gm);
  if (headers) {
    headers.slice(0, 5).forEach((h) => {
      const text = h.replace(/^#{2,3}\s+/, '').trim();
      if (text.length > 10 && text.length < 100) {
        takeaways.push(text);
      }
    });
  }

  // Extract from bold text if not enough headers
  if (takeaways.length < 3) {
    const bolds = content.match(/\*\*(.+?)\*\*/g);
    if (bolds) {
      bolds.slice(0, 5 - takeaways.length).forEach((b) => {
        const text = b.replace(/\*\*/g, '').trim();
        if (text.length > 10 && text.length < 100 && !takeaways.includes(text)) {
          takeaways.push(text);
        }
      });
    }
  }

  return takeaways.length > 0
    ? takeaways
    : ['Key insight from this content', 'Practical application for administrators', 'Actionable takeaway for your team'];
}

/** Generate a blog article structure from a podcast transcript */
export function generateBlogFromTranscript(
  episodeTitle: string,
  transcript: string
): {
  title: string;
  content: string;
  excerpt: string;
  keyTakeaways: string[];
} {
  const sentences = transcript.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const intro = sentences.slice(0, 3).join('. ').trim() + '.';
  const mainInsights = sentences.slice(3, 8).join('. ').trim() + '.';
  const lessons = sentences.slice(8, 12).join('. ').trim() + '.';

  const title = `Insights from "${episodeTitle}"`;
  const keyTakeaways = generateKeyTakeaways(transcript);

  const content = `
## Introduction

${intro}

## Main Insights

${mainInsights}

## Actionable Lessons

${lessons}

## Key Takeaways

${keyTakeaways.map((t) => `- ${t}`).join('\n')}

## Conclusion

This episode of Two Admins and a Mic covered essential strategies that every administrator can apply in their daily work. Whether you're just starting your career or are a seasoned professional, these insights provide practical value you can implement today.
`.trim();

  return {
    title,
    content,
    excerpt: generateExcerpt(intro),
    keyTakeaways,
  };
}

/** Generate a newsletter draft */
export function generateNewsletterDraft(params: {
  type: 'episode' | 'blog';
  title: string;
  summary: string;
  takeaways: string[];
  url: string;
}): {
  subject: string;
  body: string;
} {
  const { type, title, summary, takeaways, url } = params;

  const subject =
    type === 'episode'
      ? `🎙️ New Episode: ${title}`
      : `📝 New Blog Post: ${title}`;

  const takeawayList = takeaways.map((t) => `  • ${t}`).join('\n');

  const body = `Hi there,

${type === 'episode' ? "We just dropped a brand-new episode of Two Admins and a Mic!" : "We just published a new article on the blog!"}

**${title}**

${summary}

**Key Takeaways:**
${takeawayList}

👉 ${type === 'episode' ? 'Listen Now' : 'Read the Full Article'}: ${url}

Thanks for being part of our community!

— The Two Admins and a Mic Team`;

  return { subject, body };
}

/** Format a date to YYYY-MM-DD */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Format a date for display */
export function formatDateDisplay(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
