export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  postCount?: number;
}

export interface PopularTag extends Tag {
  postCount?: number;
}

export interface Vote {
  id: string;
  value: number;
  user: {
    id: string;
  };
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  memberCount?: number;
  description?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: string;
  updatedAt?: string;
  author: {
    username: string;
  };
  community?: Community | null;
  tags: { id: string; name: string }[];
  votes: Vote[];
  comments: { id: string }[];
  commentCount?: number;
  published: boolean;
  isSaved?: boolean;
}
