import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Sparkles } from "lucide-react";

const featuredPosts = [
  {
    title: "Building Scalable React Applications with TypeScript",
    author: "Sarah Chen",
    date: "2h ago",
    excerpt: "Learn how to structure your React applications for maximum scalability and maintainability using TypeScript best practices.",
    tags: ["react", "typescript", "architecture"],
    reactions: 234,
    comments: 45,
    readTime: "8 min"
  },
  {
    title: "Understanding the Virtual DOM: A Deep Dive",
    author: "Mike Johnson",
    date: "4h ago",
    excerpt: "Explore how the Virtual DOM works under the hood and why it's such a powerful concept in modern web development.",
    tags: ["javascript", "react", "performance"],
    reactions: 189,
    comments: 32,
    readTime: "6 min"
  },
  {
    title: "Modern CSS Techniques for Better Layouts",
    author: "Emma Williams",
    date: "6h ago",
    excerpt: "Discover the latest CSS features and how to use Grid, Flexbox, and Container Queries to build responsive layouts.",
    tags: ["css", "webdev", "design"],
    reactions: 156,
    comments: 28,
    readTime: "5 min"
  },
  {
    title: "API Design Best Practices in 2024",
    author: "David Park",
    date: "8h ago",
    excerpt: "A comprehensive guide to designing RESTful APIs that are intuitive, secure, and easy to maintain.",
    tags: ["api", "backend", "bestpractices"],
    reactions: 298,
    comments: 51,
    readTime: "10 min"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button className="gap-2 rounded-full">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {featuredPosts.map((post, index) => (
              <PostCard key={index} {...post} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-bold">Welcome to DevBlog!</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Your home for developer discussions, tutorials, and community insights.
                </p>
                <Button className="w-full mb-2">Create Post</Button>
                <Button variant="outline" className="w-full">Create Community</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold mb-3">Popular Tags</h2>
                <div className="space-y-2 text-sm">
                  {["javascript", "react", "typescript", "webdev", "tutorial"].map((tag) => (
                    <div key={tag} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded cursor-pointer">
                      <span>#{tag}</span>
                      <span className="text-muted-foreground">1.2k posts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold mb-3">About</h2>
                <p className="text-sm text-muted-foreground">
                  DevBlog is a community of developers sharing knowledge, experiences, and insights about web development.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
