import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_POST_QUERY,
  ADD_COMMENT_MUTATION,
  LIKE_POST_MUTATION,
  UNLIKE_POST_MUTATION,
  DELETE_POST_MUTATION,
} from "@/graphql/posts";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const { loading, error, data } = useQuery(GET_POST_QUERY, {
    variables: { id },
    skip: !id,
    onError: (error) => {
      console.error("GraphQL Error:", error);
    },
  });

  console.log("PostDetail Debug:", {
    id,
    loading,
    error,
    data,
    post: data?.post,
    hasData: !!data,
    hasPost: !!data?.post,
  });

  const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
    refetchQueries: [{ query: GET_POST_QUERY, variables: { id } }],
  });

  const [likePost] = useMutation(LIKE_POST_MUTATION, {
    refetchQueries: [{ query: GET_POST_QUERY, variables: { id } }],
  });

  const [unlikePost] = useMutation(UNLIKE_POST_MUTATION, {
    refetchQueries: [{ query: GET_POST_QUERY, variables: { id } }],
  });

  const [deletePostMutation] = useMutation(DELETE_POST_MUTATION, {
    onCompleted: () => {
      toast({ title: "Deleted", description: "Post deleted successfully" });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to comment on posts",
        variant: "destructive",
      });
      return;
    }

    try {
      await addComment({
        variables: {
          input: {
            postId: id,
            content: commentText,
          },
        },
      });
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      const hasLiked = data?.post?.likes?.some(
        (like) => like.user.id === user.id
      );
      if (hasLiked) {
        await unlikePost({ variables: { postId: id } });
      } else {
        await likePost({ variables: { postId: id } });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-4">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-40 w-full" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 p-4">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6">
            <div className="text-red-500">
              Error loading post: {error.message}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const post = data?.post;

  // const vote = (type) => {
  //   if (voteState === type) {
  //     setVotes(post.reactions);
  //     setVoteState(null);
  //   } else {
  //     setVotes(
  //       post.reactions +
  //         (type === "up" ? 1 : -1) +
  //         (voteState ? (voteState === "up" ? -1 : 1) : 0)
  //     );
  //     setVoteState(type);
  //   }
  // };

  if (!post) {
    return (
      <div className="min-h-screen bg-muted/30 p-4">
        <div className="max-w-5xl mx-auto">
          <Card className="p-6">
            <div className="text-muted-foreground">Post not found</div>
          </Card>
        </div>
      </div>
    );
  }

  const hasLiked = post.likes?.some((like) => like.user.id === user?.id);

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={!user}
              >
                <ArrowBigUp
                  className="h-6 w-6"
                  fill={hasLiked ? "currentColor" : "none"}
                />
              </Button>
              <span className="font-bold">{post.likes.length}</span>
            </div>

            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-2">
                Posted by u/{post.author.username} •{" "}
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </div>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div className="flex gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}
              </div>
              <div className="prose dark:prose-invert max-w-none mb-4">
                {post.content}
              </div>

              <div className="flex gap-2">
                {/* Edit button visible to author or admins */}
                {user &&
                  (user.id === post.author.id || user.role === "ADMIN") && (
                    <>
                      <Button asChild size="sm" className="mr-2">
                        <Link to={`/create-post?editId=${post.id}`}>Edit</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Are you sure you want to delete this post? This cannot be undone."
                            )
                          )
                            return;
                          try {
                            await deletePostMutation({
                              variables: { id: post.id },
                            });
                          } catch (e) {
                            // handled by mutation onError
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  )}

                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />{" "}
                  {post.comments.length}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Bookmark
                    className="h-4 w-4 mr-2"
                    fill={isSaved ? "currentColor" : "none"}
                  />
                  {isSaved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold mb-4">
              Comments ({post.comments.length})
            </h2>

            {user ? (
              <>
                <Textarea
                  placeholder="What are your thoughts?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="mb-2"
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={!commentText.trim()}
                >
                  Comment
                </Button>
              </>
            ) : (
              <div className="text-sm text-muted-foreground mb-4">
                Please login to comment on posts
              </div>
            )}

            <div className="mt-6 space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {comment.author.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      u/{comment.author.username} •{" "}
                      {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
