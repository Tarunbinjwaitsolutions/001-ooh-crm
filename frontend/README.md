# Media Octus CRM — Frontend

**Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript.**

Setup and demo accounts are in the [root README](../README.md).
The rules that get a PR sent back are in [CONTRIBUTING.md](../CONTRIBUTING.md).

> Also read `AGENTS.md` in this folder: Next.js 16 has breaking changes from
> earlier versions, and the full docs ship inside `node_modules/next/dist/docs/`.

---

## Structure

```
src/
├── app/                    Routes (App Router)
│   ├── layout.tsx          Root layout — wraps everything in <AuthProvider>
│   ├── page.tsx            Redirects to /dashboard or /login
│   ├── login/page.tsx      Two-step sign-in: password, then OTP
│   └── dashboard/page.tsx  Placeholder home screen
│
├── shared/                 ⚠️ Shared foundation — discuss before changing
│   ├── config.ts           NEXT_PUBLIC_* env vars
│   ├── api/
│   │   ├── client.ts       The fetch wrapper. Never call fetch() directly.
│   │   └── errors.ts       ApiError + toErrorMessage()
│   ├── auth/
│   │   ├── auth-context.tsx  <AuthProvider> and useAuth()
│   │   ├── require-auth.tsx  <RequireAuth permission="…">
│   │   ├── auth-api.ts       the auth endpoints
│   │   ├── session-store.ts  where tokens live in the browser
│   │   └── types.ts
│   ├── layout/app-shell.tsx  Header, navigation, user menu
│   └── ui/index.tsx          Button · Field · Alert · Card · Badge · Spinner · EmptyState
│
└── modules/
    └── employees/          ⭐ the reference module's frontend half
        ├── api.ts          every network call the module makes
        ├── types.ts        mirrors the API's DTO
        ├── format.ts       paise → rupees, dates, initials
        ├── hooks/          loading · error · data, every time
        └── components/     one form serving both create and edit
```

Routes for it live in `src/app/employees/` — list, detail, new, edit. Between
them they cover server-side pagination, filters, two distinct empty states, a
mobile card layout, field-level errors from the server, and a permission-gated
section of the form. Copy from there rather than starting a screen from scratch.

Adding a component to `shared/ui` is encouraged — better there than duplicated
across three modules. Everything else under `shared/` needs a conversation first.

---

## The three things you need

### 1. Call the API

```ts
import { api } from '@/shared/api/client';

const { leads } = await api.get<{ leads: Lead[] }>('/api/leads?status=New');
await api.post('/api/leads', { companyName, contactPerson, mobile });
```

The access token is attached for you. On a 401 the client refreshes the token
once and replays the request; if the refresh fails it clears the session and
sends the user to `/login?reason=expired`. Concurrent 401s share one refresh.

Errors are thrown as `ApiError` with `status`, `code`, `message` and
`fieldErrors()` for showing messages next to inputs:

```tsx
try {
  await api.post('/api/leads', form);
} catch (err) {
  setError(toErrorMessage(err));
  setFieldErrors(err instanceof ApiError ? err.fieldErrors() : {});
}
```

### 2. Read the current user

```tsx
const { user, hasPermission, signOut } = useAuth();

{hasPermission('leads.assign') && <AssignButton />}
```

### 3. Build a page

```tsx
export default function LeadsPage() {
  return (
    <RequireAuth permission="leads.view">
      <AppShell>
        <LeadsTable />
      </AppShell>
    </RequireAuth>
  );
}
```

Then add the route to `NAV_ITEMS` in `shared/layout/app-shell.tsx` with its
permission — items the user cannot access are hidden automatically.

**`RequireAuth` and `hasPermission()` are UI convenience only.** The server
enforces the same permission independently. Hiding a button is not security.

---

## Sign-in

Two steps: email + password, then a 6-digit code. In development the backend
returns the code in the step-1 response, so the login screen displays it and
pre-fills the field — no email account needed, no waiting.

That panel is driven by the `devMode` flag the API sends. When real email MFA is
switched on server-side, `devOtp` stops arriving and the panel disappears on its
own. No frontend change needed.

---

## Session handling

| | |
|---|---|
| Access token | 15 minutes, sent as `Authorization: Bearer …` |
| Refresh token | 7 days, rotated on every use |
| Storage | `localStorage`, all of it inside `shared/auth/session-store.ts` |

`localStorage` is the simple thing that works while the two apps run on separate
ports. Before production, move the refresh token to an httpOnly cookie — the only
file that has to change is `session-store.ts`, which is why the access is funnelled
through it rather than scattered across components.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |

`npm run lint` includes the React Compiler rules, which are stricter than you may
be used to — calling `setState` synchronously inside an effect is an error, not a
warning. Derive the value during render instead.

## Environment

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Copy `.env.example` to `.env`. `NEXT_PUBLIC_*` variables are baked into the
client bundle at build time — never put a secret in one.
