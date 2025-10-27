import { gql } from "@apollo/client";

// ================== Queries ==================

export const GET_POSTS_QUERY = gql`
  query GetPosts(
    $limit: Int
    $offset: Int
    $published: Boolean
    $communityId: ID
  ) {
    posts(
      limit: $limit
      offset: $offset
      published: $published
      communityId: $communityId
    ) {
      id
      communityId
      title
      content
      published
      featured
      viewCount
      createdAt
      updatedAt
      author {
        id
        username
        email
      }
      tags {
        id
        name
        color
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
        }
        votes {
          id
          value
          user {
            id
            username
          }
        }
      }
      votes {
        id
        value
        user {
          id
          username
        }
      }
    }
  }
`;

export const GET_POST_QUERY = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      communityId
      published
      featured
      viewCount
      createdAt
      updatedAt
      author {
        id
        username
        email
      }
      tags {
        id
        name
        color
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
        }
        votes {
          id
          value
          user {
            id
            username
          }
        }
      }
      votes {
        id
        value
        user {
          id
          username
        }
      }
    }
  }
`;

// ================== Mutations ==================

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      success
      message
      post {
        id
        title
        content
        communityId
        published
        featured
        viewCount
        createdAt
        updatedAt
        author {
          id
          username
          email
        }
        tags {
          id
          name
          color
        }
        votes {
          id
          value
          user {
            id
            username
          }
        }
      }
    }
  }
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      success
      message
      post {
        id
        title
        content
        communityId
        published
        featured
        viewCount
        createdAt
        updatedAt
        author {
          id
          username
          email
        }
        tags {
          id
          name
          color
        }
        votes {
          id
          value
          user {
            id
            username
          }
        }
      }
    }
  }
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const ADD_COMMENT_MUTATION = gql`
  mutation AddComment($input: CreateCommentInput!) {
    addComment(input: $input) {
      success
      message
      comment {
        id
        content
        createdAt
        author {
          id
          username
        }
        votes {
          id
          value
          user {
            id
            username
          }
        }
      }
    }
  }
`;

export const VOTE_POST_MUTATION = gql`
  mutation VotePost($postId: ID!, $value: Int!) {
    votePost(postId: $postId, value: $value) {
      id
      value
      user {
        id
        username
      }
    }
  }
`;

// ================== Tags ==================

export const GET_TAGS_QUERY = gql`
  query GetTags {
    tags {
      id
      name
      color
      createdAt
    }
  }
`;

export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      success
      message
      tag {
        id
        name
        color
        createdAt
      }
    }
  }
`;

export const GET_POPULAR_TAGS = gql`
  query GetPopularTags {
    popularTags {
      id
      name
      postCount
    }
  }
`;
