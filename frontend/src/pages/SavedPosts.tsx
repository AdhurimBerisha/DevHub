import { PostCard } from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_SAVED_POSTS_QUERY } from "@/graphql/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

export default function SavedPosts() {
  const { user } = useAuth();

  const { loading, error, data } = useQuery(GET_SAVED_POSTS_QUERY, {
    variables: { limit: 50, offset: 0 },
    skip: !user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Please login to view your saved posts
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Saved Posts</h1>
          </div>
          <p className="text-muted-foreground">
            Posts you've saved for later reading
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array(4)
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
              ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">
                Error loading saved posts: {error.message}
              </p>
            </CardContent>
          </Card>
        ) : data?.savedPosts?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No saved posts yet</p>
              <p className="text-muted-foreground">
                Start saving posts to see them here!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {data?.savedPosts.map((post: any) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author.username}
                date={new Date(post.createdAt).toLocaleDateString()}
                excerpt={post.content.substring(0, 150) + "..."}
                image={post.image}
                tags={post.tags}
                votes={post.votes}
                commentsCount={post.commentCount || 0}
                community={post.community}
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

