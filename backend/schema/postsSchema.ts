import { gql } from "graphql-tag";

export const postsTypeDefs = gql`
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    community: Community
    communityId: ID
    tags: [Tag!]!
    comments: [Comment!]!
    votes: [Vote!]! # all votes
    voteCount: Int! # computed as sum of vote values
    published: Boolean!
    featured: Boolean!
    viewCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    parentCommentId: ID
    parentComment: Comment
    replies: [Comment!]!
    votes: [Vote!]! # all votes
    voteCount: Int! # computed sum of vote values
    likes: [Vote!]! # votes with value = 1
    dislikes: [Vote!]! # votes with value = -1
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Vote {
    id: ID!
    user: User!
    value: Int! # +1 = upvote, -1 = downvote
    post: Post
    comment: Comment
    createdAt: DateTime!
  }

  type Tag {
    id: ID!
    name: String!
    color: String
    posts: [Post!]!
    postCount: Int
    createdAt: DateTime!
  }

  input CreatePostInput {
    title: String!
    content: String!
    tagIds: [ID!]
    published: Boolean
    communityId: ID
  }

  input UpdatePostInput {
    title: String
    content: String
    tagIds: [ID!]
    published: Boolean
    featured: Boolean
    communityId: ID
  }

  input CreateTagInput {
    name: String!
    color: String
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
    parentCommentId: ID
  }

  type PostResponse {
    success: Boolean!
    message: String!
    post: Post
  }

  type TagResponse {
    success: Boolean!
    message: String!
    tag: Tag
  }

  type CommentResponse {
    success: Boolean!
    message: String!
    comment: Comment
  }

  extend type Query {
    posts(
      limit: Int
      offset: Int
      published: Boolean
      communityId: ID
    ): [Post!]!
    post(id: ID!): Post
    tags: [Tag!]!
    popularTags: [Tag!]!
    tag(id: ID!): Tag
    comments(postId: ID!): [Comment!]!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): PostResponse!
    updatePost(id: ID!, input: UpdatePostInput!): PostResponse!
    deletePost(id: ID!): Boolean!
    createTag(input: CreateTagInput!): TagResponse!
    updateTag(id: ID!, input: CreateTagInput!): TagResponse!
    deleteTag(id: ID!): Boolean!
    addComment(input: CreateCommentInput!): CommentResponse!
    updateComment(id: ID!, content: String!): CommentResponse!
    deleteComment(id: ID!): Boolean!

    # New vote mutations
    votePost(postId: ID!, value: Int!): Vote!
    voteComment(commentId: ID!, value: Int!): Vote
  }
`;
