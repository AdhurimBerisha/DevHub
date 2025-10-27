import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_COMMUNITIES_QUERY,
  JOIN_COMMUNITY_MUTATION,
  LEAVE_COMMUNITY_MUTATION,
} from "@/graphql/communities";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type Community = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  memberCount?: number | null;
  owner?: { id: string; username: string } | null;
  isMember?: boolean;
};

export default function Communities() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading, error } = useQuery(GET_COMMUNITIES_QUERY, {
    variables: { limit: 50, offset: 0 },
  });

  const communities: Community[] = data?.communities ?? [];
  const currentUser = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [joinCommunity, { loading: joining }] = useMutation(
    JOIN_COMMUNITY_MUTATION,
    {
      refetchQueries: [
        { query: GET_COMMUNITIES_QUERY, variables: { limit: 50, offset: 0 } },
      ],
      awaitRefetchQueries: true,
    }
  );
  const [leaveCommunity, { loading: leaving }] = useMutation(
    LEAVE_COMMUNITY_MUTATION,
    {
      refetchQueries: [
        { query: GET_COMMUNITIES_QUERY, variables: { limit: 50, offset: 0 } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Communities</h1>
          <p className="text-muted-foreground">
            Join discussions and connect with other developers
          </p>
        </div>

        {/* ✅ Search Bar - centered and styled */}
        <div className="flex justify-center mb-10">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              className="pl-10 py-5 rounded-xl border-muted focus-visible:ring-1 focus-visible:ring-primary"
              onChange={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </div>
        </div>

        {/* Status messages */}
        {loading && <p className="text-center">Loading communities...</p>}
        {error && (
          <p className="text-center text-destructive">
            Failed to load communities: {error.message}
          </p>
        )}
        {!loading && filteredCommunities.length === 0 && (
          <p className="text-center text-muted-foreground mt-10">
            No communities found for "{searchTerm}"
          </p>
        )}

        {/* ✅ Responsive grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCommunities.map((community) => (
            <Card
              key={community.id}
              className="hover:shadow-lg transition-all duration-300 border-muted/40 rounded-xl"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-semibold leading-tight">
                        <Link
                          to={`/communities/${community.id}`}
                          className="hover:underline"
                        >
                          {community.name}
                        </Link>
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {(community.memberCount ?? 0).toLocaleString()} members
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  {currentUser &&
                  community.owner &&
                  currentUser.id === community.owner.id ? (
                    <Link to={`/communities/${community.id}/manage`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  ) : currentUser && community.isMember ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={leaving}
                      onClick={async () => {
                        try {
                          const res = await leaveCommunity({
                            variables: { communityId: community.id },
                          });
                          const success =
                            res?.data?.leaveCommunity?.success ?? false;
                          const message =
                            res?.data?.leaveCommunity?.message ??
                            "Left community";
                          toast({
                            title: success
                              ? `${
                                  currentUser?.username ?? "You"
                                } left the community`
                              : "Could not leave",
                            description: message,
                          });
                        } catch (err) {
                          const message =
                            err instanceof Error ? err.message : String(err);
                          toast({ title: "Error", description: message });
                        }
                      }}
                    >
                      {leaving ? "Leaving..." : "Leave"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={joining}
                      onClick={async () => {
                        try {
                          const res = await joinCommunity({
                            variables: { communityId: community.id },
                          });
                          const success =
                            res?.data?.joinCommunity?.success ?? true;
                          const message =
                            res?.data?.joinCommunity?.message ??
                            "Joined community";
                          toast({
                            title: success
                              ? `${
                                  currentUser?.username ?? "You"
                                } joined the community`
                              : "Could not join",
                            description: message,
                          });
                        } catch (err) {
                          const message =
                            err instanceof Error ? err.message : String(err);
                          toast({
                            title: "Error",
                            description: message ?? "Failed to join community",
                          });
                        }
                      }}
                    >
                      {joining ? "Joining..." : "Join"}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {community.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
