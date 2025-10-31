import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unread?: number;
  };
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-4 rounded-lg transition-colors text-left",
        isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"
      )}
    >
      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
        {conversation.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-foreground truncate">
            {conversation.name}
          </h3>
          <span className="text-xs text-muted-foreground">
            {conversation.timestamp}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {conversation.lastMessage}
        </p>
        {conversation.unread && (
          <div className="mt-2 inline-flex items-center justify-center h-5 px-2 rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {conversation.unread}
          </div>
        )}
      </div>
    </button>
  );
}
