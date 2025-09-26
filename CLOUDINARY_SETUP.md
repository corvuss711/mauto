# Cloudinary Setup Guide

This guide will help you configure Cloudinary for permanent image storage to replace the temporary `/tmp/uploads` storage that gets wiped on Vercel deployments.

## 1. Create a Cloudinary Account

1. Go to [Cloudinary.com](https://cloudinary.com/) and sign up for a free account
2. After signing up, you'll be taken to your Dashboard
3. Note down your **Cloud Name**, **API Key**, and **API Secret** from the Dashboard

## 2. Configure Cloudinary Settings

### Account Settings
- **Cloud Name**: This will be used in your URLs (e.g., `https://res.cloudinary.com/your-cloud-name/`)
- **Upload Presets**: Create presets for different types of uploads (optional but recommended)

### Recommended Folder Structure
Your images will be organized in these Cloudinary folders:
```
your-cloud-name/
├── blog-thumbnails/     # Blog post thumbnails
├── company-logos/       # Company logos
├── page-content-uploads/# Page content images
└── product-images/      # Product images
```

### Media Library Settings
1. Go to **Settings** → **Upload**
2. Enable **Auto-optimize** for automatic format and quality optimization
3. Set **Max file size** to 10MB (or your preferred limit)
4. Enable **Backup** to keep original files (optional)

## 3. Environment Variables

Add these environment variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

For **Vercel deployment**, add these environment variables in your Vercel dashboard:
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the three variables above

For **other hosting platforms**, ensure these environment variables are available in your production environment.

## 4. Cloudinary Transformations

The implementation includes automatic transformations:

### For Blog Thumbnails:
- **Size**: 800x600px (cropped to fill)
- **Quality**: Auto-good
- **Format**: Auto (WebP when supported)

### For Logos and General Images:
- **Size**: Max 1200x900px (limited, maintains aspect ratio)
- **Quality**: Auto-good
- **Format**: Auto (WebP when supported)

## 5. Upload Endpoints

After configuration, your app will use these Cloudinary-enabled endpoints:

### Blog Thumbnails
```
POST /api/upload/thumbnail
Content-Type: multipart/form-data
Field: thumbnail (file)
```

### Company Logos & Images
```
POST /api/upload-logo
Content-Type: multipart/form-data
Field: logo or image (file)
Query Parameters: ?folder=page-content-uploads or ?folder=product-images
```

## 6. Database Changes

Run this SQL to update your existing database fields to handle longer Cloudinary URLs:

```sql
-- Update blogs table for Cloudinary URLs
ALTER TABLE blogs MODIFY COLUMN thumbnail_url TEXT;

-- Update company_mast table (if you have logo field)
ALTER TABLE company_mast MODIFY COLUMN logo TEXT;

-- Update any other existing image fields in your tables
-- ALTER TABLE services MODIFY COLUMN image_url TEXT;
-- ALTER TABLE products MODIFY COLUMN image_url TEXT;
```

**Note**: The Cloudinary URLs will be stored directly in your existing table fields (like `logo`, `image_url`, `thumbnail_url` etc.) - no additional tables needed!

## 7. Benefits of This Setup

✅ **Permanent Storage**: Images persist across deployments  
✅ **CDN Delivery**: Fast global image delivery  
✅ **Auto-Optimization**: Automatic format/quality optimization  
✅ **Transformations**: On-the-fly image resizing and optimization  
✅ **Backup**: Images are safely stored in Cloudinary  
✅ **Cost Effective**: Free tier includes 25GB storage + 25GB bandwidth  

## 8. Migration from Existing Uploads

If you have existing images in the `/uploads` folder:

1. **Backup**: Download all images from your current `/uploads` folder
2. **Upload**: Use Cloudinary's upload API or web interface to upload them
3. **Update Database**: Update your database records to point to Cloudinary URLs
4. **Test**: Verify all images are loading correctly

## 9. Troubleshooting

### Common Issues:

**"Cloudinary not configured" Error**:
- Verify environment variables are set correctly
- Check that the Cloudinary package is installed: `npm install cloudinary`

**Upload Failures**:
- Check file size limits (default: 10MB)
- Verify file types (only images allowed)
- Check API key permissions in Cloudinary dashboard

**Images Not Loading**:
- Verify the Cloudinary URLs in your database
- Check if the images exist in your Cloudinary media library
- Ensure your cloud name is correct in the URLs

## 10. Monitoring and Analytics

Cloudinary provides:
- **Usage Analytics**: Monitor bandwidth and storage usage
- **Performance Metrics**: Track delivery times and optimization savings  
- **Error Logs**: Debug upload and delivery issues

Access these in your Cloudinary Dashboard under **Analytics** and **Reports**.

---

## Quick Setup Checklist

- [ ] Create Cloudinary account
- [ ] Note down Cloud Name, API Key, and API Secret
- [ ] Add environment variables to `.env` and hosting platform
- [ ] Install Cloudinary: `npm install cloudinary`
- [ ] Run database migration SQL
- [ ] Test upload endpoints
- [ ] Migrate existing images (if any)
- [ ] Deploy and verify in production

Your images are now permanently stored and optimally delivered! 🚀
