// Single-file Express API for Vercel to avoid cross-folder import issues
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
// @ts-ignore - type defs may not include default export style
import MySQLStoreImport from 'express-mysql-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2';
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // Import the new route handler

function parseMysqlUrl(url?: string) {
    if (!url) throw new Error('Missing MYSQL_URL');
    const m = url.match(/^mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/);
    if (!m) throw new Error('Invalid MYSQL_URL');
    return { host: m[3], user: m[1], password: m[2], port: Number(m[4]), database: m[5] };
}
let dbConfig;
try { dbConfig = parseMysqlUrl(process.env.MYSQL_URL); } catch { dbConfig = { host: 'localhost', user: 'root', password: '', port: 3306, database: 'manacle_blogs' }; }
// Create a basic pool for improved resilience & timeouts
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 8000 // ms
});

// Helper to run queries via pool.promise()
const db = pool; // keep variable name for minimal downstream changes

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

pool.getConnection((err, conn) => {
    if (err) {
        console.error('[DB] initial pool error', err.code || err.message);
    } else {
        console.log('[DB] pool ready');
        conn.release();
    }
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
// Serve existing repo-seeded uploads (read-only) and dynamic tmp uploads via unified handler
app.get('/uploads/*', (req, res) => {
    const rel = req.path.replace(/^\/uploads\//, '');
    const repoPath = path.join(process.cwd(), 'uploads', rel);
    const tmpPath = path.join('/tmp/uploads', rel);
    if (fs.existsSync(tmpPath)) return res.sendFile(tmpPath);
    if (fs.existsSync(repoPath)) return res.sendFile(repoPath);
    res.status(404).json({ error: 'File not found' });
});
// Production session store (falls back to MemoryStore if DB unavailable)
let MySQLStore: any;
try { MySQLStore = (MySQLStoreImport as any)(session); } catch { /* ignore */ }
let sessionStore: any;
if (MySQLStore) {
    try {
        sessionStore = new MySQLStore({
            ...dbConfig,
            createDatabaseTable: true,
            expiration: 86400000,
            clearExpired: true
        });
    } catch (e) { console.warn('[Session] MySQLStore init failed, using MemoryStore', (e as any)?.message); }
}
const crossSite = process.env.CROSS_SITE === 'true';
app.use(session({
    secret: process.env.SESSION_SECRET || 'change_me',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    name: 'mauto.sid', // Custom session name
    rolling: true, // Reset expiration on activity
    cookie: {
        maxAge: 86400000, // 24 hours
        sameSite: (crossSite ? 'none' : 'lax') as any,
        secure: process.env.NODE_ENV === 'production' || crossSite,
        httpOnly: true
    }
}));

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email_id = ? LIMIT 1', [email]);
        const user: any = Array.isArray(rows) && rows.length ? rows[0] : null;
        if (!user) return done(null, false, { message: 'No account found with this email. Please sign up first.' });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return done(null, false, { message: 'Incorrect password. Please try again.' });
        done(null, user);
    } catch (e) { done(e); }
}));
passport.serializeUser((u: any, d) => d(null, u.id));
passport.deserializeUser(async (id: number, d) => {
    try { const [rows] = await db.promise().query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]); d(null, Array.isArray(rows) && rows.length ? rows[0] : null); }
    catch (e) { d(e); }
});
app.use(passport.initialize());
app.use(passport.session());

function isAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) return next();
    console.warn('[AUTH] Unauthorized - session id:', (req as any).sessionID, 'user:', (req as any).user);
    return res.status(401).json({ error: 'Unauthorized' });
}

