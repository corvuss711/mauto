import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import { RowDataPacket } from 'mysql2';

// API to fetch business sectors with template_type_id
export const getBusinessSectors = async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT name, template_type_id FROM business_sectors');
    res.json({ sectors: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch business sectors' });
  }
};

// --- Passport.js, bcrypt, express-session setup ---
// Session middleware (should be used in main app.js/server.js, but for demo, add here)
export const sessionMiddleware = session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax', // Use 'none' if frontend is on HTTPS and different domain
    secure: false,    // Set to true if using HTTPS
    httpOnly: true   // Prevent client-side JS access
  }
});

// Passport local strategy setup
passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      const [rows] = await db.promise().query('SELECT * FROM users WHERE email_id = ?', [email]);
      const user = Array.isArray(rows) && rows.length > 0 ? (rows[0] as RowDataPacket) : null;
      if (!user) return done(null, false, { message: 'No account found with this email. Please sign up first.' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password. Please try again.' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM users WHERE id = ?', [id]);
    const user = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// isAuthenticated middleware
export function isAuthenticated(req: Request, res: Response, next: any) {
  if ((req as any).isAuthenticated && (req as any).isAuthenticated()) {
    // Ensure req.user is typed as any or has an 'id' property
    req.userId = (req.user as any).id;
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// --- Auth Routes ---
import { Router } from 'express';
export const authRouter = Router();

// --- Multi-step Form Progress Routes ---
export const formProgressRouter = Router();

// Save or update form progress for the logged-in user
formProgressRouter.post('/save-step', isAuthenticated, async (req: Request, res: Response) => {
  const userId = req.userId;
  const { step_number, form_data } = req.body;
  if (typeof step_number !== 'number' || !form_data) {
    return res.status(400).json({ error: 'Missing or invalid data' });
  }
  try {
    await db.promise().query(
      `INSERT INTO user_form_progress (user_id, step_number, form_data)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE step_number = VALUES(step_number), form_data = VALUES(form_data)`,
      [userId, step_number, JSON.stringify(form_data)]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Load saved form progress for the logged-in user
formProgressRouter.get('/load-form', isAuthenticated, async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    // Fetch user_form_progress
    const [progressRows] = await db.promise().query(
      'SELECT step_number, form_data FROM user_form_progress WHERE user_id = ?',
      [userId]
    );
    let step_number = 0;
    let form_data = {};
    if (Array.isArray(progressRows) && progressRows.length > 0) {
      const row = progressRows as RowDataPacket[];
      step_number = row[0].step_number;
      form_data = row[0].form_data ? JSON.parse(row[0].form_data) : {};
    }

    // Fetch company details for pre-fill
    const [companyRows] = await db.promise().query('SELECT * FROM company_mast WHERE user_id = ? LIMIT 1', [userId]);
    let company = null;
    if (Array.isArray(companyRows) && companyRows.length > 0) {
      company = companyRows[0];
    }

    res.json({ step_number, form_data, company });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Reset form progress for the logged-in user
formProgressRouter.post('/reset-form', isAuthenticated, async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    await db.promise().query('DELETE FROM user_form_progress WHERE user_id = ?', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// Mount these routes in your main app.js/server.js:
// app.use('/', authRouter);

// Signup route logic moved to index.ts
/*
authRouter.post('/signup', async (req: Request, res: Response, next) => {
  // ...logic moved to index.ts...
});
*/

// Login route logic moved to index.ts
/*
authRouter.post('/login', (req: Request, res: Response, next) => {
  // ...logic moved to index.ts...
});
*/

// Logout route logic moved to index.ts
/*
authRouter.get('/logout', (req: Request, res: Response) => {
  // ...logic moved to index.ts...
});
*/


// Minimal handleSiteStatus for API compatibility
export const handleSiteStatus = async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
};
import { Request, Response } from "express";
import dotenv from "dotenv";

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
dotenv.config();
// Disabled external AI and payment SDK imports for production hardening
// import Groq from "groq-sdk"; // Groq usage disabled
import fetch from "node-fetch";
// import Razorpay from "razorpay"; // Razorpay usage disabled
import crypto from "crypto"; // Retained for potential internal hashing (payment logic disabled)
import multer from "multer";
import path from "path";
import fs from "fs";

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
    console.log('✅ Cloudinary configured successfully in auto-site.ts');
    return cloudinary;
  } catch (error) {
    console.warn('⚠️ Cloudinary not configured in auto-site.ts:', error.message);
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

// @ts-ignore
import mysql from "mysql2";
import { ResultSetHeader } from 'mysql2';

// --- MySQL Pool Setup ---
function parseMysqlUrl(url) {
  const m = url.match(/^mysql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/);
  if (!m) throw new Error("Invalid MYSQL_URL format");
  return {
    host: m[3],
    user: m[1],
    password: m[2],
    port: Number(m[4]),
    database: m[5]
  };
}
// Local development connection (kept for future localhost testing)
// export const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'mauto'
// });

// Deployment / Railway connection
const MYSQL_URL = process.env.MYSQL_URL;
let resolvedConfig: any;
try {
  resolvedConfig = parseMysqlUrl(MYSQL_URL);
} catch (e) {
  console.error('[DB] Invalid MYSQL_URL format, falling back to localhost. Error:', (e as Error).message);
  resolvedConfig = { host: 'localhost', user: 'root', password: '', port: 3306, database: 'mauto' };
}

export const db = mysql.createConnection({
  host: resolvedConfig.host,
  user: resolvedConfig.user,
  password: resolvedConfig.password,
  port: resolvedConfig.port,
  database: resolvedConfig.database
});


db.connect((err) => {
  if (err) {
    console.error('Error connecting to DB:', err);
    return;
  }
  console.log('Connected to MySQL Database: mauto');
});

// Razorpay initialization disabled
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID",
//   key_secret: process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET"
// });

interface SiteGenerationRequest {
  hasDomain: boolean;
  domain: string;
  businessSector: string;
  theme: string;
  companyName: string;
  email: string;
  location: string;
  homeContent: string;
  aboutContent: string;
  contactContent: string;
  userPassword: string;
}

interface SiteStatus {
  status: "building" | "ready" | "error";
  progress: number;
  message: string;
  previewUrl?: string;
}

interface DeployRequest {
  domain: string;
  previewUrl: string;
  companyName: string;
  email: string;
  userPassword: string;
  paymentId?: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes: {
    domain: string;
    companyName: string;
    email: string;
  };
}

interface PaymentVerificationRequest {
  paymentId: string;
  orderId: string;
  signature: string;
  domain: string;
  companyName: string;
  email: string;
  userPassword: string;
}

// In-memory storage for demo purposes
const siteBuilds = new Map<string, SiteStatus>();
// const paymentOrders = new Map<string, any>(); // Payment feature disabled

// Multisite / WordPress integration disabled
// const MULTISITE_BASE_DOMAIN = "master1.lightlysites.com";
// function getFullSiteUrl(domain: string) {
//   return `${process.env.WP_URL.replace(/\/$/, '')}/${domain.replace(/^\//, '')}`;
// }

// Multer setup for logo uploads - Using memory storage for Cloudinary
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Logo upload endpoint - Using Cloudinary for permanent storage
export const uploadLogo = [
  memoryUpload.any(),
  async (req: Request, res: Response) => {
    try {
      const files = (req as any).files;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = files[0]; // Get the first uploaded file

      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed' });
      }

      // Get field name for better organization
      const fieldName = req.query.field as string;

      // Determine Cloudinary folder and filename based on field and folder parameters
      let cloudinaryFolder = 'company-logos'; // default
      let filenamePrefix = 'logo';

      // Enhanced field mapping for AutoSite step 4 image uploads
      if (req.query.folder === 'page-content-uploads') {
        if (fieldName === 'banner_path') {
          cloudinaryFolder = 'home-banners';
          filenamePrefix = 'banner';
        } else if (fieldName?.startsWith('photo_')) {
          cloudinaryFolder = 'home-photos';
          filenamePrefix = fieldName;
        } else {
          cloudinaryFolder = 'page-content-uploads';
          filenamePrefix = 'content';
        }
      } else if (req.query.folder === 'product-images') {
        cloudinaryFolder = 'product-images';
        filenamePrefix = 'product';
      } else if (fieldName === 'banner_path') {
        cloudinaryFolder = 'home-banners';
        filenamePrefix = 'banner';
      } else if (fieldName?.startsWith('photo_')) {
        cloudinaryFolder = 'home-photos';
        filenamePrefix = fieldName;
      } else if (fieldName === 'product_image') {
        cloudinaryFolder = 'product-images';
        filenamePrefix = 'product';
      }

      console.log(`Uploading ${fieldName || 'unknown field'} to folder: ${cloudinaryFolder}`);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        file.buffer,
        cloudinaryFolder,
        filenamePrefix
      );

      res.json({
        path: result.secure_url,
        url: result.secure_url,
        public_id: result.public_id,
        folder: cloudinaryFolder
      });

    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

// Thumbnail upload endpoint for blogs - Using Cloudinary for permanent storage
export const uploadThumbnail = [
  memoryUpload.any(),
  async (req: Request, res: Response) => {
    try {
      const files = (req as any).files;
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded.'
        });
      }

      const file = files[0]; // Get the first uploaded file

      // Validate file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed.'
        });
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum 5MB allowed.'
        });
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(
        file.buffer,
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
  }
];

export const handleDomainCheck = async (req: Request, res: Response) => {
  try {
    const { domain } = req.body;
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }
    const query = 'SELECT id FROM company_mast WHERE host = ? LIMIT 1';
    const [rows] = await db.promise().query(query, [domain]);
    if (Array.isArray(rows) && rows.length > 0) {
      return res.json({ exists: true, message: 'Domain already exists' });
    } else {
      return res.json({ exists: false, message: 'Domain is available' });
    }
  } catch (err) {
    console.error('Domain check error:', err);
    return res.status(500).json({ error: 'Failed to check domain' });
  }
}

// Commented out steps for now: Domain Check, Theme Selection, AI Generation, Preview, Payment, Deploy
// Remove validation for hasDomain and theme, and comment out AI/payment/deploy logic

export const handleSaveCompanyDetails = async (req: Request, res: Response) => {
  const data = req.body;
  // Data expected from frontend:
  // {
  //   companyName, email, phone, domain, businessSector, theme, logoPath,
  //   homeContent, aboutContent, contactContent, location, facebookLink, youtubeLink, linkedinLink, iframe, user_id
  // }
  try {
    if (!db) throw new Error("Database not configured");
    const user_id = data.user_id;
    // Ensure template_type_id is either a valid number or null
    let template_type_id = null;
    if (data.template_type_id !== undefined && data.template_type_id !== null && !isNaN(Number(data.template_type_id))) {
      template_type_id = Number(data.template_type_id);
    }
    // Validate required fields
    if (!data.companyName || !data.email || !data.phone || !data.domain || !data.businessSector || !data.location) {
      return res.status(400).json({ error: "Missing required fields: companyName, email, phone, domain, businessSector, address" });
    }

    // Build logo path: absolute if BASE_URL present, else keep relative
    let logoPathAbs = data.logoPath || '';
    if (logoPathAbs && !logoPathAbs.startsWith('http')) {
      const base = (process.env.BASE_URL || '').replace(/\/$/, '');
      if (base) {
        if (!logoPathAbs.startsWith('/')) logoPathAbs = '/' + logoPathAbs;
        logoPathAbs = base + logoPathAbs;
      }
    }

    // Check if company exists for this user
    const [companyRows] = await db.promise().query('SELECT id FROM company_mast WHERE user_id = ? LIMIT 1', [user_id]);
    let companyId;
    if (Array.isArray(companyRows) && companyRows.length > 0) {
      // Update existing company
      companyId = (companyRows as RowDataPacket[])[0].id;
      const updateQuery = `UPDATE company_mast SET name = ?, business_email = ?, business_phone = ?, host = ?, sector = ?, logo = ?, address = ?, facebook = ?, youtube = ?, linkedin = ?, iframe = ?, template_type_id = ? WHERE id = ?`;
      const updateValues = [
        data.companyName,
        data.email,
        data.phone,
        data.domain,
        data.businessSector,
        logoPathAbs,
        data.location,
        data.facebookLink || '',
        data.youtubeLink || '',
        data.linkedinLink || '',
        data.iframe || '',
        template_type_id,
        companyId
      ];
      await db.promise().query(updateQuery, updateValues);
    } else {
      // Insert new company (should not happen in edit mode)
      const insertQuery = `INSERT INTO company_mast (name, business_email, business_phone, host, sector, logo, address, facebook, youtube, linkedin, iframe, user_id, created_at, template_type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`;
      const insertValues = [
        data.companyName,
        data.email,
        data.phone,
        data.domain,
        data.businessSector,
        logoPathAbs,
        data.location,
        data.facebookLink || '',
        data.youtubeLink || '',
        data.linkedinLink || '',
        data.iframe || '',
        user_id,
        template_type_id
      ];
      const [result] = await db.promise().query(insertQuery, insertValues) as [ResultSetHeader, any];
      companyId = result.insertId;
      // Associate user with company
      await db.promise().query('UPDATE users SET company_id = ? WHERE id = ?', [companyId, user_id]);
    }

    return res.json({ success: true, companyId });
  } catch (dbErr) {
    console.error("DB Save Error:", dbErr);
    return res.status(500).json({ error: "Failed to save company details" });
  }
}

export const handleGenerateSite = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const template_type_id = data.template_type_id || null;
    // Validate required fields for each section
    if (!data.domain || !data.companyName || !data.email) {
      return res.status(400).json({ error: "Missing required fields: domain, companyName, email" });
    }
    if (!data.heading || !data.heading_desc || !data.banner_path) {
      return res.status(400).json({ error: "Missing required home page fields: title, subtitle, banner" });
    }
    if (!data.vision_desc || !data.mission_desc || !data.what_we_do || !data.our_story) {
      return res.status(400).json({ error: "Missing required about page fields: vision, mission, what we do, our story" });
    }
    // Validate campaigns/products based on sector
    if (data.template_type_id === 2) {
      if (!Array.isArray(data.campaigns) || data.campaigns.length === 0) {
        return res.status(400).json({ error: "At least one campaign is required for NGO" });
      }
    } else {
      if (!Array.isArray(data.products) || data.products.length === 0) {
        return res.status(400).json({ error: "At least one product/service is required" });
      }
    }
    // Product-based checkbox is now optional; do not enforce required check
    if (!db) throw new Error("Database not configured");

    // company_mast table uses id as primary key, referenced as company_id in other tables
    const companyId = data.company_id;
    // Validate companyId exists in company_mast
    if (!companyId || isNaN(Number(companyId))) {
      return res.status(400).json({ error: "Invalid or missing company_id. Please save company details first." });
    }
    const [companyRows] = await db.promise().query('SELECT id FROM company_mast WHERE id = ?', [companyId]);
    if (!Array.isArray(companyRows) || companyRows.length === 0) {
      return res.status(400).json({ error: "Company not found. Please save company details first." });
    }
    function absPath(p) {
      if (!p) return '';
      if (p.startsWith('http')) return p;
      const base = (process.env.BASE_URL || '').replace(/\/$/, '');
      if (!base) return p; // No BASE_URL provided: keep relative
      if (!p.startsWith('/')) p = '/' + p;
      return base + p;
    }
    // 1. Save or update Home Page Content
    const [homeRows] = await db.promise().query('SELECT id FROM home WHERE company_id = ? LIMIT 1', [companyId]);
    if (Array.isArray(homeRows) && homeRows.length > 0) {
      // Update home
      const homeUpdate = `UPDATE home SET heading = ?, heading_desc = ?, banner_path = ?, photo_1 = ?, photo_2 = ?, photo_3 = ?, photo_4 = ? WHERE company_id = ?`;
      const homeUpdateValues = [
        data.heading,
        data.heading_desc,
        absPath(data.banner_path),
        absPath(data.photo_1),
        absPath(data.photo_2),
        absPath(data.photo_3),
        absPath(data.photo_4),
        companyId
      ];
      await db.promise().query(homeUpdate, homeUpdateValues);
    } else {
      // Insert home
      const homeQuery = `INSERT INTO home(
        heading,
        heading_desc,
        banner_path,
        photo_1,
        photo_2,
        photo_3,
        photo_4,
        company_id,
        created_at
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
      const homeValues = [
        data.heading,
        data.heading_desc,
        absPath(data.banner_path),
        absPath(data.photo_1),
        absPath(data.photo_2),
        absPath(data.photo_3),
        absPath(data.photo_4),
        companyId
      ];
      await db.promise().query(homeQuery, homeValues);
    }

    // 2. Save or update About Us Page Content
    const [aboutRows] = await db.promise().query('SELECT id FROM about_page WHERE company_id = ? LIMIT 1', [companyId]);
    if (Array.isArray(aboutRows) && aboutRows.length > 0) {
      // Update about_page
      const aboutUpdate = `UPDATE about_page SET vision_desc = ?, mission_desc = ?, what_we_do = ?, our_story = ? WHERE company_id = ?`;
      const aboutUpdateValues = [
        data.vision_desc,
        data.mission_desc,
        data.what_we_do,
        data.our_story,
        companyId
      ];
      await db.promise().query(aboutUpdate, aboutUpdateValues);
    } else {
      // Insert about_page
      const aboutQuery = `INSERT INTO about_page(
        vision_desc,
        mission_desc,
        what_we_do,
        our_story,
        company_id,
        created_at
      ) VALUES(?, ?, ?, ?, ?, NOW())`;
      const aboutValues = [
        data.vision_desc,
        data.mission_desc,
        data.what_we_do,
        data.our_story,
        companyId
      ];
      await db.promise().query(aboutQuery, aboutValues);
    }

    // 3. Save or update Product/Service or Campaigns Content (multiple)
    if (template_type_id === 2) {
      // Save or update campaigns for NGO
      if (!Array.isArray(data.campaigns) || data.campaigns.length === 0) {
        return res.status(400).json({ error: "At least one campaign is required for NGO" });
      }
      // Delete old campaigns for this company (simple way to sync array)
      await db.promise().query('DELETE FROM campaigns WHERE company_id = ?', [companyId]);
      const campaignQuery = `INSERT INTO campaigns(
        name,
        description,
        volunteers,
        raised,
        campaign_status,
        goal,
        impact,
        company_id
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
      for (const camp of data.campaigns) {
        const campaignValues = [
          camp.name || camp.campaign_name,
          camp.description || camp.campaign_description,
          camp.volunteers,
          camp.raised,
          camp.campaign_status,
          camp.goal,
          camp.impact,
          companyId
        ];
        await db.promise().query(campaignQuery, campaignValues);
      }
    } else if (Array.isArray(data.products) && data.products.length > 0) {
      // Save or update products/services for non-NGO
      await db.promise().query('DELETE FROM product_services WHERE company_id = ?', [companyId]);
      const productQuery = `INSERT INTO product_services(
        name,
        short_description,
        full_description,
        image,
        price,
        display_in_menu,
        status,
        created_by,
        updated_by,
        company_id
      ) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      for (const prod of data.products) {
        // status should be integer (1=active, 0=inactive)
        let statusValue = 1;
        if (typeof prod.status === 'number') {
          statusValue = prod.status;
        } else if (typeof prod.status === 'string') {
          statusValue = prod.status === 'active' ? 1 : 0;
        }
        const productValues = [
          prod.name,
          prod.short_description,
          prod.full_description,
          absPath(prod.product_image),
          prod.price || null,
          (prod.display_in_menu === 1 ? 1 : 0),
          statusValue,
          // prod.created_at || new Date().toISOString(),
          // prod.updated_at || new Date().toISOString(),
          prod.created_by || "admin",
          prod.updated_by || "admin",
          companyId
        ];
        await db.promise().query(productQuery, productValues);
      }
    }

    // Robust increment: always increment if isEditing is true and company exists
    if (data.isEditing) {
      const [companyRowsEdit] = await db.promise().query('SELECT id FROM company_mast WHERE id = ?', [companyId]);
      if (Array.isArray(companyRowsEdit) && companyRowsEdit.length > 0) {
        await db.promise().query('UPDATE company_mast SET times_edited = COALESCE(times_edited,0) - 1 WHERE id = ?', [companyId]);
      }
      // Decrement times_edited using COALESCE after the if block

    }

    // Fire-and-forget: send company_id to second codebase, but do not wait for response
    // fetch('http://localhost:5000/api/set-company', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ companyId: company_id })
    // }).catch(() => { });
    // // Respond to frontend immediately
    return res.json({ success: true, companyId: companyId });
  } catch (error) {
    console.error("Error saving site sections:", error);
    res.status(500).json({ error: "Failed to save site sections" });
  }
};

// Check times_edited for a company
export const handleTimesEdited = async (req: Request, res: Response) => {
  try {
    const { company_id } = req.body;
    if (!company_id || isNaN(Number(company_id))) {
      return res.status(400).json({ error: "Missing or invalid company_id" });
    }
    const [rows] = await db.promise().query('SELECT times_edited FROM company_mast WHERE id = ?', [company_id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    const timesEdited = (rows[0] as any).times_edited || 0;
    if (timesEdited <= 0) {
      return res.status(403).json({ error: "You have reached the maximum number of edits allowed." });
    }
    return res.json({ success: true, times_edited: timesEdited });
  } catch (err) {
    console.error("Error checking times_edited:", err);
    return res.status(500).json({ error: "Failed to check times_edited" });
  }
};

// Comment out payment and deploy logic for now
// export const createPaymentOrder = async (req: Request, res: Response) => {
//   try {
//     const data: PaymentRequest = req.body;

//     if (!data.amount || !data.currency || !data.receipt || !data.notes) {
//       return res.status(400).json({ error: "Missing required payment fields" });
//     }

//     const options = {
//       amount: data.amount * 100, // Razorpay expects amount in paise
//       currency: data.currency,
//       receipt: data.receipt,
//       notes: data.notes
//     };

//     const order = await razorpay.orders.create(options);

//     // Store order details for verification
//     paymentOrders.set(order.id, {
//       ...order,
//       notes: data.notes
//     });

//     res.json({
//       success: true,
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID"
//     });

//   } catch (error) {
//     console.error("Error creating payment order:", error);
//     res.status(500).json({ error: "Failed to create payment order" });
//   }
// };

// export const verifyPaymentAndDeploy = async (req: Request, res: Response) => {
//   try {
//     const data: PaymentVerificationRequest = req.body;

//     console.log("Payment verification request received:", {
//       paymentId: data.paymentId,
//       orderId: data.orderId,
//       domain: data.domain,
//       companyName: data.companyName,
//       email: data.email
//     });

//     if (!data.paymentId || !data.orderId || !data.signature || !data.domain || !data.companyName || !data.email || !data.userPassword) {
//       console.error("Missing required fields:", data);
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Verify payment signature
//     const text = data.orderId + "|" + data.paymentId;
//     const expectedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "YOUR_KEY_SECRET")
//       .update(text)
//       .digest('hex');

//     console.log("Signature verification:", {
//       expected: expectedSignature,
//       received: data.signature,
//       match: expectedSignature === data.signature
//     });

//     if (expectedSignature !== data.signature) {
//       console.error("Invalid payment signature");
//       return res.status(400).json({ error: "Invalid payment signature" });
//     }

//     // Verify payment with Razorpay
//     console.log("Fetching payment from Razorpay:", data.paymentId);
//     const payment = await razorpay.payments.fetch(data.paymentId);

//     console.log("Payment status:", payment.status);

//     if (payment.status !== 'captured') {
//       console.error("Payment not completed, status:", payment.status);
//       return res.status(400).json({ error: "Payment not completed" });
//     }

//     console.log("Payment verified successfully, proceeding with deployment");

//     // Payment verified, proceed with deployment
//     const deployData: DeployRequest = {
//       domain: data.domain,
//       previewUrl: getFullSiteUrl(data.domain),
//       companyName: data.companyName,
//       email: data.email,
//       userPassword: data.userPassword,
//       paymentId: data.paymentId
//     };

//     // Call the existing deployment logic
//     return await handleDeployToHostinger({ body: deployData } as Request, res);

//   } catch (error) {
//     console.error("Error verifying payment:", error);
//     res.status(500).json({ 
//       error: "Failed to verify payment",
//       details: error instanceof Error ? error.message : "Unknown error"
//     });
//   }
// };

// export const handleDeployToHostinger = async (req: Request, res: Response) => {
//   try {
//     const data: DeployRequest = req.body;
//     if (!data.domain || !data.previewUrl || !data.companyName || !data.email || !data.userPassword) {
//       return res.status(400).json({ 
//         error: "Missing required fields" 
//       });
//     }
//     // Always generate a valid deployedUrl and previewUrl using subdirectory structure
//     const siteUrl = getFullSiteUrl(data.domain);
//     return res.json({
//       success: true,
//       deployedUrl: siteUrl,
//       previewUrl: siteUrl,
//       message: "Site deployed successfully (or already live)"
//     });
//   } catch (error) {
//     console.error("Error deploying site:", error);
//     res.status(500).json({ 
//       error: "Failed to deploy site" 
//     });
//   }
// };

// Comment out AI prompt and simulation helpers for now
// function generateAIPrompt(data: SiteGenerationRequest): string {
//   return `You are an expert web designer and copywriter.Generate a JSON object for a beautiful, modern, multi - page business website for a ${ data.businessSector } company named "${data.companyName}" using the "${data.theme}" theme.The domain is "${data.domain}".

// The JSON should have this structure:
// {
//   "Home": { "title": "Home", "content": "<html>...full HTML for Home page...</html>" },
//   "About": { "title": "About", "content": "<html>...full HTML for About page...</html>" },
//   "Services": { "title": "Services", "content": "<html>...full HTML for Services page...</html>" },
//   "Contact": { "title": "Contact", "content": "<html>...full HTML for Contact page...</html>" }
// }

// **Requirements:**
// - Each page's 'content' must be a complete, ready-to-use HTML layout (not just a section), including:
//   - A professional, modern navbar at the top (with links to Home, About, Services, Contact; highlight the current page; use company branding/colors; mobile responsive).
//   - A beautiful footer at the bottom (with company info, contact details, social media links, copyright, and consistent branding/colors).
//   - Visually stunning, business-appropriate design for the ${data.businessSector} sector, using the "${data.theme}" theme.
//   - Use royalty-free images (Unsplash or similar, e.g. <img src='https://images.unsplash.com/...'>) that match the business type and page purpose.
//   - Consistent, modern, and cohesive look across all pages.


// - Home page: Hero section, intro, navigation to all pages, call-to-action, images.
// - About page: Company story, team, mission, images.
// - Services page: List of services as cards or sections, icons/images, descriptions.
// - Contact page: Contact info, contact form (HTML only), map, images.
// - Use the following for content inspiration:
//   - Home: ${data.homeContent}
//   - About: ${data.aboutContent}
//   - Contact: ${data.contactContent}
// - Use this email: ${data.email}${data.location ? `, Location: ${data.location}` : ''}.
// - Do NOT include a Blog page.
// - Respond ONLY with the JSON object, no explanation.`;
// }

// function simulateSiteGeneration(buildId: string, data: SiteGenerationRequest, aiContent?: string) {
//   // Only use the four steps expected by the frontend for tick icons
//   const steps = [
//     "Analyzing requirements...",
//     "Generating content...",
//     "Applying theme...",
//     "Optimizing for SEO..."
//     // 'Finalizing design...' and 'Creating preview...' removed for tick compatibility
//   ];

//   let currentStep = 0;
//   const interval = setInterval(() => {
//     const progress = Math.min((currentStep / steps.length) * 100, 100);

//     if (currentStep < steps.length) {
//       siteBuilds.set(buildId, {
//         status: "building",
//         progress,
//         message: steps[currentStep]
//       });
//       currentStep++;
//     } else {
//       // Site is ready
//       const previewUrl = `https://preview.${data.domain.replace(/^https?:\/\//, '')}.manacle.dev`;

//       siteBuilds.set(buildId, {
//         status: "ready",
//         progress: 100,
//         message: "Site generated successfully!",
//         previewUrl
//       });

//       clearInterval(interval);
//     }
//   }, 2000); // Update every 2 seconds
// }

// async function simulateDeployment(data: DeployRequest): Promise<{ deployedUrl: string }> {
//   // Simulate deployment delay
//   await new Promise(resolve => setTimeout(resolve, 3000));

//   // Generate deployed URL
//   const deployedUrl = `https://${data.domain.replace(/^https?:\/\//, '')}`;

//   return { deployedUrl };
// }

// Helper function to clean AI response
function cleanAIResponse(content: string): string {
  // AI response cleaning retained (AI generation currently disabled)
  return content
    .trim()
    .replace(/^[^{]*/, '')
    .replace(/[^}]*$/, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/^[^{]*/, '')
    .replace(/[^}]*$/, '')
    .trim();
}

// More robust JSON extraction function
function extractJSONFromText(text: string): any {
  // AI extraction disabled; return null to indicate no AI parsing
  return null;
}

// Helper function to test user credentials
async function testUserCredentials(siteUrl: string, username: string, password: string) {
  try {
    console.log(`Testing credentials for user: ${username} on site: ${siteUrl}`);
    console.log(`Password being used: ${password ? password.substring(0, 3) + '***' : 'undefined'}`);
    // Use Basic Auth with Application Password
    const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    console.log(`Auth header created: ${authHeader.substring(0, 20)}...`);

    // Test if the user exists first
    console.log("Checking if user exists on subsite...");
    const userExistsResp = await fetch(`${siteUrl}/wp-json/wp/v2/users?search=${encodeURIComponent(username)}`);
    console.log(`User search status: ${userExistsResp.status}`);
    if (userExistsResp.ok) {
      const userExistsData = await userExistsResp.json();
      console.log(`Users found: ${(userExistsData as any[]).length}`);
      if ((userExistsData as any[]).length === 0) {
        throw new Error(`User ${username} does not exist on the subsite`);
      }
    }

    const testResp = await fetch(`${siteUrl}/wp-json/wp/v2/users/me`, {
      method: "GET",
      headers: {
        "Authorization": authHeader
      }
    });

    console.log(`Test response status: ${testResp.status}`);
    console.log(`Test response headers:`, Object.fromEntries(testResp.headers.entries()));
    const testData = await testResp.json();
    console.log(`Test response data:`, testData);

    if (testResp.ok) {
      console.log("Credentials verified successfully. User ID:", (testData as { id: number }).id);
      return authHeader; // Return auth header for use in other requests
    } else {
      console.error("Failed to verify credentials. Response:", testData);
      console.error("Full error response:", {
        status: testResp.status,
        statusText: testResp.statusText,
        headers: Object.fromEntries(testResp.headers.entries()),
        data: testData
      });
      // Try to get more info about the user
      // const usersResp = await fetch(`${siteUrl}/wp-json/wp/v2/users`, {
      //   method: "GET",
      //   headers: {
      //     "Authorization": authHeader
      //   }
      // });
      // const usersData = await usersResp.json();
      // console.log("Available users:", usersData);

      const errorMessage = typeof testData === 'object' && testData !== null && 'message' in testData ? (testData as any).message : JSON.stringify(testData);
      throw new Error(`Failed to verify credentials for user ${username}. Response: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error testing user credentials:", error);
    throw error; // Re-throw to be caught by the main try block
  }
}

// Cleanup old builds (run every hour)
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  for (const [buildId, buildStatus] of siteBuilds.entries()) {
    const buildTime = parseInt(buildId.split('_')[1]);
    if (buildTime < oneHourAgo) {
      siteBuilds.delete(buildId);
    }
  }
}, 60 * 60 * 1000);