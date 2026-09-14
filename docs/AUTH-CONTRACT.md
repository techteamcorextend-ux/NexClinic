# Authentication & access — what the backend has to provide

The front end is finished and runs against `lib/accounts.ts`, a mock that
keeps accounts in `localStorage`. **None of it is security.** Every rule
below is enforced in the browser today and must be enforced again on the
server, because a client check only hides a screen — it never protects the
data behind it.

Swapping the mock for a real API means replacing the five functions in
`lib/accounts.ts` and the reader in `lib/session.ts`. No screen changes.

---

## 1. Roles

Five portals, one role each. The role is the whole authorisation model:

| Role | Portal | Who creates the account |
| --- | --- | --- |
| `admin` | `/admin/*` | Another admin |
| `surgeon` | `/surgeon/*` | Admin |
| `reception` | `/reception/*` | Admin |
| `inventory` | `/inventory/*` | Admin |
| `patient` | `/patient/*` | The patient, at `/register` |

Shared areas, and who may read them (`lib/session.ts` → `SHARED_AREAS`):

| Area | Roles |
| --- | --- |
| `/profile/:id` | any signed-in user |
| `/patients/:id` (clinical record) | `admin`, `surgeon`, `reception` |
| `/account/*` | any signed-in user, own account only |

**The rule that matters:** viewing a person's profile never grants entry to
that person's portal. An admin reading a surgeon's profile sees the record
and stops there. The "Go to my portal" button only appears on your own
profile.

---

## 2. Endpoints

### `POST /api/auth/login`
```jsonc
// request
{ "username": "kavya.r", "password": "…", "role": "reception" }

// 200
{
  "session": {
    "role": "reception",
    "personId": "ST-4",
    "username": "kavya.r",
    "name": "Kavya Reddy",
    "mustChangePassword": false
  }
}
// 401 { "error": "invalid-credentials" }   ← same body for unknown user and
//                                            wrong password, deliberately
// 403 { "error": "wrong-role" }            ← real account, wrong portal
```
Sets an httpOnly, Secure, SameSite=Lax session cookie. The JSON body is
what `lib/session.ts` stores today; keep the shape and the client needs no
changes.

Rate-limit by username **and** by IP. Lock an account after ~10 failures.

### `POST /api/auth/logout`
Clears the cookie. Called by every log-out control (`SignOutLink`, the
account menu).

### `GET /api/auth/session`
Returns the same `session` object, or `401`. Replaces the localStorage read
in `lib/session.ts`; ideally called server-side in a layout so a signed-out
visitor never renders portal markup at all.

### `POST /api/auth/change-password`
```jsonc
{ "currentPassword": "…", "newPassword": "…" }
// 200 { "ok": true }        also clears mustChangePassword
// 400 { "error": "too-weak" }
// 401 { "error": "wrong-password" }
```
Rule enforced on both sides (`passwordProblem`): 8+ characters, at least one
letter and one number. Invalidate other sessions for that user on success.

### `POST /api/auth/register` — patients only
```jsonc
{ "name": "…", "email": "…", "username": "…", "password": "…" }
// 201 { "session": { … } }
// 409 { "error": "username-taken" }
```
Must reject any attempt to pass a role. Staff accounts are never created
here. Verify the email before the first sign-in if you want a real flow.

### `POST /api/staff` — admin only
Creates the staff record **and** its account, returning the one-time
password exactly once:
```jsonc
// 201
{ "staff": { "id": "ST-9", … },
  "credentials": { "username": "meera.p2", "tempPassword": "Ward@4821" } }
```
`mustChangePassword` starts `true`. The temp password must be single-use
and expire (24h is reasonable); never return it again on any later read.

---

## 3. Storage

- Passwords: Argon2id (or bcrypt cost ≥ 12). Never store or log plaintext —
  the mock's plaintext field is a stand-in and has no server equivalent.
- `users`: `id`, `person_id`, `username` (unique, case-insensitive),
  `password_hash`, `role`, `must_change_password`, `failed_attempts`,
  `locked_until`, `created_at`, `last_login_at`.
- `sessions`: server-side, revocable, with an idle timeout. A clinical
  system should expire in minutes, not weeks — the "keep me signed in"
  checkbox extends the refresh window, not the session itself.
- Audit every sign-in, failure, password change and credential issue with
  actor, target, IP and timestamp.

---

## 4. Server-side enforcement

Route guards live in `components/system/RequireRole.tsx`. They are UX only.
On the server:

1. Check the session cookie on every request to `/admin`, `/surgeon`,
   `/reception`, `/inventory`, `/patient`, `/patients`, `/profile`,
   `/account` — ideally in Next middleware, so nothing renders before the
   check.
2. Re-check the role for every API route and database query. A receptionist
   calling the payroll endpoint directly must get `403`, whatever the UI
   shows.
3. Scope every patient query. A patient may read only their own record; a
   surgeon only patients assigned to them, unless your clinic's policy is
   broader. `canOpen()` deliberately does not encode that narrowing — it is
   the server's job.
4. `mustChangePassword` must be enforced server-side too: refuse every
   endpoint except change-password while the flag is set.

---

## 5. What is mock today

| Mock | Becomes |
| --- | --- |
| `verifyCredentials()` | `POST /api/auth/login` |
| `changePassword()` | `POST /api/auth/change-password` |
| `registerPatient()` | `POST /api/auth/register` |
| `issueStaffCredentials()` | `POST /api/staff` |
| `getSession()` / `useSession()` | `GET /api/auth/session` + cookie |
| `lib/clinic-seed.ts`, `lib/portal-data.ts`, `lib/admin-data.ts` | real tables |

The five seeded accounts in `lib/accounts.ts` are sample logins for this
build. Delete that `SEED` array before anything goes near a real facility.
