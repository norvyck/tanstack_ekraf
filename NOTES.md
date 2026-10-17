# Notes — TanStack Ekraf Dashboard

## What I broke and how I fixed it

While revamping the dashboard I initially deleted the old page-based product/user routes (`/products/$productId`, `/products/new`, `/users/$userId`) and moved create/edit/role changes into modal dialogs, which briefly broke navigation and left `useParams()` calls pointing at routes that no longer existed; I also hit the TanStack Start constraint that `createServerFn` only accepts `GET`/`POST` (no PATCH/DELETE), so mutations had to encode intent in the request body, and the in-memory Better Auth adapter meant sessions/data reset on every restart (requiring re-running `/setup`). I fixed these by regenerating `routeTree.gen.ts` with `bunx tsr generate`, removing all dead links from `Header`/`Footer`/`__root.tsx`, standardizing every mutation on `POST` with Zod validators, and making `/setup` idempotent so re-seeding after a restart is safe.

## Security enhancements (Task C)

Auth / access control:
- Every mutation server function (`createProduct`, `updateProduct`, `deleteProduct`, `updateUserRole`, `deleteUser`) and the protected getters (`getProducts`, `getUsers`) now call `requireAuth()`/`requireAdmin()` server-side — prevents a client from bypassing UI guards and calling privileged endpoints directly.
- Self-role-demotion and self-deletion are blocked for administrators, and demoting/deleting the last administrator is rejected — prevents an admin (or attacker with a stolen admin session) from locking the whole app out of admin access.
- Login (and sign-up) attempts are rate-limited via Better Auth's built-in `rateLimit` (5/min sign-in, 3/min sign-up) — prevents brute-force password guessing against `/api/auth/sign-in/email`.
- Session cookies are issued with `httpOnly`, `sameSite: "lax"`, `secure` in production, and a 7-day expiry with 1-day refresh — reduces XSS session theft and CSRF exposure while avoiding permanent sessions.

App hardening:
- Every server function validates its payload with Zod (including the image data URL re-checked via `validateProductImage`) — client-side validation is UX only; the server is the trust boundary.
- Product text fields are sanitized (HTML tags stripped) on the server, and React's default escaping is used for rendering; the only `dangerouslySetInnerHTML` usage is the static, trusted theme-init script — prevents stored/reflected XSS from product content.
- No secrets are committed: `.env*` is gitignored and only `.env.example` ships placeholders; `BETTER_AUTH_SECRET` must be provided via environment variables — prevents credential leakage into git history.
- The seed password is a documented development default only; production deployments must set their own credentials via `/setup` on a fresh instance.

## Verification

- `bun run lint` → clean (exit code 0).
- `bun run build` → success (exit code 0).
- Manually tested: `/`, `/setup` (idempotent), `/login`, `/dashboard`, `/products` (list, create/edit/delete modals, image upload, validation), `/users` (list, role change modal, last-admin lockout, self-demotion block).
- Fresh clone + `bun install` + `/setup` works end-to-end.