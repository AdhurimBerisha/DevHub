import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { apolloClient } from "@/lib/apollo";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Posts from "./pages/Posts";
import CreatePost from "./pages/CreatePost";
import CreateCommunity from "./pages/CreateCommunity";
import PostDetail from "./pages/PostDetail";
import Tags from "./pages/Tags";
import Communities from "./pages/Communities";
import ManageCommunity from "./pages/ManageCommunity";
import CommunityDetails from "./pages/CommunityDetails";
import Hot from "./pages/Hot";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import Users from "./pages/Users";
import SavedPosts from "./pages/SavedPosts";
import CommunityGuide from "./pages/CommunityGuide";
import VerifyEmail from "./pages/VerifyEmail";

const queryClient = new QueryClient();

const App = () => (
  <ApolloProvider client={apolloClient}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
                  <SidebarTrigger />
                </header>
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/posts" element={<Posts />} />
                    <Route path="/post/:id" element={<PostDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/chat/:userId" element={<Chat />} />
                    <Route path="/users" element={<Users />} />
                    <Route
                      path="/create-post"
                      element={
                        <ProtectedRoute>
                          <CreatePost />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-community"
                      element={
                        <ProtectedRoute>
                          <CreateCommunity />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/tags" element={<Tags />} />
                    <Route path="/community-guide" element={<CommunityGuide />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route
                      path="/saved"
                      element={
                        <ProtectedRoute>
                          <SavedPosts />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/communities/:id"
                      element={<CommunityDetails />}
                    />
                    <Route
                      path="/communities/:id/manage"
                      element={
                        <ProtectedRoute>
                          <ManageCommunity />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/hot" element={<Hot />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute requireAdmin={true}>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ApolloProvider>
);

export default App;
