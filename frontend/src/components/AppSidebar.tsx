import {
  Home,
  FileText,
  Tag,
  Users,
  TrendingUp,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  Moon,
  Sun,
  Settings,
  MessageSquare,
  Users2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { useAuthStore } from "@/stores/authStore";
import { useAuth } from "@/hooks/useAuth";
import { useApolloClient, useQuery } from "@apollo/client";
import { GET_CONVERSATIONS_QUERY } from "@/graphql/chat";
import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Posts", url: "/posts", icon: FileText },
  { title: "Tags", url: "/tags", icon: Tag },
  { title: "Communities", url: "/communities", icon: Users },
  { title: "Users", url: "/users", icon: Users2 },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "What's Hot", url: "/hot", icon: TrendingUp },
  { title: "Create Post", url: "/create-post", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, isAuthenticated, isAdmin, token } = useAuthStore();
  const { signOut } = useAuth();
  const { isDark, toggle } = useTheme();
  const client = useApolloClient();

  const { data: conversationsData, refetch: refetchConversations } = useQuery(
    GET_CONVERSATIONS_QUERY,
    {
      skip: !token || !isAuthenticated,
    }
  );

  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    if (conversationsData?.conversations) {
      const total = conversationsData.conversations.reduce(
        (total: number, conv: { unreadCount?: number }) =>
          total + (conv.unreadCount || 0),
        0
      );
      setTotalUnreadCount(total);
    }
  }, [conversationsData]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    if (!socketService.isConnected()) {
      socketService.connect(token);
    }

    const handleNewMessage = (message: {
      conversationId: string;
      senderId: string;
    }) => {
      if (message.senderId !== user?.id) {
        setTotalUnreadCount((prev) => prev + 1);
        refetchConversations();
      }
    };

    socketService.onMessage(handleNewMessage);

    return () => {
      socketService.offMessage(handleNewMessage);
    };
  }, [token, isAuthenticated, refetchConversations, user?.id]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const interval = setInterval(() => {
      refetchConversations();
    }, 3000);

    return () => clearInterval(interval);
  }, [token, isAuthenticated, refetchConversations]);

  const handleSignOut = async () => {
    await client.clearStore();
    signOut();
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Logo */}
        <div className="px-6 py-4 border-b">
          <h1
            className={`font-bold text-xl text-primary transition-opacity ${
              !open && "opacity-0"
            }`}
          >
            DevHub
          </h1>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className="relative">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.title === "Chat" && totalUnreadCount > 0 && (
                        <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-xs font-medium text-primary-foreground">
                          {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Footer */}
        <div className={`mt-auto p-4 border-t ${!open && "px-2"}`}>
          {/* Theme Toggle */}
          <div
            className={`flex items-center justify-between mb-3 ${
              !open && "justify-center"
            }`}
          >
            {open ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  {isDark ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span>Dark mode</span>
                </div>
                <Switch checked={isDark} onCheckedChange={toggle} />
              </>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggle}>
                {isDark ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <div className="space-y-3">
              {/* Profile Link */}
              <NavLink
                to="/profile"
                className={`flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors ${
                  !open && "justify-center"
                }`}
              >
                {open && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                )}
              </NavLink>

              {/* Logout */}
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
                size={open ? "default" : "icon"}
              >
                <LogOut className="h-4 w-4" />
                {open && <span className="ml-2">Sign Out</span>}
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="default"
              className="w-full"
              size={open ? "default" : "icon"}
            >
              <NavLink to="/auth">
                <LogIn className="h-4 w-4" />
                {open && <span className="ml-2">Sign In</span>}
              </NavLink>
            </Button>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
