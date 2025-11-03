import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2, Lock } from "lucide-react";
import { RESET_PASSWORD_MUTATION } from "@/graphql/auth";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { setToken, setUser } = useAuthStore();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "form">("loading");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No reset token provided");
      return;
    }
    setStatus("form");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("No reset token provided");
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: { token, password: password.trim() },
      });

      if (data?.resetPassword?.success) {
        setStatus("success");
        setMessage(data.resetPassword.message);
        
        // Store user and token if provided
        if (data.resetPassword.user && data.resetPassword.token) {
          setUser(data.resetPassword.user);
          setToken(data.resetPassword.token);
        }
        
        toast({
          title: "Password reset successful",
          description: "Your password has been reset successfully",
        });
        
        setTimeout(() => navigate("/"), 3000);
      } else {
        setStatus("error");
        setMessage(data?.resetPassword?.message || "Failed to reset password");
        toast({
          title: "Error",
          description: data?.resetPassword?.message || "Failed to reset password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Failed to reset password");
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Validating reset token...</p>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to home page...
              </p>
            </>
          )}
          
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <p className="text-red-600 font-medium">{message}</p>
              <Button onClick={() => navigate("/auth")} variant="outline" className="w-full mt-4">
                Go to Login
              </Button>
            </>
          )}
          
          {status === "form" && (
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                Cancel
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

