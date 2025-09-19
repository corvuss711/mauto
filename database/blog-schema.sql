-- Blog CMS Database Schema
-- Database: mauto_blog_cms (or add to existing mauto database)

-- Blogs table
CREATE TABLE blogs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    tags JSON,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(100),
    status ENUM(
        'draft',
        'published',
        'archived'
    ) NOT NULL DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    read_time INT DEFAULT 5, -- in minutes
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_slug (slug),
    INDEX idx_published_at (published_at),
    INDEX idx_featured (featured)
);

-- Blog categories table (for better organization)
CREATE TABLE blog_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- hex color for category badge
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO
    blog_categories (
        name,
        slug,
        description,
        color
    )
VALUES (
        'Dispatch Management',
        'dispatch-management',
        'Articles about dispatch automation and management',
        '#f59e0b'
    ),
    (
        'CRM',
        'crm',
        'Customer Relationship Management insights',
        '#3b82f6'
    ),
    (
        'Digital Marketing',
        'digital-marketing',
        'Marketing automation and strategies',
        '#8b5cf6'
    ),
    (
        'Business Growth',
        'business-growth',
        'Tips for scaling your business',
        '#10b981'
    ),
    (
        'Technology',
        'technology',
        'Latest tech trends and innovations',
        '#ef4444'
    ),
    (
        'General',
        'general',
        'General business and industry insights',
        '#6b7280'
    );

-- Blog views tracking (optional - for analytics)
CREATE TABLE blog_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    blog_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
    INDEX idx_blog_id (blog_id),
    INDEX idx_viewed_at (viewed_at)
);

-- Sample data for testing
INSERT INTO
    blogs (
        title,
        slug,
        excerpt,
        content,
        thumbnail_url,
        category,
        author_name,
        status,
        featured,
        published_at
    )
VALUES (
        'From Chaos to Control: Why Dispatch Automation Wins',
        'dispatch-automation-fundamentals',
        'Discover how dispatch automation can transform your operations, improve efficiency, and enhance customer satisfaction.',
        '<h1>From Chaos to Control: Why Dispatch Automation Wins</h1><p>In today\'s fast-paced business environment, dispatch automation has become a game-changer for companies looking to streamline their operations...</p>',
        '/blogs_thumbs/dispatch.jpeg',
        'Dispatch Management',
        'Admin',
        'published',
        TRUE,
        NOW()
    );