import { PostCard } from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Sparkles } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_POSTS_QUERY } from "@/graphql/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  FilterSort,
  POST_SORT_OPTIONS,
  sortPosts,
} from "@/components/FilterSort";

export default function Posts() {
  const { loading, error, data } = useQuery(GET_POSTS_QUERY, {
    variables: {
      limit: 50,
      offset: 0,
      published: true,
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredAndSortedPosts = useMemo(() => {
    if (!data?.posts) return [];

    const filtered = data.posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return sortPosts(filtered, sortBy);
  }, [data, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">All Posts</h1>
          <p className="text-muted-foreground">
            Browse the latest articles, guides, and discussions from the DevHub
            community.
          </p>
        </div>

        {/* Search and Filter bar */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts by title, content, or tag..."
              className="pl-10 py-5 rounded-xl border-muted focus-visible:ring-1 focus-visible:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <FilterSort
            categories={POST_SORT_OPTIONS}
            activeSort={sortBy}
            onSortChange={setSortBy}
            variant="outline"
          />
        </div>

        {/* Layout: main posts + sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main posts */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              Array(3)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="p-6 border rounded-lg space-y-4 bg-muted/10"
                  >
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))
            ) : error ? (
              <div className="text-red-500">
                Error loading posts: {error.message}
              </div>
            ) : filteredAndSortedPosts.length > 0 ? (
              filteredAndSortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  author={post.author.username}
                  date={new Date(post.createdAt).toLocaleDateString()}
                  excerpt={post.content.substring(0, 150) + "..."}
                  tags={post.tags}
                  votes={post.votes}
                  commentsCount={post.comments.length}
                  readTime={`${Math.ceil(
                    post.content.split(" ").length / 200
                  )} min`}
                  community={post.community}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground mt-10">
                {searchTerm
                  ? `No posts found matching "${searchTerm}".`
                  : "No posts available."}
              </div>
            )}
          </div>

          {/* Sidebar cards */}
          <div className="space-y-6">
            {/* Share Your Knowledge card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="h-5 w-5 text-primary" />
                  <h2 className="font-bold">Share Your Knowledge</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Have something valuable to say? Write a post and share your
                  insights with the DevHub community.
                </p>
                <Button asChild className="w-full">
                  <Link to="/create-post">Create a Post</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Trending Tags card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-bold">Trending Tags</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Explore topics that are getting the most attention this week.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["react", "graphql", "nextjs", "typescript", "prisma"].map(
                    (tag) => {
                      const isActive =
                        searchTerm.toLowerCase() === tag.toLowerCase();

                      return (
                        <span
                          key={tag}
                          onClick={() => setSearchTerm(isActive ? "" : tag)}
                          className={`text-sm px-3 py-1 rounded-full cursor-pointer transition
        ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/70"
        }`}
                        >
                          #{tag}
                        </span>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
