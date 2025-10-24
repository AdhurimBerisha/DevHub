import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import type { Tag } from "@/types/tag";

type LocalTag = Tag & {
  description?: string | null;
  count?: number;
  _count?: { posts?: number };
};
import { useQuery, useMutation } from "@apollo/client";
import { GET_TAGS_QUERY, CREATE_TAG_MUTATION } from "@/graphql/posts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Tags() {
  const { data, loading, error } = useQuery(GET_TAGS_QUERY);
  const [createTag, { loading: creating }] = useMutation(CREATE_TAG_MUTATION, {
    refetchQueries: [{ query: GET_TAGS_QUERY }],
    awaitRefetchQueries: true,
  });
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please provide a tag name.",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await createTag({
        variables: { input: { name: name.trim(), color: color || null } },
      });
      const success = res?.data?.createTag?.success ?? false;
      const message = res?.data?.createTag?.message ?? "";
      if (success) {
        toast({
          title: "Tag created",
          description: message || "Tag created successfully",
        });
        setName("");
        setColor("");
      } else {
        toast({
          title: "Could not create tag",
          description: message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive",
      });
    }
  };

  const tags = data?.tags ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tags</h1>
          <p className="text-muted-foreground mb-6">
            Browse topics and discover content
          </p>

          <div className="flex gap-4 items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tags..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Tag name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Color (optional)"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div>Loading tags...</div>
        ) : error ? (
          <div className="text-destructive">
            Failed to load tags: {String(error.message)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map((tag: LocalTag) => (
              <Card
                key={tag.id ?? tag.name}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      <Badge
                        variant="secondary"
                        className="text-base px-3 py-1"
                      >
                        #{tag.name}
                      </Badge>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {tag._count?.posts ?? tag.count ?? 0} posts
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {tag.description ?? ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
