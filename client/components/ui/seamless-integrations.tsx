import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

type AppLogo = {
    name: string;
    src: string;
    bg: string; // tailwind bg class
    ring: string; // tailwind ring color class
};

const APPS: AppLogo[] = [
    { name: "WhatsApp", src: "/icons/whatsApp-logo.png", bg: "bg-emerald-50 dark:bg-white/5", ring: "ring-emerald-200/60 dark:ring-white/10" },
    { name: "Gmail", src: "/icons/gmail-logo.png", bg: "bg-rose-50 dark:bg-white/5", ring: "ring-rose-200/60 dark:ring-white/10" },
    { name: "Maps", src: "/icons/maps-logo.png", bg: "bg-green-50 dark:bg-white/5", ring: "ring-green-200/60 dark:ring-white/10" },
    { name: "Busy", src: "/icons/busy-logo.png", bg: "bg-violet-50 dark:bg-white/5", ring: "ring-violet-200/60 dark:ring-white/10" },
    { name: "Visio", src: "/icons/visio-logo.png", bg: "bg-sky-50 dark:bg-white/5", ring: "ring-sky-200/60 dark:ring-white/10" },
    { name: "Tally", src: "/icons/tally-logo.png", bg: "bg-amber-50 dark:bg-white/5", ring: "ring-amber-200/60 dark:ring-white/10" },
    { name: "Oracle", src: "/icons/oracle-logo.png", bg: "bg-red-50 dark:bg-white/5", ring: "ring-red-200/60 dark:ring-white/10" },
    { name: "MySQL", src: "/icons/mysql-logo.png", bg: "bg-blue-50 dark:bg-white/5", ring: "ring-blue-200/60 dark:ring-white/10" },
];

function useContainerSize<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return { ref, size } as const;
}

