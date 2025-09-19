-- Essential CMS Database Schema
-- Only the necessary tables for blog content management

-- 1. Blog Categories Table
CREATE TABLE IF NOT EXISTS blog_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
);

-- 2. Blogs Table (Main content table)
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    thumbnail_url VARCHAR(500),
    category_id INT,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(100) NOT NULL,
    read_time INT DEFAULT 5,
    status ENUM('draft', 'published') DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags JSON, -- Store tags as JSON array
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES blog_categories (id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_category (category_id),
    INDEX idx_featured (featured),
    FULLTEXT INDEX idx_search (title, excerpt, content)
);

-- Insert default categories
INSERT INTO
    blog_categories (name, slug, description)
VALUES (
        'Technology',
        'technology',
        'Technology related articles'
    ),
    (
        'Business',
        'business',
        'Business insights and strategies'
    ),
    (
        'CRM',
        'crm',
        'Customer Relationship Management'
    ),
    (
        'Automation',
        'automation',
        'Business process automation'
    ),
    (
        'Digital Marketing',
        'digital-marketing',
        'Digital marketing strategies'
    ),
    (
        'Software Development',
        'software-development',
        'Software development topics'
    )
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

-- Sample blog post (with plain text content)
INSERT INTO
    blogs (
        title,
        slug,
        excerpt,
        content,
        thumbnail_url,
        category_id,
        author_name,
        author_email,
        read_time,
        status,
        featured,
        meta_title,
        meta_description,
        tags,
        published_at
    )
VALUES (
        'Getting Started with CRM Software',
        'getting-started-with-crm-software',
        'Learn the fundamentals of CRM software and how it can transform your business operations.',
        'Customer Relationship Management (CRM) software is a powerful tool that helps businesses manage their interactions with current and potential customers. In today\'s competitive business environment, maintaining strong customer relationships is crucial for success.

What is CRM Software?
CRM software is a technology solution that centralizes customer information, tracks interactions, and automates various sales and marketing processes. It serves as a comprehensive database that stores contact information, communication history, purchase records, and other relevant customer data.

Key Benefits of CRM Software:
- Improved customer relationships through better communication tracking
- Enhanced sales performance with pipeline management
- Better customer service with complete interaction history
- Increased efficiency through automation of repetitive tasks
- Data-driven insights for better decision making

Getting Started with CRM Implementation:
First, assess your current customer management processes and identify areas for improvement. Choose a CRM solution that fits your business size and industry requirements. Train your team thoroughly on the new system and establish clear data entry standards.

Remember, successful CRM implementation requires commitment from the entire organization and ongoing optimization based on user feedback and business needs.',
        '/blogs_thumbs/crm-fundamentals.jpg',
        (
            SELECT id
            FROM blog_categories
            WHERE
                slug = 'crm'
            LIMIT 1
        ),
        'Manacle Team',
        'team@manacletech.com',
        8,
        'published',
        TRUE,
        'CRM Software Guide - Getting Started | Manacle Technologies',
        'Complete guide to CRM software implementation and best practices for businesses.',
        '["CRM", "Software", "Business", "Customer Management"]',
        NOW()
    )
ON DUPLICATE KEY UPDATE
    title = VALUES(title);