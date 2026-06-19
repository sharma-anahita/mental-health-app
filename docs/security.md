# Security Considerations

MindTrack implements security best practices across all three service layers.

---

## 1. Authentication Strategy

- **JSON Web Tokens (JWT):** Sessions use secure JWT tokens containing the `userId`. Tokens are signed using a robust `JWT_SECRET` key and are configured to expire after **7 days**.
- **Google OAuth 2.0:** Secure login integration using Google Client libraries. The backend verifies the Google ID token (`idToken`) against the Google client ID and signs a standard app JWT session token if authentic.
- **Strict Password Hashing:** User passwords are encrypted on register or password reset using `bcrypt` with **10 salt rounds** before committing to MongoDB. Raw passwords are never stored or logged.

---

## 2. Authorization Strategy

- **Express Middleware (`authMiddleware.ts`):** Protected routes are guarded by a centralized middleware. It intercepts requests, validates the Bearer authorization header, decodes the token, and attaches the `userId` to the Express Request object:
  ```typescript
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const payload = jwt.verify(token, jwtSecret);
  req.userId = payload.userId;
  ```
- **Admin Authentication:** Administrative tasks (such as seeding configurations or resetting static banks) are guarded by validating that the custom header `x-admin-secret` matches the server's `ADMIN_SECRET` environment variable.

---

## 3. API Security & CORS Policy

- **Dynamic Whitelisting:** Cross-Origin Resource Sharing (CORS) is configured using a custom validator:
  ```typescript
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (origin.endsWith('.vercel.app')) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
  ```
  This whitelist accepts localhost development origins, the production URL, and dynamically matches temporary preview subdomains assigned by Vercel (`*.vercel.app`), maintaining structural flexibility without exposing endpoints to wildcard (`*`) requests.

---

## 4. Data Protection Measures

- **Email Enumeration Mitigation:** In the password reset flow (`forgotPassword` in `authController.ts`), the API returns a generic `200 OK` response:
  ```json
  { "message": "If an account exists with this email, a password reset link has been sent" }
  ```
  This is returned whether the email exists in the database or not. This blocks attackers from querying authentication endpoints to gather lists of registered users.
- **Token Recovery Hashing:** Recovery links generated during password resets use a raw token sent via Gmail SMTP. A SHA-256 hash of this token is saved in the database (`resetPasswordToken`), with an expiration set for **10 minutes**. The backend hashes incoming token parameters to find matches, protecting database access even if database tables are compromised.

---

## 5. Secrets Management

- **Environment Separation:** API keys, database credentials, SMTP passwords, and JWT secrets are kept entirely separate from codebase repositories.
- **Environment Variables:** Loaded at boot using `dotenv` in development, or sourced directly from platform configurations on Render and Vercel in production.