export default function SeamlessIntegrations() {
    const { ref, size } = useContainerSize<HTMLDivElement>();
    const radius = useMemo(() => {
        // pick a radius that fits within the container with padding
        const base = Math.min(size.width, size.height);
        if (!base) return 140; // initial/fallback
        return Math.max(80, Math.min(200, base / 2.6));
    }, [size.width, size.height]);

    const positions = useMemo(() => {
        const count = APPS.length;
        const angleStep = (2 * Math.PI) / count;
        return new Array(count).fill(0).map((_, i) => {
            const angle = i * angleStep - Math.PI / 2; // start from top
            const appName = APPS[i].name;

            // Adjust radius and fine-tune positioning for specific apps
            let adjustedRadius = radius;
            let angleOffset = 0;

            if (appName === 'Oracle' || appName === 'MySQL' || appName === 'WhatsApp') {
                adjustedRadius = radius * 1.3;
            }

            // Fine-tune positioning for WhatsApp and Oracle to center arrows
            if (appName === 'WhatsApp') {
                angleOffset = 0.1; // Slight clockwise adjustment
            } else if (appName === 'Oracle') {
                angleOffset = -0.15; // Slight counter-clockwise adjustment
            }

            const finalAngle = angle + angleOffset;

            return {
                x: Math.cos(finalAngle) * adjustedRadius,
                y: Math.sin(finalAngle) * adjustedRadius,
                angle: finalAngle,
            };
        });
    }, [radius]);

    return (
        <div className="flex-1 w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-xl mx-auto">
            <div className="relative w-full aspect-square max-h-[280px] sm:max-h-[350px] md:max-h-[450px] lg:max-h-none" ref={ref}>
                {/* Optimized single SVG overlay for connections with arrowheads */}
                {size.width > 0 && size.height > 0 && (
                    <svg className="absolute inset-0 z-0 pointer-events-none" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`}>
                        <defs>
                            <linearGradient id="connGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#f97316" stopOpacity="0.95" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.3" />
                            </linearGradient>
                            <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b" />
                                <feMerge>
                                    <feMergeNode in="b" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* optimized arrows + flowing dots */}
                        {(() => {
                            const cx = size.width / 2;
                            const cy = size.height / 2;

                            // Calculate responsive radii based on actual component sizes
                            const manacleRadius = size.width < 640 ? 48 : size.width < 768 ? 56 : 64; // From w-24/w-28/w-32
                            const toolRadius = size.width < 640 ? 28 : size.width < 768 ? 32 : 36; // From w-14/w-16/w-[72px]

                            return positions.map((p, i) => {
                                const appName = APPS[i].name;

                                // Use actual position from positions array (which already accounts for adjusted radius)
                                const toolCenterX = cx + p.x;
                                const toolCenterY = cy + p.y;

                                // Calculate direction vector from center to actual tool position
                                const distance = Math.sqrt(p.x * p.x + p.y * p.y);
                                if (distance === 0) {
                                    return null;
                                }

                                const dirX = p.x / distance;
                                const dirY = p.y / distance;

                                // Start point: on Manacle logo boundary (outward from center)
                                const startX = cx + (dirX * manacleRadius);
                                const startY = cy + (dirY * manacleRadius);

                                // End point: on tool logo boundary (inward to tool center)
                                // Use slightly smaller radius to ensure line ends within logo boundary
                                const effectiveToolRadius = toolRadius * 0.8;
                                const endX = toolCenterX - (dirX * effectiveToolRadius);
                                const endY = toolCenterY - (dirY * effectiveToolRadius);

                                const dash = 8;

                                return (
                                    <g key={`conn-${i}`}>
                                        {/* Main connection line - Force visibility with higher opacity */}
                                        <motion.line
                                            x1={startX}
                                            y1={startY}
                                            x2={endX}
                                            y2={endY}
                                            stroke="url(#connGrad)"
                                            strokeWidth={3}
                                            strokeDasharray={`${dash} ${dash * 1.2}`}
                                            strokeLinecap="round"
                                            initial={{ strokeDashoffset: dash * 2, opacity: 0.0 }}
                                            animate={{
                                                strokeDashoffset: [dash * 2, 0, dash * 2],
                                                opacity: [0.0, 0.9, 0.75, 0.9, 0.0]
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 4.0,
                                                delay: i * 0.15,
                                                ease: "easeInOut"
                                            }}
                                        />

                                        {/* Debug line - solid line to ensure connection exists */}
                                        <line
                                            x1={startX}
                                            y1={startY}
                                            x2={endX}
                                            y2={endY}
                                            stroke={appName === 'WhatsApp' || appName === 'Oracle' || appName === 'Visio' ? '#ff0000' : '#00ff00'}
                                            strokeWidth={1}
                                            opacity={0.3}
                                        />

                                        {/* Bidirectional flowing dots */}
                                        <motion.circle
                                            cx={startX}
                                            cy={startY}
                                            r={4}
                                            fill="#f97316"
                                            filter="url(#dotGlow)"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                cx: [startX, endX, startX],
                                                cy: [startY, endY, startY],
                                                opacity: [0, 0.9, 0.6, 0],
                                                r: [4, 3, 4],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 3.0,
                                                delay: i * 0.2,
                                                ease: "easeInOut"
                                            }}
                                        />

                                        {/* Secondary dot for enhanced flow effect */}
                                        <motion.circle
                                            cx={endX}
                                            cy={endY}
                                            r={2.5}
                                            fill="#f59e0b"
                                            filter="url(#dotGlow)"
                                            initial={{ opacity: 0 }}
                                            animate={{
                                                cx: [endX, startX, endX],
                                                cy: [endY, startY, endY],
                                                opacity: [0, 0.7, 0],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 2.5,
                                                delay: 0.8 + i * 0.18,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </g>
                                );
                            }).filter(Boolean); // Remove any null entries
                        })()}
                    </svg>
                )}

                {/* center logo */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    <motion.div
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white/90 dark:bg-slate-900/80 ring-4 ring-orange-200/60 dark:ring-orange-600/30 shadow-2xl backdrop-blur"
                        animate={{ scale: [1, 1.04, 1], boxShadow: ["0 25px 35px -10px rgba(249, 115, 22, .25)", "0 30px 40px -12px rgba(249, 115, 22, .35)", "0 25px 35px -10px rgba(249, 115, 22, .25)"] }}
                        transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                    >
                        <img
                            src="/manacle_logo.png"
                            alt="Manacle"
                            className="w-full h-full p-3 object-contain drop-shadow-sm dark:drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full bg-orange-400/20 blur-xl"
                            animate={{ opacity: [0.25, 0.6, 0.25], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
                        />
                    </motion.div>
                </div>

                {/* orbiting app nodes */}
                {APPS.map((app, i) => {
                    const p = positions[i] ?? { x: 0, y: 0, angle: 0 };
                    return (
                        <motion.div
                            key={app.name}
                            className="absolute z-10"
                            style={{ left: `calc(50% + ${p.x}px)`, top: `calc(50% + ${p.y}px)`, transform: "translate(-50%, -50%)" }}
                            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 130, damping: 16 }}
                        >
                            {/* Node card */}
                            <motion.div
                                className={`relative ${app.bg} ${app.ring} ring rounded-2xl shadow-lg border border-black/5 dark:border-white/5 backdrop-blur-sm w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] flex items-center justify-center`}
                                animate={{ y: [0, -6, 0, 6, 0] }}
                                transition={{ repeat: Infinity, duration: 4 + (i % 4) * 0.2, ease: "easeInOut" }}
                                whileHover={{ scale: 1.08 }}
                            >
                                <img
                                    src={app.src}
                                    alt={app.name}
                                    className={`object-contain drop-shadow ${app.name === 'Oracle' || app.name === 'Tally'
                                            ? 'dark:invert'
                                            : 'dark:brightness-110 dark:contrast-110'
                                        } ${app.name === 'Visio' || app.name === 'MySQL' || app.name === 'Oracle' || app.name === 'Tally' || app.name === 'Busy'
                                            ? 'w-12 h-12 sm:w-14 sm:h-14'
                                            : 'w-7 h-7 sm:w-8 sm:h-8'
                                        }`}
                                />
                            </motion.div>

                            {/* connection paths now handled by the single optimized overlay */}
                        </motion.div>
                    );
                })}
            </div>

            {/* caption */}
            <div className="mt-8 sm:mt-10 md:mt-8 lg:mt-6 mb-4 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
                Manacle sits at the center—securely syncing with tools like WhatsApp, Gmail, Maps, Busy, Visio, Oracle, and MySQL to keep your work connected.
            </div>
        </div>
    );
}
