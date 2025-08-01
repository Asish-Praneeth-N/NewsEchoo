'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, getAuth } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const verify = async () => {
      const oobCode = searchParams.get("oobCode");
      if (!oobCode) {
        setError("Invalid or missing verification code.");
        return;
      }

      try {
        await applyActionCode(auth, oobCode);
        await auth.currentUser?.reload(); // Refresh user data
        setVerified(true);
        toast.success("Email verified successfully! You can now log in.");
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: any) {
        console.error("Verification error:", err);
        setError("Failed to verify email: " + err.message);
      }
    };

    verify();
  }, [searchParams, router, auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-playfair">Email Verification</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500 mb-4">{error}</p>
          ) : verified ? (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your email has been verified. Redirecting to login...
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mb-4">Verifying your email...</p>
          )}
          <Button onClick={() => router.push("/login")} className="w-full bg-black text-white dark:bg-gray-400">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}