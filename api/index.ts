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
import fetch from 'node-fetch';

// Cloudinary configuration for permanent image storage
let cloudinary: any = null;

async function initCloudinary() {
    if (cloudinary) return cloudinary;

    try {
        // Use dynamic import for ES modules
        const cloudinaryModule = await import('cloudinary');
        cloudinary = cloudinaryModule.v2;

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        return cloudinary;
    } catch (error) {
        console.warn('⚠️ Cloudinary not configured:', error.message);
        return null;
    }
}

/**
 * Upload image buffer to Cloudinary
 */
const uploadToCloudinary = async (buffer: Buffer, folder: string, filename?: string): Promise<any> => {
    const cloudinaryInstance = await initCloudinary();
    if (!cloudinaryInstance) {
        throw new Error('Cloudinary not configured');
    }

    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder: folder,
            resource_type: 'image',
            width: 1200,
            height: 900,
            crop: 'limit',
            quality: 'auto'
        };

        if (filename) {
            uploadOptions.public_id = `${filename}_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        }

        cloudinaryInstance.uploader.upload_stream(
            uploadOptions,
            (error: any, result: any) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(buffer);
    });
};
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
try { MySQLStore = (MySQLStoreImport as any)(session); } catch (e) { console.warn('[Session] MySQLStore import failed:', e); }
let sessionStore: any;

if (MySQLStore && dbConfig) {
    try {
        console.log('[Session] Initializing MySQL session store...');
        sessionStore = new MySQLStore({
            ...dbConfig,
            createDatabaseTable: true,
            expiration: 86400000, // 24 hours
            clearExpired: true,
            checkExpirationInterval: 900000, // 15 minutes
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data'
                }
            }
        });

        sessionStore.on('error', (error: any) => {
            console.error('[Session] MySQL session store error:', error);
        });

        console.log('[Session] MySQL session store initialized successfully');
    } catch (e) {
        console.error('[Session] MySQLStore init failed, using MemoryStore:', (e as any)?.message);
        sessionStore = null;
    }
} else {
    console.warn('[Session] MySQLStore not available or dbConfig missing, using MemoryStore');
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

// Middleware to check if session user still exists in DB (matches local implementation)
app.use(async (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        try {
            const userId = req.user && (req.user as any).id;
            if (userId) {
                const [rows] = await db.promise().query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
                if (!Array.isArray(rows) || rows.length === 0) {
                    console.warn('[SESSION] User not found in DB, destroying session:', userId);
                    req.logout(function (e) {
                        if (e) console.error('[SESSION] Logout error:', e);
                    });
                    return next();
                }
            }
        } catch (err) {
            console.error('[SESSION] DB error during user validation:', err);
            // On DB error, destroy session for safety
            req.logout(function (e) {
                if (e) console.error('[SESSION] Logout error after DB error:', e);
            });
            return next();
        }
    }
    next();
});

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
        const { email, request_type } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Missing email address',
                message: 'Email address is required'
            });
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email address',
                message: 'Please provide a valid email address'
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
            body: JSON.stringify({
                email: email,
                request_type: request_type,
                otp: req.body.otp // Include OTP for validation requests
            })
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
    (process.env.NODE_ENV === 'production' ? 'https://mauto-six.vercel.app' : 'http://localhost:8080');

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

            // console.log('[OAuth Strategy] Intent:', intent, 'Query state:', req.query?.state);

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

// Memory storage for Cloudinary uploads
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

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

// Database and session health check
app.get('/api/health', async (req, res) => {
    const healthInfo: any = {
        timestamp: new Date().toISOString(),
        database: { connected: false, error: null },
        session: {
            store: sessionStore ? 'mysql' : 'memory',
            sessionId: (req as any).sessionID,
            hasSession: !!(req as any).session
        },
        authentication: {
            isAuthenticated: req.isAuthenticated?.() || false,
            hasUser: !!(req as any).user,
            userId: (req as any).user?.id || null
        }
    };

    // Test database connection
    try {
        await db.promise().query('SELECT 1');
        healthInfo.database.connected = true;
    } catch (error) {
        healthInfo.database.error = error instanceof Error ? error.message : 'Unknown error';
    }

    res.json(healthInfo);
});

// Test Cloudinary connection
app.get('/api/test-cloudinary', async (_req, res) => {
    try {
        const cloudinaryInstance = await initCloudinary();
        if (!cloudinaryInstance) {
            return res.status(500).json({
                error: 'Cloudinary not configured',
                config: {
                    hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
                    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
                    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
                }
            });
        }

        // Test API connection with ping
        const result = await cloudinaryInstance.api.ping();
        res.json({
            success: true,
            message: 'Cloudinary connected successfully',
            result
        });
    } catch (error) {
        res.status(500).json({
            error: 'Cloudinary connection failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

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
            // if (e) {
            //     console.error('[OAuth Login Error]', e);
            //     return res.redirect('/login?error=session_failed');
            // }
            // console.log('[OAuth] Session created successfully for user:', user.id);
            // console.log('[OAuth] Session ID:', (req as any).sessionID);
            // console.log('[OAuth] User object in session:', JSON.stringify(user, null, 2));

            // const isNew = (info as any)?.createdNewUser ? '1' : '0';

            // Force session save before redirect (important for serverless)
            // (req as any).session.save((saveErr) => {
            //     if (saveErr) {
            //         console.error('[OAuth] Session save error:', saveErr);
            //     }
            //     console.log('[OAuth] Session save result - error:', saveErr ? 'YES' : 'NO');

            //     // Always redirect - AuthResult will handle session verification
            //     // Pass user ID as backup in case session doesn't work in serverless
            //     const userId = encodeURIComponent(String(user.id));
            //     const email = encodeURIComponent(user.email_id || user.email || '');
            //     res.redirect(`/auth/result?new=${isNew}&uid=${userId}&email=${email}`);
            // });

            //manual changes
            if (e) return res.redirect('/login?error=session_failed');
            // If handler set a flag on req for new user, propagate via query string
            const isNew = (info as any)?.createdNewUser ? '1' : '0';
            res.redirect(`/auth/result?new=${isNew}`);
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

// Previous GET + query param version commented out
// app.get('/api/load-form', async (req,res)=>{ ... })
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

// Debug endpoint to check user's form state
app.post('/api/debug-form-state', isAuth, async (req, res) => {
    let userId = req.body?.user_id;

    // Get user_id from authenticated session (preferred) or request body (fallback)
    if (!userId && (req as any).user?.id) userId = (req as any).user.id;
    if (!userId) userId = (req as any).user?.id; // Since we have isAuth, this should always exist

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

// Test form progress functionality
app.get('/api/test-form-progress', async (req, res) => {
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.json({
            authenticated: false,
            message: 'Not authenticated - testing with mock user ID 999',
            test_user_id: 999
        });
    }

    try {
        // Test save operation
        const testFormData = {
            test: true,
            timestamp: new Date().toISOString(),
            company_title: 'Test Company'
        };

        await db.promise().query(
            `INSERT INTO user_form_progress (user_id, step_number, form_data) VALUES (?,?,?) 
             ON DUPLICATE KEY UPDATE step_number=VALUES(step_number), form_data=VALUES(form_data)`,
            [userId, 2, JSON.stringify(testFormData)]
        );

        // Test load operation
        const [rows] = await db.promise().query('SELECT step_number, form_data FROM user_form_progress WHERE user_id = ? LIMIT 1', [userId]);

        const result = {
            authenticated: true,
            user_id: userId,
            save_test: 'success',
            load_test: Array.isArray(rows) && rows.length > 0 ? 'success' : 'failed',
            loaded_data: Array.isArray(rows) && rows.length > 0 ? {
                step_number: (rows as any)[0].step_number,
                form_data: JSON.parse((rows as any)[0].form_data || '{}')
            } : null,
            timestamp: new Date().toISOString()
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Test failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            user_id: userId
        });
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
        const { generic_module_id, service_names } = req.body;
        console.log('[Custom Plan] Received generic_module_id:', generic_module_id);
        console.log('[Custom Plan] Received service_names:', service_names);

        if (!generic_module_id || !Array.isArray(generic_module_id) || generic_module_id.length === 0) {
            return res.status(400).json({
                response: false,
                error: 'generic_module_id is required',
                message: 'Please provide a valid array of generic_module_id'
            });
        }

        const requestBody = {
            generic_module_id: generic_module_id
        };

        console.log('[Calculate Custom Plan] Request payload:', requestBody);

        const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/calculate-customized-services-price', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('[Calculate Custom Plan] Response status:', response.status);

        const data = await response.json();
        console.log('[Calculate Custom Plan] Response data:', data);

        if (response.ok && (data as any).status === true) {
            // Transform the response to match our expected format
            const apiData = (data as any).data;

            // Use service names from frontend if available, otherwise use generic names
            const features_list = service_names && service_names.length > 0
                ? service_names
                : generic_module_id.map((id: number) => `Service Module ${id}`);

            const transformedData = {
                plan_name: "Custom Plan",
                plan_id: 999,
                features_list: features_list,
                plan_details: [
                    {
                        id: 1,
                        plan_name: "Custom Plan",
                        duration: "monthly",
                        base_price_per_user: apiData.monthly.per_month_external.toString(),
                        base_price_per_user_external: apiData.monthly.per_month_external.toString(),
                        discount: apiData.discount.monthly.discount.toString(),
                        discount_label: apiData.discount.monthly.discount_label,
                        min_users: 1,
                        max_users: Number.MAX_SAFE_INTEGER,
                        trial_days: 7,
                        base_price_per_external_user_per_month: apiData.monthly.per_month_external
                    },
                    {
                        id: 2,
                        plan_name: "Custom Plan",
                        duration: "quaterly",
                        base_price_per_user: apiData.quaterly.per_month_external.toString(),
                        base_price_per_user_external: apiData.quaterly.per_month_external.toString(),
                        discount: apiData.discount.quaterly.discount.toString(),
                        discount_label: apiData.discount.quaterly.discount_label,
                        min_users: 1,
                        max_users: Number.MAX_SAFE_INTEGER,
                        trial_days: 7,
                        base_price_per_external_user_per_month: apiData.quaterly.per_month_external
                    },
                    {
                        id: 3,
                        plan_name: "Custom Plan",
                        duration: "half_yearly",
                        base_price_per_user: apiData.half_yearly.per_month_external.toString(),
                        base_price_per_user_external: apiData.half_yearly.per_month_external.toString(),
                        discount: apiData.discount.half_yearly.discount.toString(),
                        discount_label: apiData.discount.half_yearly.discount_label,
                        min_users: 1,
                        max_users: Number.MAX_SAFE_INTEGER,
                        trial_days: 7,
                        base_price_per_external_user_per_month: apiData.half_yearly.per_month_external
                    },
                    {
                        id: 4,
                        plan_name: "Custom Plan",
                        duration: "yearly",
                        base_price_per_user: apiData.yearly.per_month_external.toString(),
                        base_price_per_user_external: apiData.yearly.per_month_external.toString(),
                        discount: apiData.discount.yearly.discount.toString(),
                        discount_label: apiData.discount.yearly.discount_label,
                        min_users: 1,
                        max_users: Number.MAX_SAFE_INTEGER,
                        trial_days: 7,
                        base_price_per_external_user_per_month: apiData.yearly.per_month_external
                    }
                ],
                // Store the original pricing data for step 3
                pricing_data: apiData
            };

            res.status(200).json({
                response: true,
                data: transformedData,
                message: 'Custom plan calculated successfully'
            });
        } else {
            const errorMessage = (data as any).message || (data as any).error || 'Failed to calculate custom plan pricing';
            res.status(response.status || 500).json({
                response: false,
                error: 'Failed to calculate custom plan pricing',
                message: errorMessage
            });
        }
    } catch (error) {
        console.error('[Calculate Custom Plan] Error:', error);
        res.status(500).json({
            response: false,
            error: 'Failed to calculate custom plan pricing',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

async function handleCreateCustomizedPlan(req: express.Request, res: express.Response) {
    try {
        const { plan_name, application_type, generic_module_id, duration, max_users } = req.body;

        console.log('[Create Customized Plan] Received request:', {
            plan_name,
            application_type,
            generic_module_id,
            duration,
            max_users
        });

        // Validate required fields
        if (!plan_name || !application_type || !generic_module_id || !Array.isArray(generic_module_id) || !duration || !max_users) {
            return res.status(400).json({
                response: false,
                error: 'Missing required fields',
                message: 'plan_name, application_type, generic_module_id, duration, and max_users are required'
            });
        }

        const requestBody = {
            plan_name,
            application_type,
            generic_module_id,
            duration,
            max_users
        };

        console.log('[Create Customized Plan] Request payload:', requestBody);

        const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/create-customized-plan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('[Create Customized Plan] Response status:', response.status);

        const data = await response.json();
        console.log('[Create Customized Plan] Response data:', data);

        // Forward the response from external API
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[Create Customized Plan] Error:', error);
        res.status(500).json({
            response: false,
            error: 'Failed to create customized plan',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

app.post("/api/get-plan", handleGetPlans);
app.post("/api/get-services-list", handleGetServicesList);
app.post("/api/calculate-custom-plan", handleCalculateCustomPlan);
app.post("/api/create-customized-plan", handleCreateCustomizedPlan);
app.post("/api/process-payment", handleProcessPayment);
app.post("/api/otp-request", handleOtpRequest);

// Save trial user endpoint - proxy to external API
app.post("/api/save-trial-user", async (req, res) => {
    try {
        console.log('[Save Trial User Proxy] Request body:', req.body);

        // Make request to external API
        const response = await fetch('http://122.176.112.254/www-demo-msell-in/public/api/save-trial-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        console.log('[Save Trial User Proxy] External API response status:', response.status);

        const data = await response.json();
        console.log('[Save Trial User Proxy] External API response data:', data);

        // Forward the response from external API
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[Save Trial User Proxy] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save trial user details'
        });
    }
});

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
            LEFT JOIN blog_categories bc ON b.category_id = bc.id
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
            LEFT JOIN blog_categories bc ON b.category_id = bc.id
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
        let countQuery = 'SELECT COUNT(*) as total FROM blogs b LEFT JOIN blog_categories bc ON b.category_id = bc.id WHERE 1=1';
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
            (title, slug, excerpt, content, thumbnail_url, category_id, tags, 
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
        if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id); }
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

// Upload (dynamic folders + both field names) - Using Cloudinary for permanent storage
app.post('/api/upload-logo', memoryUpload.any(), async (req, res) => {
    try {
        // console.log('[upload-logo] Starting upload process...');
        // console.log('[upload-logo] Query params:', req.query);
        // console.log('[upload-logo] Files received:', (req as any).files?.map((f: any) => ({ fieldname: f.fieldname, originalname: f.originalname })) || 'No files');

        const files: any[] = (req as any).files || [];
        const fileObj = files[0]; // Take the first file regardless of field name

        if (!fileObj) {
            console.error('[upload-logo] No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // console.log('[upload-logo] File details:', {
        //     fieldname: fileObj.fieldname,
        //     originalname: fileObj.originalname,
        //     mimetype: fileObj.mimetype,
        //     size: fileObj.size
        // });

        // Validate file type
        if (!fileObj.mimetype.startsWith('image/')) {
            console.error('[upload-logo] Invalid file type:', fileObj.mimetype);
            return res.status(400).json({ error: 'Only image files are allowed' });
        }

        // Determine Cloudinary folder and filename prefix based on query parameter and field
        let cloudinaryFolder = 'company-logos'; // default
        let filenamePrefix = 'logo'; // default

        const folderParam = req.query.folder as string;
        const fieldParam = req.query.field as string || fileObj.fieldname;

        // AutoSite Step 4 specific mappings
        if (folderParam === 'page-content-uploads') {
            // Home page content uploads from AutoSite step 4
            if (fieldParam === 'banner_path' || fieldParam === 'banner' || fieldParam?.includes('banner')) {
                cloudinaryFolder = 'home-banners';
                filenamePrefix = 'banner';
            } else if (fieldParam === 'photo_1' || fieldParam === 'photo_2' || fieldParam === 'photo_3' || fieldParam === 'photo_4') {
                cloudinaryFolder = 'home-photos';
                filenamePrefix = fieldParam; // Use exact field name (photo_1, photo_2, etc.)
            } else {
                // Generic page content
                cloudinaryFolder = 'page-content';
                filenamePrefix = 'content';
            }
        } else if (folderParam === 'product-images') {
            // Product images from AutoSite step 4
            cloudinaryFolder = 'product-images';
            filenamePrefix = 'product';
        } else if (folderParam === 'company-logos' || fieldParam === 'logo') {
            // Company logo uploads
            cloudinaryFolder = 'company-logos';
            filenamePrefix = 'logo';
        } else if (fieldParam === 'thumbnail') {
            // Blog thumbnails
            cloudinaryFolder = 'blog-thumbnails';
            filenamePrefix = 'blog_thumb';
        } else {
            // Fallback logic based on field name patterns
            if (fieldParam?.includes('banner')) {
                cloudinaryFolder = 'home-banners';
                filenamePrefix = 'banner';
            } else if (fieldParam?.includes('photo')) {
                cloudinaryFolder = 'home-photos';
                filenamePrefix = fieldParam;
            } else if (fieldParam?.includes('product') || fieldParam?.includes('service')) {
                cloudinaryFolder = 'product-images';
                filenamePrefix = 'product';
            } else if (fieldParam?.includes('logo')) {
                cloudinaryFolder = 'company-logos';
                filenamePrefix = 'logo';
            } else {
                cloudinaryFolder = 'uploads';
                filenamePrefix = fieldParam || 'file';
            }
        }

        // console.log(`[upload-logo] Uploading to folder: ${cloudinaryFolder}, prefix: ${filenamePrefix}, fieldname: ${fileObj.fieldname}, query_field: ${fieldParam}, query_folder: ${folderParam}`);

        // Test Cloudinary initialization first
        const cloudinaryInstance = await initCloudinary();
        if (!cloudinaryInstance) {
            console.error('[upload-logo] Cloudinary not initialized');
            return res.status(500).json({ error: 'Cloud storage not configured. Please check environment variables.' });
        }

        // console.log('[upload-logo] Cloudinary initialized successfully');

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
            fileObj.buffer,
            cloudinaryFolder,
            filenamePrefix
        );

        // console.log(`[upload-logo] Upload successful:`, result.secure_url);

        res.json({
            path: result.secure_url,
            url: result.secure_url,
            public_id: result.public_id,
            folder: cloudinaryFolder,
            fieldname: fileObj.fieldname
        });

    } catch (error) {
        console.error('Logo upload error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Upload failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Thumbnail upload for blogs - Using Cloudinary for permanent storage
app.post('/api/upload/thumbnail', memoryUpload.single('thumbnail'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded.'
            });
        }

        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: 'Only image files are allowed.'
            });
        }

        // Validate file size (5MB limit)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum 5MB allowed.'
            });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(
            req.file.buffer,
            'blog-thumbnails',
            'blog_thumb'
        );

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            message: 'Thumbnail uploaded successfully'
        });

    } catch (error) {
        console.error('Thumbnail upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload thumbnail',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
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