import { gql } from "graphql-tag";

export const communitiesTypeDefs = gql`
  type Community {
    id: ID!
    name: String!
    slug: String!
    description: String
    private: Boolean!
    owner: User!
    isMember: Boolean!
    memberCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type Query {
    communities(limit: Int, offset: Int): [Community!]!
    community(id: ID!): Community
  }

  type JoinResponse {
    success: Boolean!
    message: String!
  }

  extend type Mutation {
    joinCommunity(communityId: ID!): JoinResponse!
    leaveCommunity(communityId: ID!): JoinResponse!
    updateCommunity(id: ID!, input: UpdateCommunityInput!): CommunityResponse!
    createCommunity(input: CreateCommunityInput!): CommunityResponse!
  }

  input UpdateCommunityInput {
    name: String
    slug: String
    description: String
    private: Boolean
  }

  input CreateCommunityInput {
    name: String!
    slug: String!
    description: String
    private: Boolean
  }

  type CommunityResponse {
    success: Boolean!
    message: String!
    community: Community
  }
`;
