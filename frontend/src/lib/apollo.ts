import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "@/stores/authStore";

// HTTP link to GraphQL endpoint
const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql",
});

// Auth link to add token to requests
const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Error link to handle auth errors
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);

      // If it's a 401 error, clear auth and redirect to login
      if ("statusCode" in networkError && networkError.statusCode === 401) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth";
      }
    }
  }
);

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: {
        fields: {
          createdAt: {
            read: (value) => new Date(value),
          },
          updatedAt: {
            read: (value) => new Date(value),
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

