## 2025-02-01 - [CRITICAL] Token Leakage in Console Logs
**Vulnerability:** The `admin-console` application was logging sensitive authentication tokens (Bearer tokens) directly to the browser console during API retries and token refresh operations.
**Learning:** Developers likely added these logs for debugging purposes during development but failed to remove them before production. This exposes session credentials to anyone with access to the console (e.g., via XSS or physical access).
**Prevention:** Implement linting rules (like `no-console` with exceptions only for `console.error`) and conduct code reviews specifically looking for logging of sensitive variables named `token`, `password`, `key`, etc.
