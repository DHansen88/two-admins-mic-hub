/**
 * BlogBlockRenderer
 * Renders structured content blocks on the public-facing blog post page.
 * Follows the editorial design system with proper typography.
 */

import { Lightbulb, Quote } from "lucide-react";
import type { ContentBlock } from "@/lib/block-types";
import { headingToSlug } from "@/components/TableOfContents";

interface BlockRendererProps {
  blocks: ContentBlock[];
}

function getEmbedHtml(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) {
    return `<iframe src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen class="w-full aspect-video rounded-lg"></iframe>`;
  }
  // Spotify
  if (url.includes("spotify.com")) {
    const spotifyUrl = url.replace("open.spotify.com", "open.spotify.com/embed");
    return `<iframe src="${spotifyUrl}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" class="w-full h-[152px] rounded-lg"></iframe>`;
  }
  return null;
}

const RenderBlock = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as "h2" | "h3" | "h4";
      const sizes = {
        2: "text-2xl md:text-3xl mt-12 mb-5",
        3: "text-xl md:text-2xl mt-10 mb-4",
        4: "text-lg md:text-xl mt-8 mb-3",
      };
      const slug = headingToSlug(block.text);
      return (
        <Tag id={slug} className={`font-display font-bold text-foreground ${sizes[block.level]} scroll-mt-24`}>
          {block.text}
        </Tag>
      );
    }

    case "paragraph":
      return (
        <p
          className="text-muted-foreground text-lg md:text-[18px] leading-[1.75] mb-[1.4em] text-left"
          dangerouslySetInnerHTML={{
            __html: block.text
              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
              .replace(/\*(.+?)\*/g, "<em>$1</em>")
              .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors">$1</a>')
              .replace(/\n/g, "<br />"),
          }}
        />
      );

    case "list":
      if (block.style === "numbered") {
        return (
          <ol className="my-6 space-y-2.5 pl-1 counter-reset-list">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground leading-[1.75]">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        );
      }
      return (
        <ul className="my-6 space-y-2.5 pl-1">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-muted-foreground leading-[1.75]">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="my-8 relative pl-6 border-l-4 border-accent/40 py-2">
          <Quote className="absolute -left-3 -top-2 h-6 w-6 text-accent/30" />
          <p className="text-lg text-foreground/80 italic leading-[1.75]">
            {block.text}
          </p>
          {block.attribution && (
            <footer className="mt-2 text-sm text-muted-foreground">
              — {block.attribution}
            </footer>
          )}
        </blockquote>
      );

    case "callout":
      return (
        <div className="my-8 rounded-xl border border-accent/20 bg-accent/5 p-5 md:p-6">
          {block.title && (
            <p className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              {block.title}
            </p>
          )}
          <p className="text-muted-foreground leading-[1.75]">{block.text}</p>
        </div>
      );

    case "image":
      return (
        <figure className="my-8">
          <img
            src={block.src}
            alt={block.alt || block.caption || ""}
            className="w-full h-auto rounded-lg max-w-full"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return (
        <hr className="my-10 border-none h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      );

    case "takeaways":
      return (
        <div className="my-10 rounded-xl border border-accent/20 bg-accent/5 p-6 md:p-8">
          <h3 className="font-display font-bold text-foreground mb-5 flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-accent" />
            Key Takeaways
          </h3>
          <ul className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground/80">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "embed": {
      const embedHtml = getEmbedHtml(block.url);
      if (embedHtml) {
        return (
          <div className="my-8 max-w-full overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: embedHtml }} />
            {block.caption && (
              <p className="mt-2 text-center text-sm text-muted-foreground italic">
                {block.caption}
              </p>
            )}
          </div>
        );
      }
      return (
        <div className="my-8 p-4 bg-muted rounded-lg">
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline break-all"
          >
            {block.url}
          </a>
        </div>
      );
    }

    default:
      return null;
  }
};

const BlogBlockRenderer = ({ blocks }: BlockRendererProps) => {
  return (
    <div className="max-w-[760px] animate-fade-in">
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  );
};

export default BlogBlockRenderer;
