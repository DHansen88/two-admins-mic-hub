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

export interface Episode {
  number: number;
  title: string;
  description: string;
  duration: string;
  date: string;
  topics: Topic[];
}

export const allEpisodes: Episode[] = [
  {
    number: 12,
    title: "Leading Through Change: Strategies for Modern Administrators",
    description:
      "Explore practical approaches to navigating organizational change while maintaining team morale and productivity.",
    duration: "42 min",
    date: "November 28, 2025",
    topics: ["Leadership", "Admin Life"],
  },
  {
    number: 11,
    title: "The Power of Empowerment: Building Confident Teams",
    description:
      "Discover how empowering your team members leads to better outcomes and a more engaged workplace culture.",
    duration: "38 min",
    date: "November 21, 2025",
    topics: ["Leadership", "Career Growth", "Communication"],
  },
  {
    number: 10,
    title: "Communication Excellence in Leadership",
    description:
      "Master the art of clear, effective communication that inspires action and builds trust with your team.",
    duration: "45 min",
    date: "November 14, 2025",
    topics: ["Communication", "Leadership"],
  },
  {
    number: 9,
    title: "Time Management for Busy Administrators",
    description:
      "Learn proven time management techniques that help administrators balance competing priorities effectively.",
    duration: "35 min",
    date: "November 7, 2025",
    topics: ["Admin Life", "Career Growth", "Wellness"],
  },
  {
    number: 8,
    title: "Building Resilience in Leadership Roles",
    description:
      "Develop the mental and emotional resilience needed to thrive in challenging leadership positions.",
    duration: "40 min",
    date: "October 31, 2025",
    topics: ["Wellness", "Leadership"],
  },
  {
    number: 7,
    title: "Data-Driven Decision Making for Administrators",
    description:
      "Learn how to leverage data and analytics to make informed decisions that drive organizational success.",
    duration: "43 min",
    date: "October 24, 2025",
    topics: ["Technology", "Admin Life", "Leadership"],
  },
  {
    number: 6,
    title: "Cultivating Innovation in Your Organization",
    description:
      "Discover strategies for fostering a culture of innovation and creative problem-solving in your team.",
    duration: "37 min",
    date: "October 17, 2025",
    topics: ["Technology", "Career Growth"],
  },
  {
    number: 5,
    title: "Conflict Resolution Strategies for Leaders",
    description:
      "Master essential techniques for addressing and resolving workplace conflicts constructively.",
    duration: "41 min",
    date: "October 10, 2025",
    topics: ["Communication", "Leadership", "Humor & Human Moments"],
  },
];
