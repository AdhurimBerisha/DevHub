import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { apolloClient } from "@/lib/apollo";
import {
  LOGIN_MUTATION,
  CREATE_USER_MUTATION,
  LOGIN_WITH_GOOGLE_MUTATION,
} from "@/graphql/auth";
import { useGoogleLogin } from "@react-oauth/google";
import { gql } from "graphql-tag";

interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      role: "USER" | "ADMIN";
      createdAt: string;
      updatedAt: string;
    } | null;
    token: string | null;
  };
}

interface CreateUserResponse {
  createUser: {
    success: boolean;
    message: string;
    user: {
      id: string;
      email: string;
      username: string;
      role: "USER" | "ADMIN";
      createdAt: string;
      updatedAt: string;
    } | null;
    token: string | null;
  };
}

export const useAuth = () => {
  const { toast } = useToast();
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
  } = useAuthStore();

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { data } = await apolloClient.mutate<LoginResponse>({
        mutation: LOGIN_MUTATION,
        variables: {
          input: { email, password },
        },
      });

      if (data?.login?.success && data?.login?.user) {
        storeLogin(data.login.user, null);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        return true;
      } else {
        toast({
          title: "Sign in failed",
          description:
            data?.login?.message ||
            "Please check your credentials and try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "An error occurred during sign in. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setLoading(true);

      const { data } = await apolloClient.mutate<CreateUserResponse>({
        mutation: CREATE_USER_MUTATION,
        variables: {
          input: { username, email, password },
        },
      });

      if (data?.createUser?.success && data?.createUser?.user) {
        storeLogin(data.createUser.user, null);
        toast({
          title: "Account created!",
          description: "You have successfully signed up.",
        });
        return true;
      } else {
        toast({
          title: "Sign up failed",
          description:
            data?.createUser?.message ||
            "Please check your information and try again.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "An error occurred during sign up. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await apolloClient.mutate({
        mutation: gql`
          mutation Logout {
            logout {
              success
              message
            }
          }
        `,
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      storeLogout();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    }
  };

  const signInWithGoogle = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      try {
        setLoading(true);

        const { data } = await apolloClient.mutate({
          mutation: LOGIN_WITH_GOOGLE_MUTATION,
          variables: {
            token: credentialResponse.access_token,
          },
        });

        if (data?.loginWithGoogle?.success && data?.loginWithGoogle?.user) {
          storeLogin(data.loginWithGoogle.user, null);
          toast({
            title: "Welcome!",
            description: "Successfully signed in with Google.",
          });
        } else {
          toast({
            title: "Sign in failed",
            description:
              data?.loginWithGoogle?.message || "Failed to sign in with Google",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Google sign in error:", error);
        toast({
          title: "Error",
          description: "An error occurred during Google sign in.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };
};
