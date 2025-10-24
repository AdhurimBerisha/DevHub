import { gql } from "@apollo/client";

export const GET_COMMUNITIES_QUERY = gql`
  query GetCommunities($limit: Int, $offset: Int) {
    communities(limit: $limit, offset: $offset) {
      id
      name
      slug
      description
      private
      isMember
      memberCount
      createdAt
      updatedAt
      owner {
        id
        username
      }
    }
  }
`;

export const GET_COMMUNITY_QUERY = gql`
  query GetCommunity($id: ID!) {
    community(id: $id) {
      id
      name
      slug
      description
      private
      isMember
      memberCount
      createdAt
      updatedAt
      owner {
        id
        username
      }
    }
  }
`;

export const CREATE_COMMUNITY_MUTATION = gql`
  mutation CreateCommunity($input: CreateCommunityInput!) {
    createCommunity(input: $input) {
      success
      message
      community {
        id
        name
        slug
        description
        private
        createdAt
        updatedAt
      }
    }
  }
`;

export const JOIN_COMMUNITY_MUTATION = gql`
  mutation JoinCommunity($communityId: ID!) {
    joinCommunity(communityId: $communityId) {
      success
      message
    }
  }
`;

export const LEAVE_COMMUNITY_MUTATION = gql`
  mutation LeaveCommunity($communityId: ID!) {
    leaveCommunity(communityId: $communityId) {
      success
      message
    }
  }
`;

export const GET_COMMUNITY_MEMBERS_QUERY = gql`
  query GetCommunityMembers($communityId: ID!, $limit: Int, $offset: Int) {
    communityMembers(
      communityId: $communityId
      limit: $limit
      offset: $offset
    ) {
      id
      user {
        id
        username
      }
      joinedAt
    }
  }
`;

export const UPDATE_COMMUNITY_MUTATION = gql`
  mutation UpdateCommunity($id: ID!, $input: UpdateCommunityInput!) {
    updateCommunity(id: $id, input: $input) {
      success
      message
      community {
        id
        name
        slug
        description
        private
        updatedAt
      }
    }
  }
`;

export const DELETE_COMMUNITY_MUTATION = gql`
  mutation DeleteCommunity($id: ID!) {
    deleteCommunity(id: $id)
  }
`;
