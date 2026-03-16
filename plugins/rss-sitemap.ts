/**
 * RSS Feed Generator Plugin for Vite.
 * Generates /podcast/rss.xml and /sitemap.xml at build time.
 * 
 * This plugin runs during the build process and creates static XML files
 * that work on any standard hosting (Hostinger, Netlify, etc.).
 */

import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';

const SITE_URL = 'https://twoadminsandamic.com'; // Update with your domain

export function rssFeedPlugin(): Plugin {
  return {
    name: 'rss-feed-generator',
    closeBundle() {
      const distDir = path.resolve('dist');
      if (!fs.existsSync(distDir)) return;

      // Read podcast content files
      const podcastDir = path.resolve('src/content/podcasts');
      const episodes: Record<string, unknown>[] = [];

      if (fs.existsSync(podcastDir)) {
        const files = fs.readdirSync(podcastDir).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(podcastDir, file), 'utf-8');
          episodes.push(JSON.parse(content));
        }
      }

      // Sort by episode number descending
      episodes.sort((a, b) => (b.number as number) - (a.number as number));

      // Generate RSS XML
      const rssItems = episodes
        .map(
          (ep) => `    <item>
      <title>${escapeXml(ep.title as string)}</title>
      <description>${escapeXml(ep.description as string)}</description>
      <pubDate>${new Date(ep.date as string).toUTCString()}</pubDate>
      <itunes:duration>${ep.duration || ''}</itunes:duration>
      <guid>${SITE_URL}/episodes/${ep.slug}</guid>
      <link>${SITE_URL}/episodes/${ep.slug}</link>
      ${ep.thumbnailUrl ? `<itunes:image href="${SITE_URL}${ep.thumbnailUrl}" />` : ''}
      ${ep.audioUrl ? `<enclosure url="${ep.audioUrl}" type="audio/mpeg" />` : ''}
    </item>`
        )
        .join('\n');

      const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Two Admins and a Mic</title>
    <link>${SITE_URL}</link>
    <description>Leadership insights, career growth strategies, and real talk for administrative professionals.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <itunes:author>Two Admins and a Mic</itunes:author>
    <itunes:category text="Business" />
    <itunes:category text="Education" />
${rssItems}
  </channel>
</rss>`;

      // Write RSS feed
      const podcastRssDir = path.join(distDir, 'podcast');
      fs.mkdirSync(podcastRssDir, { recursive: true });
      fs.writeFileSync(path.join(podcastRssDir, 'rss.xml'), rssFeed, 'utf-8');

      // Read blog content files for sitemap
      const blogDir = path.resolve('src/content/blog');
      const blogSlugs: string[] = [];

      if (fs.existsSync(blogDir)) {
        const files = fs.readdirSync(blogDir);
        for (const file of files) {
          blogSlugs.push(file.replace(/\.(md|json)$/, ''));
        }
      }

      // Generate sitemap
      const staticPages = ['', '/about', '/episodes', '/blog', '/steps', '/contact'];
      const sitemapUrls = [
        ...staticPages.map(
          (p) =>
            `  <url><loc>${SITE_URL}${p}</loc><changefreq>weekly</changefreq><priority>${p === '' ? '1.0' : '0.8'}</priority></url>`
        ),
        ...episodes.map(
          (ep) =>
            `  <url><loc>${SITE_URL}/episodes/${ep.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
        ),
        ...blogSlugs.map(
          (slug) =>
            `  <url><loc>${SITE_URL}/blog/${slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`
        ),
      ].join('\n');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>`;

      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf-8');

      console.log('✅ Generated /podcast/rss.xml and /sitemap.xml');
    },
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
