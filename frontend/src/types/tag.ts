export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface PopularTag extends Tag {
  postCount?: number;
}
