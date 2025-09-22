import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/ui/header';
import Footer from '@/components/ui/footer';
import { ThemeProvider } from '../components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    Calendar,
    User,
    Tag,
    FileText,
    Image as ImageIcon,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    Upload,
    Clock,
    ChevronDown,
    ChevronUp,
    Settings,
    PenTool,
    BarChart3
} from 'lucide-react';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail_url: string;
    category: string;
    author_name: string;
    read_time: number;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    formatted_date: string;
    created_date: string;
    updated_date: string;
    tags?: string[];
    meta_title?: string;
    meta_description?: string;
}

interface Category {
    name: string;
    slug: string;
    description: string;
    color: string;
}

// Hook: detect md breakpoint for responsive animation/positioning
function useIsMdUp() {
    const [isMdUp, setIsMdUp] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mql = window.matchMedia('(min-width: 768px)');
        const handler = (e: MediaQueryListEvent | MediaQueryList) => {
            // Support both event and direct list call
            setIsMdUp('matches' in e ? e.matches : (e as MediaQueryList).matches);
        };
        // Initialize
        setIsMdUp(mql.matches);
        // Subscribe with fallback for older browsers
        if (mql.addEventListener) mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
        else if (mql.addListener) mql.addListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
        return () => {
            if (mql.removeEventListener) mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
            else if (mql.removeListener) mql.removeListener(handler as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
        };
    }, []);
    return isMdUp;
}

