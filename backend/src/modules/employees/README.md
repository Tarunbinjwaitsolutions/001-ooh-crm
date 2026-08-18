# Employee Master — the reference module (G1)

**Read this before you build your module.** Everything else copies this shape.

Backend files are here. The matching frontend lives in
`frontend/src/modules/employees/` and `frontend/src/app/employees/`.

---

## The six files, and what belongs in each

| File | Contains | Never contains |
|---|---|---|
| `employees.model.ts` | Mongoose schema, indexes, enums | Queries, logic, formatting |
| `employees.service.ts` | Business logic, every database read | Express `req`/`res` |
| `employees.controller.ts` | Parse request → call service → send response | Queries, business rules |
| `employees.routes.ts` | Paths, `requireAuth`, `requirePermission` | Anything else |
| `employees.validator.ts` | Zod schemas, unit conversion | Database access |
| `employees.test.ts` | Tests for the rules that would hurt if broken | A database dependency |

Then mount the router in `src/app.ts`.

---

## The eight patterns to copy

**1. Reads go through the scoping layer.**
`list()` and `getById()` use `scopedFind` / `scopeFilter`, never `Employee.find()`.
That is what stops one user seeing another's records, and it is not optional.

**2. Sensitive fields are stripped in the service.**
`toDto(employee, includeSensitive)` takes the flag as a *required* argument, so
you cannot forget it. PAN, Aadhaar, bank details and CTC simply do not exist in
the JSON for a role without `employees.sensitive`. Sending them and hiding them
in the browser is a data leak, not a UI decision.

**3. Money is integer paise.**
The user types rupees; `rupeesToPaise` in the validator converts at the boundary;
everything behind it is an integer. ₹1,250.50 is `125050`. The UI converts back
with `formatPaise` at the moment of display and nowhere else.

**4. Server-generated fields are never accepted from the client.**
`employeeCode` is absent from the create schema entirely, so a client that sends
one gets it silently dropped. The code comes from `formattedSequence`, which
uses an atomic `$inc` — read-then-increment races and hands two records the same
number.

**5. Every route declares a permission.**
Including the read-only ones. Literal paths (`/me`, `/manager-options`) are
registered before `/:id`, or Express matches "me" as an id.

**6. Deletes are soft.**
`deactivate()` sets `deletedAt` and leaves the record in place — attendance,
leave and the audit log all reference it. It also refuses when the person still
has direct reports, rather than silently orphaning them.

**7. Errors are typed, not hand-written.**
`throw new ConflictError(...)` becomes a clean 409. The controller has no
try/catch; `asyncHandler` routes rejections to the central handler.

**8. Tests cover the rules, not the getters.**
`employees.test.ts` tests the money conversion, the format validators, the
permission matrix and the pagination caps — the things that would cause real
damage. It needs no database, so it runs in milliseconds.

---

## What the API looks like

| Method | Path | Permission |
|---|---|---|
| `GET` | `/api/employees` | `employees.view` |
| `GET` | `/api/employees/me` | `employees.self` (everyone) |
| `GET` | `/api/employees/manager-options` | `employees.view` |
| `GET` | `/api/employees/:id` | `employees.view` |
| `GET` | `/api/employees/:id/reports` | `employees.view` |
| `POST` | `/api/employees` | `employees.manage` |
| `PATCH` | `/api/employees/:id` | `employees.manage` |
| `DELETE` | `/api/employees/:id` | `employees.manage` (soft delete) |

List supports `search`, `department`, `status`, `reportingManagerId`, `page`,
`pageSize`, `sortBy`, `sortDir`. All of it is applied in the database —
never fetch everything and filter in the browser.

---

## Try it yourself

Sign in as `hr@mediaoctus.test` and then as `manager@mediaoctus.test`
(password `Password123!`) and compare `/employees`. HR sees a CTC column;
Manager does not — and it is missing from the API response, not just the table.
That is the difference the Definition of Done is asking you to verify.
