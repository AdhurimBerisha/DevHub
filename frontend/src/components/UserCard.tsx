import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserCheck } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    status: string;
    isFriend: boolean;
  };
  onMessage?: (id: string) => void;
  onToggleFriend?: (id: string) => void;
}

export const UserCard = ({
  user,
  onMessage,
  onToggleFriend,
}: UserCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {user.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {user.status}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMessage?.(user.id)}
            title="Send message"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant={user.isFriend ? "secondary" : "default"}
            size="icon"
            onClick={() => onToggleFriend?.(user.id)}
            title={user.isFriend ? "Remove friend" : "Add friend"}
          >
            {user.isFriend ? (
              <UserCheck className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
