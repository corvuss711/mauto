import { ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface ClientLogo {
    src: string;
    name: string;
    size: 'large' | 'medium' | 'small';
}

export function CompanyEllipse() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const containerRefTP = useRef<HTMLDivElement>(null); // tablet-portrait carousel
    const [mounted, setMounted] = useState(false);
    const [animationTime, setAnimationTime] = useState(0);
    const [spotlightIndex, setSpotlightIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [isAutoSpotlightPaused, setIsAutoSpotlightPaused] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0); // mobile
    const [currentSlideTP, setCurrentSlideTP] = useState(0); // tablet portrait
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [touchStartTP, setTouchStartTP] = useState(0);
    const [touchEndTP, setTouchEndTP] = useState(0);
    const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet-portrait' | 'desktop'>('desktop');

    useEffect(() => {
        setMounted(true);

        // Continuous animation loop for desktop ellipse rotation
        let animationId: number;

        const animate = () => {
            setAnimationTime(prev => prev + 1); // Increment for continuous rotation
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        // Device mode detection - more inclusive for tablets
        const updateMode = () => {
            if (typeof window === 'undefined') return;
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (w < 768) {
                setDeviceMode('mobile');
            } else if (w >= 768 && w < 1200) {
                // Any tablet size (both portrait and landscape) - use carousel
                setDeviceMode('tablet-portrait');
            } else {
                // Large screens - use ellipse
                setDeviceMode('desktop');
            }
        };
        updateMode();
        window.addEventListener('resize', updateMode);

        let intervalId: number | undefined;
        let desktopSpotlightInterval: number | undefined;

        if (deviceMode === 'mobile') {
            // Mobile: 2-logo carousel
            intervalId = window.setInterval(() => {
                setCurrentSlide(prev => {
                    const totalSlides = Math.ceil(clientLogos.length / 2);
                    return (prev + 1) % totalSlides;
                });
            }, 2500);
        } else if (deviceMode === 'tablet-portrait') {
            // Tablet Portrait: 4-logo smooth carousel
            intervalId = window.setInterval(() => {
                setCurrentSlideTP(prev => {
                    const totalSlides = Math.ceil(clientLogos.length / 4);
                    return (prev + 1) % totalSlides;
                });
            }, 3000); // Slightly slower for better viewing
        } else {
            // Desktop: Spotlight effect with pause/resume functionality
            const tick = () => {
                if (!isAutoSpotlightPaused) {
                    setSpotlightIndex((prev) => (prev + 1) % clientLogos.length);
                }
            };
            desktopSpotlightInterval = window.setInterval(tick, 2500);
        }

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
            if (intervalId) clearInterval(intervalId);
            if (desktopSpotlightInterval) clearInterval(desktopSpotlightInterval);
            window.removeEventListener('resize', updateMode);
        };
    }, [deviceMode, isAutoSpotlightPaused]);

    const clientLogos: ClientLogo[] = [
        { src: "/clients/haldirams_logo.png", name: "Haldirams", size: "large" },
        { src: "/clients/baidyanath_logo.png", name: "Baidyanath", size: "large" },
        { src: "/clients/havmor_logo.png", name: "Havmor", size: "large" },
        { src: "/clients/dsgroup_logo.png", name: "DS Group", size: "large" },
        { src: "/clients/HBL_logo.png", name: "HBL", size: "medium" },
        { src: "/clients/Bambino_Logo.png", name: "Bambino", size: "medium" },
        { src: "/clients/gcfoods_logo.png", name: "GC Foods", size: "medium" },
        { src: "/clients/flemingofood_logo.png", name: "Flemingo", size: "medium" },
        { src: "/clients/aakash_namkeen_logo.png", name: "Aakash Namkeen", size: "medium" },
        { src: "/clients/mahesh_namkeen_logo.png", name: "Mahesh Namkeen", size: "medium" },
        { src: "/clients/Cloud9beverages_logo.png", name: "Cloud9", size: "small" },
        { src: "/clients/maxbeverages.png", name: "Max Beverages", size: "small" },
        { src: "/clients/aeris_logo.png", name: "Aeris", size: "small" },
        { src: "/clients/aipl_logo.png", name: "AIPL", size: "small" },
        { src: "/clients/babaji_logo.png", name: "Babaji", size: "small" },
        { src: "/clients/btw_logo.png", name: "BTW", size: "small" },
        { src: "/clients/delhitourism_logo.png", name: "Delhi Tourism", size: "small" },
        { src: "/clients/elco_logo.png", name: "Elco", size: "small" },
        { src: "/clients/finegrow_logo.png", name: "Finegrow", size: "small" },
        { src: "/clients/gudnini_logo.png", name: "Gudnini", size: "small" },
        { src: "/clients/hindkush_logo.png", name: "Hindkush", size: "small" },
        { src: "/clients/hitkari_logo.png", name: "Hitkari", size: "small" },
        { src: "/clients/inforcare_logo.png", name: "Inforcare", size: "small" },
        { src: "/clients/kbz_logo.png", name: "KBZ", size: "small" },
        { src: "/clients/laborate_logo.png", name: "Laborate", size: "small" },
        { src: "/clients/mantra_logo.png", name: "Mantra", size: "small" },
        { src: "/clients/3p_logo.png", name: "3P", size: "small" }
    ];

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        // Handle both mouse and touch events
        const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

        if (clientX === undefined || clientY === undefined) return;

        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        setMousePosition({ x, y });
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchStart(e.targetTouches[0].clientX);
        setIsHovered(true);
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) {
            setIsHovered(false);
            return;
        }

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            setCurrentSlide(prev => Math.min(prev + 1, Math.ceil(clientLogos.length / 2) - 1));
        }
        if (isRightSwipe) {
            setCurrentSlide(prev => Math.max(prev - 1, 0));
        }

        setIsHovered(false);
        setTouchStart(0);
        setTouchEnd(0);
    };

    // Tablet Portrait touch handlers
    const handleTouchStartTP = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchStartTP(e.targetTouches[0].clientX);
        setIsHovered(true);
    };

    const handleTouchMoveTP = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchEndTP(e.targetTouches[0].clientX);
    };

    const handleTouchEndTP = () => {
        if (!touchStartTP || !touchEndTP) {
            setIsHovered(false);
            return;
        }

        const distance = touchStartTP - touchEndTP;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;
        const totalSlides = Math.ceil(clientLogos.length / 4);

        if (isLeftSwipe) {
            setCurrentSlideTP(prev => Math.min(prev + 1, totalSlides - 1));
        }
        if (isRightSwipe) {
            setCurrentSlideTP(prev => Math.max(prev - 1, 0));
        }

        setIsHovered(false);
        setTouchStartTP(0);
        setTouchEndTP(0);
    };

    const handleLogoMouseEnter = (index: number) => {
        setHoveredIndex(index);
        setIsAutoSpotlightPaused(true);
    };

    const handleLogoMouseLeave = () => {
        setHoveredIndex(null);
        setIsAutoSpotlightPaused(false);
    };

    const getLogoClasses = (size: string, index: number) => {
        const baseClasses = "relative group transition-all duration-800 ease-out transform-gpu will-change-transform";

        // Enhanced professional sizing for presentation
        const sizeClasses = "w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32";

        // Spectacular spotlight effect for presentation (either auto or hovered)
        const isSpotlight = hoveredIndex !== null ? index === hoveredIndex : index === spotlightIndex;
        const spotlightScale = isSpotlight ? "z-50" : "z-10"; // Scale handled in transform

        const hoverEffects = isHovered
            ? "hover:scale-105 hover:z-40"
            : "hover:scale-102 hover:z-30";

        return `${baseClasses} ${sizeClasses} ${hoverEffects} ${spotlightScale}`;
    };

    const getOrbitStyle = (index: number) => {
        if (!mounted) return {};

        const time = animationTime * 0.0010; // Faster rotation speed increased by 0.5

        // Create rotating elliptical formation
        const totalLogos = clientLogos.length;
        const angleStep = (Math.PI * 2) / totalLogos;
        const baseAngle = index * angleStep + time; // Continuous smooth rotation

        // Determine if this logo should be spotlighted (either auto or hovered)
        const isSpotlight = hoveredIndex !== null ? index === hoveredIndex : index === spotlightIndex;

        // Mobile/Medium device detection with more specific breakpoints
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        const isTabletPortrait = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024 && window.innerHeight > window.innerWidth;
        const isMediumPortrait = typeof window !== 'undefined' && window.innerWidth >= 1024 && window.innerWidth < 1280 && window.innerHeight > window.innerWidth;
        const isLargePortrait = typeof window !== 'undefined' && window.innerWidth >= 1280 && window.innerHeight > window.innerWidth;
        const isLargeScreen = typeof window !== 'undefined' && window.innerWidth >= 1280;

        // Mobile/Tablet Portrait use carousel, so return empty for those modes
        if (deviceMode === 'mobile' || deviceMode === 'tablet-portrait') {
            return { display: 'none' };
        }

        // Responsive elliptical parameters based on specific screen sizes
        let ellipseRadiusX = 480;
        let ellipseRadiusY = 260;

        if (isTabletPortrait) {
            // Tablet portrait: Very small ellipse to fit within container
            ellipseRadiusX = 220;
            ellipseRadiusY = 120;
        } else if (isMediumPortrait) {
            // Medium portrait: Reduced center space to fit inside container
            ellipseRadiusX = 200;
            ellipseRadiusY = 110;
        } else if (isLargePortrait) {
            // Large portrait: Increased ellipse area for better logo distribution
            ellipseRadiusX = 500;
            ellipseRadiusY = 280;
        } else if (isLargeScreen) {
            // Large screens: Moderate ellipse
            ellipseRadiusX = 400;
            ellipseRadiusY = 220;
        }

        // Responsive scaling
        let scaleMultiplier = 0.85;
        if (isTabletPortrait) {
            scaleMultiplier = 1.0; // Use full scale with smaller base radius
        } else if (isMediumPortrait) {
            scaleMultiplier = 1.0; // Full scale with reduced base radius
        } else if (isLargePortrait) {
            scaleMultiplier = 1.1; // Increased scale for more logo spacing
        } else if (isLargeScreen) {
            scaleMultiplier = 0.9; // Maintain good spacing on large screens
        }

        // Calculate rotating elliptical position
        const offsetX = Math.cos(baseAngle) * ellipseRadiusX * scaleMultiplier;
        const offsetY = Math.sin(baseAngle) * ellipseRadiusY * scaleMultiplier;

        // Enhanced spotlight effect with responsive scaling
        let finalScale = 1;
        let finalOffsetY = offsetY;

        if (isSpotlight) {
            if (isTabletPortrait) {
                finalScale = 1.1; // Conservative scaling for tablet portrait
            } else if (isMediumPortrait) {
                finalScale = 1.1; // Conservative scaling for medium portrait
            } else if (isLargePortrait) {
                finalScale = 1.25; // Enhanced scaling for large portrait spacing
            } else if (isLargeScreen) {
                finalScale = 1.2; // Moderate scaling for large screens
            } else {
                finalScale = 1.25; // Full scaling for desktop
            }
            const floatMotion = Math.sin(time * 3) * 6;
            finalOffsetY = offsetY + floatMotion;
        }

        // Subtle magnetic effect
        const magnetStrength = isHovered ? 0.008 : 0;
        const magnetX = (mousePosition.x - 50) * magnetStrength * 0.02;
        const magnetY = (mousePosition.y - 50) * magnetStrength * 0.02;

        return {
            transform: `translate(${offsetX + magnetX}px, ${finalOffsetY + magnetY}px) scale(${finalScale})`,
            transition: isSpotlight ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.6s ease-out',
            zIndex: isSpotlight ? 30 : 10
        };
    };

    return (
        <motion.section
            className="py-8 sm:py-16 lg:py-24 relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#0a0a0a] dark:via-[#111111] dark:to-[#0a0a0a]"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Floating Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-400/10 via-yellow-400/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-green-400/5 via-cyan-400/5 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-6 sm:mb-12"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        className="inline-block mb-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="px-4 py-2 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 font-semibold text-sm tracking-wide uppercase backdrop-blur-sm">
                            Trusted Partnership
                        </span>
                    </motion.div>
                    <motion.h2
                        className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent leading-tight pb-2 overflow-visible"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Trusted by Leading Companies
                    </motion.h2>
                    <motion.p
                        className="text-lg sm:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Join industry leaders who trust Manacle Technologies to transform their business operations and drive growth
                    </motion.p>
                </motion.div>

                {/* Ellipse Section - No Background Container */}
                <motion.div
                    className="py-2 md:py-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Mobile Carousel */}
                    <div className="md:hidden w-full flex items-center justify-center">
                        <div
                            ref={containerRef}
                            className="relative w-full max-w-lg px-4"
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-500 ease-out"
                                    style={{
                                        transform: `translateX(-${currentSlide * 100}%)`
                                    }}
                                >
                                    {/* Create slides of 2 logos each */}
                                    {Array.from({ length: Math.ceil(clientLogos.length / 2) }, (_, slideIndex) => (
                                        <div key={slideIndex} className="flex-shrink-0 w-full flex justify-center items-center gap-8 py-2">
                                            {clientLogos.slice(slideIndex * 2, slideIndex * 2 + 2).map((logo) => (
                                                <div
                                                    key={logo.name}
                                                    className="w-28 h-28 transition-all duration-300 ease-out"
                                                >
                                                    <div className="w-full h-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-lg rounded-xl border border-white/50 dark:border-gray-700/50 shadow-lg dark:shadow-xl dark:shadow-black/50 p-3 flex items-center justify-center">
                                                        <img
                                                            src={logo.src}
                                                            alt={logo.name}
                                                            className={`max-w-full max-h-full object-contain filter-none ${
                                                                // Special inversion for logos with black text in dark theme
                                                                (logo.name === 'Inforcare' || logo.name === 'Aeris' || logo.name === 'Finegrow' || logo.name === 'Hindkush')
                                                                    ? 'dark:invert'
                                                                    : 'dark:brightness-110 dark:contrast-125 dark:invert-[0.1]'
                                                                }`}
                                                            loading="lazy"
                                                            decoding="async"
                                                            fetchPriority="low"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tablet Portrait Carousel (4 logos per slide, mobile-style smooth carousel) */}
                    {deviceMode === 'tablet-portrait' && (
                        <div className="hidden sm:flex w-full items-center justify-center relative">
                            <div
                                ref={containerRefTP}
                                className="relative w-full max-w-4xl px-6"
                                onTouchStart={handleTouchStartTP}
                                onTouchMove={handleTouchMoveTP}
                                onTouchEnd={handleTouchEndTP}
                            >
                                <div className="overflow-hidden rounded-2xl">
                                    <div
                                        className="flex transition-all duration-1000 ease-in-out"
                                        style={{
                                            transform: `translateX(-${currentSlideTP * 100}%)`,
                                            opacity: 1
                                        }}
                                    >
                                        {/* Create slides of 4 logos each */}
                                        {Array.from({ length: Math.ceil(clientLogos.length / 4) }, (_, slideIndex) => (
                                            <div key={slideIndex} className="flex-shrink-0 w-full flex justify-center items-center gap-8 py-4">
                                                {clientLogos.slice(slideIndex * 4, slideIndex * 4 + 4).map((logo, logoIndex) => (
                                                    <div
                                                        key={logo.name}
                                                        className="w-32 h-32 transition-all duration-500 ease-out"
                                                        style={{
                                                            animation: `fadeInUp 0.6s ease-out ${logoIndex * 0.1}s both`,
                                                        }}
                                                    >
                                                        <div className="w-full h-full bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-lg rounded-xl border border-white/50 dark:border-gray-700/50 shadow-lg dark:shadow-xl dark:shadow-black/50 p-4 flex items-center justify-center hover:scale-105 transition-transform duration-300">
                                                            <img
                                                                src={logo.src}
                                                                alt={logo.name}
                                                                className={`max-w-full max-h-full object-contain filter-none transition-all duration-300 ${
                                                                    // Special inversion for logos with black text in dark theme
                                                                    (logo.name === 'Inforcare' || logo.name === 'Aeris' || logo.name === 'Finegrow' || logo.name === 'Hindkush')
                                                                        ? 'dark:invert'
                                                                        : 'dark:brightness-110 dark:contrast-125 dark:invert-[0.1]'
                                                                    }`}
                                                                loading="lazy"
                                                                decoding="async"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scroll Indicators */}
                                <div className="flex justify-center mt-6 space-x-2">
                                    {Array.from({ length: Math.ceil(clientLogos.length / 4) }, (_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSlideTP(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlideTP
                                                ? 'bg-orange-500 scale-110'
                                                : 'bg-gray-300 dark:bg-gray-600 hover:bg-orange-300'
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Navigation Arrows */}
                                <button
                                    onClick={() => setCurrentSlideTP(prev => Math.max(prev - 1, 0))}
                                    disabled={currentSlideTP === 0}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Previous slide"
                                >
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                <button
                                    onClick={() => setCurrentSlideTP(prev => Math.min(prev + 1, Math.ceil(clientLogos.length / 4) - 1))}
                                    disabled={currentSlideTP === Math.ceil(clientLogos.length / 4) - 1}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Next slide"
                                >
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Desktop/Large Portrait Elliptical Constellation - only for large screens */}
                    {deviceMode === 'desktop' && (
                        <div
                            ref={containerRef}
                            className="hidden md:block relative w-full"
                            onMouseMove={handleMouseMove}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Ellipse Container with Fixed Height */}
                            <div className="relative h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] flex items-center justify-center overflow-visible">
                                <div className="relative w-full max-w-6xl mx-auto">
                                    {/* Main Elliptical Ring Logos */}
                                    {clientLogos.map((logo, index) => {
                                        const isSpotlight = hoveredIndex !== null ? index === hoveredIndex : index === spotlightIndex;

                                        return (
                                            <div
                                                key={logo.name}
                                                className={getLogoClasses(logo.size, index)}
                                                style={{
                                                    position: 'absolute',
                                                    left: '50%',
                                                    top: '50%',
                                                    marginLeft: '-40px', // Center the logo
                                                    marginTop: '-40px',  // Center the logo
                                                    ...getOrbitStyle(index)
                                                }}
                                                onMouseEnter={() => handleLogoMouseEnter(index)}
                                                onMouseLeave={handleLogoMouseLeave}
                                            >
                                                {/* Clean Highlighted Logo Container - No Brown Background */}
                                                <div className={`relative w-full h-full backdrop-blur-lg rounded-2xl border transition-all duration-1000 overflow-hidden ${isSpotlight
                                                    ? 'bg-white dark:bg-[#0a0a0a] border-blue-400/40 dark:border-blue-400/40 shadow-2xl shadow-blue-500/20 dark:shadow-blue-500/30'
                                                    : 'bg-white/90 dark:bg-[#1a1a1a]/90 border-white/50 dark:border-gray-700/50 shadow-lg dark:shadow-xl dark:shadow-black/50 group-hover:bg-white/95 group-hover:dark:bg-[#1a1a1a]/95 group-hover:shadow-xl group-hover:dark:shadow-2xl group-hover:dark:shadow-black/60 group-hover:border-slate-400/40'
                                                    }`}>
                                                    {/* Clean shimmer effect - No Amber */}
                                                    <div className={`absolute inset-0 skew-x-12 transition-transform duration-1200 ${isSpotlight
                                                        ? 'translate-x-[200%] bg-gradient-to-r from-transparent via-blue-200/20 dark:via-blue-200/20 to-transparent'
                                                        : 'translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent'
                                                        }`}></div>

                                                    {/* Logo Image with Dark Theme Compatibility */}
                                                    <div className="relative w-full h-full p-3 sm:p-4 flex items-center justify-center">
                                                        <img
                                                            src={logo.src}
                                                            alt={logo.name}
                                                            className={`max-w-full max-h-full object-contain transition-all duration-800 ${
                                                                // Special handling for logos with black text - Always invert in dark theme
                                                                (logo.name === 'Inforcare' || logo.name === 'Aeris' || logo.name === 'Finegrow' || logo.name === 'Hindkush')
                                                                    ? (isSpotlight
                                                                        ? 'filter-none scale-105 dark:invert' // Inverted in dark theme during spotlight
                                                                        : 'filter grayscale hover:grayscale-0 group-hover:grayscale-0 group-hover:scale-105 dark:invert dark:hover:invert dark:group-hover:invert')
                                                                    : (isSpotlight
                                                                        ? 'filter-none scale-105 dark:brightness-110 dark:contrast-125'
                                                                        : 'filter grayscale group-hover:grayscale-0 group-hover:scale-105 dark:brightness-110 dark:contrast-125 dark:invert-[0.1]')
                                                                }`}
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </div>

                                                    {/* Clean highlight overlay - No Brown/Amber */}
                                                    <div className={`absolute inset-0 rounded-2xl transition-all duration-800 ${isSpotlight
                                                        ? 'bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/5 dark:to-indigo-500/5'
                                                        : 'bg-gradient-to-br from-slate-500/0 to-slate-600/0 group-hover:from-slate-500/3 group-hover:to-slate-600/3'
                                                        }`}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Separated Stats Section - More spacing for large portraits */}
                {/* <motion.div
                    className="text-center mt-8 sm:mt-16 xl:mt-24 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="inline-flex items-center justify-center space-x-6 bg-white/20 dark:bg-[#1a1a1a]/20 backdrop-blur-xl rounded-full px-6 py-3 border border-white/30 dark:border-gray-700/30">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-500">{clientLogos.length}+</div>
                            <div className="text-xs text-foreground/60">Trusted Partners</div>
                        </div>
                        <div className="w-px h-8 bg-foreground/20"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-500">15+</div>
                            <div className="text-xs text-foreground/60">Years Experience</div>
                        </div>
                    </div>
                </motion.div> */}

                {/* Call to Action - Extra spacing for large portraits */}
                {/* <motion.div
                    className="text-center mt-8 sm:mt-10 xl:mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.p
                        className="text-lg text-foreground/70 mb-6"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        Ready to join these industry leaders?
                    </motion.p>
                    <motion.div
                        className="inline-block group relative"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl blur-sm group-hover:blur-md transition-all duration-300 opacity-60 group-hover:opacity-90"></div>
                        <a href="/contact-us">
                            <button className="relative px-5 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-0.5 active:scale-[0.98]">
                                START YOUR TRANSFORMATION
                            </button>
                        </a>
                    </motion.div>
                </motion.div> */}
            </div>

        </motion.section>
    );
}
