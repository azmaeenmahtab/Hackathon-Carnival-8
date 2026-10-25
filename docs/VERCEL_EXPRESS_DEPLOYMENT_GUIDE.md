# 🚀 Ultimate Guide: Deploying Express on Vercel (TypeScript & JavaScript)

This guide documents the battle-tested architecture, configuration rules, development patterns, and troubleshooting steps required to build and deploy Express backends seamlessly to Vercel without recurring `500` or build errors.

---

## 1. The Core Paradigm Shift: Serverless vs. Long-Running Server

When developing an Express backend for VPS/Render/Railway vs. Vercel, the operational model is completely different:

| Aspect | Traditional Server (Render/VPS/Docker) | Vercel Serverless Function |
| :--- | :--- | :--- |
| **Lifecycle** | Persistent process running 24/7. | Ephemeral container spun up on demand, frozen between requests. |
| **Listener** | `app.listen(PORT)` binds to TCP socket. | **No `app.listen()`**. Vercel invokes your exported `app` handler as a serverless request listener. |
| **Background Jobs** | `setInterval`, cron jobs, in-memory queues run forever. | **Background timers freeze** as soon as the response finishes. |
| **Database** | Single persistent connection established once on boot. | Connection pool must be **cached across lambda container reuses** with fail-fast options. |
| **File System** | Read/write persistent local disk. | Read-only ephemeral `/tmp` (wiped on freeze/kill). |

---

## 2. The Golden Architecture: Two-Entry Pattern

Never combine your local server listener (`app.listen`) and your Vercel serverless export into the same file. Always separate your application into three distinct layers:

```
backend/
├── api/
│   └── index.ts          <-- Entrypoint #1: Serverless handler for Vercel
├── src/
│   ├── app.ts            <-- Pure Express instance (routes, middleware, error handlers)
│   ├── server.ts         <-- Entrypoint #2: Local development listener (app.listen)
│   ├── config/
│   │   ├── db.ts         <-- Serverless-safe database connection
│   │   └── env.ts        <-- Schema-validated environment variables
│   ├── middleware/
│   ├── routes/
│   └── ...
├── package.json
├── tsconfig.json
└── vercel.json           <-- Modern routing rewrites
```

### File 1: `src/app.ts` (Pure Application Layer)
Exports the configured Express instance with zero `.listen()` calls:
```typescript
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
// ...routes & middleware

export default app;
```

### File 2: `src/server.ts` (Local Development Entry)
Used only for local development (`npm run dev` or `npm start`):
```typescript
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
```

### File 3: `api/index.ts` (Vercel Serverless Entry)
Used exclusively by Vercel:
```typescript
import app from "../src/app.js";

export default app;
```

---

## 3. Configuration Setup

### `vercel.json` (Modern Zero-Config Rewrites)
**DO NOT USE** legacy `"builds": [...]` or `@vercel/node`. Use modern `"rewrites"`:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index.ts"
    }
  ]
}
```
*Note: If your project is pure JavaScript, change destination to `"/api/index.js"`.*

### `package.json`
Always include `"type": "module"` if you are using modern ES Modules, TypeScript, or ESM dependencies (like `better-auth`, `@google/generative-ai`, `nanoid`, etc.):

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

### `tsconfig.json`
Ensure `include` contains `src/**/*` and optionally `api/**/*`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 4. The 7 Silent Deployment Killers & How to Avoid Them

### ❌ Killer 1: Missing `dist/app.js` (`Cannot find module '../dist/app.js'`)
- **What causes it**: The developer creates `api/index.js` requiring `../dist/app.js`. Since `dist/` is in `.gitignore`, Git does not track it. In legacy `"builds"` mode, Vercel never ran `tsc`. The lambda crashes immediately on launch with HTTP 500 `FUNCTION_INVOCATION_FAILED`.
- **The Solution**: 
  - Delete `api/index.js` and use `api/index.ts` importing directly from `../src/app.js`.
  - Vercel's built-in bundler (`esbuild`) compiles TypeScript directly from source on deployment without needing a pre-built `dist/` directory.

---

### ❌ Killer 2: `Error [ERR_REQUIRE_ESM]` (CommonJS vs. ESM Mismatch)
- **What causes it**: You import modern ESM-only libraries (e.g. `better-auth`, `jose`, `@noble/hashes`) while `package.json` lacks `"type": "module"`. Vercel's Node runtime attempts to load the function with CommonJS `require()`, which throws `ERR_REQUIRE_ESM`.
- **The Solution**:
  - Add `"type": "module"` to `backend/package.json`.
  - All local file imports in TypeScript must have `.js` extensions under `NodeNext` (e.g. `import app from "./app.js";`).

---

### ❌ Killer 3: `Error TS2349: This expression is not callable` with Dual CJS/ESM Packages
- **What causes it**: Libraries like `helmet` and `express-rate-limit` ship dual CJS/ESM typings where the type definition file is named `index.d.cts`. When TypeScript compiles under `"moduleResolution": "NodeNext"`, it types the default import as a module namespace rather than a callable function.
- **The Solution**:
  - Cast the factory call to `any`:
    ```typescript
    // Helmet
    app.use((helmet as any)());

    // Rate Limit
    export const globalRateLimiter = (rateLimit as any)({ ... });
    ```

---

### ❌ Killer 4: CORS Errors Crashing into HTTP 500
- **What causes it**: Express `cors` middleware configured with:
  ```typescript
  return callback(new Error("CORS policy violation: origin not allowed"));
  ```
  When an origin does not match (e.g. Vercel frontend preview deployments `https://*-your-team.vercel.app`), `cors` forwards the `Error` object to Express's global error handler. If the error handler defaults unhandled errors to status 500, every blocked request becomes a 500 Internal Server Error.
