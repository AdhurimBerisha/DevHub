export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  author: User;
  tags: PostTag[];
  comments: Comment[];
  commentCount?: number;
  likes: Like[];
  published: boolean;
  featured: boolean;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostTag {
  tag: Tag;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  isFriend: boolean;
  friendshipId?: string | null;
  pending?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  likes: Like[];
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: string;
  user: User;
  createdAt: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  tagIds?: string[];
  published?: boolean;
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  tagIds?: string[];
  published?: boolean;
  featured?: boolean;
}

export interface PostResponse {
  success: boolean;
  message: string;
  post?: Post;
}
