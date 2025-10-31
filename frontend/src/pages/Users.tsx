import { useState } from "react";
import { UserCard } from "@/components/UserCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users as UsersIcon, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const mockUsers = [
  { id: "1", name: "Sarah Chen", status: "Active now", isFriend: true },
  { id: "2", name: "Michael Brown", status: "Active 5m ago", isFriend: true },
  { id: "3", name: "Emma Wilson", status: "Active 1h ago", isFriend: true },
  { id: "4", name: "James Taylor", status: "Active 2h ago", isFriend: false },
  {
    id: "5",
    name: "Olivia Martinez",
    status: "Active 3h ago",
    isFriend: false,
  },
  { id: "6", name: "William Davis", status: "Active 5h ago", isFriend: false },
  { id: "7", name: "Sophia Garcia", status: "Active today", isFriend: false },
  {
    id: "8",
    name: "Benjamin Rodriguez",
    status: "Active today",
    isFriend: false,
  },
];

export default function Users() {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "friends">("all");
  const navigate = useNavigate();

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || user.isFriend;
    return matchesSearch && matchesTab;
  });

  const handleToggleFriend = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isFriend: !user.isFriend } : user
      )
    );
    const user = users.find((u) => u.id === userId);
    if (user) {
      toast.success(
        user.isFriend
          ? `Removed ${user.name} from friends`
          : `Added ${user.name} as friend`
      );
    }
  };

  const handleMessage = (userId: string) => {
    navigate("/chat");
    const user = users.find((u) => u.id === userId);
    if (user) {
      toast.success(`Opening chat with ${user.name}`);
    }
  };

  const friendsCount = users.filter((u) => u.isFriend).length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Users & Friends
            </h1>
            <Button variant="default" size="sm" className="hidden sm:flex">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
            {/* Mobile Invite Button */}
            <Button variant="default" size="icon" className="sm:hidden">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Tabs */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-0 w-full"
            />
          </div>

          {/* Tabs */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "secondary"}
              onClick={() => setActiveTab("all")}
              className="flex-1"
            >
              <UsersIcon className="h-4 w-4 mr-2" />
              All Users ({users.length})
            </Button>
            <Button
              variant={activeTab === "friends" ? "default" : "secondary"}
              onClick={() => setActiveTab("friends")}
              className="flex-1"
            >
              Friends ({friendsCount})
            </Button>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div
            className="
              grid grid-cols-1 
              sm:grid-cols-2 
              lg:grid-cols-3 
              xl:grid-cols-4 
              gap-4
            "
          >
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onMessage={handleMessage}
                onToggleFriend={handleToggleFriend}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </main>
    </div>
  );
}
