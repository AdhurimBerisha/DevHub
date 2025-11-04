import { gql } from "@apollo/client";

// ================== Queries ==================

export const GET_POSTS_QUERY = gql`
  query GetPosts(
    $limit: Int
    $offset: Int
    $published: Boolean
    $communityId: ID
    $authorId: ID
  ) {
    posts(
      limit: $limit
      offset: $offset
      published: $published
      communityId: $communityId
      authorId: $authorId
    ) {
      id
      communityId
      title
      content
      image
      published
      featured
      createdAt
      updatedAt
      author {
        id
        username
        email
      }
      community {
        id
        name
        slug
        description
        memberCount
      }
      tags {
        id
        name
        color
      }
      commentCount
      comments {
        id
        content
        createdAt
        parentCommentId
        author {
          id
          username
        }
        replies {
          id
          content
          createdAt
          parentCommentId
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
      votes {
        id
        value
        user {
          id
          username
        }
      }
      isSaved
    }
  }
`;

export const GET_POPULAR_TAGS = gql`
  query GetPopularTags {
    popularTags {
      id
      name
      color
      postCount
      createdAt
    }
  }
`;

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

export const GET_SAVED_POSTS_QUERY = gql`
  query GetSavedPosts($limit: Int, $offset: Int) {
    savedPosts(limit: $limit, offset: $offset) {
      id
      communityId
      title
      content
      image
      published
      featured
      createdAt
      updatedAt
      author {
        id
        username
        email
      }
      community {
        id
        name
        slug
        description
        memberCount
      }
      tags {
        id
        name
        color
      }
      commentCount
      votes {
        id
        value
        user {
          id
          username
        }
      }
      isSaved
    }
  }
`;

export const GET_POST_QUERY = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      image
      communityId
      published
      featured
      createdAt
      updatedAt
      author {
        id
        username
        email
      }
      community {
        id
        name
        slug
        description
        memberCount
      }
      tags {
        id
        name
        color
      }
      commentCount
      comments {
        id
        content
        createdAt
        parentCommentId
        author {
          id
          username
        }
        replies {
          id
          content
          createdAt
          parentCommentId
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
      votes {
        id
        value
        user {
          id
          username
        }
      }
      isSaved
    }
  }
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($authorId: ID!) {
    posts(authorId: $authorId, published: true) {
      id
      title
      content
      image
      communityId
      published
      featured
      createdAt
      updatedAt
      author {
        id
        username
        email
      }
      community {
        id
        name
        slug
        description
        memberCount
      }
      tags {
        id
        name
        color
      }
      commentCount
      votes {
        id
        value
        user {
          id
          username
        }
      }
      isSaved
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
        image
        communityId
        published
        featured
        createdAt
        updatedAt
        author {
          id
          username
          email
        }
        community {
          id
          name
          slug
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
        image
        communityId
        published
        featured
        createdAt
        updatedAt
        author {
          id
          username
          email
        }
        community {
          id
          name
          slug
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
        parentCommentId
        author {
          id
          username
        }
        post {
          id
        }
        votes {
          id
          value
          user {
            id
            username
          }
        }
        replies {
          id
          content
          createdAt
          author {
            id
            username
          }
        }
      }
    }
  }
`;

export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      success
      message
      comment {
        id
        content
        createdAt
        updatedAt
        parentCommentId
        author {
          id
          username
        }
        post {
          id
        }
        votes {
          id
          value
          user {
            id
            username
          }
        }
        replies {
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
  }
`;

export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
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
      post {
        id
      }
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

export const VOTE_COMMENT_MUTATION = gql`
  mutation VoteComment($commentId: ID!, $value: Int!) {
    voteComment(commentId: $commentId, value: $value) {
      id
      value
      user {
        id
        username
      }
    }
  }
`;

export const SAVE_POST_MUTATION = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId)
  }
`;

export const UNSAVE_POST_MUTATION = gql`
  mutation UnsavePost($postId: ID!) {
    unsavePost(postId: $postId)
  }
`;
