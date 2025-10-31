import { User, Calendar, Mail, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, gql, useApolloClient } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@/components/Pagination";

const POSTS_PER_PAGE = 5;

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      id
      email
      username
      role
      createdAt
      updatedAt
    }
  }
`;

const GET_USER_POSTS = gql`
  query GetUserPosts($authorId: ID!) {
    posts(authorId: $authorId) {
      id
      title
      content
      createdAt
      viewCount
      votes {
        value
      }
      comments {
        id
      }
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      username
      role
      updatedAt
    }
  }
`;

export default function Profile() {
  const { toast } = useToast();
  const client = useApolloClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(GET_CURRENT_USER, { fetchPolicy: "network-only" });

  const { loading: postsLoading, data: postsData } = useQuery(GET_USER_POSTS, {
    variables: { authorId: userData?.currentUser?.id },
    skip: !userData?.currentUser?.id,
    fetchPolicy: "network-only",
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser({
        variables: {
          id: userData.currentUser.id,
          input: {
            username: formData.username,
            email: formData.email,
          },
        },
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setOpen(false);
      await client.refetchQueries({ include: "active" });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const formatPostDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

  const calculateStats = () => {
    const posts = postsData?.posts || [];
    const totalLikes = posts.reduce(
      (sum, post) =>
        sum + (post.votes?.filter((v) => v.value === 1).length || 0),
      0
    );
    const totalComments = posts.reduce(
      (sum, post) => sum + (post.comments?.length || 0),
      0
    );

    return {
      posts: posts.length,
      comments: totalComments,
      reputation: totalLikes * 10,
      views: posts.reduce((sum, post) => sum + (post.viewCount || 0), 0),
    };
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-2">
            Error loading profile
          </h2>
          <p className="text-muted-foreground">{userError.message}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Make sure you're logged in and try refreshing the page.
          </p>
        </Card>
      </div>
    );
  }

  const user = userData?.currentUser;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">Not logged in</h2>
          <p className="text-muted-foreground">
            Please log in to view your profile.
          </p>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();
  const userPosts = postsData?.posts || [];

  const totalPages = Math.ceil(userPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedPosts = userPosts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl p-6">
        {/* Profile Card */}
        <Card className="mb-6 overflow-hidden border-border bg-card">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20"></div>
          <div className="px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground">
                <User className="h-16 w-16" />
              </div>

              <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                  setOpen(isOpen);
                  if (isOpen)
                    setFormData({ username: user.username, email: user.email });
                }}
              >
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
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
                      <Button onClick={handleSubmit}>Save changes</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <h1 className="mb-2 text-3xl font-bold">{user.username}</h1>
            <p className="mb-4 text-muted-foreground">
              {user.role === "ADMIN" ? "Administrator" : "Community Member"}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 border-t border-border pt-4 mt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.posts}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.comments}</div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.reputation}</div>
                <div className="text-sm text-muted-foreground">Reputation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.views}</div>
                <div className="text-sm text-muted-foreground">Views</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Posts */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Recent Posts</h2>
          {postsLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : paginatedPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No posts yet. Start sharing your thoughts!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {paginatedPosts.map((post) => {
                const likes =
                  post.votes?.filter((v) => v.value === 1).length || 0;
                const comments = post.comments?.length || 0;
                return (
                  <Card
                    key={post.id}
                    className="p-6 bg-card cursor-pointer border border-border hover:border-primary transition"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{post.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatPostDate(post.createdAt)}
                      </span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {post.content}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>👁️ {post.viewCount}</span>
                      <span>❤️ {likes}</span>
                      <span>💬 {comments}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
