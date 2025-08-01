"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false); // Track email sent status
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && role && user.emailVerified) {
      router.push(role === "admin" ? "/admin" : "/user-dashboard");
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user && role && user.emailVerified) {
    return null;
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      try {
        await sendEmailVerification(userCredential.user, {
          url: `${window.location.origin}/verify-email`, // Redirect to your app’s verification route
        });
        setEmailSent(true); // Show verification message
        toast.success(
          "Verification email sent. Please check your inbox (and spam folder).",
          {
            duration: 5000,
          }
        );
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } catch (emailErr: any) {
        console.error("Email verification error:", emailErr);
        setError("Failed to send verification email: " + emailErr.message);
        await auth.signOut(); // Sign out if email fails to send
      }
    } catch (err: any) {
      console.error("Sign-up error:", err);
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/user-dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-playfair">
            Sign Up for NewsEcho
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {emailSent ? (
            <p className="text-gray-600 dark:text-gray-300 mb-4">
            A verification email has been sent to <span className="font-medium">{email}</span>.  
            Please check your inbox to verify your email address before continuing.  
            If you don't see the email, be sure to check your spam or junk folder.
            <br />
          
         <br/>
          
              <a 
  href="/" 
  className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 rounded transition duration-200"
>
  <span className="mr-2">&lt;</span> Go to Login
</a>

            </p>
          ) : (
            <>
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
                <Button
                  type="submit"
                  className="w-full bg-black text-white dark:bg-gray-400"
                >
                  Sign Up
                </Button>
              </form>
              <div className="my-4 text-center text-gray-600 dark:text-gray-300">
                OR
              </div>
              <Button
                onClick={handleGoogleSignUp}
                className="w-full bg-white text-black border border-gray-300 dark:bg-gray-800 dark:text-white"
              >
                Sign up with Google
              </Button>
              <p className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="text-blue-500 hover:underline">
                  Login
                </a>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
