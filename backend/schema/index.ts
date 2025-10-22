import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime

  type Query {
    hello: String
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }

  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateUserInput {
    email: String!
    username: String!
    password: String!
  }

  input UpdateUserInput {
    email: String
    username: String
    password: String
  }
`;
