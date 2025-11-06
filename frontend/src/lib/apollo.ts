import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useAuthStore } from "@/stores/authStore";

const GRAPHQL_URL =
  (import.meta.env.VITE_GRAPHQL_URL as string) ||
  "http://localhost:4001/graphql";

const httpLink = createHttpLink({
  uri: GRAPHQL_URL,
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        const isAuthError =
          message === "Unauthorized" ||
          message === "Not authenticated" ||
          message.includes("authentication");

        const token = useAuthStore.getState().token;

        if (token || !isAuthError) {
          console.error(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          );
        }
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);

      if ("statusCode" in networkError && networkError.statusCode === 401) {
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth";
      }
    }
  }
);

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
    mutate: {
      errorPolicy: "all",
    },
  },
});