async function handleGetPlans(req: express.Request, res: express.Response) {
    try {
        // console.log('📤 Proxying request to external API:', req.body);

        const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/get-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        // console.log('📊 External API response:', data);

        res.status(response.status).json(data);
    } catch (error) {
        console.error('❌ Error proxying to external API:', error);
        res.status(500).json({
            response: false,
            error: 'Failed to fetch plans from external API',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

async function handleProcessPayment(req: express.Request, res: express.Response) {
    try {


        const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();


        res.status(response.status).json(data);
    } catch (error) {

        res.status(500).json({
            response: false,
            error: 'Failed to process payment via external API',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

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

// Google OAuth Strategy for serverless
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
// Use HTTPS for production by default, HTTP only for local development
const DEFAULT_BASE_URL = process.env.BASE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://mauto-ten.vercel.app' : 'http://localhost:8080');

// Helper function to get the correct protocol (force HTTPS in production)
function getCorrectProtocol(req: express.Request): string {
    // Check if we're in production or if the request came through HTTPS
    if (process.env.NODE_ENV === 'production' ||
        req.headers['x-forwarded-proto'] === 'https' ||
        req.get('host')?.includes('vercel.app')) {
        return 'https';
    }
    return req.protocol;
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${DEFAULT_BASE_URL}/api/auth/google/callback`,
        passReqToCallback: true
    }, async (req, _at, _rt, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const googleId = profile.id;
            // Get the intent from state parameter in the OAuth callback
            const intent = req.query?.state || 'login'; // Google returns state in query params

            console.log('[OAuth Strategy] Intent:', intent, 'Query state:', req.query?.state);

            if (!email || !googleId) {
                return done(null, false, {
                    message: 'google_profile_incomplete',
                    userMessage: 'Google profile is missing required information. Please ensure your Google account has a valid email address.'
                });
            }

            const baseLoginId = email.split('@')[0];

            // Find existing user by google_id or email
            const [rows] = await db.promise().query('SELECT * FROM users WHERE google_id = ? OR email_id = ? LIMIT 1', [googleId, email]);
            let user: any = Array.isArray(rows) && (rows as any[]).length ? (rows as any[])[0] : null;
            let created = false;

            if (!user) {
                // No existing user found - create new user
                let loginId = baseLoginId;
                const [loginRows] = await db.promise().query('SELECT id FROM users WHERE login_id = ? LIMIT 1', [loginId]);
                if (Array.isArray(loginRows) && (loginRows as any[]).length > 0) {
                    loginId = `${baseLoginId}-${Math.floor(Math.random() * 10000)}`;
                }

                await db.promise().query(
                    'INSERT INTO users (email_id, login_id, google_id, provider, created_at) VALUES (?,?,?,?,NOW())',
                    [email, loginId, googleId, 'google']
                );

                const [rows2] = await db.promise().query('SELECT * FROM users WHERE email_id = ? LIMIT 1', [email]);
                user = Array.isArray(rows2) && (rows2 as any[]).length ? (rows2 as any[])[0] : null;

                if (!user) {
                    return done(null, false, {
                        message: 'account_creation_failed',
                        userMessage: 'Failed to create your account. Please try again or contact support if the problem persists.'
                    });
                }
                created = true;

            } else if (user.email_id === email && !user.google_id) {
                // User exists with this email but no Google ID - link the accounts
                await db.promise().query('UPDATE users SET google_id=?, provider=? WHERE id=?', [googleId, 'google', user.id]);
                user.google_id = googleId;
                user.provider = 'google';
                created = false;

            } else if (user.google_id === googleId) {
                // User exists with this Google ID - normal login
                created = false;

            } else if (user.email_id === email && user.google_id && user.google_id !== googleId) {
                // Email exists but with different Google ID
                if (intent === 'signup') {
                    // On signup page - show conflict error
                    return done(null, false, {
                        message: 'account_conflict',
                        userMessage: `This email is already registered with a different account. Please:\n\n• Sign in with your regular email/password instead\n• Or contact support to link your Google account\n• Or use a different Google account`
                    });
                } else {
                    // On login page - suggest using regular login
                    return done(null, false, {
                        message: 'existing_account_different_provider',
                        userMessage: `This email is already registered with a regular account. Please sign in using your email and password instead.`
                    });
                }
            } else {
                // Other conflict cases
                return done(null, false, {
                    message: 'authentication_failed',
                    userMessage: 'Authentication failed. Please try again or contact support.'
                });
            }

            return done(null, user, { createdNewUser: created });
        } catch (e) {
            console.error('[OAuth Error]', e);
            return done(e as Error);
        }
    }) as any);
}

// Uploads (ephemeral)
const uploadRoot = '/tmp/uploads';
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true });
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = req.query.folder ? path.join(uploadRoot, String(req.query.folder)) : uploadRoot;
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
    },
    filename: (_req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});
const upload = multer({ storage });

// Helper: always return an https absolute URL for stored assets
function toHttpsAbsolute(p: string | undefined | null, req: express.Request): string {
    if (!p) return '';
    // If already absolute http/https
    if (/^https?:\/\//i.test(p)) {
        return p.startsWith('https://') ? p.replace(/^[Hh][Tt][Tt][Pp]:\/\//, 'https://') : p;
    }
    if (!p.startsWith('/')) p = '/' + p;
    // host header may include port in dev; still fine
    return `https://${req.headers.host}${p}`;
}

// ---------------- Consolidated FULL Logic Routes ----------------
// Ping
app.get('/api/ping', (_req, res) => res.json({ ok: true }));

// Signup (detailed, matches original server implementation)
app.post('/api/signup', async (req, res, next) => {
    const { email, contact_no, password, login_id } = req.body || {};
    if (!email || !password || !contact_no || !login_id) return res.status(400).json({ error: 'All fields required' });
    try {
        const [existing] = await db.promise().query('SELECT email_id, login_id FROM users WHERE email_id = ? OR login_id = ?', [email, login_id]);
        if (Array.isArray(existing) && existing.length > 0) {
            const existsEmail = (existing as any[]).some(r => r.email_id === email);
            const existsLogin = (existing as any[]).some(r => r.login_id === login_id);
            return res.status(400).json({ error: existsEmail && existsLogin ? 'This email and username are already registered. Please log in instead.' : existsEmail ? 'This email is already registered. Please log in instead.' : 'This username is already taken. Please choose a different username.' });
        }
        const hash = await bcrypt.hash(password, 10);
        await db.promise().query('INSERT INTO users (email_id, contact_no, password, login_id, created_at) VALUES (?,?,?,?,NOW())', [email, contact_no, hash, login_id]);
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email_id = ? LIMIT 1', [email]);
        const user: any = Array.isArray(rows) && (rows as any[]).length ? (rows as any[])[0] : null;
        if (!user) return res.status(500).json({ error: 'Signup failed' });
        req.login(user, err => {
            if (err) return next(err);
            res.json({ success: true, user: { id: user.id, email: user.email_id || user.email } });
        });
    } catch (err) { res.status(500).json({ error: 'Signup failed' }); }
});

// Login
app.post('/api/login', (req, res, next) => {
    console.log('[/api/login] Login attempt for:', req.body?.email);
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('[/api/login] Authentication error:', err);
            return next(err);
        }
        if (!user) {
            console.log('[/api/login] Authentication failed:', info?.message);
            return res.status(400).json({ error: info?.message || 'Invalid credentials' });
        }
        console.log('[/api/login] User authenticated:', { id: user.id, email: user.email_id || user.email });
        req.login(user, e => {
            if (e) {
                console.error('[/api/login] Session creation error:', e);
                return next(e);
            }
            console.log('[/api/login] Session created successfully for user:', user.id);
            const userData = { id: String(user.id), email: user.email_id || user.email };
            res.json({ success: true, user: userData });
        });
    })(req, res, next);
});

// Logout
app.get('/api/logout', (req, res) => {
    req.logout?.(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out' });
    });
});

// Google auth endpoints
app.get('/api/auth/google', (req, res, next) => {
    if (!GOOGLE_CLIENT_ID) return res.status(500).json({ error: 'Google OAuth not configured' });
    const callbackURL = `${getCorrectProtocol(req)}://${req.get('host')}/api/auth/google/callback`;
    // Pass the intent (login/signup) as state parameter
    const intent = req.query.intent || 'login'; // default to login for existing links
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        callbackURL,
        state: intent
    } as any)(req, res, next);
});
app.get('/api/auth/google/callback', (req, res, next) => {
    const callbackURL = `${getCorrectProtocol(req)}://${req.get('host')}/api/auth/google/callback`;

    // Log the callback request to see where the state parameter is
    console.log('[OAuth Callback] Query params:', req.query);

    passport.authenticate('google', { callbackURL } as any, (err, user, info) => {
        if (err) {
            console.error('[OAuth Callback Error]', err);
            return res.redirect('/login?error=google_auth_failed&reason=server_error');
        }
        if (!user) {
            const errorCode = info?.message || 'authentication_failed';
            const userMessage = info?.userMessage || 'Authentication failed. Please try again.';
            console.log('[OAuth] Authentication failed:', errorCode, userMessage);

            // Check if we have intent information to redirect appropriately
            const intent = req.query?.state || 'login';
            const redirectPage = intent === 'signup' ? 'signup' : 'login';

            return res.redirect(`/${redirectPage}?error=google_auth_failed&code=${encodeURIComponent(errorCode)}&message=${encodeURIComponent(userMessage)}`);
        }
        req.login(user, (e) => {
            if (e) {
                console.error('[OAuth Login Error]', e);
                return res.redirect('/login?error=session_failed');
            }
            console.log('[OAuth] Session created successfully for user:', user.id);
            console.log('[OAuth] Session ID:', (req as any).sessionID);
            console.log('[OAuth] User object in session:', JSON.stringify(user, null, 2));

            const isNew = (info as any)?.createdNewUser ? '1' : '0';

            // Force session save before redirect (important for serverless)
            (req as any).session.save((saveErr) => {
                if (saveErr) {
                    console.error('[OAuth] Session save error:', saveErr);
                }
                console.log('[OAuth] Session save result - error:', saveErr ? 'YES' : 'NO');

                // Always redirect - AuthResult will handle session verification
                // Pass user ID as backup in case session doesn't work in serverless
                const userId = encodeURIComponent(String(user.id));
                const email = encodeURIComponent(user.email_id || user.email || '');
                res.redirect(`/auth/result?new=${isNew}&uid=${userId}&email=${email}`);
            });
        });
    })(req, res, next);
});

// Session debug endpoint
app.get('/api/debug/session', (req, res) => {
    const session = (req as any).session;
    const user = (req as any).user;
    const sessionId = (req as any).sessionID;

    res.json({
        sessionId,
        hasSession: !!session,
        sessionData: session ? {
            cookie: session.cookie,
            passport: session.passport,
            keys: Object.keys(session)
        } : null,
        hasUser: !!user,
        user: user ? {
            id: user.id,
            email: user.email_id || user.email,
            keys: Object.keys(user)
        } : null,
        isAuthenticated: req.isAuthenticated?.(),
        cookies: req.headers.cookie,
        timestamp: new Date().toISOString()
    });
});

// OAuth debug endpoint for production troubleshooting
app.get('/api/auth/google/debug', (req, res) => {
    res.json({
        hasClientId: Boolean(GOOGLE_CLIENT_ID),
        clientIdPrefix: GOOGLE_CLIENT_ID ? GOOGLE_CLIENT_ID.slice(0, 12) + '...' : null,
        hasClientSecret: Boolean(GOOGLE_CLIENT_SECRET),
        baseUrl: DEFAULT_BASE_URL,
        callbackURL: `${getCorrectProtocol(req)}://${req.get('host')}/api/auth/google/callback`,
        detectedProtocol: getCorrectProtocol(req),
        originalProtocol: req.protocol,
        forwardedProto: req.headers['x-forwarded-proto'],
        host: req.get('host'),
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// Auth status
app.get('/api/me', (req, res) => {
    const sessionId = (req as any).sessionID;
    const isAuth = req.isAuthenticated?.();
    const user = (req as any).user;
    const cookies = req.headers.cookie;



    if (req.isAuthenticated && req.isAuthenticated()) {
        const u: any = (req as any).user;
        if (!u || !u.id) {
            console.warn('[/api/me] User object missing or no ID:', u);
            return res.json({
                authenticated: false,
                error: 'User data incomplete',
                debug: { sessionId, user: u, hasSession: !!(req as any).session }
            });
        }
        const userData = {
            id: String(u.id), // Ensure ID is string
            email: u.email_id || u.email
        };
        console.log('[/api/me] SUCCESS - Returning user data:', userData);
        return res.json({ authenticated: true, user: userData });
    }
    console.log('[/api/me] Not authenticated - returning false');
    res.json({
        authenticated: false,
        debug: {
            sessionId,
            hasIsAuthenticated: typeof req.isAuthenticated === 'function',
            isAuthResult: isAuth,
            hasUser: !!user,
            hasSession: !!(req as any).session,
            cookies: !!cookies
        }
    });
});

// Business sectors
app.get('/api/business-sectors', async (_req, res) => {
    try { const [rows] = await db.promise().query('SELECT name, template_type_id FROM business_sectors'); res.json({ sectors: rows }); }
    catch (e) { res.status(500).json({ error: 'Failed to fetch business sectors' }); }
});

// Form progress routes
app.post('/api/save-step', async (req, res) => {
    let { step_number, form_data, user_id } = req.body || {};
    if (!user_id && (req as any).user?.id) user_id = (req as any).user.id;

    // Enhanced validation
    if (typeof step_number !== 'number' || form_data == null || !user_id) {
        console.warn('[save-step] Missing required fields:', { step_number, has_form_data: !!form_data, user_id });
        return res.status(400).json({ error: 'Missing required fields (user_id, step_number, form_data)' });
    }

    // Validate step number is reasonable (0-9)
    if (step_number < 0 || step_number > 9) {
        console.warn('[save-step] Invalid step number:', step_number, 'for user:', user_id);
        return res.status(400).json({ error: 'Invalid step number' });
    }

    try {
        console.log('[save-step] Saving step:', step_number, 'for user:', user_id, 'with data keys:', Object.keys(form_data));

        const formDataString = JSON.stringify(form_data);
        await db.promise().query(
            `INSERT INTO user_form_progress (user_id, step_number, form_data) VALUES (?,?,?) 
             ON DUPLICATE KEY UPDATE step_number=VALUES(step_number), form_data=VALUES(form_data)`,
            [user_id, step_number, formDataString]
        );

        console.log('[save-step] Successfully saved step:', step_number, 'for user:', user_id);
        res.json({ success: true, step_number, user_id });
    } catch (e) {
        console.error('[save-step] DB error for user:', user_id, 'step:', step_number, 'error:', e);
        res.status(500).json({ error: 'DB error' });
    }
});

// Previous GET + query param version commented out
// app.get('/api/load-form', async (req,res)=>{ ... })
app.post('/api/load-form', async (req, res) => {
    const userId = req.body?.user_id;
    if (!userId) return res.status(400).json({ error: 'Missing user_id' });

    try {
        console.log('[load-form] Loading form for user:', userId);

        // First, check if user has any form progress saved
        const [progressRows] = await db.promise().query('SELECT step_number, form_data FROM user_form_progress WHERE user_id = ? LIMIT 1', [userId]);

        let step_number = 0;
        let form_data: any = {};
        let hasProgress = false;

        if (Array.isArray(progressRows) && (progressRows as any[]).length > 0) {
            const row: any = (progressRows as any[])[0];
            step_number = row.step_number;
            hasProgress = true;
            try {
                form_data = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data;
            } catch {
                console.warn('[load-form] Failed to parse form_data for user:', userId);
                form_data = {};
            }
        }

        console.log('[load-form] User progress:', { userId, hasProgress, step_number, form_data_keys: Object.keys(form_data) });

        // Check if company exists (only for informational purposes, doesn't affect step)
        let company: any = null;
        const [companyRows] = await db.promise().query('SELECT * FROM company_mast WHERE user_id = ? LIMIT 1', [userId]);
        if (Array.isArray(companyRows) && (companyRows as any[]).length > 0) {
            company = (companyRows as any[])[0];
            console.log('[load-form] Found company for user:', userId, 'company_id:', company.id);
        } else {
            console.log('[load-form] No company found for user:', userId);
        }

        // For new users (no progress), always start at step 0
        if (!hasProgress) {
            console.log('[load-form] New user, starting at step 0');
            step_number = 0;
            form_data = {};
            company = null; // Don't send company data for new users
        }

        res.json({
            step_number,
            form_data,
            company,
            debug: {
                hasProgress,
                userId,
                timestamp: new Date().toISOString()
            }
        });
    } catch (e) {
        console.error('[load-form] Database error:', e);
        res.status(500).json({ error: 'DB error' });
    }
});

// Debug endpoint to check user's form state
app.post('/api/debug-form-state', async (req, res) => {
    const userId = req.body?.user_id;
    if (!userId) return res.status(400).json({ error: 'Missing user_id' });

    try {
        // Get form progress
        const [progressRows] = await db.promise().query('SELECT * FROM user_form_progress WHERE user_id = ?', [userId]);

        // Get company data
        const [companyRows] = await db.promise().query('SELECT * FROM company_mast WHERE user_id = ?', [userId]);

        // Get user data
        const [userRows] = await db.promise().query('SELECT id, email_id, login_id, created_at FROM users WHERE id = ?', [userId]);

        res.json({
            user_id: userId,
            user: userRows[0] || null,
            form_progress: progressRows[0] || null,
            company: companyRows[0] || null,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error('[debug-form-state] Error:', e);
        res.status(500).json({ error: 'DB error' });
    }
});

app.post('/api/reset-form', isAuth, async (req, res) => {
    const userId = (req.user as any)?.id;
    if (!userId) return res.status(400).json({ error: 'User not authenticated' });

    try {
        console.log('[reset-form] Resetting form progress for user:', userId);

        // Delete form progress
        const [result] = await db.promise().query('DELETE FROM user_form_progress WHERE user_id = ?', [userId]);

        console.log('[reset-form] Deleted', (result as any).affectedRows, 'form progress records for user:', userId);
        res.json({
            success: true,
            deleted_records: (result as any).affectedRows,
            user_id: userId
        });
    } catch (e) {
        console.error('[reset-form] Error resetting form for user:', userId, 'error:', e);
        res.status(500).json({ error: 'DB error' });
    }
});

// Domain check (detailed message)
app.post('/api/domain-check', async (req, res) => {
    const { domain } = req.body || {};
    if (!domain) return res.status(400).json({ error: 'Domain is required' });
    try {
        const [rows] = await db.promise().query('SELECT id FROM company_mast WHERE host = ? LIMIT 1', [domain]);
        if (Array.isArray(rows) && (rows as any[]).length > 0) return res.json({ exists: true, message: 'Domain already exists' });
        return res.json({ exists: false, message: 'Domain is available' });
    } catch (e) { res.status(500).json({ error: 'Failed to check domain' }); }
});

// Company details save (comprehensive)
app.post('/api/company-details', async (req, res) => {
    const data = req.body || {};
    try {
        const user_id = data.user_id;
        let template_type_id: number | null = null;
        if (data.template_type_id !== undefined && data.template_type_id !== null && !isNaN(Number(data.template_type_id))) template_type_id = Number(data.template_type_id);
        if (!data.companyName || !data.email || !data.phone || !data.domain || !data.businessSector || !data.location) {
            return res.status(400).json({ error: 'Missing required fields: companyName, email, phone, domain, businessSector, address' });
        }
        let logoPathAbs = toHttpsAbsolute(data.logoPath, req);
        const [companyRows] = await db.promise().query('SELECT id FROM company_mast WHERE user_id = ? LIMIT 1', [user_id]);
        let companyId: any;
        if (Array.isArray(companyRows) && (companyRows as any[]).length > 0) {
            companyId = (companyRows as any[])[0].id;
            const updateQuery = `UPDATE company_mast SET name=?, business_email=?, business_phone=?, host=?, sector=?, logo=?, address=?, facebook=?, youtube=?, linkedin=?, iframe=?, template_type_id=? WHERE id=?`;
            const updateValues = [
                data.companyName, data.email, data.phone, data.domain, data.businessSector, logoPathAbs, data.location,
                data.facebookLink || '', data.youtubeLink || '', data.linkedinLink || '', data.iframe || '', template_type_id, companyId
            ];
            await db.promise().query(updateQuery, updateValues);
        } else {
            const insertQuery = `INSERT INTO company_mast (name,business_email,business_phone,host,sector,logo,address,facebook,youtube,linkedin,iframe,user_id,created_at,template_type_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?)`;
            const insertValues = [
                data.companyName, data.email, data.phone, data.domain, data.businessSector, logoPathAbs, data.location,
                data.facebookLink || '', data.youtubeLink || '', data.linkedinLink || '', data.iframe || '', user_id, template_type_id
            ];
            const [result] = await db.promise().query(insertQuery, insertValues) as [ResultSetHeader, any];
            companyId = result.insertId;
            await db.promise().query('UPDATE users SET company_id = ? WHERE id = ?', [companyId, user_id]);
        }
        res.json({ success: true, companyId });
    } catch (e) { console.error('[company-details]', e); res.status(500).json({ error: 'Failed to save company details' }); }
});

// Generate site (content persistence)
app.post('/api/generate-site', async (req, res) => {
    try {
        const data = req.body || {};
        const template_type_id = data.template_type_id || null;
        if (!data.domain || !data.companyName || !data.email) return res.status(400).json({ error: 'Missing required fields: domain, companyName, email' });
        if (!data.heading || !data.heading_desc || !data.banner_path) return res.status(400).json({ error: 'Missing required home page fields: heading, heading_desc, banner_path' });
        if (!data.vision_desc || !data.mission_desc || !data.what_we_do || !data.our_story) return res.status(400).json({ error: 'Missing required about page fields: vision_desc, mission_desc, what_we_do, our_story' });
        if (template_type_id === 2) {
            if (!Array.isArray(data.campaigns) || data.campaigns.length === 0) return res.status(400).json({ error: 'At least one campaign is required for NGO' });
        } else {
            if (!Array.isArray(data.products) || data.products.length === 0) return res.status(400).json({ error: 'At least one product/service is required' });
        }
        const companyId = data.company_id;
        if (!companyId || isNaN(Number(companyId))) return res.status(400).json({ error: 'Invalid or missing company_id. Please save company details first.' });
        const [companyRows] = await db.promise().query('SELECT id FROM company_mast WHERE id = ? LIMIT 1', [companyId]);
        if (!Array.isArray(companyRows) || (companyRows as any[]).length === 0) return res.status(400).json({ error: 'Company not found. Please save company details first.' });
        const absPath = (p: string) => toHttpsAbsolute(p, req);
        const [homeRows] = await db.promise().query('SELECT id FROM home WHERE company_id = ? LIMIT 1', [companyId]);
        if (Array.isArray(homeRows) && (homeRows as any[]).length > 0) {
            const homeUpdate = `UPDATE home SET heading=?, heading_desc=?, banner_path=?, photo_1=?, photo_2=?, photo_3=?, photo_4=? WHERE company_id = ?`;
            const homeVals = [data.heading, data.heading_desc, absPath(data.banner_path), absPath(data.photo_1), absPath(data.photo_2), absPath(data.photo_3), absPath(data.photo_4), companyId];
            await db.promise().query(homeUpdate, homeVals);
        } else {
            const homeInsert = `INSERT INTO home(heading,heading_desc,banner_path,photo_1,photo_2,photo_3,photo_4,company_id,created_at) VALUES (?,?,?,?,?,?,?,?,NOW())`;
            const homeVals = [data.heading, data.heading_desc, absPath(data.banner_path), absPath(data.photo_1), absPath(data.photo_2), absPath(data.photo_3), absPath(data.photo_4), companyId];
            await db.promise().query(homeInsert, homeVals);
        }
        const [aboutRows] = await db.promise().query('SELECT id FROM about_page WHERE company_id = ? LIMIT 1', [companyId]);
        if (Array.isArray(aboutRows) && (aboutRows as any[]).length > 0) {
            const aboutUpdate = `UPDATE about_page SET vision_desc=?, mission_desc=?, what_we_do=?, our_story=? WHERE company_id = ?`;
            const aboutVals = [data.vision_desc, data.mission_desc, data.what_we_do, data.our_story, companyId];
            await db.promise().query(aboutUpdate, aboutVals);
        } else {
            const aboutInsert = `INSERT INTO about_page(vision_desc,mission_desc,what_we_do,our_story,company_id,created_at) VALUES (?,?,?,?,?,NOW())`;
            const aboutVals = [data.vision_desc, data.mission_desc, data.what_we_do, data.our_story, companyId];
            await db.promise().query(aboutInsert, aboutVals);
        }
        if (template_type_id === 2) {
            await db.promise().query('DELETE FROM campaigns WHERE company_id = ?', [companyId]);
            const campaignInsert = `INSERT INTO campaigns(name,description,volunteers,raised,campaign_status,goal,impact,company_id) VALUES (?,?,?,?,?,?,?,?)`;
            for (const camp of data.campaigns) {
                const campaignVals = [camp.name || camp.campaign_name, camp.description || camp.campaign_description, camp.volunteers, camp.raised, camp.campaign_status, camp.goal, camp.impact, companyId];
                await db.promise().query(campaignInsert, campaignVals);
            }
        } else if (Array.isArray(data.products) && data.products.length > 0) {
            await db.promise().query('DELETE FROM product_services WHERE company_id = ?', [companyId]);
            const productInsert = `INSERT INTO product_services(name,short_description,full_description,image,price,display_in_menu,status,created_by,updated_by,company_id) VALUES (?,?,?,?,?,?,?,?,?,?)`;
            for (const prod of data.products) {
                let statusValue = 1;
                if (typeof prod.status === 'number') statusValue = prod.status; else if (typeof prod.status === 'string') statusValue = prod.status === 'active' ? 1 : 0;
                const prodVals = [prod.name, prod.short_description, prod.full_description, absPath(prod.product_image), prod.price || null, (prod.display_in_menu === 1 ? 1 : 0), statusValue, prod.created_by || 'admin', prod.updated_by || 'admin', companyId];
                await db.promise().query(productInsert, prodVals);
            }
        }
        if (data.isEditing) {
            const [companyRowsEdit] = await db.promise().query('SELECT id FROM company_mast WHERE id = ? LIMIT 1', [companyId]);
            if (Array.isArray(companyRowsEdit) && (companyRowsEdit as any[]).length > 0) {
                await db.promise().query('UPDATE company_mast SET times_edited = COALESCE(times_edited,0) - 1 WHERE id = ?', [companyId]);
            }
        }
        res.json({ success: true, companyId });
    } catch (e) { console.error('[generate-site]', e); res.status(500).json({ error: 'Failed to save site sections' }); }
});

// Times edited
app.post('/api/times-edited', async (req, res) => {
    const { company_id } = req.body || {};
    if (!company_id || isNaN(Number(company_id))) return res.status(400).json({ error: 'Missing or invalid company_id' });
    try {
        const [rows] = await db.promise().query('SELECT times_edited FROM company_mast WHERE id = ? LIMIT 1', [company_id]);
        if (!Array.isArray(rows) || (rows as any[]).length === 0) return res.status(404).json({ error: 'Company not found' });
        const timesEdited = (rows as any[])[0].times_edited || 0;
        if (timesEdited <= 0) return res.status(403).json({ error: 'You have reached the maximum number of edits allowed.' });
        res.json({ success: true, times_edited: timesEdited });
    } catch (e) { res.status(500).json({ error: 'Failed to check times_edited' }); }
});



async function handleGetServicesList(req: express.Request, res: express.Response) {
    try {
        const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/get-services-list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({
            response: false,
            error: 'Failed to fetch services from external API',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

async function handleCalculateCustomPlan(req: express.Request, res: express.Response) {
    try {
        const { selectedServices, applicationTypeId } = req.body;

        if (!selectedServices || !Array.isArray(selectedServices) || selectedServices.length === 0) {
            return res.status(400).json({
                response: false,
                error: 'Selected services are required',
                message: 'Please provide an array of selected services'
            });
        }

        // Calculate total monthly price from selected services
        // Note: services API returns daily prices, so we multiply by 30 to get monthly price
        const totalDailyPrice = selectedServices.reduce((total: number, service: any) => {
            const dailyPrice = parseFloat(service.external_price_per_user || service.price || "0");
            return total + dailyPrice;
        }, 0);

        // Convert daily price to monthly price (daily * 30)
        const totalMonthlyPrice = totalDailyPrice * 30;

        // For yearly calculation: monthly * 12 * discount / 12 = monthly * discount
        const yearlyMonthlyPrice = totalMonthlyPrice * 0.8; // 20% discount
        const sixMonthlyPrice = totalMonthlyPrice * 0.9;    // 10% discount  
        const quarterlyPrice = totalMonthlyPrice * 0.95;    // 5% discount

        // Create plan details with different tenure discounts
        const planDetails = [
            {
                id: 1,
                plan_name: "Custom Plan",
                duration: "monthly",
                base_price_per_user: totalMonthlyPrice.toFixed(2),
                base_price_per_user_external: totalMonthlyPrice.toFixed(2),
                discount: "0",
                min_users: 1,
                max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
                trial_days: 7,
                base_price_per_external_user_per_month: totalMonthlyPrice
            },
            {
                id: 2,
                plan_name: "Custom Plan",
                duration: "quaterly",
                base_price_per_user: quarterlyPrice.toFixed(2), // 5% discount
                base_price_per_user_external: quarterlyPrice.toFixed(2),
                discount: "5",
                min_users: 1,
                max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
                trial_days: 7,
                base_price_per_external_user_per_month: quarterlyPrice
            },
            {
                id: 3,
                plan_name: "Custom Plan",
                duration: "half_yearly",
                base_price_per_user: sixMonthlyPrice.toFixed(2), // 10% discount
                base_price_per_user_external: sixMonthlyPrice.toFixed(2),
                discount: "10",
                min_users: 1,
                max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
                trial_days: 7,
                base_price_per_external_user_per_month: sixMonthlyPrice
            },
            {
                id: 4,
                plan_name: "Custom Plan",
                duration: "yearly",
                base_price_per_user: yearlyMonthlyPrice.toFixed(2), // 20% discount
                base_price_per_user_external: yearlyMonthlyPrice.toFixed(2),
                discount: "20",
                min_users: 1,
                max_users: Number.MAX_SAFE_INTEGER, // Truly unlimited for custom plans
                trial_days: 7,
                base_price_per_external_user_per_month: yearlyMonthlyPrice
            }
        ];

        // Create the custom plan structure
        const customPlan = {
            plan_name: "Custom Plan",
            plan_id: 999, // Use a unique ID for custom plans
            features_list: selectedServices.map((service: any) => service.generic_name || service.name),
            plan_details: planDetails
        };

        res.status(200).json({
            response: true,
            data: customPlan,
            message: 'Custom plan calculated successfully'
        });

    } catch (error) {
        res.status(500).json({
            response: false,
            error: 'Failed to calculate custom plan pricing',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

app.post("/api/get-plan", handleGetPlans);
app.post("/api/get-services-list", handleGetServicesList);
app.post("/api/calculate-custom-plan", handleCalculateCustomPlan);
app.post("/api/process-payment", handleProcessPayment);
app.post("/api/otp-request", handleOtpRequest);

// Blog API endpoints
// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .trim();
}

// Helper function to calculate read time
function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

// GET /api/blogs - Get all published blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const { category_id, limit = 50, offset = 0, status = 'published' } = req.query;

        let query = `
            SELECT 
                b.id, b.title, b.slug, b.excerpt, b.thumbnail_url, 
                bc.name as category_id, b.author_name, b.read_time, 
                b.published_at, b.featured, b.status,
                DATE_FORMAT(b.published_at, '%b %d, %Y') as formatted_date
            FROM blogs b
            LEFT JOIN blog_categories bc ON b.category_id_id = bc.id
            WHERE b.status = ?
        `;

        const params: any[] = [status];

        if (category_id && category_id !== 'All') {
            query += ' AND bc.name = ?';
            params.push(category_id);
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
                id, title, slug, excerpt, content, thumbnail_url, category_id,
                author_name, author_email, read_time, published_at, featured,
                meta_title, meta_description, tags, status,
                DATE_FORMAT(published_at, '%b %d, %Y') as formatted_date,
                DATE_FORMAT(created_at, '%b %d, %Y at %h:%i %p') as created_date
            FROM blogs 
            WHERE slug = ? AND status = 'published'`,
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

        res.json({
            success: true,
            data: (rows as any[])[0]
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
        const { status, category_id, search, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                b.id, b.title, b.slug, b.excerpt, b.content, b.thumbnail_url, 
                bc.name as category_id, b.author_name, b.read_time, 
                b.status, b.featured, b.tags, b.meta_title, b.meta_description,
                DATE_FORMAT(b.published_at, '%b %d, %Y') as formatted_date,
                DATE_FORMAT(b.created_at, '%b %d, %Y at %h:%i %p') as created_date,
                DATE_FORMAT(b.updated_at, '%b %d, %Y at %h:%i %p') as updated_date
            FROM blogs b
            LEFT JOIN blog_categories bc ON b.category_id_id = bc.id
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }

        if (category_id && category_id !== 'All') {
            query += ' AND bc.name = ?';
            params.push(category_id);
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
        let countQuery = 'SELECT COUNT(*) as total FROM blogs b LEFT JOIN blog_categories bc ON b.category_id_id = bc.id WHERE 1=1';
        const countParams: any[] = [];

        if (status) {
            countQuery += ' AND b.status = ?';
            countParams.push(status);
        }

        if (category_id && category_id !== 'All') {
            countQuery += ' AND bc.name = ?';
            countParams.push(category_id);
        }

        if (search) {
            countQuery += ' AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }

        const [countRows] = await blogDb.promise().execute(countQuery, countParams);

        // Parse tags for each blog
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
            category_id,
            tags,
            author_name,
            author_email,
            status = 'draft',
            featured = false,
            meta_title,
            meta_description
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

        const readTime = calculateReadTime(content);
        const publishedAt = status === 'published' ? new Date() : null;

        const [result] = await blogDb.promise().execute(
            `INSERT INTO blogs 
            (title, slug, excerpt, content, thumbnail_url, category_id_id, tags, 
             author_name, author_email, status, featured, read_time, 
             meta_title, meta_description, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, slug, excerpt, content, thumbnail_url, category_id,
                JSON.stringify(tags || []), author_name, author_email,
                status, featured, readTime, meta_title, meta_description,
                publishedAt
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            data: {
                id: (result as any).insertId,
                slug,
                read_time: readTime
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
            category_id,
            tags,
            author_name,
            author_email,
            status,
            featured,
            meta_title,
            meta_description
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

        const readTime = content ? calculateReadTime(content) : undefined;
        const publishedAt = status === 'published' && currentBlog.status !== 'published'
            ? new Date() : undefined;

        // Build update query dynamically
        const updates: string[] = [];
        const values: any[] = [];

        if (title !== undefined) { updates.push('title = ?'); values.push(title); }
        if (slug !== currentBlog.slug) { updates.push('slug = ?'); values.push(slug); }
        if (excerpt !== undefined) { updates.push('excerpt = ?'); values.push(excerpt); }
        if (content !== undefined) { updates.push('content = ?'); values.push(content); }
        if (thumbnail_url !== undefined) { updates.push('thumbnail_url = ?'); values.push(thumbnail_url); }
        if (category_id !== undefined) { updates.push('category_id_id = ?'); values.push(category_id); }
        if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
        if (author_name !== undefined) { updates.push('author_name = ?'); values.push(author_name); }
        if (author_email !== undefined) { updates.push('author_email = ?'); values.push(author_email); }
        if (status !== undefined) { updates.push('status = ?'); values.push(status); }
        if (featured !== undefined) { updates.push('featured = ?'); values.push(featured); }
        if (readTime !== undefined) { updates.push('read_time = ?'); values.push(readTime); }
        if (meta_title !== undefined) { updates.push('meta_title = ?'); values.push(meta_title); }
        if (meta_description !== undefined) { updates.push('meta_description = ?'); values.push(meta_description); }
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
                read_time: readTime
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

// Upload (dynamic folders + both field names)
app.post('/api/upload-logo', (req, res, next) => {
    // Support ?folder=page-content-uploads or product-images
    let folder = '';
    if (req.query.folder === 'page-content-uploads') folder = 'page-content-uploads';
    else if (req.query.folder === 'product-images') folder = 'product-images';
    const destDir = folder ? path.join('/tmp/uploads', folder) : '/tmp/uploads';
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const storageDyn = multer.diskStorage({
        destination: (_r, _f, cb) => cb(null, destDir),
        filename: (_r, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
            cb(null, (folder ? (folder + '-') : '') + unique);
        }
    });
    const up = multer({ storage: storageDyn }).fields([{ name: 'image', maxCount: 1 }, { name: 'logo', maxCount: 1 }]);
    up(req as any, res as any, (err: any) => {
        if (err) return res.status(400).json({ error: err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Unexpected file field' : 'Upload error' });
        const files: any = (req as any).files || {};
        const fileObj = (files.image?.[0]) || (files.logo?.[0]);
        if (!fileObj) return res.status(400).json({ error: 'No file uploaded' });
        const rel = folder ? `/uploads/${folder}/${fileObj.filename}` : `/uploads/${fileObj.filename}`;
        const url = toHttpsAbsolute(rel, req);
        res.json({ path: rel, url });
    });
});

// Thumbnail upload for blogs
app.post('/api/upload/thumbnail', (req, res) => {
    const destDir = '/tmp/blogs_thumbs';
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, 'blog-thumb-' + uniqueSuffix + ext);
        }
    });

    const fileFilter = (req: any, file: any, cb: any) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    };

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    }).single('thumbnail');

    upload(req as any, res as any, (err: any) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum 5MB allowed.'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed.'
            });
        }

        if (!(req as any).file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.'
            });
        }

        const file = (req as any).file;
        const relativePath = `/blogs_thumbs/${file.filename}`;

        res.json({
            success: true,
            url: relativePath,
            message: 'Thumbnail uploaded successfully'
        });
    });
});

// Company host
app.get('/api/company-host/:companyId', async (req, res) => {
    const { companyId } = req.params;
    if (!companyId) return res.status(400).json({ error: 'Missing companyId' });
    try {
        const [rows] = await db.promise().query('SELECT host FROM company_mast WHERE id = ? LIMIT 1', [companyId]);
        if (Array.isArray(rows) && (rows as any[]).length && (rows as any[])[0].host) return res.json({ host: (rows as any[])[0].host });
        return res.status(404).json({ error: 'Host not found for companyId' });
    } catch { res.status(500).json({ error: 'DB error' }); }
});

// Site status placeholder (previous not implemented)
app.get('/api/site-status/:buildId', (_req, res) => res.status(501).json({ error: 'Not implemented' }));

// Global error handler
app.use((err, _req, res, _next) => { console.error('[API ERROR]', err); res.status(500).json({ error: 'Internal server error' }); });

export default (req, res) => app(req, res);