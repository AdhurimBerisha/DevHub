import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";

const communities = [
  {
    name: "React Developers",
    members: 12453,
    description: "A community for React enthusiasts to share knowledge and best practices",
    tags: ["react", "javascript", "frontend"],
    trending: true
  },
  {
    name: "TypeScript Masters",
    members: 8976,
    description: "Deep dive into TypeScript patterns, types, and advanced techniques",
    tags: ["typescript", "javascript"],
    trending: true
  },
  {
    name: "Full Stack Builders",
    members: 15234,
    description: "End-to-end web development discussions and project showcases",
    tags: ["fullstack", "webdev", "backend"],
    trending: false
  },
  {
    name: "UI/UX Designers",
    members: 6789,
    description: "Design systems, user experience, and interface best practices",
    tags: ["design", "ux", "ui"],
    trending: false
  },
  {
    name: "DevOps & Cloud",
    members: 9234,
    description: "Infrastructure, deployment, CI/CD, and cloud architecture",
    tags: ["devops", "cloud", "aws"],
    trending: true
  },
  {
    name: "API Development",
    members: 5432,
    description: "RESTful APIs, GraphQL, and backend architecture patterns",
    tags: ["api", "backend", "graphql"],
    trending: false
  }
];

export default function Communities() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Communities</h1>
          <p className="text-muted-foreground">Join discussions and connect with other developers</p>
        </div>

        <div className="grid gap-6">
          {communities.map((community) => (
            <Card key={community.name} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{community.name}</CardTitle>
                      {community.trending && (
                        <Badge variant="default" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{community.members.toLocaleString()} members</span>
                    </div>
                  </div>
                  <Button>Join</Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{community.description}</p>
                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
