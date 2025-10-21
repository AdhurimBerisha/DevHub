import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const tags = [
  { name: "react", count: 1234, description: "A JavaScript library for building user interfaces" },
  { name: "typescript", count: 987, description: "JavaScript with syntax for types" },
  { name: "javascript", count: 1567, description: "The programming language of the web" },
  { name: "webdev", count: 2341, description: "General web development topics" },
  { name: "css", count: 876, description: "Cascading Style Sheets" },
  { name: "nodejs", count: 743, description: "JavaScript runtime built on Chrome's V8" },
  { name: "nextjs", count: 654, description: "The React Framework for Production" },
  { name: "api", count: 532, description: "Application Programming Interfaces" },
  { name: "database", count: 421, description: "Data storage and management" },
  { name: "performance", count: 389, description: "Optimization and speed" },
  { name: "architecture", count: 345, description: "Software design patterns" },
  { name: "tutorial", count: 1876, description: "Step-by-step guides" },
];

export default function Tags() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tags</h1>
          <p className="text-muted-foreground mb-6">Browse topics and discover content</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tags..." 
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Card key={tag.name} className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      #{tag.name}
                    </Badge>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">{tag.count} posts</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tag.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
