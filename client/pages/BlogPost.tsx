import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { ThemeProvider } from '../components/ui/theme-provider';
import {
    ArrowLeft,
    Calendar,
    User,
    Clock,
    Tag,
    Share2,
    Twitter,
    Facebook,
    Linkedin
} from 'lucide-react';

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail_url: string;
    category: string;
    author_name: string;
    author_email: string;
    read_time: number;
    formatted_date: string;
    created_date: string;
    meta_title?: string;
    meta_description?: string;
    tags?: string[];
}

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const [blog, setBlog] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);

    useEffect(() => {
        if (!slug) return;

        const fetchBlog = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/blogs/${slug}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setBlog(data.data);
                    // Set page title and meta description
                    document.title = data.data.meta_title || data.data.title;
                    if (data.data.meta_description) {
                        const metaDesc = document.querySelector('meta[name="description"]');
                        if (metaDesc) {
                            metaDesc.setAttribute('content', data.data.meta_description);
                        }
                    }

                    // Fetch related blogs
                    fetchRelatedBlogs(data.data.category, data.data.id);
                } else {
                    console.error('Blog API error:', data);
                    setError(data.error || 'Blog not found');
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load blog post');
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

    const fetchRelatedBlogs = async (category: string, currentId: number) => {
        try {
            const response = await fetch(`/api/blogs?category=${encodeURIComponent(category)}&limit=3`);
            const data = await response.json();

            if (data.success) {
                // Filter out current blog and limit to 3
                const related = data.data.filter((b: BlogPost) => b.id !== currentId).slice(0, 3);
                setRelatedBlogs(related);
            }
        } catch (err) {
            console.error('Failed to fetch related blogs:', err);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = blog?.title || '';

    const handleShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(shareTitle);

        let shareLink = '';
        switch (platform) {
            case 'twitter':
                shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
                break;
            case 'facebook':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
                break;
            case 'linkedin':
                shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
                break;
        }

        if (shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=400');
        }
    };

    const renderContent = (content: string) => {
        // Split content into blocks (double line breaks or single line breaks for different sections)
        const blocks = content.split(/\n\s*\n/).filter(block => block.trim() !== '');

        return blocks.map((block, index) => {
            const trimmedBlock = block.trim();
            const lines = trimmedBlock.split('\n').map(line => line.trim()).filter(line => line !== '');

            // Skip empty blocks
            if (lines.length === 0) return null;

            // Single line block analysis
            if (lines.length === 1) {
                const line = lines[0];

                // Main headings: Questions, statements ending with ?, or prominent titles
                if (line.endsWith('?') ||
                    (line.endsWith(':') && !line.startsWith('-') && !line.startsWith('•')) ||
                    (line.length < 80 && !line.includes('.') && !line.includes(',') &&
                        (line.includes('What is') || line.includes('How to') || line.includes('Why') ||
                            line.includes('Benefits') || line.includes('Getting Started') ||
                            line.includes('Implementation') || line.includes('Overview')))) {
                    return (
                        <h2 key={index} className="text-xl sm:text-2xl md:text-3xl font-bold mt-8 sm:mt-10 mb-4 sm:mb-6 text-foreground">
                            {line.replace(/:\s*$/, '')}
                        </h2>
                    );
                }

                // Sub headings: Short statements or section titles
                if (!line.includes('.') && !line.includes(',') && line.length < 120 &&
                    !line.startsWith('-') && !line.startsWith('•')) {
                    return (
                        <h3 key={index} className="text-lg sm:text-xl font-semibold mt-6 sm:mt-8 mb-3 sm:mb-4 text-foreground">
                            {line}
                        </h3>
                    );
                }

                // Single line paragraph
                return (
                    <p key={index} className="mb-4 sm:mb-6 text-foreground/90 leading-relaxed text-base sm:text-lg">
                        {line}
                    </p>
                );
            }

            // Multi-line block analysis

            // Check if it's a list block (contains bullet points)
            const hasListItems = lines.some(line => line.startsWith('-') || line.startsWith('•'));

            if (hasListItems) {
                // Find the title (first non-list line) and list items
                let titleLine = '';
                const listItems: string[] = [];
                let foundTitle = false;

                for (const line of lines) {
                    if (line.startsWith('-') || line.startsWith('•')) {
                        listItems.push(line.replace(/^[-•]\s*/, '').trim());
                    } else if (!foundTitle && !line.startsWith('-') && !line.startsWith('•')) {
                        titleLine = line;
                        foundTitle = true;
                    }
                }

                return (
                    <div key={index} className="my-6 sm:my-8">
                        {titleLine && (
                            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-foreground">
                                {titleLine.replace(/:\s*$/, '')}
                            </h3>
                        )}
                        {listItems.length > 0 && (
                            <ul className="space-y-2 sm:space-y-3 pl-4 sm:pl-6">
                                {listItems.map((item, itemIndex) => (
                                    <li key={itemIndex} className="text-foreground/90 text-base sm:text-lg leading-relaxed list-disc">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );
            }

            // Check if first line is a section header
            const firstLine = lines[0];
            const isFirstLineHeader = firstLine.endsWith(':') &&
                !firstLine.includes('.') &&
                firstLine.length < 100 &&
                lines.length > 1;

            if (isFirstLineHeader) {
                const remainingLines = lines.slice(1);
                return (
                    <div key={index} className="mb-6 sm:mb-8">
                        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-foreground">
                            {firstLine.replace(/:\s*$/, '')}
                        </h3>
                        {remainingLines.map((line, lineIndex) => (
                            <p key={lineIndex} className="mb-3 sm:mb-4 text-foreground/90 leading-relaxed text-base sm:text-lg last:mb-0">
                                {line}
                            </p>
                        ))}
                    </div>
                );
            }

            // Regular multi-line paragraph block
            return (
                <div key={index} className="mb-4 sm:mb-6">
                    {lines.map((line, lineIndex) => (
                        <p key={lineIndex} className="mb-3 sm:mb-4 text-foreground/90 leading-relaxed text-base sm:text-lg last:mb-0">
                            {line}
                        </p>
                    ))}
                </div>
            );
        });
    };

    if (loading) {
        return (
            <ThemeProvider defaultTheme="dark" storageKey="manacle_theme">
                <div className="min-h-screen flex flex-col bg-background text-foreground">
                    <Header />
                    <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 min-h-screen">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
                            <div className="flex justify-center items-center py-12 sm:py-20">
                                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </ThemeProvider>
        );
    }

    if (error || !blog) {
        return (
            <ThemeProvider defaultTheme="dark" storageKey="manacle_theme">
                <div className="min-h-screen flex flex-col bg-background text-foreground">
                    <Header />
                    <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 min-h-screen">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
                            <div className="text-center py-12 sm:py-20">
                                <h1 className="text-xl sm:text-2xl font-bold mb-4">Blog Not Found</h1>
                                <p className="text-sm sm:text-base text-foreground/70 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
                                <Link
                                    to="/blogs"
                                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm sm:text-base"
                                >
                                    <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                                    Back to Blogs
                                </Link>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider defaultTheme="dark" storageKey="manacle_theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />

                <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 min-h-screen">
                    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">

                        {/* Back Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 sm:mb-8"
                        >
                            <Link
                                to="/blogs"
                                className="inline-flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to Blogs
                            </Link>
                        </motion.div>

                        {/* Blog Header */}
                        <motion.header
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mb-6 sm:mb-8"
                        >
                            {/* Category Badge */}
                            <div className="mb-4">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                    {blog.category}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                                {blog.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-foreground/70 mb-4 sm:mb-6">
                                <div className="flex items-center gap-2">
                                    <User size={14} className="sm:w-4 sm:h-4" />
                                    <span>{blog.author_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="sm:w-4 sm:h-4" />
                                    <span>{blog.formatted_date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="sm:w-4 sm:h-4" />
                                    <span>{blog.read_time} min read</span>
                                </div>
                            </div>

                            {/* Share Buttons */}
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                <span className="text-xs sm:text-sm text-foreground/70 flex items-center gap-2">
                                    <Share2 size={14} className="sm:w-4 sm:h-4" />
                                    Share:
                                </span>
                                <button
                                    onClick={() => handleShare('twitter')}
                                    className="p-1.5 sm:p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                    aria-label="Share on Twitter"
                                >
                                    <Twitter size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare('facebook')}
                                    className="p-1.5 sm:p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                    aria-label="Share on Facebook"
                                >
                                    <Facebook size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                <button
                                    onClick={() => handleShare('linkedin')}
                                    className="p-1.5 sm:p-2 rounded-full bg-blue-700 hover:bg-blue-800 text-white transition-colors"
                                    aria-label="Share on LinkedIn"
                                >
                                    <Linkedin size={14} className="sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </motion.header>

                        {/* Featured Image */}
                        {blog.thumbnail_url && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="mb-6 sm:mb-8"
                            >
                                <img
                                    src={blog.thumbnail_url}
                                    alt={blog.title}
                                    className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg sm:rounded-xl"
                                />
                            </motion.div>
                        )}

                        {/* Blog Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none dark:prose-invert mb-8 sm:mb-12"
                        >
                            {blog.content ? renderContent(blog.content) : (
                                <p className="text-foreground/70 italic">No content available.</p>
                            )}
                        </motion.div>

                        {/* Tags */}
                        {(() => {
                            let tags: string[] = [];

                            if (blog.tags) {
                                try {
                                    // If tags is a string, parse it as JSON
                                    if (typeof blog.tags === 'string') {
                                        tags = JSON.parse(blog.tags);
                                    } else if (Array.isArray(blog.tags)) {
                                        tags = blog.tags;
                                    }
                                } catch (e) {
                                    console.warn('Failed to parse tags:', e);
                                    tags = [];
                                }
                            }

                            return tags && tags.length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="mb-8 sm:mb-12"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Tag size={14} className="sm:w-4 sm:h-4 text-foreground/70" />
                                        <span className="text-xs sm:text-sm font-medium text-foreground/70">Tags:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 sm:px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs sm:text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : null;
                        })()}

                        {/* Author Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="border-t border-border pt-6 sm:pt-8 mb-8 sm:mb-12"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="text-primary" size={18} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm sm:text-base">{blog.author_name}</h3>
                                    <p className="text-xs sm:text-sm text-foreground/70">Author</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Related Blogs */}
                        {relatedBlogs.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="border-t border-border pt-8 sm:pt-12"
                            >
                                <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Related Articles</h2>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                    {relatedBlogs.map((relatedBlog) => (
                                        <Link
                                            key={relatedBlog.id}
                                            to={`/blogs/${relatedBlog.slug}`}
                                            className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                                        >
                                            <div className="aspect-video bg-muted">
                                                {relatedBlog.thumbnail_url ? (
                                                    <img
                                                        src={relatedBlog.thumbnail_url}
                                                        alt={relatedBlog.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-primary/20 rounded text-primary">📄</div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3 sm:p-4">
                                                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 text-sm sm:text-base">
                                                    {relatedBlog.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-foreground/70 line-clamp-2 mb-3">
                                                    {relatedBlog.excerpt}
                                                </p>
                                                <div className="flex items-center gap-3 sm:gap-4 text-xs text-foreground/60">
                                                    <span>{relatedBlog.formatted_date}</span>
                                                    <span>{relatedBlog.read_time} min read</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </article>
                </main>

                <Footer />
            </div>
        </ThemeProvider>
    );
}
