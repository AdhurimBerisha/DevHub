import { PostCard } from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const allPosts = [
  {
    title: "Getting Started with Vite and React",
    author: "Alex Rivera",
    date: "Dec 15, 2024",
    excerpt: "Learn how to set up a blazing-fast React development environment with Vite.",
    tags: ["vite", "react", "tutorial"],
    reactions: 145,
    comments: 23,
    readTime: "7 min"
  },
  {
    title: "The Power of Server Components",
    author: "Jordan Lee",
    date: "Dec 14, 2024",
    excerpt: "Explore how server components are changing the way we think about React applications.",
    tags: ["react", "ssr", "nextjs"],
    reactions: 267,
    comments: 38,
    readTime: "9 min"
  },
  {
    title: "State Management in 2024",
    author: "Casey Morgan",
    date: "Dec 13, 2024",
    excerpt: "A comparison of modern state management solutions and when to use each one.",
    tags: ["react", "state", "zustand"],
    reactions: 198,
    comments: 42,
    readTime: "11 min"
  },
  {
    title: "TypeScript Tips and Tricks",
    author: "Sam Peterson",
    date: "Dec 12, 2024",
    excerpt: "Level up your TypeScript skills with these advanced patterns and techniques.",
    tags: ["typescript", "javascript", "tips"],
    reactions: 312,
    comments: 56,
    readTime: "6 min"
  },
  {
    title: "Optimizing React Performance",
    author: "Taylor Swift",
    date: "Dec 11, 2024",
    excerpt: "Learn about memoization, lazy loading, and other techniques to boost your app's performance.",
    tags: ["react", "performance", "optimization"],
    reactions: 421,
    comments: 67,
    readTime: "12 min"
  },
  {
    title: "Building Accessible Web Apps",
    author: "Morgan Davis",
    date: "Dec 10, 2024",
    excerpt: "Essential accessibility practices every developer should know and implement.",
    tags: ["accessibility", "a11y", "webdev"],
    reactions: 178,
    comments: 29,
    readTime: "8 min"
  }
];

export default function Posts() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">All Posts</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search posts..." 
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {allPosts.map((post, index) => (
            <PostCard key={index} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
