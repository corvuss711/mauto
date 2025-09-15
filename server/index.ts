import 'dotenv/config';
import express from "express";
import cors from "cors";
import { handleDemo, handleGetPlans, handleProcessPayment } from "./routes/demo";
import {
  handleSaveCompanyDetails,
  handleGenerateSite,
  handleSiteStatus,
  handleDomainCheck,
  uploadLogo,
  sessionMiddleware,
  handleTimesEdited,
  getBusinessSectors
} from "./routes/auto-site";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from "bcryptjs";
import { db } from "./routes/auto-site";
import { formProgressRouter } from './routes/auto-site';

const app = express();

export function createServer() {
  // Ensure DB has required columns for Google OAuth (idempotent)
  (async () => {
    try {
      const [dbNameRows] = await db.promise().query("SELECT DATABASE() AS db");
      const rowsAny = dbNameRows as any[];
      const dbName = Array.isArray(rowsAny) && rowsAny[0]?.db ? rowsAny[0].db : undefined;
      if (!dbName) return;
      const [cols] = await db.promise().query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('google_id','provider')",
        [dbName]
      );
      const existing = new Set(
        Array.isArray(cols) ? (cols as any[]).map((c: any) => c.COLUMN_NAME) : []
      );
      const alters: string[] = [];
      if (!existing.has('google_id')) alters.push("ADD COLUMN `google_id` VARCHAR(255) NULL");
      if (!existing.has('provider')) alters.push("ADD COLUMN `provider` VARCHAR(50) NULL");
      if (alters.length) {
        await db.promise().query(`ALTER TABLE users ${alters.join(', ')}`);
      }
    } catch (e) {
      console.warn('[startup] Skipping users table column ensure', e);
    }
  })();
  // Middleware to check if session user still exists in DB
  app.use(async (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      try {
        const userId = req.user && (req.user as any).id;
        if (userId) {
          const [rows] = await db.promise().query('SELECT id FROM users WHERE id = ?', [userId]);
          if (!Array.isArray(rows) || rows.length === 0) {
            req.logout(function (err) {
              req.session.destroy(() => {
                res.status(401).json({ error: 'Session expired. Please login again.' });
              });
            });
            return;
          }
        }
      } catch (err) {
        // On DB error, destroy session for safety
        req.logout(function (e) {
          req.session.destroy(() => {
            res.status(401).json({ error: 'Session expired. Please login again.' });
          });
        });
        return;
      }
    }
    next();
  });


  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy (works for local dev and production)
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
  const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL}/api/auth/google/callback`,
        passReqToCallback: true
      },
      async (_req, _accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || (profile as any)?._json?.email || (profile as any)?.email;
          const googleId = profile.id;
          if (!googleId) return done(null, false, { reason: 'missing_google_id' });
          if (!email) return done(null, false, { reason: 'missing_email' });
          const baseLoginId = email.split('@')[0];
          // Find existing by google_id or email
          const [rows] = await db.promise().query(
            'SELECT * FROM users WHERE google_id = ? OR email_id = ? LIMIT 1',
            [googleId, email]
          );
          let user: any = Array.isArray(rows) && rows.length ? (rows as any)[0] : null;
          let createdNew = false;

          if (!user) {
            // No existing user found - create new user
            const provider = 'google';
            // ensure unique login_id if collision
            let loginId = baseLoginId;
            const [loginRows] = await db.promise().query('SELECT id FROM users WHERE login_id = ? LIMIT 1', [loginId]);
            if (Array.isArray(loginRows) && (loginRows as any[]).length > 0) {
              loginId = `${baseLoginId}-${Math.floor(Math.random() * 10000)}`;
            }
            await db.promise().query(
              'INSERT INTO users (email_id, login_id, google_id, provider, created_at) VALUES (?,?,?,?, NOW())',
              [email, loginId, googleId, provider]
            );
            const [rows2] = await db.promise().query('SELECT * FROM users WHERE email_id = ? LIMIT 1', [email]);
            user = Array.isArray(rows2) && (rows2 as any[]).length ? (rows2 as any[])[0] : null;
            createdNew = true;
          } else if (user.email_id === email && !user.google_id) {
            // User exists with this email but no Google ID - link the accounts
            await db.promise().query('UPDATE users SET google_id = ?, provider = ? WHERE id = ?', [googleId, 'google', user.id]);
            user.google_id = googleId;
            user.provider = 'google';
            // This is not a new user, just linking accounts
            createdNew = false;
          } else if (user.google_id === googleId) {
            // User exists with this Google ID - normal login
            createdNew = false;
          } else {
            // This should not happen, but handle gracefully
            return done(null, false, { reason: 'account_conflict' });
          }
          return done(null, user, { createdNewUser: createdNew });
        } catch (e) {
          console.error('[google-oauth] verify error', e);
          return done(e as any);
        }
      }
    ));
  }

  // Example API routes
  app.use('/api', formProgressRouter);

  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  // API Routes
  app.post("/api/demo", handleDemo);
  app.post("/api/get-plan", handleGetPlans);
  app.post("/api/process-payment", handleProcessPayment);  // Google auth routes
  app.get('/api/auth/google', (req, res, next) => {
    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Google OAuth not configured' });
    const callbackURL = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    passport.authenticate('google', { scope: ['profile', 'email'], callbackURL } as any)(req, res, next);
  });
  app.get('/api/auth/google/callback', (req, res, next) => {
    const callbackURL = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    passport.authenticate('google', { callbackURL } as any, (err, user, info) => {
      if (err || !user) {
        const code = (err as any)?.code;
        const reason = (info as any)?.reason || (code === 'invalid_client' ? 'invalid_client_config' : (err ? 'strategy_error' : 'no_user'));
        if (err) console.error('[google-oauth] callback error', { err, callbackURL });
        return res.redirect(`/login?error=google_auth_failed&reason=${encodeURIComponent(reason)}`);
      }
      req.login(user, (e) => {
        if (e) return res.redirect('/login?error=session_failed');
        // If handler set a flag on req for new user, propagate via query string
        const isNew = (info as any)?.createdNewUser ? '1' : '0';
        res.redirect(`/auth/result?new=${isNew}`);
      });
    })(req, res, next);
  });

  // Debug endpoint to verify Google OAuth config (safe output)
  app.get('/api/auth/google/debug', (req, res) => {
    const callbackURL = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    res.json({
      hasClientId: Boolean(GOOGLE_CLIENT_ID),
      clientIdPrefix: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.slice(0, 8) : null,
      hasClientSecret: Boolean(GOOGLE_CLIENT_SECRET),
      callbackURL,
      baseUrlEnv: BASE_URL,
    });
  });

  // Auth routes
  // Save step with session fallback for user_id
  app.post('/api/save-step', async (req, res) => {
    let { step_number, form_data, user_id } = req.body || {};
    if (!user_id && (req as any).user?.id) user_id = (req as any).user.id;
    if (typeof step_number !== 'number' || form_data == null || !user_id) return res.status(400).json({ error: 'Missing required fields (user_id, step_number, form_data)' });
    try {
      await db.promise().query(
        `INSERT INTO user_form_progress (user_id, step_number, form_data) VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE step_number=VALUES(step_number), form_data=VALUES(form_data)`,
        [user_id, step_number, JSON.stringify(form_data)]
      );
      res.json({ success: true });
    } catch (e) {
      console.error('[save-step] DB error', e);
      res.status(500).json({ error: 'DB error' });
    }
  });
  app.post("/api/signup", async (req, res, next) => {
    interface Users {
      id: number;
      email: string;
      // add other fields if needed
    }
    const { email, contact_no, password, login_id } = req.body;
    if (!email || !password || !contact_no || !login_id) {
      return res.status(400).json({ error: 'All fields required' });
    }
    try {
      // Check for existing email or login_id
      const [existing] = await db.promise().query(
        'SELECT email_id, login_id FROM users WHERE email_id = ? OR login_id = ?',
        [email, login_id]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        const existsEmail = existing.some((u: any) => u.email_id === email);
        const existsLogin = existing.some((u: any) => u.login_id === login_id);
        let errorMsg = '';
        if (existsEmail && existsLogin) {
          errorMsg = 'This email and username are already registered. Please log in instead.';
        } else if (existsEmail) {
          errorMsg = 'This email is already registered. Please log in instead.';
        } else if (existsLogin) {
          errorMsg = 'This username is already taken. Please choose a different username.';
        }
        return res.status(400).json({ error: errorMsg });
      }
      const hash = await bcrypt.hash(password, 10);
      const [result] = await db.promise().query(
        'INSERT INTO users (email_id, contact_no, password, login_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [email, contact_no, hash, login_id]
      );
      // Fetch the newly created user
      const [rows] = await db.promise().query('SELECT * FROM users WHERE email_id = ?', [email]);
      const user = Array.isArray(rows) && rows.length > 0 ? rows[0] as Users : null;
      if (!user) return res.status(500).json({ error: 'Signup failed' });
      // Log in the user (create session)
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ success: true, user: { id: user.id, email: user.email } });
      });
    } catch (err) {
      res.status(500).json({ error: 'Signup failed' });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ error: info.message });
      req.login(user, (err) => {
        if (err) return next(err);
        res.json({ success: true, user: { id: user.id, email: user.email } });
      });
    })(req, res, next);
  });

  // Auth status route for client to fetch user
  app.get('/api/me', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
      const u: any = (req as any).user;
      return res.json({ authenticated: true, user: { id: u.id, email: u.email_id || u.email } });
    }
    res.json({ authenticated: false });
  });

  app.get("/api/logout", (req, res) => {
    req.logout(function (err) {
      res.clearCookie("connect.sid");
      if (err) {
        return res.status(500).json({ success: false, error: err.message || 'Logout failed' });
      }
      res.json({ success: true, message: 'Logged out' });
    });
  });

  // Load form progress by user_id (POST variant to align with client)
  app.post('/api/load-form', async (req, res) => {
    const userId = req.body?.user_id;
    if (!userId) return res.status(400).json({ error: 'Missing user_id' });
    try {
      const [progressRows] = await db.promise().query('SELECT step_number, form_data FROM user_form_progress WHERE user_id = ? LIMIT 1', [userId]);
      let step_number = 0; let form_data: any = {};
      if (Array.isArray(progressRows) && (progressRows as any[]).length > 0) {
        const row: any = (progressRows as any[])[0];
        step_number = row.step_number;
        try { form_data = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data; } catch { form_data = {}; }
      }
      const [companyRows] = await db.promise().query('SELECT * FROM company_mast WHERE user_id = ? LIMIT 1', [userId]);
      const company = Array.isArray(companyRows) && (companyRows as any[]).length ? (companyRows as any[])[0] : null;
      res.json({ step_number, form_data, company });
    } catch {
      res.status(500).json({ error: 'DB error' });
    }
  });

  // Auto Site Builder API routes
  app.get("/api/business-sectors", getBusinessSectors);
  app.post("/api/generate-site", handleGenerateSite);
  app.post("/api/company-details", handleSaveCompanyDetails);
  app.post("/api/domain-check", handleDomainCheck);
  app.get("/api/site-status/:buildId", handleSiteStatus);
  app.post("/api/upload-logo", uploadLogo);
  app.post("/api/times-edited", handleTimesEdited);

  // New API: Get host by companyId
  app.get("/api/company-host/:companyId", async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ error: "Missing companyId" });
    }
    try {
      // Assuming 'host' is a column in company_mast table
      const [rows] = await db.promise().query(
        "SELECT host FROM company_mast WHERE id = ? LIMIT 1",
        [companyId]
      ) as [import('mysql2').RowDataPacket[], any];
      if (Array.isArray(rows) && rows.length > 0 && rows[0].host) {
        return res.json({ host: rows[0].host });
      } else {
        return res.status(404).json({ error: "Host not found for companyId" });
      }
    } catch (err) {
      return res.status(500).json({ error: "DB error" });
    }
  });

  // Payment routes
  // app.post("/api/create-payment-order", createPaymentOrder);
  // app.post("/api/verify-payment-and-deploy", verifyPaymentAndDeploy);

  return app;
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API Documentation:`);
    console.log(`   POST /api/generate-site - Generate a new website`);
    console.log(`   GET  /api/site-status/:buildId - Check build status`);
    // Disabled: deploy-to-hostinger, payment order, verification (external services removed)
  });
}