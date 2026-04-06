# Render Production Deployment Audit

Audit date: 2026-04-06

## 1. Project Overview

### Tech stack

- Frontend: React 19, Vite, Redux Toolkit, React Router, Axios, Socket.IO client, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, Socket.IO, MongoDB/Mongoose, LangChain, Mistral, Pinecone, Tavily, Nodemailer, Multer
- Auth/session model: cookie-based auth
- AI/RAG stack: Google GenAI, Mistral chat + embeddings, Pinecone vector search, Tavily web search, ImageKit-based image processing

### Architecture summary

- `Frontend/` is a standalone React SPA built by Vite.
- `Backend/` is the Node/Express API and Socket.IO server.
- The backend also serves a compiled frontend from `Backend/public`, so the project is trying to behave like a single deployable web service.
- Current deployment model is incomplete: the frontend source and the checked-in backend build output are not tied together by an automated build step.

### Verification performed

- `Frontend`: `npm run build` passed
- `Frontend`: `npm run lint` passed
- `Backend`: `node --check` passed on core runtime files (`server.js`, `src/app.js`, controllers, services, socket server)

### Readiness verdict

The project is **not production-ready for Render as-is**.

The main blockers are:

1. hardcoded localhost URLs in both frontend and backend
2. non-production cookie/CORS/socket settings
3. missing automated frontend-to-backend build sync
4. weak env management and no `.env.example`
5. an email verification flow that can silently fail in production

If those are fixed once, the app can reach the goal of "change env vars only, no more code changes per deployment".

## 2. Critical Issues

1. **Hardcoded frontend API and Socket.IO URLs**

Evidence: `Frontend/src/features/auth/services/auth.api.js:3`, `Frontend/src/features/chat/services/chat.api.js:5-7`, `Frontend/src/features/chat/services/chat.socket.js:3-5`

Impact: the production frontend will still call `http://localhost:5000`, so API requests and websocket connections will fail immediately on Render.

Fix: create a central frontend config using `import.meta.env`, for example `VITE_API_URL` and `VITE_SOCKET_URL`, and make every API/socket client consume that single config.

2. **Hardcoded backend CORS and websocket origins**

Evidence: `Backend/src/app.js:19-27`, `Backend/src/socket/server.socket.js:22-27`

Impact: requests from the real Render domain will be blocked or fail credentialed requests because only localhost origins are allowed.

Fix: drive allowed origins from env, for example `CLIENT_URL` or `CORS_ORIGINS`, and use the same origin list for both Express CORS and Socket.IO CORS.

3. **Cookie auth is not production-safe**

Evidence: `Backend/src/controller/auth.controller.js:257-260`, `Backend/src/controller/auth.controller.js:318-324`

Impact:

- cookies are missing `httpOnly`
- cookies are missing `secure`
- cookies are missing `sameSite`
- logout does not clear cookies with matching options

This will either create security risk or break login persistence, especially if frontend and backend are deployed on different Render domains.

Fix: centralize cookie options in one backend config module and set:

- `httpOnly: true`
- `secure: NODE_ENV === 'production'`
- `sameSite: 'lax'` for same-origin single-service deploys, or `'none'` for split-domain deploys
- `maxAge`
- `path`
- optionally `domain`

Use the exact same options in `res.clearCookie(...)`.

4. **Email verification links are hardcoded to localhost**

Evidence: `Backend/src/controller/auth.controller.js:82`, `Backend/src/controller/auth.controller.js:138`

Impact: users will receive verification links that point to `http://localhost:5000/...`, which is unusable after deployment.

Fix: build verification URLs from env, for example `APP_BASE_URL` or `API_BASE_URL`.

5. **Registration can succeed even when email delivery fails**

Evidence: `Backend/src/controller/auth.controller.js:135-147`, `Backend/src/services/email.service.js:15-35`

Impact: a user can be created as unverified, receive `201 Registration successful`, but never actually get the verification email. In production that becomes a support issue and a login blocker.

