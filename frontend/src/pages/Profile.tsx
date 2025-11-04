import { User, Calendar, Mail, Edit, Loader2, Upload, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
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
import { useNavigate, useParams } from "react-router-dom";
import { Pagination } from "@/components/Pagination";
import { useAuthStore } from "@/stores/authStore";
import { useProfileStore } from "@/stores/profileStore";
import { GET_CURRENT_USER, UPDATE_USER } from "@/graphql/userSettings";
import { GET_USER_QUERY } from "@/graphql/auth";
import { GET_USER_POSTS } from "@/graphql/posts";

const POSTS_PER_PAGE = 5;

export default function Profile() {
  const { toast } = useToast();
  const client = useApolloClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const isOwnProfile = !id;

  const {
    isEditDialogOpen,
    formData,
    currentPage,
    avatarUploading,
    avatarPreview,
    setEditDialogOpen,
    setFormData,
    updateFormData,
    resetFormData,
    setCurrentPage,
    setAvatarUploading,
    setAvatarPreview,
    clearAvatarPreview,
  } = useProfileStore();

  const { token } = useAuthStore();

  const {
    loading: userLoading,
    error: userError,
    data: userData,
  } = useQuery(isOwnProfile ? GET_CURRENT_USER : GET_USER_QUERY, {
    variables: isOwnProfile ? {} : { id },
    skip: isOwnProfile && !token,
    fetchPolicy: "network-only",
  });

  const userId = isOwnProfile ? userData?.currentUser?.id : userData?.user?.id;

  const {
    loading: postsLoading,
    data: postsData,
    error: postsError,
  } = useQuery(GET_USER_POSTS, {
    variables: { authorId: userId },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  const [updateUser] = useMutation(UPDATE_USER, {
    refetchQueries: [{ query: GET_CURRENT_USER }],
  });

  useEffect(() => {
    if (isEditDialogOpen && userData) {
      const currentUser = isOwnProfile ? userData?.currentUser : userData?.user;
      if (currentUser) {
        setFormData({
          username: currentUser.username || "",
          email: currentUser.email || "",
        });
        clearAvatarPreview();
      }
    }
  }, [
    isEditDialogOpen,
    userData,
    isOwnProfile,
    setFormData,
    clearAvatarPreview,
  ]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const fileInput = document.getElementById(
      "avatar-upload-dialog"
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      if (!avatarPreview) {
        toast({
          title: "No file selected",
          description: "Please select an image to upload.",
          variant: "destructive",
        });
      }
      return;
    }

    setAvatarUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("avatar", file);

      const BACKEND_URL =
        import.meta.env.VITE_GRAPHQL_URL?.replace("/graphql", "") ||
        "http://localhost:4000";
      const token = useAuthStore.getState().token;

      const response = await fetch(`${BACKEND_URL}/api/upload/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload avatar");
      }

      const data = await response.json();

      await updateUser({
        variables: {
          id: userData?.currentUser?.id || userData?.user?.id,
          input: { avatar: data.avatar },
        },
      });

      toast({
        title: "Avatar updated",
        description: "Your avatar has been successfully updated.",
      });

      await client.refetchQueries({ include: "active" });

      clearAvatarPreview();
      if (fileInput) fileInput.value = "";
    } catch (error: unknown) {
      console.error("Avatar upload error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload avatar. Please try again.";
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCancelAvatarUpload = () => {
    clearAvatarPreview();
    const fileInput = document.getElementById(
      "avatar-upload-dialog"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const currentUser = isOwnProfile ? userData?.currentUser : userData?.user;
      if (!currentUser) return;

      await updateUser({
        variables: {
          id: currentUser.id,
          input: { username: formData.username, email: formData.email },
        },
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setEditDialogOpen(false);
      await client.refetchQueries({ include: "active" });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

  const formatPostDate = (dateString: string) =>
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
      (sum, post) => sum + (post.commentCount || 0),
      0
    );

    return {
      posts: posts.length,
      comments: totalComments,
      reputation: totalLikes * 10,
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
        </Card>
      </div>
    );
  }

  const user = isOwnProfile ? userData?.currentUser : userData?.user;

  if (!user) {
    if (isOwnProfile) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-2">Please sign in</h2>
            <p className="text-muted-foreground mb-4">
              You need to be signed in to view your profile.
            </p>
            <Button onClick={() => navigate("/auth")}>Go to Sign In</Button>
          </Card>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-2">User not found</h2>
            <p className="text-muted-foreground">
              The user profile you're looking for doesn't exist.
            </p>
          </Card>
        </div>
      );
    }
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
              <Avatar className="h-32 w-32 border-4 border-card">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
                  {user?.username?.charAt(0).toUpperCase() || (
                    <User className="h-16 w-16" />
                  )}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground hover:bg-primary/90 transition"
                >
                  {avatarUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                </label>
              )}

              {/* Edit only for own profile */}
              {isOwnProfile && (
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setEditDialogOpen}
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
                        Make changes to your profile here. Click save when
                        you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Avatar Upload Section */}
                      <div className="space-y-2">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-20 w-20 border-2 border-border">
                              <AvatarImage
                                src={avatarPreview || user?.avatar}
                                alt={user?.username}
                              />
                              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                {user?.username?.charAt(0).toUpperCase() || (
                                  <User className="h-10 w-10" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <label htmlFor="avatar-upload-dialog">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full cursor-pointer"
                                  disabled={avatarUploading}
                                  onClick={() => {
                                    document
                                      .getElementById("avatar-upload-dialog")
                                      ?.click();
                                  }}
                                >
                                  {avatarPreview
                                    ? "Change Image"
                                    : "Choose Image"}
                                </Button>
                              </label>
                              <input
                                id="avatar-upload-dialog"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarSelect}
                                disabled={avatarUploading}
                              />
                            </div>
                            {avatarPreview && (
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={handleAvatarUpload}
                                  disabled={avatarUploading}
                                  className="flex-1"
                                >
                                  {avatarUploading ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    "Upload"
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelAvatarUpload}
                                  disabled={avatarUploading}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              JPG, PNG or GIF. Max size 5MB
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) =>
                            updateFormData({ username: e.target.value })
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
                            updateFormData({ email: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSubmit}>Save changes</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
                const comments = post.commentCount || 0;
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
