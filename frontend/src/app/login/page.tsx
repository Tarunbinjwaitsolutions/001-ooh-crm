'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';

import { ApiError, toErrorMessage } from '@/shared/api/errors';
import { authApi } from '@/shared/auth/auth-api';
import { useAuth } from '@/shared/auth/auth-context';
import type { LoginChallenge } from '@/shared/auth/types';
import { Alert, Button, Field, Spinner } from '@/shared/ui';

/**
 * Sign-in, in two steps.
 *
 *   Step 1  email + password  -> the API issues an OTP
 *   Step 2  the 6-digit code  -> the API issues a session
 *
 * In development the API returns the code in the step-1 response (see
 * OTP_EXPOSE_IN_RESPONSE) and this page shows it, so nobody has to wait for an
 * email. When real email MFA is switched on the field simply stops arriving and
 * the dev panel below disappears on its own.
 */

type Step = 'credentials' | 'otp';

/** The seeded-account hint is a local-development affordance only. */
const SHOW_DEMO_HINT = process.env.NODE_ENV !== 'production';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeSignIn, isAuthenticated, isLoading } = useAuth();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Already signed in? Skip the form.
  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, router]);

  // Resend cooldown countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'otp') codeInputRef.current?.focus();
  }, [step]);

  // Derived, not stored: it clears itself as soon as the user moves on.
  const displayedNotice =
    notice ??
    (searchParams.get('reason') === 'expired' && step === 'credentials' && !error
      ? 'Your session expired. Please sign in again.'
      : null);

  function applyError(err: unknown) {
    setError(toErrorMessage(err));
    setFieldErrors(err instanceof ApiError ? err.fieldErrors() : {});
  }

  function applyChallenge(response: { devMode: boolean; challenge: LoginChallenge }) {
    setChallenge(response.challenge);
    setDevMode(response.devMode);
    setResendIn(response.challenge.resendAvailableInSeconds);
    // Pre-fill the code in dev so signing in is one more click.
    setCode(response.challenge.devOtp ?? '');
  }

  async function handleCredentials(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await authApi.startLogin(email, password);
      applyChallenge(response);
      setStep('otp');
    } catch (err) {
      applyError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent) {
    event.preventDefault();
    if (!challenge) return;

    setError(null);
    setNotice(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const session = await authApi.verifyOtp(challenge.challengeId, code);
      completeSignIn(session);
      router.replace('/dashboard');
    } catch (err) {
      applyError(err);
      setCode('');
      codeInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!challenge || resendIn > 0) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await authApi.resendOtp(challenge.challengeId);
      applyChallenge(response);
      setNotice('A new code has been sent.');
    } catch (err) {
      applyError(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function backToCredentials() {
    setStep('credentials');
    setChallenge(null);
    setCode('');
    setError(null);
    setNotice(null);
  }

  return (
    <main className="flex min-h-screen">
      {/* Left Panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 dark:bg-slate-950">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-left">
            {step === 'credentials' ? (
              <>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Welcome to our CRM.<br />
                  Login and get started.
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Enter your details to proceed further
                </p>
              </>
            ) : (
              <div className="text-center sm:text-left">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  Verify Your Identity
                </h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Enter the 6-digit code sent to {challenge?.email} to continue.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8">
            {displayedNotice && (
              <div className="mb-4">
                <Alert tone="info">{displayedNotice}</Alert>
              </div>
            )}

            {error && (
              <div className="mb-4">
                <Alert tone="error">{error}</Alert>
              </div>
            )}

            {step === 'credentials' ? (
              <form onSubmit={handleCredentials} className="space-y-5" noValidate>
                <Field
                  label="Email Address"
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="youremail@gmail.com"
                  value={email}
                  error={fieldErrors.email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />

                <Field
                  label="Password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  error={fieldErrors.password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700 dark:bg-slate-900"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-500 dark:text-slate-400">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400">
                      Forgot Password?
                    </a>
                  </div>
                </div>

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  LOG IN
                  {!isSubmitting && <span className="ml-2">→</span>}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerify} className="space-y-6" noValidate>
                <Field
                  ref={codeInputRef}
                  label="Verification Code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  error={fieldErrors.code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  className="text-center tracking-[1em] text-lg font-semibold h-14"
                  required
                />

                <div className="flex items-center gap-2 rounded bg-primary-100/50 px-3 py-1.5 text-xs text-primary dark:bg-slate-900/50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  {resendIn > 0 ? (
                    <span>New code available in <span className="font-semibold text-primary-600">00:{resendIn.toString().padStart(2, '0')}</span></span>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={isSubmitting} className="font-semibold hover:underline">
                      Resend code
                    </button>
                  )}
                </div>
                
                <p className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Your verification code helps keep your account safe
                </p>

                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  SUBMIT
                  {!isSubmitting && <span className="ml-2">→</span>}
                </Button>

                <div className="mt-6 text-center text-xs">
                  <p className="text-slate-500 mb-2">Having trouble?</p>
                  <button
                    type="button"
                    onClick={backToCredentials}
                    className="font-semibold text-red-600 underline hover:text-red-700"
                  >
                    Try another way
                  </button>
                </div>
                
                {devMode && challenge?.devOtp && (
                  <Alert tone="warning" title="Development mode">
                    <p>
                      Your code is{' '}
                      <span className="font-mono text-base font-semibold tracking-widest">
                        {challenge.devOtp}
                      </span>{' '}
                      — already filled in for you.
                    </p>
                  </Alert>
                )}
              </form>
            )}
            
            {SHOW_DEMO_HINT && step === 'credentials' && (
              <div className="mt-8">
                <Alert tone="info" title="Demo accounts">
                  <p className="text-xs">
                    Sign in as <code className="font-mono">admin@</code>,{' '}
                    <code className="font-mono">manager@</code>, <code className="font-mono">sales@</code>,{' '}
                    <code className="font-mono">ops@</code>, <code className="font-mono">finance@</code>,{' '}
                    <code className="font-mono">hr@</code>, <code className="font-mono">employee@</code>{' '}
                    mediaoctus.test — password <code className="font-mono">Password123!</code>
                  </p>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden lg:relative lg:flex lg:flex-1 items-center justify-center bg-primary overflow-hidden">
        {/* Abstract Wavy blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-[40%] bg-primary-600 opacity-80 blur-2xl rotate-45"></div>
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-[45%] bg-primary-400 opacity-60 blur-3xl rotate-12"></div>
        <div className="absolute -bottom-1/4 -right-1/4 h-[700px] w-[700px] rounded-[35%] bg-[#5a1616] opacity-90 blur-3xl -rotate-12"></div>
        
        {/* Logo container */}
        <div className="relative z-10 p-8">
          <img src="/logo.svg" alt="Media Octus" className="w-64 invert brightness-0 saturate-100 filter brightness-[100] drop-shadow-sm opacity-90" />
        </div>
      </div>
    </main>
  );
}

/**
 * `useSearchParams` makes LoginForm a dynamic client component, so Next needs a
 * Suspense boundary around it. The fallback is a real skeleton, not null —
 * otherwise the static shell paints an empty page until hydration.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen">
          <div className="flex flex-1 flex-col items-center justify-center bg-white px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
            <div className="w-full max-w-sm space-y-8">
              <div className="text-left">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Media Octus CRM
                </h1>
              </div>
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            </div>
          </div>
          <div className="hidden lg:flex lg:flex-1 bg-primary"></div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
