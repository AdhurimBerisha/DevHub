import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_POPULAR_TAGS, GET_POSTS_QUERY } from "@/graphql/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PopularTag, Post } from "@/types/Types";
import { SidebarCard } from "@/components/SidebarCard";

export default function Home() {
  const { user } = useAuth();

  const { loading, error, data } = useQuery(GET_POSTS_QUERY, {
    variables: { limit: 4, offset: 0, published: true },
  });

  const { data: tagsData, loading: tagsLoading } = useQuery(GET_POPULAR_TAGS);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Button asChild className="gap-2 rounded-full">
            <Link to="/create-post">
              <Plus className="h-4 w-4" />
              Create Post
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              Array(4)
                .fill(null)
                .map((_, idx) => (
                  <div key={idx} className="p-6 border rounded-lg space-y-4">
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
              data?.posts.map((post: Post) => (
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
                  isSaved={post.isSaved || false}
                />
              ))
            )}
          </div>

          <div className="space-y-4">
            <SidebarCard
              icon={Sparkles}
              title="Welcome to DevHub!"
              description="Your home for developer discussions, tutorials, and community insights."
            >
              <Button asChild className="w-full mb-2">
                <Link to="/create-post">Create Post</Link>
              </Button>
              <Button variant="outline" className="w-full">
                <Link to="/create-community">Create Community</Link>
              </Button>
            </SidebarCard>

            <SidebarCard title="Popular Tags">
              <div className="space-y-2 text-sm">
                {tagsLoading ? (
                  <Skeleton className="h-4 w-1/2" />
                ) : (
                  tagsData?.popularTags.slice(0, 5).map((tag: PopularTag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between hover:bg-muted/50 p-2 rounded cursor-pointer"
                    >
                      <span>#{tag.name}</span>
                      <span className="text-muted-foreground">
                        {tag.postCount} posts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </SidebarCard>

            <SidebarCard
              title="About"
              description="DevHub is a community of developers sharing knowledge, experiences, and insights about web development."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
