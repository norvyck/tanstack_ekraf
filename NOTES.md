# Notes — TanStack Ekraf Dashboard

## Ringkasan pengerjaan

Project ini dikerjakan sesuai `CHEATSHEET.md`: Task A (UI Revamp), Task B (Fix Errors), dan Task C (Security Enhancements), ditambah deliverable `NOTES.md` dan verifikasi build/lint.

---

## Task A — UI Revamp (Required)

**Yang dikerjakan:**
- **Sidebar layout** di area admin (`src/components/admin/AdminShell.tsx`): sidebar dengan ikon `lucide-react` (Dashboard/Products/Users), collapsible di desktop, hamburger drawer + overlay di mobile, nav item aktif, theme toggle, sign out. Route-level guard via `_admin` pathless layout (`beforeLoad` cek session).
- **Popup modals** (`ProductFormModal`, `UserRoleModal`, `ConfirmDialog`): validasi pesan, cancel, loading/submission state, error feedback, close-on-success.
- **Login page revamped** (`src/routes/login.tsx`): card centered, logo/title, shadow/border, dark-mode support, error feedback untuk kredensial salah, toggle sign-in/sign-up, link ke `/setup`.
- **Hapus docs & demo pages**: `about.tsx` dan `demo/better-auth.tsx` dihapus, `routeTree.gen.ts` di-regen (`bunx tsr generate`), tidak ada dead link di `Header`/`Footer`/`__root.tsx`.
- **Product image input**: file picker + preview + downscale otomatis max 512px (`src/lib/image.ts`), validasi client-side & server-side.
- **Responsive mobile**: tabel desktop (`md:block`) + list/card mobile (`md:hidden`) di Products & Users; grid responsif di Dashboard.
- **Loading/empty/error states**: skeleton, empty state, error state + retry di Products, Users, Dashboard.
- **Konsistensi visual**: Home (`/`), Setup (`/setup`), dan NotFound diselaraskan ke shadcn `Card`/`Button` + token, konsisten dengan Login & admin area.
- **Stack tetap**: Tailwind + shadcn `ui/`, tanpa framework swap.

## Task B — Fix Errors (Required)

**Yang dikerjakan:**
- `bun run lint` bersih: konversi CRLF→LF seluruh source, hapus BOM, perbaiki import order (`styles.css`), `noArrayIndexKey` (slider, biome-ignore), `noDangerouslySetInnerHtml` (__root, biome-ignore), `noShorthandPropertyOverrides` (styles.css).
- **Product form inputs bisa diketik**: controlled input dengan `field.handleChange` (TanStack Form) + `key={product?.id ?? "new"}` pada body modal; diverifikasi mengetik di Name/Description/Price/Stock lalu submit berhasil membuat produk.
- `bun run build` sukses (exit 0).
- Route diuji manual: `/`, `/setup` (idempotent), `/login`, `/dashboard`, `/products` (list + create/edit/delete modal + image), `/users` (list + role modal + last-admin lockout).
- Gotchas ditangani: `useParams()` pakai `{ from }` (tidak ada bare call), server fn hanya GET/POST, `/setup` idempotent (re-seed → "already exists").

## Task C — Security Enhancements (Required · min 2, satu dari tiap kolom)

### Auth / access control

- **Every mutation calls `requireAdmin()`/`requireAuth()`** — `createProduct`, `updateProduct`, `deleteProduct`, `updateUserRole`, `deleteUser`, dan getter `getProducts`/`getUsers` semuanya diproteksi server-side. Mencegah client bypass UI guard dan memanggil endpoint privileged langsung.
- **Block self-role-demotion & self-deletion admin** — admin tidak bisa menurunkan/menghapus akunnya sendiri; admin terakhir tidak bisa di-demote/dihapus. Mencegah lockout (aplikasi kehilangan admin) bila session admin dicuri atau admin salah klik.
- **Rate-limit login** — konfigurasi Better Auth `rateLimit` (5/min sign-in, 3/min sign-up) pada `/sign-in/email` & `/sign-up/email`. Mencegah brute-force tebak password.
- **Session cookie flags** — `defaultCookieAttributes`: `httpOnly`, `sameSite: "lax"`, `secure` di production, expiry 7 hari + refresh 1 hari. Mengurangi XSS session theft & CSRF, menghindari session permanen.

### App hardening

- **Server-side Zod validation di setiap server function** — semua payload (incl. image data URL re-check via `validateProductImage`) divalidasi di server. Validasi client = UX, server = trust boundary.
- **Sanitasi product fields** — tag HTML di-strip dari `name`/`description` di schema (transform). Mencegah stored XSS.
- **No `dangerouslySetInnerHTML` dengan user content** — satu-satunya pemakaian adalah script tema statis/trusted (biome-ignored). Rendering produk pakai escaping default React.
- **No secrets di code/git** — `.env*` gitignored, hanya `.env.example` (placeholder); `BETTER_AUTH_SECRET` wajib dari env. Mencegah credential leak ke git history.

## What I broke and how I fixed it (1 paragraph)

Saat revamp, saya hapus route page-based produk/user (`/products/$productId`, `/products/new`, `/users/$userId`) dan pindahkan create/edit/role change ke modal dialog, yang sempat memutus navigasi dan meninggalkan `useParams()` mengarah ke route yang sudah tidak ada; saya juga terbentur batasan TanStack Start bahwa `createServerFn` hanya mendukung `GET`/`POST` (bukan PATCH/DELETE), sehingga mutation harus encode intent di body, dan adapter in-memory Better Auth membuat data/session reset tiap restart (harus re-run `/setup`). Saya perbaiki dengan regenerasi `routeTree.gen.ts` (`bunx tsr generate`), menghapus dead link di `Header`/`Footer`/`__root.tsx`, menstandarkan semua mutation ke `POST` + validator Zod, serta membuat `/setup` idempotent agar re-seed aman setelah restart.

## Verifikasi

- `bun run lint` → clean (exit code 0).
- `bun run build` → success (exit code 0).
- Manually tested: `/`, `/setup` (idempotent), `/login`, `/dashboard`, `/products` (list + create/edit/delete modal + image upload + validation), `/users` (list + role modal + last-admin lockout + self-demotion block).
- Fresh clone + `bun install` + `/setup` works end-to-end.
- Guard self-demotion diuji di browser: pesan "You cannot demote your own account." muncul dan perubahan dibatalkan.