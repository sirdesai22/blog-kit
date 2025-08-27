"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/app/auth/_components/Button";
import { Input } from "@/app/auth/_components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoWithText, { GitHubIcon, GoogleIcon } from "@/components/icons/icons";
import ReCAPTCHA from "react-google-recaptcha";
import { Loader } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const getRedirectDestination = async (): Promise<string> => {
    try {
      const response = await fetch("/api/auth/redirect");
      if (response.ok) {
        const { redirectTo } = await response.json();
        return redirectTo;
      }
    } catch (error) {
      console.error("Error getting redirect destination:", error);
    }
    return "/onboarding";
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      getRedirectDestination().then((redirectTo) => {
        router.push(redirectTo);
      });
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    // Remove the callbackUrl - let NextAuth redirect callback handle it
    await signIn("google");
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError("");
    // Remove the callbackUrl - let NextAuth redirect callback handle it
    await signIn("github");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!recaptchaToken && siteKey) {
      setError("Please complete the CAPTCHA.");
      return;
    }

    if (isSignUp) {
      await handleSignUp();
    } else {
      await handleEmailSignIn();
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        const redirectTo = await getRedirectDestination();
        router.push(redirectTo);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create account");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/onboarding");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>
          <Loader className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between py-10 min-h-screen font-sans bg-background">
      <div>
        <div className="w-full flex items-center justify-center mb-0">
          <LogoWithText />
        </div>
        <h2 className="text-center text-muted-foreground mb-6 text-md italic">
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </h2>
      </div>

      <div className="w-full max-w-[385px] px-4">
        <p className="text-center text-muted-foreground text-md mt-4 mb-2">
          Get started - Sign-in or create an account
        </p>

        <div className="space-y-4 mb-3">
          <Button
            onClick={handleGoogleSignIn}
            variant="social"
            disabled={loading}
          >
            <GoogleIcon className="mr-2.5 h-5 w-5" /> Continue with Google
          </Button>

          {/* <Button
            onClick={handleGitHubSignIn}
            variant="social"
            disabled={loading}
          >
            <GitHubIcon className="mr-2.5 h-5 w-5" /> Continue with GitHub
          </Button> */}
        </div>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hovered"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-3 text-muted-foreground">Or</span>
          </div>
        </div>

        {error && (
          <div className="p-3 my-2 text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          )}

          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          {siteKey && (
            <div className="flex justify-center">
              <div
                className={`
                    relative 
                    rounded-xl
                  `}
              >
                <div className="rounded-xl overflow-hidden">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={setRecaptchaToken}
                    // theme='light'
                  />
                </div>
                <div className="absolute inset-[-15px] rounded-xl border-x-[20px] border-y-[0px] h-20 mt-[14px] border-recaptcha pointer-events-none"></div>
                <div className="absolute inset-x-[-24px] inset-y-[-1px] rounded-xl border-x-[15px] border-y-[10px]  border-recaptcha pointer-events-none"></div>
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading
              ? "Loading..."
              : isSignUp
              ? "Create Account"
              : "Continue with email"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setPassword("");
              setName("");
              setRecaptchaToken(null);
              recaptchaRef.current?.reset();
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-8 text-center">
        By continuing you agree to the <br />
        <Link href="/terms" className="underline hover:text-primary">
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
