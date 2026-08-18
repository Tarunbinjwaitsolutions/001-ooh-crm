# Contributing

Read this once, fully, before your first commit. Everything here comes from
`MediaOctus_CRM_Developer_Spec.md` Part 1 — this is the short operational version.

---

## 1. Before you write any code

1. Get it running locally from a clean clone (`README.md`). If it does not run,
   say so in the group chat immediately — do not spend hours debugging setup.
2. Read your assigned section in the developer spec. Only your section.
3. Read the reference module — **`backend/src/modules/employees/README.md`** — and
   copy its structure. Its frontend half is in `frontend/src/modules/employees/`
   and `frontend/src/app/employees/`. If you find yourself inventing a new
   pattern, stop and ask: the pattern almost certainly already exists there.

---

## 2. The rules

These are not suggestions. A PR that breaks any of them gets sent back.

### `core/` is off limits

`backend/src/core` and `frontend/src/shared` are shared foundation — auth, RBAC,
scoping, the design system, the API client. Everyone's module depends on them, so
a change there breaks all of us. If you think you need one, message the lead. Do
not edit it directly.

Adding a component to `frontend/src/shared/ui` is the one exception, and it is
encouraged — better there than duplicated in three modules.

### Never write a raw query

Every database read goes through the scoping layer.

```ts
// WRONG — leaks other users' data
const leads = await Lead.find({ status: 'New' });

// RIGHT — automatically filtered by who is asking
const leads = await scopedFind(Lead, { status: 'New' }, ctx);
```

A sales agent must only ever see their own leads. This system stores PAN and
Aadhaar numbers — treat it accordingly. The lint rule catches raw queries in
controllers; it cannot catch them in services, so that part is on you.

### Money is stored as integer paise

`₹1,250.50` is `125050`. Never floats, ever. Convert to rupees at the display
boundary only; all arithmetic happens in paise. A rounding error in a system
whose headline feature is profit margin is not recoverable.

### No cross-module imports

```ts
// WRONG
import { Campaign } from '../campaign/campaign.model.js';

// RIGHT
import { campaignService } from '../campaign/campaign.service.js';
const campaign = await campaignService.getById(id, ctx);
```

The ESLint rule fails your build if you don't.

### Every document gets the standard fields

Apply `basePlugin` to your schema — it adds `createdAt`, `updatedAt`,
`createdBy`, `updatedBy`, `deletedAt`. Don't hand-roll them.

**Deletes are soft deletes.** Set `deletedAt`; never physically remove a record.

### Validate on the server, always

Client-side validation is for user experience only. Every endpoint validates its
input with a Zod schema in `<name>.validator.ts`. Never trust anything the client
sends — especially amounts and IDs.

### Every route declares its permission

```ts
router.get('/', requireAuth, requirePermission('leads.view'), asyncHandler(controller.list));
```

No route ships without one. Add new permission strings to
`backend/src/core/rbac/permissions.ts` and grant them to the right roles in the
same file — that matrix is the single source of truth.

### Use the cross-cutting services — don't rebuild them

Four things already exist in `core/` and every module gets them:

| Need | Use | Notes |
|---|---|---|
| Record who changed what | *nothing* | `auditMiddleware` logs every successful mutation automatically |
| A before/after diff | `auditService.record({ changes: diffFields(a, b) })` | when the automatic entry isn't enough |
| Tell someone something | `notify({ userId, type, title, link, email })` | in-app + optional email, one call |
| Accept a file | `uploadSingle('field')` + `fileService.save()` | never write to disk yourself |
| Produce a document | `renderPdf({ title, build })` | header, footer and page numbers are done |
| Run something on a schedule | register in `src/jobs/index.ts` | wrap the body in `withJobLock` |

Adding a sensitive field to a model? Add its name to `core/audit/redact.ts` too,
or it lands in the audit log in clear text.

### Throw typed errors, don't hand-write responses

```ts
throw new ConflictError('Lead already claimed');   // -> 409 { error: { code: 'CONFLICT', … } }
```

Wrap async controllers in `asyncHandler` and the central error handler does the
rest. A raw Mongo error must never reach the client.

---

## 3. Adding a backend module

Copy `backend/src/modules/employees/` and rename.

```
backend/src/modules/<name>/
├── <name>.model.ts        Mongoose schema — fields only, no logic
├── <name>.service.ts      Business logic; scopedFind() lives here
├── <name>.controller.ts   Parses the request, calls the service, sends the response
├── <name>.routes.ts       Paths + requirePermission() on every route
├── <name>.validator.ts    Zod schemas
└── <name>.test.ts         Tests for the main flows
```

Then mount it in `backend/src/app.ts` under the `--- Modules ---` marker.

## 4. Adding a frontend module

Copy `frontend/src/modules/employees/` and `frontend/src/app/employees/`.

```
frontend/src/modules/<name>/
├── api.ts          calls through `api` from @/shared/api/client — never fetch() directly
├── components/
└── hooks/
```

Routes live in `frontend/src/app/<name>/`. Guard the page with `<RequireAuth
permission="…">` and wrap it in `<AppShell>`, then add the nav entry to
`NAV_ITEMS` in `frontend/src/shared/layout/app-shell.tsx`.

Build screens from `@/shared/ui`. `RequireAuth` and `hasPermission()` are UI
convenience only — the server enforces the same permission independently.

---

## 5. Git workflow

**Branch naming:** `feature/<module>-<short-description>` — e.g. `feature/leads-intake`

```bash
git checkout develop
git pull origin develop        # start every day with this
git checkout feature/leads-intake
git merge develop              # keep up to date; avoid a painful merge later
```

**Commits:** small and frequent, with real messages. `fix stuff` is not a commit
message. `add SLA timer on lead claim` is.

When you're done: push, open a PR into `develop`, post the link in the group chat.

**Do not merge your own PR. Do not push directly to `develop` or `main`.**

Never commit `.env`. It is gitignored — keep it that way. Secrets belong in the
deployment environment, and `.env.example` documents the shape.

---

## 6. Definition of Done

Go through this yourself before opening the PR. If any item fails, the PR gets
returned without review — which wastes a day for both of us.

- [ ] Works against the seeded demo data
- [ ] Tested by signing in as at least two different roles — permissions actually enforced
- [ ] All queries go through the scoping layer; no raw `Model.find()`
- [ ] Server-side validation on every input
- [ ] Loading and error states in the UI (not a blank screen while fetching)
- [ ] Empty states handled (what shows when there are zero records?)
- [ ] No cross-module imports
- [ ] Tests written for the main flows
- [ ] `npm run check` from `code/` is clean (typecheck + lint + tests, both apps)
- [ ] You have read your own diff line by line before requesting review

---

## 7. How the week runs

| When | What |
|---|---|
| **Monday** | You get your section number. 30-minute call — ask everything you need then. |
| **Every day** | Post in the group chat: **Done yesterday / Doing today / Blocked**. Written, no call. |
| **Any time** | Stuck for more than half a day? Post it. Do not sit on it silently. |
| **Friday** | Push, open your PR, post the link. Short call to demo on the staging URL. |

Ask questions in the group chat, not in DMs. Someone else has the same question.

And take **"Not in scope"** in your spec section seriously — someone else is
building that part, or it comes later. Building it anyway causes merge conflicts
and wastes your week.
