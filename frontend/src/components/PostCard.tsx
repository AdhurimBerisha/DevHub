import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PostCardProps {
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  reactions: number;
  comments: number;
  readTime: string;
}

export function PostCard({ title, author, date, excerpt, tags, reactions, comments, readTime }: PostCardProps) {
  const [votes, setVotes] = useState(reactions);
  const [voteState, setVoteState] = useState<'up' | 'down' | null>(null);

  const handleUpvote = () => {
    if (voteState === 'up') {
      setVotes(reactions);
      setVoteState(null);
    } else {
      setVotes(reactions + (voteState === 'down' ? 2 : 1));
      setVoteState('up');
    }
  };

  const handleDownvote = () => {
    if (voteState === 'down') {
      setVotes(reactions);
      setVoteState(null);
    } else {
      setVotes(reactions - (voteState === 'up' ? 2 : 1));
      setVoteState('down');
    }
  };

  return (
    <Card className="hover:border-border transition-all duration-200 overflow-hidden border-l-0">
      <div className="flex gap-0">
        {/* Voting section */}
        <div className="flex flex-col items-center bg-muted/30 py-2 px-3 gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 w-8 p-0 hover:bg-background ${voteState === 'up' ? 'text-[hsl(var(--upvote))]' : ''}`}
            onClick={handleUpvote}
          >
            <ArrowBigUp className="h-6 w-6" fill={voteState === 'up' ? 'currentColor' : 'none'} />
          </Button>
          <span className={`text-xs font-bold ${voteState === 'up' ? 'text-[hsl(var(--upvote))]' : voteState === 'down' ? 'text-[hsl(var(--downvote))]' : 'text-foreground'}`}>
            {votes}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 w-8 p-0 hover:bg-background ${voteState === 'down' ? 'text-[hsl(var(--downvote))]' : ''}`}
            onClick={handleDownvote}
          >
            <ArrowBigDown className="h-6 w-6" fill={voteState === 'down' ? 'currentColor' : 'none'} />
          </Button>
        </div>

        {/* Content section */}
        <div className="flex-1 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary to-accent" />
              <span className="font-medium text-foreground hover:underline cursor-pointer">r/{author.split(' ')[0]}</span>
            </div>
            <span>•</span>
            <span>Posted by u/{author.replace(' ', '').toLowerCase()}</span>
            <span>•</span>
            <span>{date}</span>
          </div>

          <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer mb-2">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{excerpt}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal hover:bg-secondary/80 cursor-pointer">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
              <MessageSquare className="h-4 w-4" />
              {comments} Comments
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs">
              <Bookmark className="h-4 w-4" />
              Save
            </Button>
            <span className="ml-auto text-xs">{readTime} read</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
