'use client';

import { useState, useEffect, useRef } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/app/auth/_components/Button';
import { Input } from '@/app/auth/_components/Input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoWithText, { GitHubIcon, GoogleIcon } from '@/components/icons/icons';
import ReCAPTCHA from 'react-google-recaptcha';
import { Loader } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'otp-request' | 'otp-verify';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const [isNewUser, setIsNewUser] = useState(false);

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
    return '/onboarding';
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      getRedirectDestination().then((redirectTo) => {
        router.push(redirectTo);
      });
    }
  }, [session, status, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    await signIn('google');
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    setError('');
    await signIn('github');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // CAPTCHA check only for signup and password signin
    if (
      (authMode === 'signup' || authMode === 'signin') &&
      !recaptchaToken &&
      siteKey
    ) {
      setError('Please complete the CAPTCHA.');
      return;
    }

    switch (authMode) {
      case 'signin':
        await handleEmailSignIn();
        break;
      case 'signup':
        await handleSignUp();
        break;
      case 'otp-request':
        await handleOTPRequest();
        break;
      case 'otp-verify':
        await handleOTPVerify();
        break;
    }
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
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push('/onboarding');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    }
  };

  const handleOTPRequest = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setAuthMode('otp-verify');
      setOtpExpiry(Date.now() + data.expiresIn * 1000);
      setIsNewUser(data.isNewUser || false); // Track if this is a new user
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async () => {
    if (!email || !otp) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signIn('otp', {
        email,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid or expired OTP');
      } else if (result?.ok) {
        const redirectTo = await getRedirectDestination();
        router.push(redirectTo);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setError('');
    setPassword('');
    setName('');
    setOtp('');
    setOtpExpiry(null);
    setRecaptchaToken(null);
    recaptchaRef.current?.reset();
  };

  const switchAuthMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>
          <Loader className="h-4 w-4 animate-spin" />
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch (authMode) {
      case 'otp-request':
        return 'Sign in or Sign up with Email';
      case 'otp-verify':
        return isNewUser
          ? 'Complete Your Account Setup'
          : 'Enter Verification Code';
      case 'signup':
        return 'Create your account';
      default:
        return 'Sign in to your account';
    }
  };

  const renderFormContent = () => {
    switch (authMode) {
      case 'otp-request':
        return (
          <>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Enter your email to sign in or create a new account
              </p>
            </div>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Sending...' : 'Continue with Email'}
            </Button>
          </>
        );

      case 'otp-verify':
        return (
          <>
            <div className="text-center mb-4">
              {isNewUser ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enter it below to complete your account setup
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              )}
              {otpExpiry && (
                <p className="text-xs text-muted-foreground mt-1">
                  Code expires in{' '}
                  {Math.max(0, Math.ceil((otpExpiry - Date.now()) / 60000))}{' '}
                  minutes
                </p>
              )}
            </div>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              disabled={loading}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading || otp.length !== 6}
            >
              {loading
                ? 'Verifying...'
                : isNewUser
                ? 'Create Account & Sign In'
                : 'Verify & Sign In'}
            </Button>
            <Button
              type="button"
              // variant="outline"
              onClick={() => handleOTPRequest()}
              disabled={loading}
            >
              Resend Code
            </Button>
          </>
        );

      case 'signup':
        return (
          <>
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
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
                <div className="relative rounded-xl">
                  <div className="rounded-xl overflow-hidden">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={siteKey}
                      onChange={setRecaptchaToken}
                    />
                  </div>
                  <div className="absolute inset-[-15px] rounded-xl border-x-[20px] border-y-[0px] h-20 mt-[14px] border-recaptcha pointer-events-none"></div>
                  <div className="absolute inset-x-[-24px] inset-y-[-1px] rounded-xl border-x-[15px] border-y-[10px] border-recaptcha pointer-events-none"></div>
                </div>
              </div>
            )}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </>
        );

      default: // signin
        return (
          <>
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
                <div className="relative rounded-xl">
                  <div className="rounded-xl overflow-hidden">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={siteKey}
                      onChange={setRecaptchaToken}
                    />
                  </div>
                  <div className="absolute inset-[-15px] rounded-xl border-x-[20px] border-y-[0px] h-20 mt-[14px] border-recaptcha pointer-events-none"></div>
                  <div className="absolute inset-x-[-24px] inset-y-[-1px] rounded-xl border-x-[15px] border-y-[10px] border-recaptcha pointer-events-none"></div>
                </div>
              </div>
            )}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Continue with Email'}
            </Button>
          </>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-between py-10 min-h-screen font-sans bg-background">
      <div>
        <div className="w-full flex items-center justify-center mb-0">
          <LogoWithText />
        </div>
        <h2 className="text-center text-muted-foreground mb-6 text-md italic">
          {getTitle()}
        </h2>
      </div>

      <div className="w-full max-w-[385px] px-4">
        {authMode === 'signin' && (
          <>
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
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hovered"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-3 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 my-2 text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormContent()}
        </form>

        <div className="text-center mt-4 space-y-2">
          {authMode === 'signin' && (
            <>
              <button
                onClick={() => switchAuthMode('otp-request')}
                className="text-sm text-primary hover:underline block w-full"
              >
                Sign in with email code instead
              </button>
              <button
                onClick={() => switchAuthMode('signup')}
                className="text-sm text-primary hover:underline"
              >
                Don't have an account? Sign up
              </button>
            </>
          )}

          {authMode === 'signup' && (
            <button
              onClick={() => switchAuthMode('signin')}
              className="text-sm text-primary hover:underline"
            >
              Already have an account? Sign in
            </button>
          )}

          {(authMode === 'otp-request' || authMode === 'otp-verify') && (
            <button
              onClick={() => switchAuthMode('signin')}
              className="text-sm text-primary hover:underline"
            >
              Back to password sign in
            </button>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-8 text-center">
        By continuing you agree to the <br />
        <Link href="/terms" className="underline hover:text-primary">
          Terms of Use
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
}
