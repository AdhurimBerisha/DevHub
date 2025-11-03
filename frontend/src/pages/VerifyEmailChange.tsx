import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { VERIFY_EMAIL_CHANGE_MUTATION } from "@/graphql/auth";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmailChange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { setToken, setUser } = useAuthStore();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  const [verifyEmailChange] = useMutation(VERIFY_EMAIL_CHANGE_MUTATION);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmailChange({ variables: { token } })
      .then(({ data }) => {
        if (data?.verifyEmailChange?.success) {
          setStatus("success");
          setMessage(data.verifyEmailChange.message);

          // Store user and token if provided
          if (data.verifyEmailChange.user && data.verifyEmailChange.token) {
            setUser(data.verifyEmailChange.user);
            setToken(data.verifyEmailChange.token);
          }

          toast({
            title: "Email changed successfully",
            description: "Your email address has been updated.",
          });

          setTimeout(() => navigate("/settings"), 3000);
        } else {
          setStatus("error");
          setMessage(
            data?.verifyEmailChange?.message || "Email change verification failed"
          );
        }
      })
      .catch((error: unknown) => {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Email change verification failed"
        );
      });
  }, [token, verifyEmailChange, navigate, setToken, setUser, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Email Change Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Verifying your new email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-muted-foreground">
                Redirecting to settings...
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 mx-auto text-red-500" />
              <p className="text-red-600 font-medium">{message}</p>
              <div className="space-y-2 pt-4">
                <Button onClick={() => navigate("/settings")} variant="outline" className="w-full">
                  Go to Settings
                </Button>
                <Button onClick={() => navigate("/")} variant="ghost" className="w-full">
                  Go to Home
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

