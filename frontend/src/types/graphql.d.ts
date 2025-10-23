export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  tags: PostTag[];
  comments: Comment[];
  likes: Like[];
  published: boolean;
  featured: boolean;
  viewCount: number;
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
