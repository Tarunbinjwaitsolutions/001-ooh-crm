'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState, type FormEvent } from 'react';

import { ApiError, toErrorMessage } from '@/shared/api/errors';
import { authApi } from '@/shared/auth/auth-api';
import { useAuth } from '@/shared/auth/auth-context';
import type { LoginChallenge } from '@/shared/auth/types';
import { Alert, Button, Card, Field, Spinner } from '@/shared/ui';

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
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Media Octus CRM
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {step === 'credentials'
              ? 'Sign in to your account'
              : `Enter the code we sent to ${challenge?.email}`}
          </p>
        </div>

        <Card>
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
            <form onSubmit={handleCredentials} className="space-y-4" noValidate>
              <Field
                label="Email"
                type="email"
                name="email"
                autoComplete="username"
                placeholder="you@mediaoctus.com"
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

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4" noValidate>
              <Field
                ref={codeInputRef}
                label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={8}
                placeholder="123456"
                value={code}
                error={fieldErrors.code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                className="tracking-[0.4em]"
                required
              />

              {devMode && challenge?.devOtp && (
                <Alert tone="warning" title="Development mode">
                  <p>
                    Your code is{' '}
                    <span className="font-mono text-base font-semibold tracking-widest">
                      {challenge.devOtp}
                    </span>{' '}
                    — already filled in for you.
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    No email is sent while <code className="font-mono">OTP_DELIVERY=console</code>.
                    This panel disappears once real email MFA is switched on.
                  </p>
                </Alert>
              )}

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Verify and sign in
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={backToCredentials}
                  className="text-slate-600 underline-offset-2 hover:underline dark:text-slate-400"
                >
                  Use a different account
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendIn > 0 || isSubmitting}
                  className="text-slate-600 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 dark:text-slate-400"
                >
                  {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </Card>

        {SHOW_DEMO_HINT && step === 'credentials' && (
          <Alert tone="info" title="Demo accounts">
            <p className="text-xs">
              Run <code className="font-mono">npm run seed</code> in the backend, then sign in as
              any of: <code className="font-mono">admin@</code>,{' '}
              <code className="font-mono">manager@</code>, <code className="font-mono">sales@</code>
              , <code className="font-mono">ops@</code>, <code className="font-mono">finance@</code>
              , <code className="font-mono">hr@</code>, <code className="font-mono">employee@</code>
              mediaoctus.test — password <code className="font-mono">Password123!</code>
            </p>
          </Alert>
        )}
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
        <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                Media Octus CRM
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sign in to your account
              </p>
            </div>
            <Card>
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            </Card>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
