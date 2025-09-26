-- Database updates for Cloudinary URL support
-- Ensure existing fields can store longer Cloudinary URLs

-- Update blogs table thumbnail_url field to handle Cloudinary URLs
ALTER TABLE blogs MODIFY COLUMN thumbnail_url TEXT;

-- Update company_mast table logo field to handle Cloudinary URLs (if needed)
-- ALTER TABLE company_mast MODIFY COLUMN logo TEXT;

-- Update any other image/logo fields in your existing tables as needed
-- Examples:
-- ALTER TABLE services MODIFY COLUMN image_url TEXT;
-- ALTER TABLE products MODIFY COLUMN image_url TEXT;