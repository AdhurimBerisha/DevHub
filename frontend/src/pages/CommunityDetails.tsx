import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_COMMUNITY_QUERY } from "@/graphql/communities";
import { GET_POSTS_QUERY } from "@/graphql/posts";
import { PostCard } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

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

  const {
    data: communityData,
    loading: communityLoading,
    error: communityError,
  } = useQuery(GET_COMMUNITY_QUERY, { variables: { id }, skip: !id });

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
  } = useQuery(GET_POSTS_QUERY, {
    variables: { limit: 20, offset: 0, published: true, communityId: id },
    skip: !id,
  });

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

  // Helpful debug log so you can inspect what the posts query returned in the browser console
  if (!postsLoading) console.debug("CommunityDetails postsData:", postsData);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          <p className="text-muted-foreground">{community.description}</p>
          <div className="text-sm text-muted-foreground mt-2">
            {community.memberCount?.toLocaleString?.() ?? community.memberCount}{" "}
            members
          </div>
        </div>

        <div className="grid gap-6">
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
      </div>
    </div>
  );
}
