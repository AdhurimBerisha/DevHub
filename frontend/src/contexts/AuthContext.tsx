import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  signOut: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("devblog_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        localStorage.removeItem("devblog_user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password combination
      // In a real app, this would validate against a backend
      if (email && password) {
        // Check if this is the temporary admin account
        const isAdmin = email === "admin@admin.com";

        const newUser: User = {
          id: Date.now().toString(),
          username: email.split("@")[0],
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          role: isAdmin ? "admin" : "user",
        };

        setUser(newUser);
        localStorage.setItem("devblog_user", JSON.stringify(newUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Sign in error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    username: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo purposes, accept any valid input
      if (username && email && password) {
        // Check if this is the temporary admin account
        const isAdmin = email === "admin@admin.com";

        const newUser: User = {
          id: Date.now().toString(),
          username: username,
          email: email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          role: isAdmin ? "admin" : "user",
        };

        setUser(newUser);
        localStorage.setItem("devblog_user", JSON.stringify(newUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Sign up error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("devblog_user");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
