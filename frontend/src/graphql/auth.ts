import { gql } from "@apollo/client";

// ================== Queries ==================

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      email
      username
      role
      gender
      avatar
      createdAt
      updatedAt
      isFriend
      friendshipId
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
      gender
      avatar
      emailVerified
      createdAt
      updatedAt
    }
  }
`;

// ================== Mutations ==================

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
        emailVerified
        createdAt
        updatedAt
      }
      token
    }
  }
`;

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
        emailVerified
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
        emailVerified
        createdAt
        updatedAt
      }
      token
    }
  }
`;

export const VERIFY_EMAIL_MUTATION = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      success
      message
      user {
        id
        email
        username
        role
        emailVerified
        createdAt
        updatedAt
      }
      token
    }
  }
`;

export const RESEND_VERIFICATION_EMAIL_MUTATION = gql`
  mutation ResendVerificationEmail {
    resendVerificationEmail {
      success
      message
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      success
      message
      user {
        id
        email
        username
        role
        emailVerified
      }
      token
    }
  }
`;
