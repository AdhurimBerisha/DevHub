import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    isOwn: boolean;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 mb-4", message.isOwn && "flex-row-reverse")}>
      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
        {message.sender.charAt(0).toUpperCase()}
      </div>
      <div
        className={cn(
          "flex flex-col max-w-[70%]",
          message.isOwn && "items-end"
        )}
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {message.sender}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp}
          </span>
        </div>
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm",
            message.isOwn
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-card text-card-foreground rounded-tl-none"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
