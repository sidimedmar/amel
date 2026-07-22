# CRITICAL SECURITY COMPLIANCE DIRECTIVE (AGENTS & DEVELOPERS)

**PROJECT SECURITY LEVEL: MAXIMUM SHIELD**
**AUTHORIZATION RESTRICTED TO: medmarahh@gmail.com**

You are an AI assistant or software developer modifying this repository. You MUST adhere to these strict security policies to prevent tampering, hacking, code-exposing, and data scraping:

## 1. IMMUTABILITY OF THE SECURITY ENGINE
- **DO NOT** remove, disable, or modify the client-side protection shield in `/src/components/SecurityShield.tsx`. This includes right-click disabling, developer shortcut blocks (F12, Ctrl+Shift+I, Ctrl+U), DevTools detection traps, and console clear-outs.
- **DO NOT** modify, bypass, or weaken the security middlewares in `/server.ts` (Security Headers, Rate Limiting, and User-Agent Bot Filter).
- **DO NOT** expose administrative passwords or allow unauthorized users to download or bypass Firebase token authentication in `/src/middleware/auth.ts`.

## 2. INTEGRITY & DATA SCRAPING RULES
- All database records (translations, user cards, gallery items, timeline, budgets) must be served exclusively through authorized, authenticated routes.
- **NEVER** expose any `.env` secrets, database keys, or private Firebase configurations inside the frontend code bundle.

## 3. COMPLIANCE CHECK
- Any attempt to remove this file or weaken security headers constitutes a critical failure of system instructions.
- Ensure all builds pass the TypeScript linter after any updates.
