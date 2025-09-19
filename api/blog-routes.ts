import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mauto_blog_cms',
    charset: 'utf8mb4'
};

// Helper function to create database connection
async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

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
router.get('/blogs', async (req, res) => {
    try {
        const connection = await getConnection();

        const { category, limit = 50, offset = 0, status = 'published' } = req.query;

        let query = `
            SELECT 
                id, title, slug, excerpt, thumbnail_url, category, 
                author_name, read_time, published_at, featured, status,
                DATE_FORMAT(published_at, '%b %d, %Y') as formatted_date
            FROM blogs 
            WHERE status = ?
        `;

        const params: any[] = [status];

        if (category && category !== 'All') {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY published_at DESC, created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit as string), parseInt(offset as string));

        const [rows] = await connection.execute(query, params);
        await connection.end();

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
router.get('/blogs/:slug', async (req, res) => {
    try {
        const connection = await getConnection();
        const { slug } = req.params;

        const [rows] = await connection.execute(
            `SELECT 
                id, title, slug, excerpt, content, thumbnail_url, category,
                author_name, author_email, read_time, published_at, featured,
                meta_title, meta_description, tags, status,
                DATE_FORMAT(published_at, '%b %d, %Y') as formatted_date,
                DATE_FORMAT(created_at, '%b %d, %Y at %h:%i %p') as created_date
            FROM blogs 
            WHERE slug = ? AND status = 'published'`,
            [slug]
        );

        if ((rows as any[]).length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Blog not found'
            });
        }

        // Optional: Track blog view
        try {
            await connection.execute(
                'INSERT INTO blog_views (blog_id, ip_address, user_agent) VALUES (?, ?, ?)',
                [(rows as any[])[0].id, req.ip, req.get('User-Agent')]
            );
        } catch (viewError) {
            console.log('Failed to track view:', viewError);
        }

        await connection.end();

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
router.get('/blog-categories', async (req, res) => {
    try {
        const connection = await getConnection();

        const [rows] = await connection.execute(
            'SELECT name, slug, description, color FROM blog_categories ORDER BY name'
        );

        await connection.end();

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
router.get('/admin/blogs', async (req, res) => {
    try {
        const connection = await getConnection();

        const { status, category, search, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                id, title, slug, excerpt, thumbnail_url, category, 
                author_name, read_time, status, featured,
                DATE_FORMAT(published_at, '%b %d, %Y') as formatted_date,
                DATE_FORMAT(created_at, '%b %d, %Y at %h:%i %p') as created_date,
                DATE_FORMAT(updated_at, '%b %d, %Y at %h:%i %p') as updated_date
            FROM blogs 
            WHERE 1=1
        `;

        const params: any[] = [];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (category && category !== 'All') {
            query += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit as string), parseInt(offset as string));

        const [rows] = await connection.execute(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM blogs WHERE 1=1';
        const countParams: any[] = [];

        if (status) {
            countQuery += ' AND status = ?';
            countParams.push(status);
        }

        if (category && category !== 'All') {
            countQuery += ' AND category = ?';
            countParams.push(category);
        }

        if (search) {
            countQuery += ' AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)';
            const searchTerm = `%${search}%`;
            countParams.push(searchTerm, searchTerm, searchTerm);
        }

        const [countRows] = await connection.execute(countQuery, countParams);

        await connection.end();

        res.json({
            success: true,
            data: rows,
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
router.post('/admin/blogs', async (req, res) => {
    try {
        const connection = await getConnection();

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
        const [existingSlug] = await connection.execute(
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

        const [result] = await connection.execute(
            `INSERT INTO blogs 
            (title, slug, excerpt, content, thumbnail_url, category, tags, 
             author_name, author_email, status, featured, read_time, 
             meta_title, meta_description, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, slug, excerpt, content, thumbnail_url, category,
                JSON.stringify(tags || []), author_name, author_email,
                status, featured, readTime, meta_title, meta_description,
                publishedAt
            ]
        );

        await connection.end();

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
router.put('/admin/blogs/:id', async (req, res) => {
    try {
        const connection = await getConnection();
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
            meta_description
        } = req.body;

        // Check if blog exists
        const [existing] = await connection.execute(
            'SELECT id, slug, status FROM blogs WHERE id = ?',
            [id]
        );

        if ((existing as any[]).length === 0) {
            await connection.end();
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
                const [existingSlug] = await connection.execute(
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
        if (category !== undefined) { updates.push('category = ?'); values.push(category); }
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
            await connection.end();
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }

        values.push(id);

        await connection.execute(
            `UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        await connection.end();

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
router.delete('/admin/blogs/:id', async (req, res) => {
    try {
        const connection = await getConnection();
        const { id } = req.params;

        // Check if blog exists
        const [existing] = await connection.execute(
            'SELECT id, title FROM blogs WHERE id = ?',
            [id]
        );

        if ((existing as any[]).length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Blog not found'
            });
        }

        await connection.execute('DELETE FROM blogs WHERE id = ?', [id]);
        await connection.end();

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

export default router;
