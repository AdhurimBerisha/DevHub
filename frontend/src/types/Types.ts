export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
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

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    username: string;
  };
  tags: { id: string; name: string }[];
  votes: Vote[];
  comments: { id: string }[];
}
