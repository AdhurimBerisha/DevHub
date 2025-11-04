import { PostCard } from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_POSTS_QUERY, DELETE_POST_MUTATION } from "@/graphql/posts";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types/Types";

export default function Drafts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { loading, error, data, refetch } = useQuery(GET_POSTS_QUERY, {
    variables: {
      limit: 50,
      offset: 0,
      published: false,
      authorId: user?.id,
    },
    skip: !user,
  });

  const [deletePost] = useMutation(DELETE_POST_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Success",
        description: "Draft deleted successfully",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await deletePost({ variables: { id } });
    } catch (err) {
      // Error handled by onError
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Please login to view your drafts
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">My Drafts</h1>
          </div>
          <p className="text-muted-foreground">
            Your unpublished posts. Edit and publish them when ready.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="p-6 border rounded-lg space-y-4 bg-muted/10"
                >
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-destructive">
                Error loading drafts: {error.message}
              </p>
            </CardContent>
          </Card>
        ) : data?.posts?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No drafts yet</p>
              <p className="text-muted-foreground mb-4">
                Create a post and save it as a draft to see it here.
              </p>
              <Button asChild>
                <Link to="/create-post">Create Post</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(data?.posts as Post[])?.map((post: Post) => (
              <Card key={post.id} className="hover:border-primary transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold truncate">{post.title}</h3>
                        <Badge variant="secondary">Draft</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Created {new Date(post.createdAt).toLocaleDateString()}
                        {post.updatedAt && post.updatedAt !== post.createdAt && (
                          <span className="ml-2">
                            • Updated {new Date(post.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground line-clamp-3 mb-4">
                        {post.content.substring(0, 300)}
                        {post.content.length > 300 ? "..." : ""}
                      </p>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 5).map((tag) => (
                            <Badge key={tag.id} variant="outline" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                          {post.tags.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => navigate(`/create-post?editId=${post.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit & Publish
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/create-post?editId=${post.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

