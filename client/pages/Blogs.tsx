import { useMemo, useState, useEffect } from 'react';
import { Header } from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ThemeProvider } from '../components/ui/theme-provider';
import { LoadingSpinner } from '../components/ui/loading-spinner';

interface BlogMeta {
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    thumbnail_url: string;
    category: string;
    read_time: number;
    formatted_date: string;
    author_name: string;
    featured: boolean;
}

// Static fallback data
const staticBlogItems: BlogMeta[] = [
    {
        id: 1,
        slug: 'dispatch-automation-fundamentals',
        title: 'From Chaos to Control : Why Dispatch Automation Wins',
        excerpt: 'Discover how dispatch automation can transform your operations, improve efficiency, and enhance customer satisfaction.',
        thumbnail_url: '/blogs_thumbs/dispatch.jpeg',
        category: 'Dispatch Management',
        read_time: 6,
        formatted_date: 'Aug 21, 2025',
        author_name: 'Admin',
        featured: true
    }
];

export default function Blogs() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [blogItems, setBlogItems] = useState<BlogMeta[]>(staticBlogItems);
    const [categories, setCategories] = useState<string[]>(['All']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch blogs from API
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/blogs');
                const data = await response.json();

                if (data.success && data.data.length > 0) {
                    // Always show static blog first, then dynamic blogs
                    const combinedBlogs = [...staticBlogItems, ...data.data];
                    setBlogItems(combinedBlogs);

                    // Extract unique categories from both static and dynamic blogs
                    const uniqueCategories = new Set(combinedBlogs.map((b: BlogMeta) => b.category));
                    setCategories(['All', ...Array.from(uniqueCategories)] as string[]);
                } else {
                    // Use only static data if no dynamic blogs found
                    setBlogItems(staticBlogItems);
                    const staticCategories = new Set(staticBlogItems.map(b => b.category));
                    setCategories(['All', ...Array.from(staticCategories)]);
                }
            } catch (err) {
                console.error('Error fetching blogs:', err);
                setError('Failed to load blogs from API');
                // Always show static blog even if API fails
                setBlogItems(staticBlogItems);
                const staticCategories = new Set(staticBlogItems.map(b => b.category));
                setCategories(['All', ...Array.from(staticCategories)]);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const filteredBlogs = useMemo(() => {
        if (activeCategory === 'All') return blogItems;
        return blogItems.filter(b => b.category === activeCategory);
    }, [activeCategory, blogItems]);

    const MotionLink = motion(Link);

    // Animation variants for smooth fade + upward motion with gentle scale
    const containerVariants = {
        hidden: { opacity: 0 },
        show: (count: number) => ({
            opacity: 1,
            transition: { staggerChildren: count > 1 ? 0.07 : 0, delayChildren: 0.08 }
        })
    } as const;
    const cardVariants = {
        hidden: { opacity: 0, y: 28, scale: 0.985, filter: 'blur(6px)' },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
        },
        exit: {
            opacity: 0,
            y: 10,
            scale: 0.99,
            filter: 'blur(4px)',
            transition: { duration: 0.28, ease: 'easeOut' }
        }
    } as const;

    return (
        <ThemeProvider defaultTheme="dark" storageKey="manacle_theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-28 xl:pt-56 xl:pb-36 lg:min-h-[520px] overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-purple-600/10 to-transparent" />
                    <div className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-orange-400/20 to-fuchsia-500/10 blur-3xl" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[720px] h-[240px] bg-primary/10 blur-3xl rounded-full" />
                    <div className="max-w-6xl mx-auto px-6 lg:px-10">
                        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: 'easeOut' }} className="text-center">
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                                Insights, Strategies & Product Knowledge
                            </h1>
                            <p className="text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto font-medium">
                                Explore practical guides, deep–dive explainers and announcements helping FMCG & enterprise teams scale with data‑driven automation.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Blogs Grid */}
                <main className="flex-1 pb-24">
                    <div className="max-w-6xl mx-auto px-6 lg:px-10">
                        {/* Category Pills */}
                        <div className="flex flex-wrap justify-center gap-3 mt-8 mb-10 pt-2">
                            {categories.map(c => {
                                const active = c === activeCategory;
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setActiveCategory(c)}
                                        aria-pressed={active}
                                        className={
                                            `px-4 py-2 rounded-full text-sm font-semibold border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ` +
                                            (active
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                : 'bg-card/70 text-foreground border-glass-border hover:bg-primary/10')
                                        }
                                    >
                                        {c}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <motion.div
                                className="flex flex-col justify-center items-center py-20"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <LoadingSpinner size="lg" className="mb-6" />
                                <motion.p
                                    className="text-base text-foreground/70 font-medium tracking-wide"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                >
                                    Loading latest articles
                                    <motion.span
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        ...
                                    </motion.span>
                                </motion.p>
                                <motion.div
                                    className="mt-4 flex space-x-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-primary/40 rounded-full"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.4, 1, 0.4],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="text-center py-20">
                                <p className="text-red-500 mb-4">{error}</p>
                                <p className="text-foreground/60">Showing fallback content</p>
                            </div>
                        )}
                        {/* Blogs Grid */}
                        {!loading && (
                            <motion.div
                                className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3"
                                variants={containerVariants}
                                custom={filteredBlogs.length}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, amount: 0.15 }}
                                layout
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredBlogs.map((b) => (
                                        <MotionLink
                                            key={b.slug}
                                            to={`/blogs/${b.slug}`}
                                            variants={cardVariants}
                                            layout
                                            whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
                                            whileTap={{ scale: 0.98 }}
                                            exit="exit"
                                            className="group flex flex-col rounded-2xl overflow-hidden bg-card/80 backdrop-blur border border-glass-border hover:shadow-xl hover:border-primary/40 transition-[border-color,box-shadow,transform] duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                            aria-label={`Read article: ${b.title}`}
                                            onClick={() => {
                                                // Ensure page will scroll to top on navigation
                                                window.scrollTo({ top: 0, behavior: 'instant' });
                                            }}
                                        >
                                            <div className="relative aspect-[20/10] overflow-hidden">
                                                <img src={b.thumbnail_url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                                {/* <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur text-white">{b.category}</span> */}
                                            </div>
                                            <div className="flex flex-col flex-1 p-6">
                                                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-snug">{b.title}</h2>
                                                <p className="text-sm text-foreground/70 flex-1 mb-4 leading-relaxed">{b.excerpt}</p>
                                                <div className="flex items-center justify-between text-xs text-foreground/60 font-medium">
                                                    <span>{b.formatted_date}</span>
                                                    <span>{b.read_time} min read</span>
                                                </div>
                                                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                                                    Read Article <span aria-hidden>→</span>
                                                </span>
                                            </div>
                                        </MotionLink>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
}
