// Cloudinary configuration for permanent image storage
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image buffer to Cloudinary
 * @param buffer - Image buffer from multer
 * @param folder - Cloudinary folder path (e.g., 'blog-thumbnails', 'company-logos')
 * @param filename - Optional filename prefix
 * @returns Promise with Cloudinary upload result
 */
export const uploadToCloudinary = async (
    buffer: Buffer,
    folder: string,
    filename?: string
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder: folder,
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto',
            transformation: [
                { width: 1200, height: 900, crop: 'limit' }, // Max dimensions
                { quality: 'auto:good' }
            ]
        };

        // Add public_id if filename provided
        if (filename) {
            uploadOptions.public_id = `${filename}_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        }

        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
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

/**
 * Upload thumbnail with specific transformations
 */
export const uploadThumbnailToCloudinary = async (
    buffer: Buffer,
    filename?: string
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadOptions: any = {
            folder: 'blog-thumbnails',
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto',
            transformation: [
                { width: 800, height: 600, crop: 'fill' }, // Blog thumbnail size
                { quality: 'auto:good' }
            ]
        };

        if (filename) {
            uploadOptions.public_id = `blog_thumb_${filename}_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        }

        cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    console.error('Cloudinary thumbnail upload error:', error);
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(buffer);
    });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

export default cloudinary;
