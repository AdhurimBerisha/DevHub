import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      user {
        id
        email
        username
        role
        createdAt
        updatedAt
      }
      token
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      success
      message
      user {
        id
        email
        username
        role
        createdAt
        updatedAt
      }
      token
    }
  }
`;

export const LOGIN_WITH_GOOGLE_MUTATION = gql`
  mutation LoginWithGoogle($token: String!) {
    loginWithGoogle(token: $token) {
      success
      message
      user {
        id
        email
        username
        role
        createdAt
        updatedAt
      }
      token
    }
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsersAndFriendRequests {
    users {
      id
      email
      username
      role
      isFriend
      friendshipId
      createdAt
      updatedAt
    }
    friendRequests {
      id
      status
      requester {
        id
        username
      }
      receiver {
        id
        username
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      username
      role
      avatar
      createdAt
      updatedAt
    }
  }
`;

export const GET_USER_POSTS = gql`
  query GetUserPosts($authorId: ID!) {
    posts(authorId: $authorId) {
      id
      title
      content
      createdAt
      viewCount
      commentCount
      tags {
        tag {
          id
          name
        }
      }
      votes {
        value
      }
      comments {
        id
      }
    }
  }
`;
