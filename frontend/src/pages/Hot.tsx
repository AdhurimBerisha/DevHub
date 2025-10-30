import { useQuery } from "@apollo/client";
import { GET_POSTS_QUERY } from "@/graphql/posts";
import { PostCard } from "@/components/PostCard";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame } from "lucide-react";
import { useState } from "react";
import type { Post } from "@/types/Types";
import { Pagination } from "@/components/Pagination";

export default function Hot() {
  const { data, loading, error } = useQuery<{ posts: Post[] }>(
    GET_POSTS_QUERY,
    {
      variables: { limit: 50, offset: 0, published: true },
    }
  );

  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 4;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading posts</p>;

  // Sort posts by likes
  const sortedPosts = [...(data?.posts ?? [])].sort(
    (a, b) =>
      (b.votes.filter((v) => v.value === 1).length || 0) -
      (a.votes.filter((v) => v.value === 1).length || 0)
  );

  // Pagination logic
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);

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
          {paginatedPosts.map((post, index) => (
            <div key={post.id} className="relative">
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
