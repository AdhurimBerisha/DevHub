import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Trash2,
  FileText,
  Users,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import {
  GET_ADMIN_STATS,
  GET_RECENT_POSTS,
  DELETE_POST,
} from "@/graphql/admin";
import { Post } from "@/types/Types";

const POSTS_PER_PAGE = 5;

export default function Admin() {
  const { data: statsData, loading: statsLoading } = useQuery(GET_ADMIN_STATS);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: postsData, refetch } = useQuery(GET_RECENT_POSTS, {
    variables: {
      limit: POSTS_PER_PAGE,
      offset: (currentPage - 1) * POSTS_PER_PAGE,
    },
    fetchPolicy: "network-only", // ensures refetch returns fresh data
  });

  const [deletePost] = useMutation(DELETE_POST);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  if (statsLoading) return <p>Loading dashboard...</p>;

  const stats = [
    {
      title: "Total Posts",
      value: statsData?.adminStats.totalPosts || 0,
      icon: FileText,
    },
    {
      title: "Total Users",
      value: statsData?.adminStats.totalUsers || 0,
      icon: Users,
    },
    {
      title: "Total Communities",
      value: statsData?.adminStats.totalCommunities || 0,
      icon: MessageCircle,
    },
    {
      title: "Page Views",
      value: statsData?.adminStats.totalPageViews || 0,
      icon: TrendingUp,
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      setLoadingDelete(id);
      await deletePost({ variables: { id } });
      setLoadingDelete(null);
      refetch();
    } catch (err) {
      console.error("Failed to delete post:", err);
      setLoadingDelete(null);
    }
  };

  const totalPosts = statsData?.adminStats.totalPosts || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {postsData?.recentPosts.map((post: Post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>by {post.author.username}</span>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "published" : "draft"}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loadingDelete === post.id}
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-2">
              <Button
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </Button>
              <span className="px-2 py-1 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
