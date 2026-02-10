export const TOPICS = [
  "Leadership",
  "Career Growth",
  "Technology",
  "Admin Life",
  "Communication",
  "Wellness",
  "Humor & Human Moments",
] as const;

export type Topic = (typeof TOPICS)[number];

export interface ShareableClip {
  title: string;
  duration: string;
  url: string;
}

export interface PlatformLinks {
  apple?: string;
  spotify?: string;
  youtube?: string;
  other?: { name: string; url: string }[];
}

export interface Episode {
  number: number;
  title: string;
  slug: string;
  description: string;
  duration: string;
  date: string;
  topics: Topic[];
  videoUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  platformLinks?: PlatformLinks;
  clips?: ShareableClip[];
  transcript?: string;
  showNotes?: string[];
}

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return allEpisodes.find((ep) => ep.slug === slug);
}

export function getRelatedEpisodes(episode: Episode, count = 4): Episode[] {
  return allEpisodes
    .filter((ep) => ep.number !== episode.number)
    .map((ep) => ({
      ep,
      score: ep.topics.filter((t) => episode.topics.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ ep }) => ep);
}

export const allEpisodes: Episode[] = [
  {
    number: 12,
    title: "Leading Through Change: Strategies for Modern Administrators",
    slug: "episode-12-leading-through-change",
    description:
      "Explore practical approaches to navigating organizational change while maintaining team morale and productivity.",
    duration: "42 min",
    date: "November 28, 2025",
    topics: ["Leadership", "Admin Life"],
    thumbnailUrl: "/placeholder.svg",
    transcript:
      "Welcome to Two Admins and a Mic. In today's episode, we're diving deep into strategies for leading through change...\n\nChange is inevitable in any organization, but how we navigate it makes all the difference. Our guest today shares practical frameworks that administrators can use to guide their teams through uncertainty.\n\nKey insight: Communication frequency should increase during times of change, not decrease. Many leaders make the mistake of waiting until they have all the answers before communicating, but teams need to hear from leadership regularly, even if the message is simply 'we're working on it.'\n\nAnother critical strategy is involving team members in the change process itself. When people feel ownership over the transition, resistance decreases dramatically.\n\nWe also discussed the importance of acknowledging the emotional impact of change. It's not just about new processes or structures—it's about people adjusting to a new reality.\n\nThank you for listening to Two Admins and a Mic. See you next week!",
    showNotes: [
      "Why change management fails without clear communication",
      "3 frameworks for leading teams through transitions",
      "How to maintain morale during organizational restructuring",
      "The role of empathy in effective change leadership",
    ],
    platformLinks: {
      apple: "#",
      spotify: "#",
      youtube: "#",
    },
    clips: [
      {
        title: "Why communication matters most during change",
        duration: "1:42",
        url: "#",
      },
      {
        title: "The ownership framework for transitions",
        duration: "2:15",
        url: "#",
      },
    ],
  },
  {
    number: 11,
    title: "The Power of Empowerment: Building Confident Teams",
    slug: "episode-11-power-of-empowerment",
    description:
      "Discover how empowering your team members leads to better outcomes and a more engaged workplace culture.",
    duration: "38 min",
    date: "November 21, 2025",
    topics: ["Leadership", "Career Growth", "Communication"],
    thumbnailUrl: "/placeholder.svg",
    transcript:
      "Welcome back to Two Admins and a Mic! Today we're talking about empowerment and how building confident teams transforms organizational culture...\n\nEmpowerment isn't just about delegating tasks—it's about giving people the authority, resources, and trust to make decisions on their own.\n\nThank you for listening!",
    showNotes: [
      "The difference between delegation and true empowerment",
      "Building psychological safety in teams",
      "How confident teams drive innovation",
    ],
    platformLinks: { apple: "#", spotify: "#" },
  },
  {
    number: 10,
    title: "Communication Excellence in Leadership",
    slug: "episode-10-communication-excellence",
    description:
      "Master the art of clear, effective communication that inspires action and builds trust with your team.",
    duration: "45 min",
    date: "November 14, 2025",
    topics: ["Communication", "Leadership"],
    thumbnailUrl: "/placeholder.svg",
    platformLinks: { apple: "#", spotify: "#" },
  },
  {
    number: 9,
    title: "Time Management for Busy Administrators",
    slug: "episode-9-time-management",
    description:
      "Learn proven time management techniques that help administrators balance competing priorities effectively.",
    duration: "35 min",
    date: "November 7, 2025",
    topics: ["Admin Life", "Career Growth", "Wellness"],
    thumbnailUrl: "/placeholder.svg",
    platformLinks: { apple: "#", spotify: "#" },
  },
  {
    number: 8,
    title: "Building Resilience in Leadership Roles",
    slug: "episode-8-building-resilience",
    description:
      "Develop the mental and emotional resilience needed to thrive in challenging leadership positions.",
    duration: "40 min",
    date: "October 31, 2025",
    topics: ["Wellness", "Leadership"],
    thumbnailUrl: "/placeholder.svg",
    platformLinks: { apple: "#", spotify: "#" },
  },
  {
    number: 7,
    title: "Data-Driven Decision Making for Administrators",
    slug: "episode-7-data-driven-decisions",
    description:
      "Learn how to leverage data and analytics to make informed decisions that drive organizational success.",
    duration: "43 min",
    date: "October 24, 2025",
    topics: ["Technology", "Admin Life", "Leadership"],
    thumbnailUrl: "/placeholder.svg",
    platformLinks: { apple: "#", spotify: "#" },
  },
  {
    number: 6,
    title: "Cultivating Innovation in Your Organization",
    slug: "episode-6-cultivating-innovation",
    description:
      "Discover strategies for fostering a culture of innovation and creative problem-solving in your team.",
    duration: "37 min",
    date: "October 17, 2025",
    topics: ["Technology", "Career Growth"],
    thumbnailUrl: "/placeholder.svg",
    platformLinks: { apple: "#", spotify: "#" },
  },
  {
    number: 5,
    title: "Conflict Resolution Strategies for Leaders",
    slug: "episode-5-conflict-resolution",
    description:
      "Master essential techniques for addressing and resolving workplace conflicts constructively.",
    duration: "41 min",
    date: "October 10, 2025",
    topics: ["Communication", "Leadership", "Humor & Human Moments"],
    thumbnailUrl: "/placeholder.svg",
    platformLinks: { apple: "#", spotify: "#" },
  },
];