Fix: make `sendEmail()` throw on failure instead of returning `"Email failed: ..."`, and only report registration success when email delivery succeeds. At minimum, surface a failed-email response and avoid a false-success state.

6. **Verification tokens and email bodies are logged to server output**

Evidence: `Backend/src/services/email.service.js:18`

Impact: the email payload includes the verification URL and token, so production logs can expose sensitive links.

Fix: remove raw payload logging. Log only high-level metadata such as message ID, recipient domain, and success/failure.

7. **Database connection failures do not stop server startup**

Evidence: `Backend/src/config/db.js:3-10`, `Backend/server.js:19-28`

Impact: `connectDB()` catches and swallows the error, so Render can mark the service as started even when MongoDB is unavailable. Requests then fail later at runtime.

Fix: let `connectDB()` throw, or rethrow after logging, so `main()` can exit the process and Render can restart/fail fast.

8. **No automated sync from `Frontend/dist` into `Backend/public`**

Evidence: `Frontend/package.json:6-10`, `Backend/package.json:6-9`

Impact: the backend serves static files from `Backend/public`, but there is no build script that populates that folder from the current frontend source. That means you can deploy stale UI assets even if the frontend source changed.

Fix: automate the build pipeline so Render always does:

1. build `Frontend/`
2. copy `Frontend/dist/*` into `Backend/public/`
3. start `Backend/server.js`

If you do not want a single-service deploy, then deploy frontend and backend separately and stop serving `Backend/public` entirely.

9. **Checked-in backend frontend bundle is already out of sync with the current frontend source**

Evidence: `Frontend/index.html:5` uses `/vite.svg`, while `Backend/public/index.html:5` uses `/images/botIcon-real.png`

Impact: this confirms the served bundle is being manually maintained instead of deterministically rebuilt. That is a deployment risk by itself.

Fix: stop treating `Backend/public` as hand-edited source. Make it generated output only.

10. **Linux case-sensitivity bug in checked-in static assets**

Evidence: `Backend/public/index.html:5` uses `/images/botIcon-real.png`, but the folder in the repo is `Backend/public/Images/`

Impact: Windows dev machines often hide this. Render runs on Linux, so `/images/...` and `/Images/...` are different paths. The favicon or related asset requests can 404 in production.

Fix: make path casing consistent everywhere and let the frontend build output own those paths.

11. **`/api/files/upload` is publicly accessible**

Evidence: `Backend/src/app.js:40`, `Backend/src/routes/file.route.js:13`

Impact: anyone can hit the upload route without auth, which opens the door to abuse, storage/AI cost spikes, and unnecessary attack surface.

Fix: add `authVerifyMiddleware`, then add rate limiting and request-size controls on top of that.

12. **Env management is not deployment-grade yet**

Evidence:

- only `Backend/.env` exists right now
- no `.env.example` exists
- there is no frontend env usage
- there is no startup validation for required env vars

Impact: the app does not yet meet the goal of "deploy by changing env vars only". It still depends on code edits and runtime guesswork.

Fix: add:

- `Frontend/.env.example`
- `Backend/.env.example`
- a backend env validator module
- a frontend config module

13. **`Backend/.env` is not protected by the repo root `.gitignore`**

Evidence: `.gitignore:1-3`, plus a real `Backend/.env` exists in the workspace

Impact: secrets can be accidentally committed later because only root `.env` is ignored.

Fix: update ignore rules to cover `Backend/.env*` and `Frontend/.env*`, while still allowing `.env.example`.

### What will break on Render if nothing changes

- The frontend will call localhost instead of the deployed backend.
- Socket.IO will fail to connect to the deployed server.
- CORS will reject the production frontend origin.
- Email verification links will point to localhost.
- Users may register successfully but never receive usable verification emails.
- The backend may start even when MongoDB is not connected.
- The app may serve stale frontend assets from `Backend/public`.
- Split frontend/backend deployment will have cookie issues until `secure` and `sameSite` are fixed.

## 3. Medium Issues

1. **SPA fallback can return HTML for unknown API GET routes**

Evidence: `Backend/src/app.js:43-45`

