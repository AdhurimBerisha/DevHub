import { useQuery } from "@apollo/client";
import { GET_POSTS_QUERY } from "@/graphql/posts";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame } from "lucide-react";
import type { Post } from "@/types/Types";

export default function Hot() {
  const { data, loading, error } = useQuery<{ posts: Post[] }>(
    GET_POSTS_QUERY,
    {
      variables: { limit: 50, offset: 0, published: true },
    }
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading posts</p>;

  const sortedPosts = [...(data?.posts ?? [])].sort(
    (a, b) =>
      (b.votes.filter((v) => v.value === 1).length || 0) -
      (a.votes.filter((v) => v.value === 1).length || 0)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">What's Hot</h1>
          </div>
          <p className="text-muted-foreground">
            The most popular posts right now
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Badge variant="default" className="gap-1 whitespace-nowrap">
            <TrendingUp className="h-3 w-3" />
            This Week
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">
            This Month
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">
            This Year
          </Badge>
          <Badge variant="outline" className="whitespace-nowrap">
            All Time
          </Badge>
        </div>

        <div className="grid gap-6">
          {sortedPosts.map((post, index) => (
            <div key={post.id} className="relative">
              {/* <div className="absolute -left-2 top-4 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-sm">
                {index + 1}
              </div> */}
              <PostCard
                id={post.id}
                title={post.title}
                author={post.author.username}
                date={new Date(post.createdAt).toLocaleDateString()}
                excerpt={post.content.slice(0, 200) + "..."}
                tags={post.tags}
                votes={post.votes}
                commentsCount={post.comments.length}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
