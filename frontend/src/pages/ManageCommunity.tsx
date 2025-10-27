import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  GET_COMMUNITY_QUERY,
  UPDATE_COMMUNITY_MUTATION,
} from "@/graphql/communities";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function ManageCommunity() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const { data, loading, error } = useQuery(GET_COMMUNITY_QUERY, {
    variables: { id },
    skip: !id,
  });

  const [updateCommunity, { loading: updating }] = useMutation(
    UPDATE_COMMUNITY_MUTATION,
    {
      awaitRefetchQueries: true,
    }
  );

  const community = data?.community;

  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");

  React.useEffect(() => {
    if (community) {
      setName(community.name || "");
      setSlug(community.slug || "");
      setDescription(community.description || "");
    }
  }, [community]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (error)
    return (
      <p className="p-6 text-destructive">Error: {String(error.message)}</p>
    );
  if (!community) return <p className="p-6">Community not found</p>;

  if (!currentUser || community.owner?.id !== currentUser.id) {
    return <p className="p-6">Not authorized to manage this community.</p>;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateCommunity({
        variables: { id, input: { name, slug, description } },
      });
      const success = res?.data?.updateCommunity?.success ?? false;
      const message = res?.data?.updateCommunity?.message ?? "Updated";
      if (success) {
        toast({ title: "Updated", description: message });
        navigate("/communities");
      } else {
        toast({ title: "Failed", description: message });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: "Error", description: message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Manage Community</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description ?? ""}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button type="submit" disabled={updating}>
                  {updating ? "Saving..." : "Save changes"}
                </Button>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
