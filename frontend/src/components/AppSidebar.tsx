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
import { Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Posts", url: "/posts", icon: FileText },
  { title: "Tags", url: "/tags", icon: Tag },
  { title: "Communities", url: "/communities", icon: Users },
  { title: "What's Hot", url: "/hot", icon: TrendingUp },
];

const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, isAuthenticated, signOut, isAdmin } = useAuth();
  const { isDark, toggle } = useTheme();

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        <div className="px-6 py-4 border-b">
          <h1
            className={`font-bold text-xl text-primary transition-opacity ${
              !open && "opacity-0"
            }`}
          >
            DevBlog
          </h1>
        </div>

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

        <div className={`mt-auto p-4 border-t ${!open && "px-2"}`}>
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
                <Switch
                  checked={isDark}
                  onCheckedChange={toggle}
                  aria-label="Toggle dark mode"
                />
              </>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                aria-label="Toggle dark mode"
              >
                {isDark ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          {isAuthenticated && user ? (
            <div className="space-y-3">
              <div
                className={`flex items-center gap-3 ${
                  !open && "justify-center"
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
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
              </div>
              <Button
                onClick={signOut}
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
