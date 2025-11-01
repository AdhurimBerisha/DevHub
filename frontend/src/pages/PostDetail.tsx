import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Users } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client";
import { usePostStore } from "@/stores/postStore";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  GET_POST_QUERY,
  ADD_COMMENT_MUTATION,
  VOTE_POST_MUTATION,
  DELETE_POST_MUTATION,
  VOTE_COMMENT_MUTATION,
} from "@/graphql/posts";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    commentText,
    replyText,
    replyingTo,
    isSaved,
    setCommentText,
    setReplyText,
    clearReplyText,
    setReplyingTo,
    setIsSaved,
  } = usePostStore();

  const { loading, error, data } = useQuery(GET_POST_QUERY, {
    variables: { id },
  });

  useEffect(() => {
    if (location.hash === "#comments" && !loading && data?.post) {
      setTimeout(() => {
        const commentsElement = document.getElementById("comments");
        if (commentsElement) {
          commentsElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  }, [location.hash, loading, data]);

  const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
    refetchQueries: [{ query: GET_POST_QUERY, variables: { id } }],
    awaitRefetchQueries: true,
  });

  const [votePost] = useMutation(VOTE_POST_MUTATION, {
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

  const [voteComment] = useMutation(VOTE_COMMENT_MUTATION, {
    refetchQueries: [{ query: GET_POST_QUERY, variables: { id } }],
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const handleComment = async (parentCommentId?: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }

    const textToUse = parentCommentId
      ? replyText[parentCommentId]
      : commentText;
    if (!textToUse.trim()) return;

    try {
      await addComment({
        variables: {
          input: {
            postId: id!,
            content: textToUse,
            parentCommentId: parentCommentId || undefined,
          },
        },
      });

      if (parentCommentId) {
        clearReplyText(parentCommentId);
        setReplyingTo(null);
        toast({ title: "Reply added successfully" });
      } else {
        setCommentText("");
        toast({ title: "Comment added successfully" });
      }
    } catch (err: unknown) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleReply = (commentId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to reply",
        variant: "destructive",
      });
      return;
    }
    setReplyingTo(replyingTo === commentId ? null : commentId);
    if (replyingTo !== commentId && !replyText[commentId]) {
      setReplyText(commentId, "");
    }
  };

  const handleCommentVote = async (commentId, voteValue) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to vote on comments",
        variant: "destructive",
      });
      return;
    }

    try {
      const comment = post.comments.find((c) => c.id === commentId);
      const existingVote = comment.votes.find((v) => v.user.id === user.id);
      const valueToSend = existingVote?.value === voteValue ? 0 : voteValue;

      await voteComment({
        variables: { commentId, value: valueToSend },
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleVote = async (voteValue) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingVote = post.votes.find((v) => v.user.id === user.id);
      const valueToSend = existingVote?.value === voteValue ? 0 : voteValue;

      await votePost({ variables: { postId: id, value: valueToSend } });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const post = data?.post;
  if (!post) return <div>Post not found</div>;

  const userVote = post.votes.find((v) => v.user.id === user?.id);
  const voteCount = post.votes.reduce((acc, v) => acc + v.value, 0);

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex gap-4">
                {/* ======= VOTE SECTION ======= */}
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(1)}
                  >
                    <ArrowBigUp
                      className="h-6 w-6"
                      stroke={
                        userVote?.value === 1
                          ? "hsl(var(--upvote))"
                          : "currentColor"
                      }
                      fill={
                        userVote?.value === 1 ? "hsl(var(--upvote))" : "none"
                      }
                    />
                  </Button>
                  <span className="font-bold">{voteCount}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(-1)}
                  >
                    <ArrowBigDown
                      className="h-6 w-6"
                      stroke={
                        userVote?.value === -1
                          ? "hsl(var(--destructive))"
                          : "currentColor"
                      }
                      fill={
                        userVote?.value === -1
                          ? "hsl(var(--destructive))"
                          : "none"
                      }
                    />
                  </Button>
                </div>

                {/* ======= POST BODY ======= */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {post.community && (
                      <Badge
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() =>
                          navigate(`/communities/${post.community.id}`)
                        }
                      >
                        c/{post.community.name}
                      </Badge>
                    )}
                  </div>
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

                  {/* ======= ACTION BUTTONS ======= */}
                  <div className="flex gap-2 mb-4">
                    {user &&
                      (user.id === post.author.id || user.role === "ADMIN") && (
                        <>
                          <Button asChild size="sm">
                            <Link to={`/create-post?editId=${post.id}`}>
                              Edit
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              deletePostMutation({ variables: { id: post.id } })
                            }
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />{" "}
                      {post.commentCount || 0}
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

                  {/* ======= COMMENT FORM ======= */}
                  {user && (
                    <>
                      <Textarea
                        placeholder="Add a comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="mb-2"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleComment()}
                        disabled={!commentText.trim()}
                      >
                        Comment
                      </Button>
                    </>
                  )}

                  {/* ======= COMMENT LIST ======= */}
                  <div id="comments" className="mt-6 space-y-4">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="space-y-3">
                        {/* Main Comment */}
                        <div className="flex gap-3 border-b border-border pb-4 last:border-none">
                          {/* Comment vote bar */}
                          <div className="flex flex-col items-center mt-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 p-0"
                              onClick={() => handleCommentVote(comment.id, 1)}
                            >
                              <ArrowBigUp
                                className="h-4 w-4"
                                stroke={
                                  comment.votes.some(
                                    (v) =>
                                      v.user.id === user?.id && v.value === 1
                                  )
                                    ? "hsl(var(--upvote))"
                                    : "currentColor"
                                }
                                fill={
                                  comment.votes.some(
                                    (v) =>
                                      v.user.id === user?.id && v.value === 1
                                  )
                                    ? "hsl(var(--upvote))"
                                    : "none"
                                }
                              />
                            </Button>

                            <span className="text-xs font-semibold">
                              {comment.votes.reduce(
                                (acc, v) => acc + v.value,
                                0
                              )}
                            </span>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 p-0"
                              onClick={() => handleCommentVote(comment.id, -1)}
                            >
                              <ArrowBigDown
                                className="h-4 w-4"
                                stroke={
                                  comment.votes.some(
                                    (v) =>
                                      v.user.id === user?.id && v.value === -1
                                  )
                                    ? "hsl(var(--destructive))"
                                    : "currentColor"
                                }
                                fill={
                                  comment.votes.some(
                                    (v) =>
                                      v.user.id === user?.id && v.value === -1
                                  )
                                    ? "hsl(var(--destructive))"
                                    : "none"
                                }
                              />
                            </Button>
                          </div>

                          {/* Comment content area */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {comment.author.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-semibold">
                                {comment.author.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(comment.createdAt)
                                )}{" "}
                                ago
                              </span>
                            </div>

                            <p className="text-sm text-foreground mb-2 ml-8">
                              {comment.content}
                            </p>

                            {/* Comment actions */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-8">
                              <button
                                onClick={() => handleReply(comment.id)}
                                className="hover:text-foreground flex items-center gap-1"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Reply
                              </button>
                            </div>

                            {/* Reply form */}
                            {replyingTo === comment.id && user && (
                              <div className="mt-3 ml-8 space-y-2">
                                <Textarea
                                  placeholder="Write a reply..."
                                  value={replyText[comment.id] || ""}
                                  onChange={(e) =>
                                    setReplyText(comment.id, e.target.value)
                                  }
                                  className="min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleComment(comment.id)}
                                    disabled={!replyText[comment.id]?.trim()}
                                  >
                                    Reply
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      clearReplyText(comment.id);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-4 ml-8 space-y-3 border-l-2 border-border pl-4">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-5 w-5">
                                        <AvatarFallback>
                                          {reply.author.username[0].toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs font-semibold">
                                        {reply.author.username}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(
                                          new Date(reply.createdAt)
                                        )}{" "}
                                        ago
                                      </span>
                                    </div>
                                    <p className="text-sm text-foreground ml-7">
                                      {reply.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Community Card Sidebar */}
          {post.community && (
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h2 className="font-bold">{post.community.name}</h2>
                    </div>
                    {post.community.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {post.community.description}
                      </p>
                    )}
                    {post.community.memberCount !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Users className="h-4 w-4" />
                        <span>
                          {post.community.memberCount?.toLocaleString?.() ??
                            post.community.memberCount}{" "}
                          members
                        </span>
                      </div>
                    )}
                    <Button variant="outline" className="w-full" asChild>
                      <Link to={`/communities/${post.community.id}`}>
                        View Community
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full mt-2">
                      <Link
                        to={`/create-post?communityId=${post.community.id}`}
                      >
                        Create Post
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
