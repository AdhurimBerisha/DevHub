import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame } from "lucide-react";

const trendingPosts = [
  {
    title: "Why Your React App Is Slow (And How to Fix It)",
    author: "Alex Thompson",
    date: "Dec 15, 2024",
    excerpt: "Performance optimization techniques that actually work, with real-world examples and measurements.",
    tags: ["react", "performance", "optimization"],
    reactions: 1243,
    comments: 189,
    readTime: "15 min"
  },
  {
    title: "I Built a Full-Stack App in 24 Hours",
    author: "Jamie Cruz",
    date: "Dec 15, 2024",
    excerpt: "A journey through rapid prototyping with modern tools and frameworks. Here's what I learned.",
    tags: ["fullstack", "tutorial", "productivity"],
    reactions: 987,
    comments: 134,
    readTime: "12 min"
  },
  {
    title: "The State of JavaScript 2024: Key Takeaways",
    author: "Morgan Bailey",
    date: "Dec 14, 2024",
    excerpt: "Analysis of the latest JavaScript survey results and what they mean for the future of web development.",
    tags: ["javascript", "trends", "webdev"],
    reactions: 2134,
    comments: 267,
    readTime: "18 min"
  },
  {
    title: "Building Production-Ready TypeScript Apps",
    author: "Chris Anderson",
    date: "Dec 14, 2024",
    excerpt: "From development to deployment: a complete guide to TypeScript best practices in production.",
    tags: ["typescript", "bestpractices", "production"],
    reactions: 876,
    comments: 98,
    readTime: "14 min"
  },
  {
    title: "CSS Grid: The Ultimate Layout Guide",
    author: "Sam Rivers",
    date: "Dec 13, 2024",
    excerpt: "Master CSS Grid with practical examples and learn when to use it over Flexbox.",
    tags: ["css", "layout", "design"],
    reactions: 743,
    comments: 76,
    readTime: "10 min"
  }
];

export default function Hot() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">What's Hot</h1>
          </div>
          <p className="text-muted-foreground">The most popular posts right now</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge variant="default" className="gap-1 whitespace-nowrap">
            <TrendingUp className="h-3 w-3" />
            This Week
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">This Month</Badge>
          <Badge variant="outline" className="whitespace-nowrap">This Year</Badge>
          <Badge variant="outline" className="whitespace-nowrap">All Time</Badge>
        </div>

        <div className="grid gap-6">
          {trendingPosts.map((post, index) => (
            <div key={index} className="relative">
              <div className="absolute -left-2 top-4 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm">
                {index + 1}
              </div>
              <PostCard {...post} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
