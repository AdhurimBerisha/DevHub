import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { GET_POSTS_QUERY, VOTE_POST_MUTATION } from "@/graphql/posts";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: { id: string; name: string }[];
  votes: { id: string; value: number; user: { id: string } }[];
  commentsCount: number;
  readTime?: string;
  community?: { id: string; name: string; slug: string } | null;
}

export function PostCard({
  id,
  title,
  author,
  date,
  excerpt,
  tags,
  votes,
  commentsCount,
  community,
}: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const userVote = votes?.find((vote) => vote.user.id === user?.id);
  const voteCount = votes?.reduce((acc, vote) => acc + vote.value, 0) || 0;

  const [votePost] = useMutation(VOTE_POST_MUTATION, {
    refetchQueries: [{ query: GET_POSTS_QUERY }],
  });

  const handleVote = async (value: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to vote",
        variant: "destructive",
      });
      return;
    }
    const newValue = userVote?.value === value ? 0 : value; // toggle vote
    await votePost({ variables: { postId: id, value: newValue } });
  };

  return (
    <Card className="hover:border-border transition-all duration-200 overflow-hidden border-l-0">
      <div className="flex gap-0">
        {/* Voting section */}
        <div className="flex flex-col items-center bg-muted/30 py-2 px-3 gap-1">
          <Button variant="ghost" size="sm" onClick={() => handleVote(1)}>
            <ArrowBigUp
              className="h-6 w-6"
              stroke={
                userVote?.value === 1 ? "hsl(var(--upvote))" : "currentColor"
              }
              fill={userVote?.value === 1 ? "hsl(var(--upvote))" : "none"}
            />
          </Button>

          <span className="text-xs font-bold">{voteCount}</span>

          <Button variant="ghost" size="sm" onClick={() => handleVote(-1)}>
            <ArrowBigDown
              className="h-6 w-6"
              stroke={
                userVote?.value === -1
                  ? "hsl(var(--destructive))"
                  : "currentColor"
              }
              fill={userVote?.value === -1 ? "hsl(var(--destructive))" : "none"}
            />
          </Button>
        </div>

        {/* Content section */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {community && (
              <Badge 
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => navigate(`/communities/${community.id}`)}
              >
                c/{community.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
            <span className="font-medium text-foreground hover:underline">
              r/{author}
            </span>
            <span>•</span>
            <span>{date}</span>
          </div>

          <h3
            className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer mb-2"
            onClick={() => navigate(`/post/${id}`)}
          >
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {excerpt}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-2 text-xs"
              onClick={() => navigate(`/post/${id}#comments`)}
            >
              <MessageSquare className="h-4 w-4" />
              {commentsCount} Comments
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
              <Bookmark className="h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
