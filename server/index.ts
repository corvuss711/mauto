import 'dotenv/config';
import express from "express";
import cors from "cors";
import { handleDemo, handleGetPlans, handleProcessPayment, handleGetServicesList, handleCalculateCustomPlan } from "./routes/demo";
import {
  handleSaveCompanyDetails,
  handleGenerateSite,
  handleSiteStatus,
  handleDomainCheck,
  uploadLogo,
  uploadThumbnail,
  sessionMiddleware,
  handleTimesEdited,
  getBusinessSectors
} from "./routes/auto-site";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from "bcryptjs";
import { db } from "./routes/auto-site";
import { formProgressRouter } from './routes/auto-site';
import mysql from 'mysql2';

// Create a separate connection pool specifically for blog database
const blogDbConfig = { 
  host: process.env.DB_HOST || 'localhost', 
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASS || '', 
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, 
  database: process.env.DB_NAME || 'manacle_blogs' 
};
const blogPool = mysql.createPool({
  ...blogDbConfig,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 8000
});

// Helper function for blog database queries
const blogDb = blogPool;

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

  async function handleOtpRequest(req: express.Request, res: express.Response) {
    try {

      // Validate required fields
      const { mobile, request_type } = req.body;

      if (!mobile) {
        return res.status(400).json({
          success: false,
          error: 'Missing mobile number',
          message: 'Mobile number is required'
        });
      }

      if (!request_type || !['SENT', 'VALIDATE'].includes(request_type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request type',
          message: 'request_type must be either SENT or VALIDATE'
        });
      }


      const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/otp_send_status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body)
      });


      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        data = {
          success: false,
          error: 'Invalid response format from external API',
          message: 'External API returned non-JSON response',
          rawResponse: textResponse
        };
      }
      res.status(response.status).json(data);
    } catch (error) {

      res.status(500).json({
        success: false,
        error: 'Failed to process OTP request via external API',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  // Example API routes
  app.use('/api', formProgressRouter);

  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  // API Routes
  app.post("/api/demo", handleDemo);
  app.post("/api/get-plan", handleGetPlans);
  app.post("/api/get-services-list", handleGetServicesList);
  app.post("/api/calculate-custom-plan", handleCalculateCustomPlan);
  app.post("/api/otp-request", handleOtpRequest);
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
  app.post("/api/upload/thumbnail", uploadThumbnail);
  app.get("/api/upload/test", (req, res) => {
    res.json({ success: true, message: "Upload endpoint is working" });
  });
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

  // Helper function to calculate read time
  function generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }

  function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  // Helper function to get category ID from name
  async function getCategoryId(categoryName: string | undefined): Promise<number | null> {
    if (!categoryName || categoryName.trim() === '') return null;

    try {
      const [rows] = await blogDb.promise().execute(
        'SELECT id FROM blog_categories WHERE name = ? LIMIT 1',
        [categoryName]
      );

      if ((rows as any[]).length > 0) {
        return (rows as any[])[0].id;
      }

      // If category doesn't exist, create it
      const [result] = await blogDb.promise().execute(
        'INSERT INTO blog_categories (name, slug) VALUES (?, ?)',
        [categoryName, generateSlug(categoryName)]
      );

      return (result as any).insertId;
    } catch (error) {
      console.error('Error getting/creating category:', error);
      return null;
    }
  }

  // Blog API Routes

  // GET /api/blogs - Get all published blogs
  app.get('/api/blogs', async (req, res) => {
    try {
      const { category, limit = 50, offset = 0, status = 'published' } = req.query;

      let query = `
              SELECT 
                  b.id, b.title, b.slug, b.excerpt, b.thumbnail_url, 
                  bc.name as category, b.author_name, b.read_time, 
                  b.published_at, b.featured, b.status,
                  DATE_FORMAT(b.published_at, '%b %d, %Y') as formatted_date
              FROM blogs b
              LEFT JOIN blog_categories bc ON b.category_id = bc.id
              WHERE b.status = ?
          `;

      const params: any[] = [status];

      if (category && category !== 'All') {
        query += ' AND bc.name = ?';
        params.push(category);
      }

      query += ' ORDER BY b.published_at DESC, b.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit as string), parseInt(offset as string));

      const [rows] = await blogDb.promise().execute(query, params);

      res.json({
        success: true,
        data: rows,
        total: (rows as any[]).length
      });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch blogs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/blogs/:slug - Get single blog by slug
  app.get('/api/blogs/:slug', async (req, res) => {
    try {
      const { slug } = req.params;

      const [rows] = await blogDb.promise().execute(
        `SELECT 
                  b.id, b.title, b.slug, b.excerpt, b.content, b.thumbnail_url, 
                  bc.name as category, b.author_name, b.author_email, b.read_time, 
                  b.published_at, b.featured, b.meta_title, b.meta_description, 
                  b.tags, b.status,
                  DATE_FORMAT(b.published_at, '%b %d, %Y') as formatted_date,
                  DATE_FORMAT(b.created_at, '%b %d, %Y at %h:%i %p') as created_date
              FROM blogs b
              LEFT JOIN blog_categories bc ON b.category_id = bc.id
              WHERE b.slug = ? AND b.status = 'published'`,
        [slug]
      );

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found'
        });
      }

      // Optional: Track blog view (increment views counter)
      try {
        await blogDb.promise().execute(
          'UPDATE blogs SET views = views + 1 WHERE id = ?',
          [(rows as any[])[0].id]
        );
      } catch (viewError) {
        console.log('Failed to track view:', viewError);
      }

      const blog = (rows as any[])[0];

      // Parse tags if they exist
      if (blog.tags) {
        try {
          blog.tags = typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags;
        } catch (e) {
          console.warn('Failed to parse tags for blog:', blog.id, e);
          blog.tags = [];
        }
      }

      res.json({
        success: true,
        data: blog
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch blog',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test endpoint to check if blog API is working
  app.get('/api/blog-test', (req, res) => {
    res.json({
      success: true,
      message: 'Blog API is working!',
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/blog-categories - Get all categories
  app.get('/api/blog-categories', async (req, res) => {
    try {
      const [rows] = await blogDb.promise().execute(
        'SELECT name, slug, description FROM blog_categories ORDER BY name'
      );

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Admin routes (add authentication middleware in production)

  // GET /api/admin/blogs - Get all blogs (including drafts)  
  app.get('/api/admin/blogs', async (req, res) => {
    try {
      const { status, category, search, limit = 50, offset = 0 } = req.query;

      let query = `
              SELECT 
                  b.id, b.title, b.slug, b.excerpt, b.content, b.thumbnail_url, 
                  bc.name as category, b.author_name, b.read_time, 
                  b.status, b.featured, b.tags, b.meta_title, b.meta_description,
                  DATE_FORMAT(b.published_at, '%b %d, %Y') as formatted_date,
                  DATE_FORMAT(b.created_at, '%b %d, %Y at %h:%i %p') as created_date,
                  DATE_FORMAT(b.updated_at, '%b %d, %Y at %h:%i %p') as updated_date
              FROM blogs b
              LEFT JOIN blog_categories bc ON b.category_id = bc.id
              WHERE 1=1
          `;

      const params: any[] = [];

      if (status) {
        query += ' AND b.status = ?';
        params.push(status);
      }

      if (category && category !== 'All') {
        query += ' AND bc.name = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit as string), parseInt(offset as string));

      const [rows] = await blogDb.promise().execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM blogs b LEFT JOIN blog_categories bc ON b.category_id = bc.id WHERE 1=1';
      const countParams: any[] = [];

      if (status) {
        countQuery += ' AND b.status = ?';
        countParams.push(status);
      }

      if (category && category !== 'All') {
        countQuery += ' AND bc.name = ?';
        countParams.push(category);
      }

      if (search) {
        countQuery += ' AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      const [countRows] = await blogDb.promise().execute(countQuery, countParams);

      // Parse tags and ensure proper boolean conversion for each blog
      const blogsWithParsedTags = (rows as any[]).map(blog => {
        if (blog.tags) {
          try {
            blog.tags = typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags;
          } catch (e) {
            console.warn('Failed to parse tags for blog:', blog.id, e);
            blog.tags = [];
          }
        } else {
          blog.tags = [];
        }

        // Ensure featured is properly converted to boolean
        blog.featured = Boolean(blog.featured);

        return blog;
      });

      res.json({
        success: true,
        data: blogsWithParsedTags,
        total: (countRows as any[])[0].total,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: (countRows as any[])[0].total > parseInt(offset as string) + parseInt(limit as string)
        }
      });
    } catch (error) {
      console.error('Error fetching admin blogs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch blogs',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // POST /api/admin/blogs - Create new blog
  app.post('/api/admin/blogs', async (req, res) => {
    try {
      const {
        title,
        excerpt,
        content,
        thumbnail_url,
        category,
        tags,
        author_name,
        author_email,
        status = 'draft',
        featured = false,
        meta_title,
        meta_description,
        read_time
      } = req.body;

      // Validation
      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required'
        });
      }

      // Generate slug
      let slug = generateSlug(title);

      // Check if slug exists and make it unique
      const [existingSlug] = await blogDb.promise().execute(
        'SELECT slug FROM blogs WHERE slug LIKE ? ORDER BY slug DESC LIMIT 1',
        [`${slug}%`]
      );

      if ((existingSlug as any[]).length > 0) {
        const lastSlug = (existingSlug as any[])[0].slug;
        const match = lastSlug.match(/-(\d+)$/);
        const nextNumber = match ? parseInt(match[1]) + 1 : 1;
        slug = `${slug}-${nextNumber}`;
      }

      // Use user-provided read_time or calculate if not provided
      const finalReadTime = read_time && read_time > 0 ? read_time : calculateReadTime(content);
      const publishedAt = status === 'published' ? new Date() : null;

      // Get category ID from name
      const categoryId = await getCategoryId(category);

      const [result] = await blogDb.promise().execute(
        `INSERT INTO blogs 
              (title, slug, excerpt, content, thumbnail_url, category_id, tags, 
               author_name, author_email, status, featured, read_time, 
               meta_title, meta_description, published_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          slug,
          excerpt || null,
          content,
          thumbnail_url || null,
          categoryId,
          JSON.stringify(tags || []),
          author_name || null,
          author_email || null,
          status || 'draft',
          featured || false,
          finalReadTime,
          meta_title || null,
          meta_description || null,
          publishedAt
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        data: {
          id: (result as any).insertId,
          slug,
          read_time: finalReadTime
        }
      });
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create blog',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PUT /api/admin/blogs/:id - Update blog
  app.put('/api/admin/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        excerpt,
        content,
        thumbnail_url,
        category,
        tags,
        author_name,
        author_email,
        status,
        featured,
        meta_title,
        meta_description,
        read_time
      } = req.body;

      // Check if blog exists
      const [existing] = await blogDb.promise().execute(
        'SELECT id, slug, status FROM blogs WHERE id = ?',
        [id]
      );

      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found'
        });
      }

      const currentBlog = (existing as any[])[0];
      let slug = currentBlog.slug;

      // If title changed, generate new slug
      if (title && title !== '') {
        const newSlug = generateSlug(title);
        if (newSlug !== currentBlog.slug) {
          // Check if new slug exists
          const [existingSlug] = await blogDb.promise().execute(
            'SELECT slug FROM blogs WHERE slug LIKE ? AND id != ? ORDER BY slug DESC LIMIT 1',
            [`${newSlug}%`, id]
          );

          if ((existingSlug as any[]).length > 0) {
            const lastSlug = (existingSlug as any[])[0].slug;
            const match = lastSlug.match(/-(\d+)$/);
            const nextNumber = match ? parseInt(match[1]) + 1 : 1;
            slug = `${newSlug}-${nextNumber}`;
          } else {
            slug = newSlug;
          }
        }
      }

      // Use user-provided read_time or calculate if content is being updated
      const finalReadTime = read_time !== undefined && read_time > 0 ? read_time :
        (content ? calculateReadTime(content) : undefined);
      const publishedAt = status === 'published' && currentBlog.status !== 'published'
        ? new Date() : undefined;

      // Get category ID from name if category is provided
      const categoryId = category !== undefined ? await getCategoryId(category) : undefined;

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (title !== undefined) { updates.push('title = ?'); values.push(title || null); }
      if (slug !== currentBlog.slug) { updates.push('slug = ?'); values.push(slug); }
      if (excerpt !== undefined) { updates.push('excerpt = ?'); values.push(excerpt || null); }
      if (content !== undefined) { updates.push('content = ?'); values.push(content || null); }
      if (thumbnail_url !== undefined) { updates.push('thumbnail_url = ?'); values.push(thumbnail_url || null); }
      if (categoryId !== undefined) { updates.push('category_id = ?'); values.push(categoryId); }
      if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags || [])); }
      if (author_name !== undefined) { updates.push('author_name = ?'); values.push(author_name || null); }
      if (author_email !== undefined) { updates.push('author_email = ?'); values.push(author_email || null); }
      if (status !== undefined) { updates.push('status = ?'); values.push(status || 'draft'); }
      if (featured !== undefined) { updates.push('featured = ?'); values.push(featured || false); }
      if (finalReadTime !== undefined) { updates.push('read_time = ?'); values.push(finalReadTime); }
      if (meta_title !== undefined) { updates.push('meta_title = ?'); values.push(meta_title || null); }
      if (meta_description !== undefined) { updates.push('meta_description = ?'); values.push(meta_description || null); }
      if (publishedAt !== undefined) { updates.push('published_at = ?'); values.push(publishedAt); }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      values.push(id);

      await blogDb.promise().execute(
        `UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({
        success: true,
        message: 'Blog updated successfully',
        data: {
          id: parseInt(id),
          slug,
          read_time: finalReadTime
        }
      });
    } catch (error) {
      console.error('Error updating blog:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update blog',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE /api/admin/blogs/:id - Delete blog
  app.delete('/api/admin/blogs/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Check if blog exists
      const [existing] = await blogDb.promise().execute(
        'SELECT id, title FROM blogs WHERE id = ?',
        [id]
      );

      if ((existing as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blog not found'
        });
      }

      await blogDb.promise().execute('DELETE FROM blogs WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Blog deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete blog',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  return app;
}

// Start server if this file is run directly
// if (import.meta.url === `file://${process.argv[1]}`) {
//   const app = createServer();
//   const PORT = process.env.PORT || 3000;

//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
//     console.log(`📝 API Documentation:`);
//     console.log(`   POST /api/generate-site - Generate a new website`);
//     console.log(`   GET  /api/site-status/:buildId - Check build status`);
// Disabled: deploy-to-hostinger, payment order, verification (external services removed)
//   });
// }

