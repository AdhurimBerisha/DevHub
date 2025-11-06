import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import {
  GET_NOTIFICATIONS_QUERY,
  GET_UNREAD_NOTIFICATION_COUNT_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from "@/graphql/notifications";
import { socketService } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/stores/authStore";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  post?: {
    id: string;
    title: string;
  };
  comment?: {
    id: string;
    content: string;
    post?: {
      id: string;
    };
  };
  triggeredBy: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
}

function getNotificationText(notification: Notification): string {
  const { triggeredBy, type } = notification;
  const username = triggeredBy.username;

  switch (type) {
    case "POST_UPVOTE":
      return `${username} upvoted your post`;
    case "POST_DOWNVOTE":
      return `${username} downvoted your post`;
    case "COMMENT_UPVOTE":
      return `${username} upvoted your comment`;
    case "COMMENT_DOWNVOTE":
      return `${username} downvoted your comment`;
    case "COMMENT_ON_POST":
      return `${username} commented on your post`;
    case "REPLY_TO_COMMENT":
      return `${username} replied to your comment`;
    default:
      return "New notification";
  }
}

export function NotificationsDropdown() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { open: sidebarOpen } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS_QUERY, {
    variables: { limit: 20, offset: 0 },
    skip: !isOpen || !isAuthenticated,
    fetchPolicy: "cache-and-network",
  });

  const { data: countData, refetch: refetchCount } = useQuery(
    GET_UNREAD_NOTIFICATION_COUNT_QUERY,
    {
      pollInterval: 10000,
      fetchPolicy: "cache-and-network",
      skip: !isAuthenticated,
    }
  );

  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION, {
    refetchQueries: [
      GET_NOTIFICATIONS_QUERY,
      GET_UNREAD_NOTIFICATION_COUNT_QUERY,
    ],
  });

  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      refetch();
      refetchCount();

      toast({
        title: "New Notification",
        description: getNotificationText(notification),
      });
    };

    const handleNotificationRead = (notificationId: string) => {
      refetch();
      refetchCount();
    };

    socketService.onNotification(handleNewNotification);
    socketService.onNotificationRead(handleNotificationRead);

    return () => {
      socketService.offNotification(handleNewNotification);
      socketService.offNotificationRead(handleNotificationRead);
    };
  }, [refetch, refetchCount, toast]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead({
          variables: { id: notification.id },
        });
        socketService.markNotificationRead(notification.id);
        refetchCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    if (notification.post) {
      navigate(`/post/${notification.post.id}`);
    } else if (notification.comment?.post?.id) {
      navigate(`/post/${notification.comment.post.id}`);
    }

    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      refetch();
      refetchCount();
      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const unreadCount = countData?.unreadNotificationCount || 0;
  const notifications: Notification[] = data?.notifications || [];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={sidebarOpen ? "default" : "icon"}
          className={`relative ${
            sidebarOpen ? "w-full justify-start gap-2" : ""
          }`}
        >
          <Bell className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>Notifications</span>}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className={`absolute -top-1 ${
                sidebarOpen ? "-right-1" : "-right-1"
              } h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="h-7 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        !notification.read ? "font-semibold" : ""
                      }`}
                    >
                      {getNotificationText(notification)}
                    </p>
                    {notification.post && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {notification.post.title}
                      </p>
                    )}
                    {notification.comment && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {notification.comment.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
