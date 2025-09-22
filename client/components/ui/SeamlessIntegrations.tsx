import React from 'react';
import { motion } from 'framer-motion';

type Integration = { name: string; src: string };

const DEFAULT_INTEGRATIONS: Integration[] = [
    { name: 'Gmail', src: '/icons/gmail-logo.png' },
    { name: 'WhatsApp', src: '/icons/whatsApp-logo.png' },
    { name: 'Google Maps', src: '/icons/maps-logo.png' },
    { name: 'Tally', src: '/icons/tally-logo.png' },
    { name: 'MySQL', src: '/icons/mysql-logo.png' },
    { name: 'Oracle', src: '/icons/oracle-logo.png' },
    { name: 'Visio', src: '/icons/visio-logo.png' },
    { name: 'Busy', src: '/icons/busy-logo.png' },
];

export function SeamlessIntegrations({ integrations = DEFAULT_INTEGRATIONS }: { integrations?: Integration[] }) {
    // Render only one variant (mobile or sm+) to reduce DOM and animations
    const [isSmUp, setIsSmUp] = React.useState(false);
    React.useEffect(() => {
        if (typeof window === 'undefined') return;
        const m = window.matchMedia('(min-width: 640px)');
        const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsSmUp('matches' in e ? e.matches : (e as MediaQueryList).matches);
        setIsSmUp(m.matches);
        // Cross-browser add/remove
        // @ts-ignore
        (m.addEventListener ? m.addEventListener('change', handler) : m.addListener(handler));
        return () => {
            // @ts-ignore
            (m.removeEventListener ? m.removeEventListener('change', handler) : m.removeListener(handler));
        };
    }, []);
    // Utility to build wrappers at percentages of the container size
    const RingWrapper: React.FC<{
        sizePct: number; // 0-100
        children: React.ReactNode;
        className?: string;
    }> = ({ sizePct, children, className }) => (
        <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${className || ''}`}
            style={{ width: `${sizePct}%`, height: `${sizePct}%` }}
        >
            {children}
        </div>
    );

    // Evenly distribute N angles
    const spread = (count: number, offset = 0) => Array.from({ length: count }, (_, i) => (i * (360 / count) + offset) % 360);

    // Place a single icon at the top of the ring, wrapper rotated to angle
    const IconOnRing: React.FC<{ angle: number; tool: Integration }> = ({ angle, tool }) => {
        const needsDarkInvert = tool.name === 'Tally' || tool.name === 'Oracle';
        const needsEmphasis = tool.name === 'Visio' || tool.name === 'Busy' || tool.name === 'Oracle' || tool.name === 'MySQL';
        const base = 'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 object-contain rounded-xl bg-white/95 dark:bg-white/10 ring-1 ring-orange-200/70 dark:ring-white/10 shadow-[0_6px_22px_rgba(16,24,40,0.10)]';
        // Increase in-box size (content) by reducing padding for specific logos; outer box size unchanged
        const padding = needsEmphasis ? 'p-1 sm:p-1.5 md:p-2' : 'p-1.5 sm:p-2 md:p-2.5';
        const darkInvert = needsDarkInvert ? 'dark:invert' : '';
        return (
            <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
                <motion.img
                    src={tool.src}
                    alt={`${tool.name} integration`}
                    title={tool.name}
                    loading="lazy"
                    className={[base, padding, darkInvert].join(' ')}
                    animate={{ y: [0, -4, 0, 4, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>
        );
    };

    // Exactly 8 icons total, no duplicates: 4 on inner ring, 4 on outer ring
    const innerAngles = spread(4, 0);
    const outerAngles = spread(4, 45); // offset so inner/outer don't align

    return (
        <motion.div
            className="w-full flex flex-col items-center"
            initial={{ opacity: 0, y: 24, scale: 0.98, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            viewport={{ once: true, margin: '-10% 0px' }}
        >
            <div className="relative aspect-square w-full max-w-[420px] sm:max-w-[520px] md:max-w-[560px]">
                {/* Background dots removed for a cleaner look */}

                {/* Manacle Core */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    {/* Transparent center container so the Manacle logo remains readable on both themes */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-transparent border border-white/40 dark:border-white/15 shadow-[0_8px_30px_-16px_rgba(0,0,0,0.25)] flex items-center justify-center">
                        {/* Increase only the in-box image size; container size unchanged */}
                        <img src="/manacle_logo.png" alt="Manacle" className="w-[94%] h-[94%] sm:w-[96%] sm:h-[96%] md:w-[96%] md:h-[96%] object-contain drop-shadow" />
                        <motion.span className="absolute -inset-2 rounded-3xl border-2 border-orange-300/25 dark:border-white/10" animate={{ opacity: [0.5, 0.1, 0.5], scale: [1, 1.06, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} />
                    </div>
                </div>

                {/* Visual rings: choose one set based on screen size */}
                {isSmUp ? (
                    <>
                        <RingWrapper sizePct={78}>
                            <div className="w-full h-full rounded-full border-2 border-orange-200/35 dark:border-orange-200/10" />
                        </RingWrapper>
                        <RingWrapper sizePct={52}>
                            <div className="w-full h-full rounded-full border-2 border-amber-300/40 dark:border-amber-300/15" />
                        </RingWrapper>
                    </>
                ) : (
                    <>
                        <RingWrapper sizePct={86}>
                            <div className="w-full h-full rounded-full border-2 border-orange-200/35 dark:border-orange-200/10" />
                        </RingWrapper>
                        <RingWrapper sizePct={46}>
                            <div className="w-full h-full rounded-full border-2 border-amber-300/40 dark:border-amber-300/15" />
                        </RingWrapper>
                    </>
                )}

                {/* Rotating groups: render a single variant to reduce work */}
                {isSmUp ? (
                    <>
                        <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}>
                            <RingWrapper sizePct={52}>
                                {innerAngles.map((a, i) => (
                                    <IconOnRing key={`in-${i}`} angle={a} tool={integrations[i]} />
                                ))}
                            </RingWrapper>
                        </motion.div>
                        <motion.div className="absolute inset-0" animate={{ rotate: -360 }} transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}>
                            <RingWrapper sizePct={78}>
                                {outerAngles.map((a, i) => (
                                    <IconOnRing key={`out-${i}`} angle={a} tool={integrations[i + innerAngles.length]} />
                                ))}
                            </RingWrapper>
                        </motion.div>
                    </>
                ) : (
                    <>
                        <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 46, repeat: Infinity, ease: 'linear' }}>
                            <RingWrapper sizePct={46}>
                                {innerAngles.map((a, i) => (
                                    <IconOnRing key={`in-m-${i}`} angle={a} tool={integrations[i]} />
                                ))}
                            </RingWrapper>
                        </motion.div>
                        <motion.div className="absolute inset-0" animate={{ rotate: -360 }} transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}>
                            <RingWrapper sizePct={86}>
                                {outerAngles.map((a, i) => (
                                    <IconOnRing key={`out-m-${i}`} angle={a} tool={integrations[i + innerAngles.length]} />
                                ))}
                            </RingWrapper>
                        </motion.div>
                    </>
                )}

            </div>
            {/* Caption below with top margin to avoid overlap on mobile */}
            <div className="mt-6 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm md:text-base text-foreground/60 dark:text-gray-400 leading-snug">Trusted by teams — integrate your stack with Manacle</p>
            </div>
        </motion.div>
    );
}

export default SeamlessIntegrations;
