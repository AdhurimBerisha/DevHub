import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  MessageCircle, 
  TrendingUp,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

const stats = [
  { title: "Total Posts", value: "1,234", change: "+12%", icon: FileText },
  { title: "Total Users", value: "45,678", change: "+8%", icon: Users },
  { title: "Comments", value: "8,901", change: "+15%", icon: MessageCircle },
  { title: "Page Views", value: "234K", change: "+23%", icon: TrendingUp },
];

const recentPosts = [
  { id: 1, title: "Building Scalable React Applications", author: "Sarah Chen", status: "published", views: 1234 },
  { id: 2, title: "Understanding the Virtual DOM", author: "Mike Johnson", status: "published", views: 987 },
  { id: 3, title: "Modern CSS Techniques", author: "Emma Williams", status: "draft", views: 0 },
  { id: 4, title: "API Design Best Practices", author: "David Park", status: "published", views: 2341 },
  { id: 5, title: "TypeScript Advanced Patterns", author: "Alex Rivera", status: "review", views: 543 },
];

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your blog content and monitor analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-primary">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Posts</CardTitle>
              <Button>Create New Post</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>by {post.author}</span>
                      <Badge 
                        variant={
                          post.status === "published" ? "default" : 
                          post.status === "draft" ? "secondary" : 
                          "outline"
                        }
                      >
                        {post.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {post.views.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
