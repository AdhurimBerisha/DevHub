import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_COMMUNITY_QUERY,
  JOIN_COMMUNITY_MUTATION,
  LEAVE_COMMUNITY_MUTATION,
} from "@/graphql/communities";
import { GET_POSTS_QUERY } from "@/graphql/posts";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string };
  tags: { id: string; name: string }[];
  likes: { id: string; user: { id: string; username: string } }[];
  comments: {
    id: string;
    content: string;
    createdAt?: string;
    author?: { id: string; username: string };
  }[];
}

export default function CommunityDetails() {
  const { id } = useParams();
  const { toast } = useToast();
  const currentUser = useAuthStore((s) => s.user);

  const {
    data: communityData,
    loading: communityLoading,
    error: communityError,
    refetch: refetchCommunity,
  } = useQuery(GET_COMMUNITY_QUERY, { variables: { id }, skip: !id });

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = useQuery(GET_POSTS_QUERY, {
    variables: { limit: 20, offset: 0, published: true, communityId: id },
    skip: !id,
  });

  const [joinCommunity, { loading: joining }] = useMutation(
    JOIN_COMMUNITY_MUTATION,
    {
      onCompleted: (data) => {
        const success = data?.joinCommunity?.success ?? false;
        const message = data?.joinCommunity?.message ?? "Joined community";
        toast({
          title: success ? "Joined community" : "Failed to join",
          description: message,
        });
        refetchCommunity();
      },
      onError: (error) => {
        toast({
          title: "Error joining community",
          description: error.message,
        });
      },
    }
  );

  const [leaveCommunity, { loading: leaving }] = useMutation(
    LEAVE_COMMUNITY_MUTATION,
    {
      onCompleted: (data) => {
        const success = data?.leaveCommunity?.success ?? false;
        const message = data?.leaveCommunity?.message ?? "Left community";
        toast({
          title: success ? "Left community" : "Failed to leave",
          description: message,
        });
        refetchCommunity();
      },
      onError: (error) => {
        toast({
          title: "Error leaving community",
          description: error.message,
        });
      },
    }
  );

  if (communityLoading || postsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          {Array(3)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="mb-6">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (communityError)
    return (
      <div className="p-6 text-destructive">
        Error: {String(communityError.message)}
      </div>
    );

  if (postsError)
    return (
      <div className="p-6 text-destructive">
        Error loading posts: {String(postsError.message)}
      </div>
    );

  if (!communityData?.community)
    return <div className="p-6">Community not found</div>;

  const community = communityData.community;
  const posts: Post[] = postsData?.posts ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome to {community.name}</h1>
          <p className="text-muted-foreground">{community.description}</p>
          <div className="text-sm text-muted-foreground mt-2">
            {community.memberCount?.toLocaleString?.() ?? community.memberCount}{" "}
            members
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Posts */}
          <div className="lg:col-span-2 space-y-6">
            {posts.length === 0 ? (
              <div className="text-muted-foreground">
                No posts in this community yet.
              </div>
            ) : (
              posts.map((post) => (
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

          {/* Right: Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="font-bold">Welcome to {community.name}!</h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {community.description}
                  </p>

                  {/* Join / Leave / Manage Logic */}
                  {currentUser && community.owner?.id === currentUser.id ? (
                    <Link to={`/communities/${community.id}/manage`}>
                      <Button variant="outline" className="w-full">
                        Manage
                      </Button>
                    </Link>
                  ) : currentUser && community.isMember ? (
                    <Button
                      disabled={leaving}
                      onClick={() =>
                        leaveCommunity({
                          variables: { communityId: community.id },
                        })
                      }
                      className="w-full"
                    >
                      {leaving ? "Leaving..." : "Leave"}
                    </Button>
                  ) : (
                    <Button
                      disabled={joining}
                      onClick={() =>
                        joinCommunity({
                          variables: { communityId: community.id },
                        })
                      }
                      className="w-full"
                    >
                      {joining ? "Joining..." : "Join"}
                    </Button>
                  )}

                  <Button variant="outline" asChild className="w-full mt-2">
                    <Link to={`/create-post?communityId=${community.id}`}>
                      Create Post
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