- **The Solution**:
  - Return `callback(null, false)` instead of throwing an Error:
  ```typescript
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Direct browser checks, curls, mobile apps
        if (!origin) return callback(null, true);

        if (
          allowedOrigins.includes("*") ||
          allowedOrigins.includes(origin) ||
          origin.endsWith(".vercel.app") // Automatically allows Vercel preview URLs
        ) {
          return callback(null, true);
        }

        // Safely disallow without throwing 500
        return callback(null, false);
      },
      credentials: true,
    })
  );
  ```

---

### ❌ Killer 5: Mongoose Serverless Buffering & Timeout
- **What causes it**:
  1. Mongoose has `bufferCommands: true` by default. If a query runs while disconnected, Mongoose hangs for 10 seconds waiting to connect, timing out Vercel's serverless function.
  2. If connection drops, a naive `cachedPromise` variable remains resolved, preventing Mongoose from reconnecting.
- **The Solution**:
  Implement a robust serverless connection pattern in `src/config/db.ts`:
  ```typescript
  import mongoose from "mongoose";

  let cachedPromise: Promise<typeof mongoose> | null = null;

  export async function connectDB(): Promise<typeof mongoose> {
    // 1. Return immediately if already connected
    if (mongoose.connection.readyState === 1) {
      return mongoose;
    }

    // 2. Reuse in-flight connection promise if currently connecting
    if (cachedPromise && mongoose.connection.readyState === 2) {
      return cachedPromise;
    }

    // 3. Initiate fresh connection
    try {
      cachedPromise = mongoose.connect(process.env.MONGODB_URI!, {
        dbName: process.env.MONGODB_DB_NAME,
        bufferCommands: false, // Fail fast instead of hanging 10s
      });
      const conn = await cachedPromise;
      return conn;
    } catch (error) {
      cachedPromise = null;
      throw error;
    }
  }
  ```
  And in `src/app.ts`, add a lightweight connection middleware:
  ```typescript
  app.use(async (req, res, next) => {
    // Fast path: Don't block root status check or health checks on DB
    if (req.path === "/" || req.path === "/api/health") {
      return next();
    }

    if (mongoose.connection.readyState !== 1) {
      try {
        await Promise.race([
          connectDB(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Database connection timeout after 5s")), 5000)
          ),
        ]);
      } catch (err: any) {
        return res.status(503).json({
          success: false,
          error: "DATABASE_UNAVAILABLE",
          message: err?.message || "Database connection pending",
        });
      }
    }
    next();
  });
  ```

---

### ❌ Killer 6: Monorepo Root Directory Misconfiguration
- **What causes it**: In a monorepo containing both `frontend/` and `backend/`, Vercel defaults the deployment root directory to `./`. Vercel looks for `package.json` in the repo root, cannot find it, and fails.
- **The Solution**:
  - In Vercel Project Settings -> **General** -> **Root Directory**:
  - Set it to `backend`.
  - Check the box **"Include source files outside of the Root Directory in the Build Step"** if backend imports shared packages.

---

### ❌ Killer 7: Background Tasks & Schedulers in Serverless
- **What causes it**: Calling `setInterval(...)` or in-memory cron jobs inside `app.ts` or routes. In serverless, as soon as Express sends `res.json(...)`, AWS Lambda freezes the container process. The timer pauses and will not fire until a new request unfreezes the container.
- **The Solution**:
  - Keep local schedulers strictly inside `server.ts` (for local dev only).
  - For production scheduling on Vercel, use **Vercel Cron Jobs** via `vercel.json`:
    ```json
    {
      "crons": [
        {
          "path": "/api/cron/prune-threads",
          "schedule": "0 0 * * *"
        }
      ]
    }
    ```

---

## 5. Pre-Deployment Verification Checklist

Before pushing to GitHub / deploying to Vercel, run these checks:

- [ ] **Type Check & Build**: Run `npm run build` locally. If `tsc` gives any error, Vercel build will fail.
- [ ] **Native ESM Import Test**: Run `node -e "import('./dist/app.js')"` to verify no `ERR_REQUIRE_ESM` errors occur.
- [ ] **Vercel Root Directory**: Confirm Root Directory is set to `backend` in Vercel project settings.
- [ ] **Environment Variables Configured in Vercel Dashboard**:
  - `MONGODB_URI`: MongoDB connection string.
  - `MONGODB_DB_NAME`: Database name.
  - `BETTER_AUTH_SECRET`: Secret key (at least 32 characters).
  - `BETTER_AUTH_URL`: Your deployed backend Vercel URL (`https://your-backend.vercel.app`).
  - `BETTER_AUTH_TRUSTED_ORIGINS`: Comma-separated frontend URLs (`https://your-frontend.vercel.app,http://localhost:3000`).
  - `CORS_ORIGIN`: Comma-separated frontend URLs or `*`.
  - `NODE_ENV`: Set to `production`.
- [ ] **MongoDB Atlas IP Whitelist**: In MongoDB Atlas -> Network Access, ensure `0.0.0.0/0` (Allow access from anywhere) is enabled, as Vercel serverless IPs are dynamic.