Impact: a bad API GET path like `/api/whatever` can return `index.html` with `200 OK` instead of a JSON 404. That makes debugging and monitoring harder.

Fix: add an API 404 handler before the SPA fallback, or exclude `/api/*` from the catch-all route.

2. **Verbose dev logging is always enabled**

Evidence: `Backend/src/app.js:31`

Impact: `morgan("dev")` is fine locally, but noisy in production and not ideal for structured Render logs.

Fix: conditionally enable request logging by environment and/or switch to a structured logger.

3. **Chat delete request is malformed**

Evidence: `Frontend/src/features/chat/services/chat.api.js:49-52`

Impact: `axios.delete('/delete', { chatId })` does not send the body the way the backend expects. If this feature is wired up later, it is likely to fail.

Fix: use `api.delete('/delete', { data: { chatId } })`.

4. **Registration redirects before the API call finishes**

Evidence: `Frontend/src/features/auth/pages/Register.jsx:21-30`

Impact: on slower production networks, the UI can navigate to `/login` before registration finishes, hiding backend errors and confusing users.

Fix: `await handleRegister(payload)` and only navigate after success.

5. **Imperative navigation still happens during render**

Evidence: `Frontend/src/features/auth/pages/Login.jsx:39-40`, `Frontend/src/features/auth/pages/Register.jsx:32-33`

Impact: React can warn or behave unpredictably when navigation is triggered during render.

Fix: keep redirects inside `useEffect` or return a router redirect element instead of calling `navigate()` in render.

6. **Email expiry copy does not match actual token expiry**

Evidence: `Backend/src/controller/auth.controller.js:43`, `Backend/src/controller/auth.controller.js:99`

Impact: the email says the link expires in 10 minutes, but the token actually lasts 7 days.

Fix: align the copy with the real expiry, or change the token expiry to match the message.

7. **There is no centralized backend env validation**

Impact: missing `JWT_SECRET_KEY`, `MONGODB_URI`, provider keys, or vector-store config will fail only when a feature is used.

Fix: validate required env vars at startup and fail fast with a readable message.

8. **No automated smoke test or test script exists**

Evidence: `Backend/package.json:6-9`, `Frontend/package.json:6-10`

Impact: deployment regression risk is higher because build and lint are the only automated checks.

Fix: add a minimal smoke-test layer for auth, chat, and static asset serving.

9. **Unused dependencies and env variables add maintenance noise**

Evidence:

