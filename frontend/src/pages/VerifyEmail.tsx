import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import {
  VERIFY_EMAIL_MUTATION,
  RESEND_VERIFICATION_EMAIL_MUTATION,
} from "@/graphql/auth";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { setToken, setUser } = useAuthStore();
  const { toast } = useToast();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [canResend, setCanResend] = useState(false);

  const [verifyEmail] = useMutation(VERIFY_EMAIL_MUTATION);
  const [resendEmail] = useMutation(RESEND_VERIFICATION_EMAIL_MUTATION);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      setCanResend(true);
      return;
    }

    verifyEmail({ variables: { token } })
      .then(({ data }) => {
        if (data?.verifyEmail?.success) {
          setStatus("success");
          setMessage(data.verifyEmail.message);

          if (data.verifyEmail.user && data.verifyEmail.token) {
            setUser(data.verifyEmail.user);
            setToken(data.verifyEmail.token);
          }

          setTimeout(() => navigate("/"), 3000);
        } else {
          setStatus("error");
          setMessage(data?.verifyEmail?.message || "Verification failed");
          setCanResend(true);
        }
      })
      .catch((error: unknown) => {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Verification failed"
        );
        setCanResend(true);
      });
  }, [token, verifyEmail, navigate, setToken, setUser]);

  const handleResend = async () => {
    try {
      const { data } = await resendEmail();
      if (data?.resendVerificationEmail?.success) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link.",
        });
        setCanResend(false);
      } else {
        toast({
          title: "Error",
          description:
            data?.resendVerificationEmail?.message || "Failed to resend email",
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to resend email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Verifying your email...</p>
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
              {canResend && (
                <div className="space-y-2 pt-4">
                  <Button
                    onClick={handleResend}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Verification Email
                  </Button>
                  <Button
                    onClick={() => navigate("/auth")}
                    variant="ghost"
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
