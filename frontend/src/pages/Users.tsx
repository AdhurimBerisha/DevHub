import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_USERS_QUERY } from "@/graphql/auth";
import {
  SEND_FRIEND_REQUEST,
  REMOVE_FRIEND,
  RESPOND_TO_FRIEND_REQUEST,
} from "@/graphql/friendship";
import { UserCard } from "@/components/UserCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User } from "@/types/graphql";
import { Pagination } from "@/components/Pagination";

type FriendRequest = {
  id: string;
  requester: { id: string; username: string };
  receiver: { id: string; username: string };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
};

export default function Users() {
  const [searchQuery, setSearchQuery] = useState("");
  const [friendsPage, setFriendsPage] = useState(1);
  const [othersPage, setOthersPage] = useState(1);
  const itemsPerPage = 12;

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_USERS_QUERY, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      const usersWithFriendship = data.users.map((u: User) => ({
        ...u,
        friendshipId: u.friendshipId || null,
      }));

      setAllUsers(usersWithFriendship);
      setFriendRequests(data.friendRequests);
    },
  });

  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST);
  const [removeFriend] = useMutation(REMOVE_FRIEND);
  const [respondToFriendRequest] = useMutation(RESPOND_TO_FRIEND_REQUEST);

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredUsers = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const friends = filteredUsers.filter((user) => user.isFriend);
  const nonFriends = filteredUsers.filter((user) => !user.isFriend);

  const totalFriendsPages = Math.ceil(friends.length / itemsPerPage);
  const totalOthersPages = Math.ceil(nonFriends.length / itemsPerPage);

  const paginatedFriends = friends.slice(
    (friendsPage - 1) * itemsPerPage,
    friendsPage * itemsPerPage
  );

  const paginatedOthers = nonFriends.slice(
    (othersPage - 1) * itemsPerPage,
    othersPage * itemsPerPage
  );

  const handleToggleFriend = async (user: User) => {
    try {
      if (user.isFriend) {
        if (!user.friendshipId) {
          toast.error("Cannot remove friend: friendshipId missing");
          return;
        }

        await removeFriend({ variables: { friendshipId: user.friendshipId } });
        toast.success("Friend removed");
        await refetch();

        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, isFriend: false, friendshipId: null, pending: false }
              : u
          )
        );
      } else {
        const result = await sendFriendRequest({
          variables: { receiverId: user.id },
        });
        const newFriendshipId = result.data.sendFriendRequest.id;
        toast.success("Friend request sent");

        await refetch();

        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, pending: true, friendshipId: newFriendshipId }
              : u
          )
        );
      }
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("An unexpected error occurred.");
    }
  };

  const handleRespondRequest = async (
    friendshipId: string,
    accept: boolean
  ) => {
    try {
      const status = accept ? "ACCEPTED" : "REJECTED";

      const result = await respondToFriendRequest({
        variables: { friendshipId, status },
      });

      toast.success(`Friend request ${status.toLowerCase()}`);

      await refetch();

      setFriendRequests((prev) =>
        prev.filter((req) => req.id !== friendshipId)
      );

      if (accept && result.data?.respondToFriendRequest) {
        const updatedFriendship = result.data.respondToFriendRequest;

        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === updatedFriendship.requester.id
              ? {
                  ...u,
                  isFriend: true,
                  pending: false,
                  friendshipId: updatedFriendship.id,
                }
              : u
          )
        );
      }
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
      else toast.error("An unexpected error occurred.");
    }
  };

  const handleGoToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId: string) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              Users & Friends
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-0 w-full"
          />
        </div>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Friend Requests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {friendRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-card border rounded-md flex flex-col items-start"
                >
                  <p className="font-medium">{req.requester.username}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded"
                      onClick={() => handleRespondRequest(req.id, true)}
                    >
                      Accept
                    </button>
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleRespondRequest(req.id, false)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Your Friends</h2>
          {friends.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedFriends.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onMessage={handleMessage}
                    onToggleFriend={() => handleToggleFriend(user)}
                    onClick={() => handleGoToProfile(user.id)}
                  />
                ))}
              </div>
              <Pagination
                currentPage={friendsPage}
                totalPages={totalFriendsPages}
                onPageChange={setFriendsPage}
              />
            </>
          ) : (
            <p className="text-muted-foreground">You have no friends yet.</p>
          )}
        </div>

        {/* Non-friends Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Other Users</h2>
          {nonFriends.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedOthers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onMessage={handleMessage}
                    onToggleFriend={() => handleToggleFriend(user)}
                  />
                ))}
              </div>
              <Pagination
                currentPage={othersPage}
                totalPages={totalOthersPages}
                onPageChange={setOthersPage}
              />
            </>
          ) : (
            <p className="text-muted-foreground">No other users found.</p>
          )}
        </div>
      </main>
    </div>
  );
}
