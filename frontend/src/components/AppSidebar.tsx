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
import { useApolloClient } from "@apollo/client";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Posts", url: "/posts", icon: FileText },
  { title: "Tags", url: "/tags", icon: Tag },
  { title: "Communities", url: "/communities", icon: Users },
  { title: "What's Hot", url: "/hot", icon: TrendingUp },
  { title: "Chat", url: "/chat", icon: MessageSquare },
  { title: "Create Post", url: "/create-post", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, isAuthenticated, isAdmin } = useAuthStore();
  const { signOut } = useAuth();
  const { isDark, toggle } = useTheme();
  const client = useApolloClient();

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
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
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
