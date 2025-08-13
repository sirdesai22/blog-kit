'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Smart redirect function
  const getRedirectDestination = async (): Promise<string> => {
    try {
      const response = await fetch('/api/auth/redirect');
      if (response.ok) {
        const { redirectTo } = await response.json();
        return redirectTo;
      }
    } catch (error) {
      console.error('Error getting redirect destination:', error);
    }
    // Fallback to onboarding
    return '/onboarding';
  };

  // Handle session-based redirect
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      getRedirectDestination().then((redirectTo) => {
        router.push(redirectTo);
      });
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    // Use a simple callback that will trigger useEffect for smart redirect
    await signIn('google', { callbackUrl: window.location.origin + '/auth/signin' });
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    // Use a simple callback that will trigger useEffect for smart redirect  
    await signIn('github', { callbackUrl: window.location.origin + '/auth/signin' });
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        const redirectTo = await getRedirectDestination();
        router.push(redirectTo);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // After successful registration, sign in the user
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        // New users always go to onboarding
        router.push('/onboarding');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // If user is already authenticated, show redirecting message
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  logoipsum
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? 'Create your account' : 'Sign in to your account'}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full h-11 border-gray-300 hover:bg-gray-50"
            >
              Continue with Google
            </Button>

            {/* GitHub Sign In */}
            <Button
              onClick={handleGitHubSignIn}
              disabled={loading}
              variant="outline"
              className="w-full h-11 border-gray-300 hover:bg-gray-50"
            >
              Continue with GitHub
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <div className="space-y-4">
              {isSignUp && (
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}

              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />

              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />

              <Button
                onClick={isSignUp ? handleSignUp : handleEmailSignIn}
                disabled={loading}
                className="w-full h-11 bg-black hover:bg-gray-800 text-white"
              >
                {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </div>

            {/* Toggle between Sign In and Sign Up */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setPassword('');
                  setName('');
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>

            {/* Terms and Privacy */}
            <div className="text-xs text-center text-gray-500 pt-4">
              By continuing you agree to the{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
