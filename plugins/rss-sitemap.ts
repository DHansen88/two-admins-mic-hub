/**
 * Sitemap Generator Plugin for Vite.
 * Generates /sitemap.xml at build time.
 * 
 * The podcast RSS feed is generated dynamically on the server from live
 * published episode content, so this plugin intentionally leaves RSS alone.
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

      console.log('✅ Generated /sitemap.xml');
    },
  };
}