// Custom Dropdown Component
interface CustomDropdownProps {
    value: string;
    options: { value: string; label: string; icon?: React.ReactNode }[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

function CustomDropdown({ value, options, onChange, placeholder = "Select option", className = "", disabled = false }: CustomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(option => option.value === value);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground flex items-center justify-between transition-all ${isOpen ? 'border-primary/50 ring-2 ring-primary/20' : 'hover:border-primary/30'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <div className="flex items-center gap-2">
                    {selectedOption?.icon}
                    <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedOption?.label || placeholder}
                    </span>
                </div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left hover:bg-muted hover:bg-opacity-80 dark:hover:bg-muted/50 flex items-center gap-2 transition-colors first:rounded-t-lg last:rounded-b-lg ${option.value === value ? 'bg-primary/10 text-primary' : 'text-foreground'
                                    }`}
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function BlogAdmin() {
    const isMdUp = useIsMdUp();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filters and search
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // File upload states
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Form data
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        thumbnail_url: '',
        category: '',
        author_name: '',
        status: 'draft' as 'draft' | 'published' | 'archived',
        featured: false,
        tags: [] as string[],
        meta_title: '',
        meta_description: '',
        read_time: 0
    });

    // Fetch blogs
    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`/api/admin/blogs?${params}`);
            const data = await response.json();

            if (data.success) {
                setBlogs(data.data);
            } else {
                setError('Failed to fetch blogs');
            }
        } catch (err) {
            setError('Network error while fetching blogs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/blog-categories');
            const data = await response.json();

            if (data.success) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, [statusFilter, categoryFilter, searchTerm]);

    // Auto-hide messages
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Handle create blog
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Blog created successfully!');
                setShowCreateModal(false);
                resetForm();
                fetchBlogs();
            } else {
                setError(data.message || 'Failed to create blog');
            }
        } catch (err) {
            setError('Network error while creating blog');
            console.error(err);
        }
    };

    // Handle update blog
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBlog) return;

        try {
            const response = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Blog updated successfully!');
                setShowEditModal(false);
                setEditingBlog(null);
                resetForm();
                fetchBlogs();
            } else {
                setError(data.message || 'Failed to update blog');
            }
        } catch (err) {
            setError('Network error while updating blog');
            console.error(err);
        }
    };

    // Handle delete blog
    const handleDelete = async () => {
        if (!deletingBlog || deleteConfirmation !== 'DELETE') return;

        try {
            const response = await fetch(`/api/admin/blogs/${deletingBlog.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Blog deleted successfully!');
                setShowDeleteModal(false);
                setDeletingBlog(null);
                setDeleteConfirmation('');
                fetchBlogs();
            } else {
                setError(data.message || 'Failed to delete blog');
            }
        } catch (err) {
            setError('Network error while deleting blog');
            console.error(err);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            thumbnail_url: '',
            category: '',
            author_name: '',
            status: 'draft',
            featured: false,
            tags: [],
            meta_title: '',
            meta_description: '',
            read_time: 0
        });
        setPreviewUrl('');
    };

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            console.error('Invalid file type:', file.type);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            console.error('File too large:', file.size);
            return;
        }

        // Create local preview immediately
        const previewURL = URL.createObjectURL(file);
        setPreviewUrl(previewURL);

        try {
            setUploading(true);
            setError('');
            setSuccess('');

            const uploadFormData = new FormData();
            uploadFormData.append('thumbnail', file);

            console.log('Uploading to /api/upload/thumbnail...');
            const response = await fetch('/api/upload/thumbnail', {
                method: 'POST',
                body: uploadFormData
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({ ...prev, thumbnail_url: data.url }));
                // Keep the preview URL but also store the server URL
                setSuccess('Thumbnail uploaded successfully!');
            } else {
                setError(data.message || 'Failed to upload image');
                console.error('Upload failed:', data);
                // Revert preview on error
                URL.revokeObjectURL(previewURL);
                setPreviewUrl('');
            }
        } catch (err) {
            setError('Network error while uploading image');
            console.error('Upload error:', err);
            // Revert preview on error
            URL.revokeObjectURL(previewURL);
            setPreviewUrl('');
        } finally {
            setUploading(false);
        }
    };

    // Handle edit click
    const handleEditClick = (blog: Blog) => {
        setEditingBlog(blog);
        setFormData({
            title: blog.title,
            excerpt: blog.excerpt,
            content: blog.content,
            thumbnail_url: blog.thumbnail_url,
            category: blog.category,
            author_name: blog.author_name,
            status: blog.status,
            featured: Boolean(blog.featured), // Ensure proper boolean conversion
            tags: blog.tags || [],
            meta_title: blog.meta_title || '',
            meta_description: blog.meta_description || '',
            read_time: blog.read_time || 0
        });
        setPreviewUrl(blog.thumbnail_url || '');
        setShowEditModal(true);
    };

    // Handle delete click
    const handleDeleteClick = (blog: Blog) => {
        setDeletingBlog(blog);
        setDeleteConfirmation('');
        setShowDeleteModal(true);
    };

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800 border-green-200';
            case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="manacle_theme">
            <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Header />

                {/* Success/Error Messages */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: isMdUp ? 50 : -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: isMdUp ? 50 : -50 }}
                            className="fixed inset-x-0 mx-auto w-max top-[calc(env(safe-area-inset-top)+1rem)] md:top-auto md:inset-x-auto md:mx-0 md:w-auto md:bottom-6 md:right-6 z-[60] bg-green-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-[95vw] md:max-w-md text-sm md:text-base"
                        >
                            <CheckCircle size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="truncate">{success}</span>
                        </motion.div>
                    )}

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: isMdUp ? 50 : -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: isMdUp ? 50 : -50 }}
                            className="fixed inset-x-0 mx-auto w-max top-[calc(env(safe-area-inset-top)+1rem)] md:top-auto md:inset-x-auto md:mx-0 md:w-auto md:bottom-6 md:right-6 z-[60] bg-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-[95vw] md:max-w-md text-sm md:text-base"
                        >
                            <AlertCircle size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="truncate">{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 sm:pb-12 min-h-screen">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">

                        {/* Enhanced Header */}
                        <div className="mb-8 sm:mb-10">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 mb-2"
                                    >
                                        <div className="p-2 rounded-xl bg-primary/10">
                                            <PenTool className="w-6 h-6 text-primary" />
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-bold">
                                            Blog Management
                                        </h1>
                                    </motion.div>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-sm sm:text-base text-foreground/70 ml-11"
                                    >
                                        Create, edit, and manage your content with our advanced blog editor
                                    </motion.p>
                                </div>

                                {/* Quick Stats */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border border-border/50"
                                >
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-foreground/70">Total Posts</span>
                                        <span className="font-semibold text-green-500">{blogs.length}</span>
                                    </div>
                                    <div className="w-px h-6 bg-border"></div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-foreground/70">Published</span>
                                        <span className="font-semibold text-blue-500">
                                            {blogs.filter(b => b.status === 'published').length}
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>                        {/* Enhanced Controls */}
                        <div className="mb-8 sm:mb-10">
                            <div className="bg-card/30 backdrop-blur-sm rounded-2xl border border-border/50 p-4 sm:p-6">
                                {/* Search and Filters */}
                                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                                    {/* Left side - Search and Filters */}
                                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-1">
                                        {/* Enhanced Search */}
                                        <div className="relative flex-1 lg:max-w-sm">
                                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/40" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Search by title, content, or author..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-12 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 w-full text-sm placeholder:text-foreground/40 transition-all"
                                            />
                                        </div>

                                        {/* Custom Status Filter */}
                                        <CustomDropdown
                                            value={statusFilter}
                                            onChange={setStatusFilter}
                                            placeholder="Filter by status"
                                            className="w-full sm:w-48"
                                            options={[
                                                { value: 'all', label: 'All Status', icon: <Settings size={16} className="text-foreground/60" /> },
                                                { value: 'published', label: 'Published', icon: <CheckCircle size={16} className="text-green-500" /> },
                                                { value: 'draft', label: 'Draft', icon: <Edit size={16} className="text-yellow-500" /> },
                                                { value: 'archived', label: 'Archived', icon: <FileText size={16} className="text-gray-500" /> }
                                            ]}
                                        />

                                        {/* Custom Category Filter */}
                                        <CustomDropdown
                                            value={categoryFilter}
                                            onChange={setCategoryFilter}
                                            placeholder="Filter by category"
                                            className="w-full sm:w-48"
                                            options={[
                                                { value: 'all', label: 'All Categories', icon: <Tag size={16} className="text-foreground/60" /> },
                                                ...categories.map(cat => ({
                                                    value: cat.name,
                                                    label: cat.name,
                                                    icon: <Tag size={16} className="text-primary" />
                                                }))
                                            ]}
                                        />
                                    </div>

                                    {/* Right side - Create Button */}
                                    <div className="flex-shrink-0">
                                        <Button
                                            onClick={() => {
                                                resetForm();
                                                setShowCreateModal(true);
                                            }}
                                            className="bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary/90 text-white flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                                        >
                                            <Plus size={18} />
                                            Create New Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        )}

                        {/* Blogs Grid */}
                        {!loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            >
                                {blogs.map((blog) => (
                                    <motion.div
                                        key={blog.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-300 group"
                                    >
                                        {/* Enhanced Thumbnail */}
                                        <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
                                            {blog.thumbnail_url ? (
                                                <img
                                                    src={blog.thumbnail_url}
                                                    alt={blog.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <ImageIcon className="text-muted-foreground" size={48} />
                                                    <span className="text-xs text-muted-foreground">No Image</span>
                                                </div>
                                            )}
                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>

                                        {/* Enhanced Content */}
                                        <div className="p-4 sm:p-6">
                                            {/* Status & Featured - Enhanced */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(blog.status)}`}>
                                                        {blog.status.charAt(0).toUpperCase() + blog.status.slice(1)}
                                                    </span>
                                                    {Boolean(blog.featured) && (
                                                        <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-800 text-orange-800 dark:text-orange-200 border border-orange-200 dark:border-orange-700">
                                                            ⭐ Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-foreground/40">
                                                    #{blog.id}
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">{blog.title}</h3>
                                            <p className="text-sm text-foreground/70 mb-4 line-clamp-2 leading-relaxed">{blog.excerpt}</p>

                                            {/* Enhanced Meta Info */}
                                            <div className="grid grid-cols-2 gap-2 text-xs text-foreground/60 mb-4 p-3 bg-muted/20 rounded-lg">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={14} className="flex-shrink-0" />
                                                    <span className="truncate">{blog.author_name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="flex-shrink-0" />
                                                    <span>{blog.formatted_date}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Tag size={14} className="flex-shrink-0" />
                                                    <span className="truncate">{blog.category}</span>
                                                </div>
                                                {blog.read_time > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="flex-shrink-0" />
                                                        <span>{blog.read_time} min read</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Enhanced Actions */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(`/blogs/${blog.slug}`, '_blank')}
                                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary border-border transition-all"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditClick(blog)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-foreground hover:bg-blue-500/5 hover:border-blue-500/50 hover:text-blue-600 border-border transition-all"
                                                >
                                                    <Edit size={14} />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDeleteClick(blog)}
                                                    className="px-3 flex items-center justify-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/20 dark:hover:border-red-800 border-border transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Empty State */}
                        {!loading && blogs.length === 0 && (
                            <div className="text-center py-20">
                                <FileText className="mx-auto mb-4 text-muted-foreground" size={64} />
                                <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
                                <p className="text-foreground/70 mb-4">Get started by creating your first blog post</p>
                                <Button onClick={() => setShowCreateModal(true)} className="bg-purple-500 hover:bg-purple-600 text-white">
                                    <Plus size={20} className="mr-2" />
                                    Create Your First Blog
                                </Button>
                            </div>
                        )}
                    </div>
                </main>

                {/* Create/Edit Modal */}
                <AnimatePresence>
                    {(showCreateModal || showEditModal) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-2 sm:p-4"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowCreateModal(false);
                                    setShowEditModal(false);
                                    setEditingBlog(null);
                                }
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-card rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar mt-4 sm:mt-0"
                            >
                                <div className="p-4 sm:p-6">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <h2 className="text-xl sm:text-2xl font-bold">
                                            {showCreateModal ? 'Create New Blog' : 'Edit Blog'}
                                        </h2>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setShowEditModal(false);
                                                setEditingBlog(null);
                                                resetForm();
                                            }}
                                            className="text-foreground hover:text-foreground hover:bg-muted/50"
                                        >
                                            <X size={18} />
                                        </Button>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="space-y-4 sm:space-y-6">
                                        {/* Basic Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Title *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                    placeholder="Enter blog title"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Author Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.author_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                    placeholder="Enter author name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Category *</label>
                                                <CustomDropdown
                                                    value={formData.category}
                                                    onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                                    placeholder="Select category"
                                                    options={[
                                                        ...categories.map(cat => ({
                                                            value: cat.name,
                                                            label: cat.name,
                                                            icon: <Tag size={16} className="text-primary" />
                                                        }))
                                                    ]}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Status</label>
                                                <CustomDropdown
                                                    value={formData.status}
                                                    onChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' | 'archived' }))}
                                                    placeholder="Select status"
                                                    options={[
                                                        { value: 'draft', label: 'Draft', icon: <Edit size={16} className="text-yellow-500" /> },
                                                        { value: 'published', label: 'Published', icon: <CheckCircle size={16} className="text-green-500" /> },
                                                        { value: 'archived', label: 'Archived', icon: <FileText size={16} className="text-gray-500" /> }
                                                    ]}
                                                />
                                            </div>                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-foreground">Read Time (minutes)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.read_time}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, read_time: parseInt(e.target.value) || 0 }))}
                                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                    placeholder="Estimated read time"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-foreground">Thumbnail Image</label>

                                            {/* File Upload Area */}
                                            <div className="space-y-4">
                                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        id="thumbnail-upload"
                                                        disabled={uploading}
                                                        key={`thumbnail-${Date.now()}`}
                                                    />
                                                    <label
                                                        htmlFor="thumbnail-upload"
                                                        className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-foreground w-full md:w-auto ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                    >
                                                        <Upload size={16} />
                                                        {uploading ? 'Uploading...' : 'Choose Image'}
                                                    </label>

                                                    {/* Manual URL Input (Alternative) */}
                                                    <div className="flex-1 w-full min-w-0">
                                                        <input
                                                            type="url"
                                                            value={formData.thumbnail_url}
                                                            onChange={(e) => {
                                                                setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }));
                                                                setPreviewUrl(e.target.value);
                                                            }}
                                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-foreground"
                                                            placeholder="Or paste image URL"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Image Preview */}
                                                {(previewUrl || formData.thumbnail_url) && (
                                                    <div className="relative">
                                                        <img
                                                            src={previewUrl || formData.thumbnail_url}
                                                            alt="Thumbnail preview"
                                                            className="w-full max-w-sm h-32 object-cover rounded-lg border border-border"
                                                            onError={() => {
                                                                setPreviewUrl('');
                                                                setFormData(prev => ({ ...prev, thumbnail_url: '' }));
                                                            }}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setPreviewUrl('');
                                                                setFormData(prev => ({ ...prev, thumbnail_url: '' }));
                                                            }}
                                                            className="absolute top-2 right-2 p-1 h-6 w-6 text-foreground hover:text-foreground hover:bg-muted/50 border-border"
                                                        >
                                                            <X size={12} />
                                                        </Button>
                                                    </div>
                                                )}

                                                <p className="text-xs text-foreground/60">
                                                    Upload an image or paste a URL. Supported formats: JPG, PNG, GIF. Max size: 5MB.
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-foreground">Excerpt *</label>
                                            <textarea
                                                required
                                                rows={3}
                                                value={formData.excerpt}
                                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                placeholder="Brief description of the blog post"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-foreground">
                                                Content *
                                                <span className="text-xs text-foreground/60 block mt-1">
                                                    Write in plain text. Use double line breaks for paragraphs. Start section titles on new lines.
                                                </span>
                                            </label>
                                            <textarea
                                                required
                                                rows={10}
                                                value={formData.content}
                                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-xs sm:text-sm"
                                                placeholder="Write your blog content in plain text...

Example:
Customer Relationship Management (CRM) software is a powerful tool for businesses.

What is CRM Software?
CRM software centralizes customer information and tracks interactions.

Key Benefits:
- Improved customer relationships
- Better sales tracking  
- Enhanced communication

Getting Started:
First, assess your current processes and identify areas for improvement..."
                                            />
                                        </div>

                                        {/* Advanced Options */}
                                        <details className="border border-border rounded-lg p-4">
                                            <summary className="cursor-pointer font-medium">Advanced Options</summary>
                                            <div className="mt-4 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id="featured"
                                                        checked={formData.featured}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                                        className="rounded border-border"
                                                    />
                                                    <label htmlFor="featured" className="text-sm">Featured post</label>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-foreground">Meta Title</label>
                                                    <input
                                                        type="text"
                                                        value={formData.meta_title}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                        placeholder="SEO title (optional)"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-foreground">Meta Description</label>
                                                    <textarea
                                                        rows={2}
                                                        value={formData.meta_description}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                                                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                                        placeholder="SEO description (optional)"
                                                    />
                                                </div>
                                            </div>
                                        </details>

                                        {/* Form Actions */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 justify-end pt-4 border-t border-border">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowCreateModal(false);
                                                    setShowEditModal(false);
                                                    setEditingBlog(null);
                                                    resetForm();
                                                }}
                                                className="w-full sm:w-auto text-foreground hover:text-foreground hover:bg-muted/50 border-border"
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="flex items-center justify-center gap-2 w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white transition-colors">
                                                <Save size={16} />
                                                {showCreateModal ? 'Create Blog' : 'Update Blog'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {showDeleteModal && deletingBlog && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    setShowDeleteModal(false);
                                    setDeletingBlog(null);
                                    setDeleteConfirmation('');
                                }
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-card rounded-xl shadow-xl max-w-md w-full p-4 sm:p-6 mx-4"
                            >
                                <div className="text-center">
                                    <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-4">
                                        <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                    </div>
                                    <h3 className="text-base sm:text-lg font-medium mb-2">Delete Blog Post</h3>
                                    <p className="text-xs sm:text-sm text-foreground/70 mb-4">
                                        Are you sure you want to delete "<span className="font-semibold">{deletingBlog.title}</span>"? This action cannot be undone.
                                    </p>

                                    {/* Double Confirmation Input */}
                                    <div className="mb-6 text-left">
                                        <label className="block text-xs sm:text-sm font-medium text-foreground/80 mb-2">
                                            To confirm deletion, please type <span className="font-bold text-red-600">DELETE</span> below:
                                        </label>
                                        <input
                                            type="text"
                                            value={deleteConfirmation}
                                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 text-sm text-foreground"
                                            placeholder="Type DELETE to confirm"
                                            autoComplete="off"
                                        />
                                        {deleteConfirmation && deleteConfirmation !== 'DELETE' && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Please type "DELETE" exactly as shown above
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setDeletingBlog(null);
                                                setDeleteConfirmation('');
                                            }}
                                            className="w-full sm:w-auto text-foreground hover:text-foreground hover:bg-muted/50 border-border"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleDelete}
                                            disabled={deleteConfirmation !== 'DELETE'}
                                            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                                        >
                                            Delete Blog
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Footer />
            </div>
        </ThemeProvider>
    );
}
