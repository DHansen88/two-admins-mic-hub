export const BLOG_TOPICS = [
  "Leadership",
  "Communication",
  "Team Building",
  "Wellness",
  "Career Growth",
  "Technology",
] as const;

export type BlogTopic = (typeof BLOG_TOPICS)[number];

export interface Author {
  name: string;
  role: string;
  bio: string;
  avatar: string;
}

export interface BlogPost {
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  topics: BlogTopic[];
  slug: string;
  author: Author;
  featuredImage?: string;
}

const authors: Record<string, Author> = {
  sarah: {
    name: "Sarah Mitchell",
    role: "Co-Host & Leadership Coach",
    bio: "Sarah brings 15 years of administrative leadership experience and is passionate about empowering others to reach their full potential.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
  },
  marcus: {
    name: "Marcus Chen",
    role: "Co-Host & Operations Expert",
    bio: "Marcus has spent two decades in administrative roles across Fortune 500 companies and loves sharing practical strategies that work.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  }
};

export const allBlogs: BlogPost[] = [
  {
    title: "5 Essential Leadership Skills Every Administrator Needs in 2025",
    excerpt: "Discover the key leadership competencies that will set you apart as an effective administrator in today's rapidly evolving workplace.",
    content: `
In today's fast-paced business environment, administrators are no longer just the backbone of operations—they're strategic leaders who drive organizational success. As we move through 2025, certain leadership skills have become absolutely essential for anyone in an administrative role.

## 1. Emotional Intelligence

The ability to understand and manage your own emotions while empathizing with others has never been more important. In a world where remote and hybrid work is the norm, emotional intelligence helps you:

- Navigate complex interpersonal dynamics
- Build trust across distributed teams
- Handle conflict with grace and professionalism
- Create inclusive environments where everyone feels valued

## 2. Strategic Thinking

Gone are the days when administrators simply executed tasks handed down from above. Today's administrators need to think strategically about how their work contributes to broader organizational goals. This means:

- Understanding the big picture of your organization's mission
- Anticipating needs before they become urgent
- Identifying opportunities for improvement and innovation
- Making data-informed decisions

## 3. Digital Fluency

Technology continues to reshape how we work. Administrators who thrive in 2025 are those who embrace new tools and platforms with curiosity rather than fear. Key areas include:

- Project management and collaboration tools
- AI-powered productivity assistants
- Data visualization and reporting
- Cybersecurity awareness

## 4. Change Management

Organizations are constantly evolving, and administrators often serve as the bridge between leadership vision and ground-level implementation. Effective change management skills include:

- Communicating changes clearly and compassionately
- Helping teams adapt to new processes
- Managing resistance with patience and understanding
- Celebrating wins along the way

## 5. Coaching and Mentorship

The best administrators lift others up. By developing coaching skills, you can:

- Support the growth of team members
- Build a culture of continuous learning
- Develop future leaders within your organization
- Create lasting positive impact

## Putting It Into Practice

These skills aren't developed overnight. Start by identifying one area where you'd like to grow and create a specific plan for improvement. Whether it's reading a book, taking a course, or finding a mentor, small consistent steps lead to significant growth over time.

Remember: leadership isn't about titles—it's about influence and impact. As an administrator, you have countless opportunities every day to demonstrate leadership and make a difference.
    `,
    date: "December 10, 2025",
    readTime: "5 min read",
    topics: ["Leadership", "Career Growth"],
    slug: "essential-leadership-skills-2025",
    author: authors.sarah
  },
  {
    title: "Building a Culture of Empowerment in Your Organization",
    excerpt: "Learn how to create an environment where team members feel valued, trusted, and motivated to take initiative.",
    content: `
Empowerment isn't just a buzzword—it's a fundamental shift in how organizations operate. When team members feel empowered, they bring their best selves to work, take ownership of outcomes, and contribute to a positive, innovative culture.

## What Does Empowerment Really Mean?

At its core, empowerment is about trust. It's about giving people the authority, resources, and support they need to make decisions and take action. But it goes deeper than delegation—it's about creating an environment where people feel genuinely valued and capable.

## The Building Blocks of Empowerment

### Clear Expectations

People can only succeed when they understand what success looks like. This means:

- Defining roles and responsibilities clearly
- Setting measurable goals
- Communicating the "why" behind the work
- Providing regular feedback on performance

### Psychological Safety

Team members need to feel safe taking risks and making mistakes. This requires:

- Celebrating learning, not just winning
- Responding to failures with curiosity rather than blame
- Encouraging diverse perspectives and healthy debate
- Modeling vulnerability as a leader

### Access to Resources

Empowerment without resources is just frustration. Ensure your team has:

- The tools and technology they need
- Training and development opportunities
- Time to do quality work
- Budget authority appropriate to their roles

### Recognition and Appreciation

People thrive when their contributions are acknowledged. Make it a habit to:

- Celebrate wins publicly and specifically
- Connect individual contributions to team success
- Create opportunities for peer recognition
- Show gratitude genuinely and frequently

## Common Pitfalls to Avoid

### Micromanagement

Nothing kills empowerment faster than hovering over every decision. If you've hired capable people and set clear expectations, trust them to deliver.

### Inconsistency

Empowerment must be consistent. If you encourage initiative but then punish people for taking risks, you'll destroy trust quickly.

### Empty Words

Talking about empowerment while maintaining command-and-control practices is worse than not mentioning it at all. Actions must match words.

## Starting the Journey

Building an empowered culture takes time and intentional effort. Start with small experiments—give one team member more autonomy on a project and see what happens. Learn from the experience and expand from there.

The investment is worth it. Empowered teams are more engaged, more innovative, and more resilient. They're also more fun to be part of.
    `,
    date: "December 5, 2025",
    readTime: "7 min read",
    topics: ["Team Building", "Leadership"],
    slug: "building-culture-empowerment",
    author: authors.marcus
  },
  {
    title: "The Administrator's Guide to Effective Communication",
    excerpt: "Master the art of clear, impactful communication that drives results and builds stronger relationships.",
    content: `
Communication is the lifeblood of every organization, and administrators are often at the center of information flow. Whether you're coordinating with executives, supporting team members, or interfacing with external partners, your communication skills can make or break success.

## The Foundation: Clarity

Before you communicate anything, ask yourself: "What do I want the recipient to understand, feel, or do as a result of this message?" If you can't answer that question clearly, you're not ready to communicate yet.

### Tips for Clarity

- Use simple, direct language
- Avoid jargon unless your audience speaks it fluently
- Structure information logically (most important first)
- Edit ruthlessly—if a word doesn't add value, remove it

## Choosing the Right Channel

Not all messages belong in the same medium. Consider:

**Email** for:
- Formal communications that need a record
- Detailed information that people need to reference
- Messages that don't require immediate response

**Instant messaging** for:
- Quick questions or updates
- Time-sensitive matters
- Informal team coordination

**Video or phone calls** for:
- Complex discussions requiring dialogue
- Sensitive topics needing nuance
- Building relationships

**In-person meetings** for:
- Strategic planning sessions
- Difficult conversations
- Team building and collaboration

## Active Listening

Communication isn't just about sending messages—it's equally about receiving them. Active listening demonstrates respect and ensures you truly understand what others are communicating.

### Practice Active Listening

- Give your full attention (put away distractions)
- Show you're engaged through body language
- Ask clarifying questions
- Summarize what you heard to confirm understanding
- Respond thoughtfully rather than reactively

## Written Communication Excellence

As an administrator, you likely write dozens of emails, messages, and documents daily. Small improvements compound into significant impact.

### Email Best Practices

- Write descriptive subject lines
- Put the ask or key point in the first paragraph
- Use bullet points for multiple items
- Include clear next steps and deadlines
- Proofread before sending

## Difficult Conversations

Some conversations are inherently challenging—delivering tough feedback, navigating conflict, or sharing unwelcome news. Approach these with:

- Preparation (think through what you'll say)
- Empathy (consider the other person's perspective)
- Directness (don't bury the message)
- Solutions (focus on moving forward)

## Continuous Improvement

Great communicators never stop learning. Seek feedback on your communication, observe skilled communicators in action, and practice deliberately. The investment will pay dividends throughout your career.
    `,
    date: "November 30, 2025",
    readTime: "6 min read",
    topics: ["Communication"],
    slug: "guide-effective-communication",
    author: authors.sarah
  },
  {
    title: "Navigating Difficult Conversations with Confidence",
    excerpt: "Practical strategies for handling challenging discussions while maintaining professionalism and empathy.",
    content: `
Difficult conversations are inevitable in any workplace. Whether it's addressing underperformance, resolving conflict, or delivering unwelcome news, how you handle these moments defines your leadership. The good news? With the right approach, you can navigate these conversations with confidence and compassion.

## Why We Avoid Difficult Conversations

Before diving into strategies, it's worth understanding why these conversations feel so hard:

- Fear of damaging relationships
- Worry about emotional reactions
- Concern about being seen as the "bad guy"
- Uncertainty about how to proceed
- Hope that problems will resolve themselves

Here's the truth: avoiding difficult conversations almost always makes things worse. Issues fester, resentment builds, and small problems become big ones.

## The Preparation Phase

### Get Clear on Your Intentions

Before the conversation, ask yourself:
- What outcome do I hope to achieve?
- What does success look like?
- How do I want both parties to feel afterward?

### Gather the Facts

Separate observations from interpretations. Focus on specific, observable behaviors rather than assumptions about motivations.

### Choose the Right Setting

- Private location where you won't be interrupted
- Adequate time so the conversation doesn't feel rushed
- Neutral ground if possible

## During the Conversation

### Start with Empathy

Acknowledge that this might be difficult for both of you. Show that you care about the person and the relationship.

### Be Direct but Kind

Don't bury the message in so much softening that it gets lost. Be clear about the issue while remaining respectful.

### Listen More Than You Talk

After stating the issue, give the other person space to respond. Really listen to understand their perspective.

### Focus on the Future

While you may need to address past issues, keep the conversation oriented toward solutions and moving forward.

### Stay Calm

If emotions escalate, pause and breathe. You can always say, "Let's take a moment here" if things get heated.

## After the Conversation

### Follow Up in Writing

Document key points and agreements in an email. This creates clarity and accountability.

### Check In Later

A difficult conversation shouldn't be a one-time event. Follow up to see how things are progressing and offer support.

### Reflect and Learn

What went well? What would you do differently? Each difficult conversation is an opportunity to improve.

## Building Your Confidence

Like any skill, handling difficult conversations gets easier with practice. Start with lower-stakes situations and build up. Over time, you'll develop confidence in your ability to address challenges directly and constructively.

Remember: having difficult conversations is an act of respect. It shows you care enough to be honest and believe in the other person's ability to grow.
    `,
    date: "November 25, 2025",
    readTime: "8 min read",
    topics: ["Communication", "Leadership"],
    slug: "navigating-difficult-conversations",
    author: authors.marcus
  },
  {
    title: "The Power of Active Listening in Leadership",
    excerpt: "Why listening is your most powerful leadership tool and how to develop this essential skill.",
    content: `
In a world that celebrates bold speaking and decisive action, listening might seem like a passive activity. But truly great leaders know that active listening is one of the most powerful tools in their arsenal.

## Why Listening Matters

When you listen well, you:

- **Build trust**: People feel valued and respected
- **Gain insight**: You learn things you'd never discover otherwise
- **Make better decisions**: With more information and perspectives
- **Reduce conflict**: Many disputes stem from people feeling unheard
- **Inspire loyalty**: People follow leaders who understand them

## The Difference Between Hearing and Listening

Hearing is passive—sound waves hitting your eardrums. Listening is active—intentionally working to understand what someone is communicating.

Most of us think we're good listeners. Research suggests otherwise. We retain only about 25% of what we hear, and we often spend "listening" time planning what we'll say next rather than truly understanding the speaker.

## Elements of Active Listening

### Full Attention

Put away your phone. Close your laptop. Turn away from your screen. Give the speaker your undivided attention. This sounds simple but is increasingly rare—and people notice when you do it.

### Nonverbal Engagement

Your body language communicates interest and engagement:
- Maintain appropriate eye contact
- Lean slightly forward
- Nod to show understanding
- Keep an open posture

### Verbal Acknowledgment

Show you're tracking the conversation:
- "I see"
- "That makes sense"
- "Tell me more about that"

### Clarifying Questions

When something isn't clear, ask:
- "Can you help me understand what you mean by...?"
- "What did that look like specifically?"
- "How did that make you feel?"

### Reflective Responses

Summarize what you've heard to confirm understanding:
- "So what you're saying is..."
- "It sounds like you're feeling..."
- "Let me make sure I understand..."

## Common Barriers to Listening

### Internal Distractions

Your own thoughts, worries, and to-do lists can pull attention away from the speaker.

### Judgment

When we judge what someone is saying (or how they're saying it), we stop truly listening.

### Solution Mode

Especially as problem-solvers, we often jump to fixing before fully understanding.

### Assumption

We think we know what someone will say and stop listening to what they actually say.

## Practicing Active Listening

Like any skill, active listening improves with deliberate practice:

1. Choose one conversation each day to practice fully present listening
2. Notice when your attention wanders and gently bring it back
3. Ask at least one clarifying question in important conversations
4. Summarize key points before responding with your own thoughts

## The Leadership Impact

When leaders listen well, it transforms their organizations. Team members feel safe sharing ideas and concerns. Problems surface early when they're easier to solve. Innovation flourishes because diverse perspectives are welcomed.

Perhaps most importantly, leaders who listen well model the behavior they want to see throughout the organization. Listening becomes part of the culture.

Start today. In your next conversation, commit to listening fully before you respond. Notice what you learn—and how the other person responds to being truly heard.
    `,
    date: "November 20, 2025",
    readTime: "4 min read",
    topics: ["Leadership", "Communication"],
    slug: "power-active-listening",
    author: authors.sarah
  },
  {
    title: "Work-Life Balance: Myths and Realities for Administrators",
    excerpt: "Redefining what balance means for busy professionals and practical tips for achieving it.",
    content: `
"Work-life balance" is one of the most discussed—and most misunderstood—concepts in modern professional life. For administrators who often serve as the glue holding organizations together, finding this elusive balance can feel impossible. Let's separate myth from reality and explore what balance can actually look like.

## Myth #1: Balance Means Equal Time

The idea that balance requires spending exactly equal time on work and personal life is not only unrealistic—it's unhelpful. Life doesn't work in neat 50/50 splits.

**The Reality**: Balance is about alignment with your values and priorities, not mathematical equality. Some seasons of life require more work focus; others allow more personal time. What matters is that, over time, you're investing in the things that matter most to you.

## Myth #2: You Can Have It All

The promise that you can excel in every area simultaneously is a recipe for burnout and disappointment.

**The Reality**: Trade-offs are real and necessary. Saying yes to one thing means saying no (or "not now") to others. The key is making intentional choices rather than letting default patterns run your life.

## Myth #3: Balance Is a Destination

Many people think of balance as a state they'll achieve someday—once they get the promotion, finish the project, or reach some other milestone.

**The Reality**: Balance is an ongoing practice, not a permanent state. It requires regular adjustment and recalibration as circumstances change.

## Practical Strategies for Real Balance

### Know Your Non-Negotiables

What are the things you won't compromise on? Maybe it's dinner with family, Saturday mornings for yourself, or eight hours of sleep. Identify these and protect them fiercely.

### Set Boundaries (and Keep Them)

Boundaries without enforcement are just wishes. This might mean:
- Not checking email after a certain hour
- Keeping one day per week meeting-free
- Taking your full lunch break away from your desk

### Manage Energy, Not Just Time

You have the same 24 hours as everyone else, but your energy fluctuates. Schedule demanding tasks for when you're most energized. Use lower-energy periods for routine work.

### Learn to Say No

Every yes carries opportunity costs. Before committing to something new, consider what you'd have to give up. It's okay to say, "I can't take that on right now."

### Use Your PTO

Seriously. Studies show that taking time off makes you more productive and creative when you return. Yet many administrators leave vacation days unused. Don't be one of them.

### Disconnect to Reconnect

Being constantly available is not a badge of honor—it's a path to burnout. Intentional disconnection from work allows you to be fully present in other areas of life.

## When Balance Feels Impossible

Sometimes life genuinely is out of balance—a major project, a personal crisis, a seasonal crunch. During these times:

- Acknowledge it's temporary
- Communicate with those affected
- Plan recovery time after the intense period
- Ask for help

## Redefining Success

Ultimately, balance is about defining success on your own terms. What does a life well-lived look like for you? Your answer will be different from anyone else's—and that's exactly as it should be.

You have more control over your balance than you might think. Start with one small change this week. Notice how it feels. Adjust from there. Balance isn't found—it's created, one choice at a time.
    `,
    date: "November 15, 2025",
    readTime: "6 min read",
    topics: ["Wellness", "Career Growth"],
    slug: "work-life-balance-myths",
    author: authors.marcus
  }
];

export const getBlogBySlug = (slug: string): BlogPost | undefined => {
  return allBlogs.find(blog => blog.slug === slug);
};

export const getRelatedPosts = (currentSlug: string, limit: number = 3): BlogPost[] => {
  const currentPost = getBlogBySlug(currentSlug);
  if (!currentPost) return allBlogs.slice(0, limit);
  
  // Prioritize posts sharing topic tags
  const scored = allBlogs
    .filter(blog => blog.slug !== currentSlug)
    .map(blog => ({
      blog,
      score: blog.topics.filter(t => currentPost.topics.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.blog);
};
