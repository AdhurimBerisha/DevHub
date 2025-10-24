import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_COMMUNITIES_QUERY,
  JOIN_COMMUNITY_MUTATION,
  LEAVE_COMMUNITY_MUTATION,
} from "@/graphql/communities";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground">
            Join discussions and connect with other developers
          </p>
        </div>

        {loading && <p className="text-center">Loading communities...</p>}
        {error && (
          <p className="text-center text-destructive">
            Failed to load communities: {error.message}
          </p>
        )}

        <div className="grid gap-6">
          {communities.map((community) => (
            <Card
              key={community.id}
              className="hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">
                        {community.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {(community.memberCount ?? 0).toLocaleString()} members
                      </span>
                    </div>
                  </div>
                  {/* Non-owners can join; owners see Manage */}
                  {currentUser &&
                  community.owner &&
                  currentUser.id === community.owner.id ? (
                    <Link to={`/communities/${community.id}/manage`}>
                      <Button variant="ghost">Manage</Button>
                    </Link>
                  ) : currentUser && community.isMember ? (
                    <Button
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
                          if (success) {
                            toast({
                              title: `${
                                currentUser?.username ?? "You"
                              } left the community`,
                              description: message,
                            });
                          } else {
                            toast({
                              title: "Could not leave",
                              description: message,
                            });
                          }
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
                          if (success) {
                            toast({
                              title: `${
                                currentUser?.username ?? "You"
                              } joined the community`,
                              description: message,
                            });
                          } else {
                            toast({
                              title: "Could not join",
                              description: message,
                            });
                          }
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
                <p className="text-muted-foreground mb-3">
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