- likely unused backend dependencies: `openai`, `uuid`, `@mistralai/mistralai`, `@langchain/google`, `readline`
- likely unused frontend dependency: `remark-gfm`
- env names present but not referenced in code search: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRETKEY`, `GOOGLE_REFRESH_TOKEN`

Impact: heavier installs, more attack surface, and less clarity about what production actually needs.

Fix: remove unused packages and stale env keys after confirming they are not part of an upcoming feature.

10. **Cookie-based auth makes split-domain deployment harder than it needs to be**

Impact: this is workable, but only if cookie flags, CORS, and socket settings are all aligned.

Fix: prefer a single Render Web Service unless you explicitly want split frontend/backend services.

## 4. Suggestions

1. Create a frontend config module such as `Frontend/src/config/api.js` that exports `apiBaseUrl` and `socketUrl` from `import.meta.env`.

2. Create a backend env module such as `Backend/src/config/env.js` using `zod` or a small manual validator so startup fails fast when required vars are missing.

3. Create a backend cookie config helper so login and logout always use matching cookie options.

4. Add `helmet`, request rate limiting, and API 404 handling before going live.

5. Add a Render-friendly build pipeline that copies `Frontend/dist` into `Backend/public` automatically, or deploy frontend separately and stop committing build output.

6. Prefer one Render Web Service for this app if you want the lowest-friction deployment with cookie auth and websockets.

7. Add `.env.example` files and document the exact env contract once, so future deployments become env-only.

8. Remove checked-in generated assets from source control if possible, or at minimum treat `Backend/public` as generated output and not hand-maintained source.

## 5. Deployment Checklist

### Recommended Render topology

Use **one Render Web Service** from the repo root.

Why this is recommended:

- easiest path for cookie auth
- easiest path for Socket.IO
- same-origin frontend/backend avoids cross-site cookie headaches
- closest to the project's current architecture

### Recommended Render settings

1. **Root directory**

Use the repository root so the build can access both `Frontend/` and `Backend/`.

2. **Build command**

```bash
npm ci --prefix Frontend
npm run build --prefix Frontend
rm -rf Backend/public/*
mkdir -p Backend/public
cp -r Frontend/dist/* Backend/public/
npm ci --prefix Backend
```

3. **Start command**

```bash
npm --prefix Backend start
```

4. **Service type**

Render Web Service

5. **Environment variables**

Set the backend env vars listed below.

6. **Port**

Do not hardcode a Render port in code or config. Render injects `PORT` automatically. The code already reads `process.env.PORT || 5000`, which is fine.

### Alternative topology

Use **Render Static Site + Render Web Service** only if you intentionally want separate frontend/backend deploys.

If you choose that path, you must also do all of the following:

- set `VITE_API_URL` to the backend HTTPS URL
- set `VITE_SOCKET_URL` to the backend HTTPS URL
- set backend cookie `sameSite` to `none`
- set backend cookie `secure` to `true`
- set exact CORS origins for both Express and Socket.IO

### Final pre-launch checklist

1. Replace all hardcoded localhost URLs with env-driven config.
2. Move CORS origins and socket origin config to env.
3. Harden cookies for production and use matching clear-cookie options.
4. Fix email verification URL generation and stop logging email payloads.
5. Make database startup fail fast.
6. Protect `/api/files/upload` with auth and rate limiting.
7. Add `.env.example` files and env validation.
8. Automate `Frontend/dist -> Backend/public`.
9. Fix stale/static asset path casing.
10. Re-test registration, login, socket chat, file upload, and verification email on the actual Render URL.

## 6. Environment Setup Template

### Important naming note

Your current backend code uses:

- `MONGODB_URI` instead of `DATABASE_URL`
- `JWT_SECRET_KEY` instead of `JWT_SECRET`

To keep deployment friction low, it is best to keep those names unless you refactor the backend once to standardize them.

### FRONTEND

Recommended for a **single-service** Render deploy:

```env
VITE_API_URL=/api
VITE_SOCKET_URL=/
```

Recommended for a **split frontend/backend** deploy:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### BACKEND

```env
NODE_ENV=production
PORT=10000

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=replace_with_a_long_random_secret

APP_BASE_URL=https://your-backend.onrender.com
CLIENT_URL=https://your-frontend.onrender.com
CORS_ORIGINS=https://your-frontend.onrender.com

COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=

GOOGLE_API_KEY=your_google_api_key
MISTRAL_API_KEY=your_mistral_api_key
TAVILY_API_KEY=your_tavily_api_key

VECTOR_API_KEY=your_pinecone_api_key
VECTOR_INDEX_NAME=your_pinecone_index_name

IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_END_URL=https://ik.imagekit.io/your_endpoint

GOOGLE_EMAIL_USER=your_email_address
GOOGLE_EMAIL_PASS=your_email_app_password

LOG_LEVEL=info
```

### Notes on env usage

- On Render, `PORT` is normally injected by the platform. Keep the fallback in code, but do not manually force a local port in the Render dashboard.
- If you deploy frontend and backend on different domains, set `COOKIE_SAME_SITE=none`.
- If you keep everything on one Render Web Service, `COOKIE_SAME_SITE=lax` is simpler and safer.
- `CLIENT_URL`, `CORS_ORIGINS`, and `APP_BASE_URL` should never be localhost in production.

## Final Summary

The app is close, but it is not yet at the "deploy by env vars only" stage.

The once-only changes that matter most are:

1. centralize frontend URLs in env
2. centralize backend origins and cookie config in env
3. fix the email verification flow
4. fail fast on DB/env problems
5. automate the frontend build into `Backend/public`

After those are done, Render deployment should be straightforward and should not require code edits for each new environment.
