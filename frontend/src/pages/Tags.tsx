import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_POPULAR_TAGS, CREATE_TAG_MUTATION } from "@/graphql/posts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PopularTag } from "@/types/Types";
import { Link } from "react-router-dom";

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
  const [createTag] = useMutation(CREATE_TAG_MUTATION, {
    refetchQueries: [{ query: GET_POPULAR_TAGS }],
    awaitRefetchQueries: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

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

          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              className="pl-10"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Tags Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
            {loading ? (
              <>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Welcome / Create Tag Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-bold">Welcome to Tags!</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Tags help content get discovered and connect you with
                  like-minded developers. Explore the tags below to find topics
                  you’re interested in and join the conversation!
                </p>
                <Button asChild className="w-full mb-2">
                  <Link to="/community-guide">Read Community Guide</Link>
                </Button>
              </CardContent>
            </Card>

            {/* About / Tips Card */}
            <Card>
              <CardContent className="p-4">
                <h2 className="font-bold mb-3">About Tags</h2>
                <p className="text-sm text-muted-foreground">
                  Tags help categorize content so users can easily find posts
                  related to specific topics. Use clear and descriptive names
                  when creating new tags.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
