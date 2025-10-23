import { PostCard } from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_POSTS_QUERY } from "@/graphql/posts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Posts() {
  const { loading, error, data } = useQuery(GET_POSTS_QUERY, {
    variables: {
      limit: 10,
      offset: 0,
      published: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">All Posts</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="pl-10" />
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            // Show skeletons while loading
            Array(3)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="p-6 border rounded-lg space-y-4">
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
          ) : (
            data?.posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author.username}
                date={new Date(post.createdAt).toLocaleDateString()}
                excerpt={post.content.substring(0, 150) + "..."}
                tags={post.tags.map((tag) => tag.name)}
                reactions={post.likes.length}
                comments={post.comments.length}
                readTime={`${Math.ceil(
                  post.content.split(" ").length / 200
                )} min`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
