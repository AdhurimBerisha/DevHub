import {
  User,
  MapPin,
  Calendar,
  Mail,
  Link as LinkIcon,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const userStats = [
  { label: "Posts", value: "42" },
  { label: "Comments", value: "156" },
  { label: "Reputation", value: "1,234" },
  { label: "Following", value: "89" },
];

const userPosts = [
  {
    id: 1,
    title: "Getting Started with Apollo Client",
    excerpt:
      "Apollo Client is a powerful library for managing GraphQL queries and state in the frontend.",
    date: "10/26/2025",
    likes: 2,
    comments: 0,
    tags: ["Apollo", "GraphQL", "React"],
  },
  {
    id: 2,
    title: "Understanding React Hooks",
    excerpt:
      "A deep dive into React Hooks and how they revolutionize component state management.",
    date: "10/27/2025",
    likes: 5,
    comments: 3,
    tags: ["React", "Hooks", "JavaScript"],
  },
];

export default function Profile() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "Adhurim Berisha",
    bio: "Full-stack developer passionate about building amazing web experiences. Love React, GraphQL, and everything JavaScript.",
    email: "adhurimb@gmail.com",
    location: "San Francisco, CA",
    website: "github.com/adhurim",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-6">
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden border-border bg-card">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20"></div>
          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground">
                <User className="h-16 w-16" />
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're
                      done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        placeholder="github.com/username"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save changes</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-4">
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                {formData.name}
              </h1>
              <p className="mb-4 text-muted-foreground">{formData.bio}</p>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{formData.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined January 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <LinkIcon className="h-4 w-4" />
                  <a href="#" className="text-primary hover:underline">
                    {formData.website}
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 border-t border-border pt-4">
              {userStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Posts Section */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Recent Posts
          </h2>
          <div className="space-y-4">
            {userPosts.map((post) => (
              <Card
                key={post.id}
                className="border-border bg-card p-6 transition-colors hover:bg-card/80"
              >
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-foreground">
                    {post.title}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {post.date}
                  </span>
                </div>
                <p className="mb-4 text-muted-foreground">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-secondary text-secondary-foreground"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
