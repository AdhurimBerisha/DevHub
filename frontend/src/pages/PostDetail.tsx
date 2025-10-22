import { useNavigate } from "react-router-dom";
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const post = {
  title: "Building Scalable React Applications with TypeScript",
  author: "Sarah Chen",
  date: "2h ago",
  content:
    "# Introduction\n\nBuilding scalable React applications requires careful planning...",
  tags: ["react", "typescript", "architecture"],
  reactions: 234,
  comments: 45,
};

const comments = [
  {
    id: "1",
    author: "John Doe",
    date: "1h ago",
    content: "Great article!",
    votes: 12,
  },
  {
    id: "2",
    author: "Jane Smith",
    date: "45m ago",
    content: "Would you recommend TypeScript for smaller projects?",
    votes: 8,
  },
];

export default function PostDetail() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState(post.reactions);
  const [voteState, setVoteState] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const vote = (type) => {
    if (voteState === type) {
      setVotes(post.reactions);
      setVoteState(null);
    } else {
      setVotes(
        post.reactions +
          (type === "up" ? 1 : -1) +
          (voteState ? (voteState === "up" ? -1 : 1) : 0)
      );
      setVoteState(type);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => vote("up")}>
                <ArrowBigUp
                  fill={voteState === "up" ? "currentColor" : "none"}
                />
              </Button>
              <span className="font-bold">{votes}</span>
              <Button variant="ghost" size="sm" onClick={() => vote("down")}>
                <ArrowBigDown
                  fill={voteState === "down" ? "currentColor" : "none"}
                />
              </Button>
            </div>

            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-2">
                r/{post.author.split(" ")[0]} • {post.date}
              </div>
              <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
              <div className="flex gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <p className="mb-4">{post.content.substring(0, 200)}...</p>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" /> {post.comments}
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
              Comments ({comments.length})
            </h2>
            <Textarea
              placeholder="What are your thoughts?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="mb-2"
            />
            <Button size="sm">Comment</Button>

            <div className="mt-6 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {c.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      u/{c.author.replace(" ", "").toLowerCase()} • {c.date}
                    </div>
                    <p className="text-sm mb-2">{c.content}</p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <ArrowBigUp className="h-4 w-4" /> {c.votes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ArrowBigDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        Reply
                      </Button>
                    </div>
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
