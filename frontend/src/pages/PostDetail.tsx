import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  GET_POST_QUERY,
  ADD_COMMENT_MUTATION,
  VOTE_POST_MUTATION,
  DELETE_POST_MUTATION,
} from "@/graphql/posts";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const { loading, error, data } = useQuery(GET_POST_QUERY, {
    variables: { id },
  });

  const [addComment] = useMutation(ADD_COMMENT_MUTATION, {
    refetchQueries: [{ query: GET_POST_QUERY, variables: { id } }],
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

  const handleComment = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }
    try {
      await addComment({
        variables: { input: { postId: id, content: commentText } },
      });
      setCommentText("");
      toast({ title: "Comment added" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (voteValue: 1 | -1) => {
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

      if (existingVote?.value === voteValue) {
        await votePost({ variables: { postId: id, value: 0 } });
      } else {
        await votePost({ variables: { postId: id, value: voteValue } });
      }
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
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleVote(1)}>
                <ArrowBigUp
                  className="h-6 w-6"
                  stroke={
                    userVote?.value === 1
                      ? "hsl(var(--upvote))"
                      : "currentColor"
                  }
                  fill={userVote?.value === 1 ? "hsl(var(--upvote))" : "none"}
                />
              </Button>
              <span className="font-bold">{voteCount}</span>
              <Button variant="ghost" size="sm" onClick={() => handleVote(-1)}>
                <ArrowBigDown
                  className="h-6 w-6"
                  stroke={
                    userVote?.value === -1
                      ? "hsl(var(--destructive))"
                      : "currentColor"
                  }
                  fill={
                    userVote?.value === -1 ? "hsl(var(--destructive))" : "none"
                  }
                />
              </Button>
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

              <div className="flex gap-2 mb-4">
                {user &&
                  (user.id === post.author.id || user.role === "ADMIN") && (
                    <>
                      <Button asChild size="sm">
                        <Link to={`/create-post?editId=${post.id}`}>Edit</Link>
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
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                  >
                    Comment
                  </Button>
                </>
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
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
