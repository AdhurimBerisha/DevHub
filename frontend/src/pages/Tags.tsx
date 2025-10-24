import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_POPULAR_TAGS, CREATE_TAG_MUTATION } from "@/graphql/posts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PopularTag, Tag } from "@/types/tag";

function TagSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="h-7 w-32 bg-muted rounded" />
          <div className="h-4 w-16 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-4 w-full bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

export default function Tags() {
  const { data, loading, error } = useQuery(GET_POPULAR_TAGS);
  const [createTag, { loading: creating }] = useMutation(CREATE_TAG_MUTATION, {
    refetchQueries: [{ query: GET_POPULAR_TAGS }],
    awaitRefetchQueries: true,
  });

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const popularTags = data?.popularTags ?? [];

  const filteredTags = popularTags.filter((tag: PopularTag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <Input
                placeholder="Search tags..."
                className="pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <h1 className="font-bold text-2xl">Popular Tags🔥:</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            // Show 6 skeleton cards while loading
            <>
              <TagSkeleton />
              <TagSkeleton />
              <TagSkeleton />
              <TagSkeleton />
              <TagSkeleton />
              <TagSkeleton />
            </>
          ) : error ? (
            <div className="col-span-full">
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive text-center">
                    Failed to load tags: {String(error.message)}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    {searchQuery
                      ? `No tags found matching "${searchQuery}"`
                      : "No tags available yet"}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredTags.map((tag: PopularTag) => (
              <Card
                key={tag.id}
                className="hover:shadow-lg transition-all duration-300 hover:border-primary"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      <Badge
                        variant="secondary"
                        className="text-base px-3 py-1"
                        style={{
                          backgroundColor: tag.color || "var(--secondary)",
                        }}
                      >
                        #{tag.name}
                      </Badge>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {tag.postCount ?? 0} posts
                    </span>
                  </div>
                </CardHeader>
                <CardContent></CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
