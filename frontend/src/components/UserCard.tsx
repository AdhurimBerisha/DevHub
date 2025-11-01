import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, UserCheck } from "lucide-react";

interface UserCardProps {
  user: {
    id: string;
    username: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    isFriend?: boolean;
  };
  onMessage?: (id: string) => void;
  onToggleFriend?: (id: string) => void;
  onClick?: () => void;
}

export const UserCard = ({
  user,
  onMessage,
  onToggleFriend,
  onClick,
}: UserCardProps) => {
  return (
    <div
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
          {user.username.charAt(0).toUpperCase()}
        </div>

        {/* Username */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {user.username}
          </h3>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onMessage?.(user.id);
            }}
            title="Send message"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <Button
            variant={user.isFriend ? "secondary" : "default"}
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFriend?.(user.id);
            }}
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
