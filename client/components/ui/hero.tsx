import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "./button";
import { ArrowRight, Play, Globe, CheckCircle } from "lucide-react";
import { useTheme } from "./theme-provider";
import { useRef } from "react";
import { CompactSolutions } from "./compact-solutions";
import { useNavigate } from "react-router-dom";

// Load Fredoka font (modern Gen Z style) - Optimized for performance
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500&display=swap';
  link.rel = 'preload';
  link.as = 'style';
  link.onload = function (this: HTMLLinkElement) { this.rel = 'stylesheet'; };
  document.head.appendChild(link);
}

export function Hero() {
  const navigate = useNavigate();
  const ref = useRef(null);

  // Optimize for mobile performance
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const isMobilePortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth && window.innerWidth <= 768;
  const desktopSlowFactor = 1;

  // Reduce scroll calculations on mobile
  const scrollConfig = isMobile
    ? { target: ref, offset: "start end" }
    : { target: ref, offset: "start end" };

  const { scrollYProgress } = useScroll({ target: ref });

  // Disable expensive transforms on mobile
  const y = isMobile ? null : useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = isMobile ? null : useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className={`relative min-h-[600px] md:min-h-[700px] lg:min-h-screen bg-gradient-to-br from-orange-50/80 via-yellow-50/60 to-blue-50/70 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/40 overflow-hidden will-change-transform`} style={{ contain: 'layout style paint' }}>
      {/* Enhanced Light Theme Background Layers - Optimized for mobile */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/40 via-transparent to-blue-100/30 dark:opacity-0 hidden sm:block" />
      <div className="absolute inset-0 bg-gradient-to-bl from-yellow-100/30 via-transparent to-indigo-100/40 dark:opacity-0 hidden sm:block" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-50/50 to-transparent dark:opacity-0 hidden sm:block" />

      {/* Simplified mobile background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/30 to-blue-100/20 dark:opacity-0 sm:hidden" style={{ willChange: 'auto' }} />

      {/* Radial gradients for depth - Hidden on mobile */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-radial from-orange-200/20 via-transparent to-transparent dark:opacity-0 hidden sm:block" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(251, 146, 60, 0.15) 0%, transparent 50%)' }} />
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-radial from-blue-200/20 via-transparent to-transparent dark:opacity-0 hidden sm:block" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.15) 0%, transparent 50%)' }} />
      <div className="absolute bottom-0 left-1/2 w-full h-full bg-gradient-radial from-yellow-200/15 via-transparent to-transparent dark:opacity-0 hidden sm:block" style={{ background: 'radial-gradient(circle at 50% 80%, rgba(254, 240, 138, 0.12) 0%, transparent 50%)' }} />
      {/* Professional Space-Type Orbital Background - Disabled on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        {/* Central Data Core - Hidden on mobile */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-32 h-32 hidden sm:block"
          style={{ top: 'calc(50% + 80px)' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 40 * desktopSlowFactor, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-500/10 to-yellow-400/10 dark:from-orange-400/15 dark:to-yellow-300/15 rounded-full blur-xl" />
          <div className="absolute inset-4 bg-gradient-to-br from-orange-400/15 to-yellow-500/15 dark:from-orange-300/20 dark:to-yellow-400/20 rounded-full blur-lg" />
          <div className="absolute inset-8 bg-gradient-to-br from-white/20 to-orange-200/20 dark:from-white/10 dark:to-orange-200/10 rounded-full" />
        </motion.div>

        {/* Simplified mobile core - CSS animation for better performance */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 sm:hidden"
          style={{
            top: 'calc(50% + 40px)',
            animation: 'mobile-core-rotate 60s linear infinite',
            transform: 'translateX(-50%) translate3d(0, 0, 0)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-500/12 to-yellow-400/12 rounded-full blur-md" />
        </div>

        {/* CSS keyframe for mobile core */}
        <style>{`
          @keyframes mobile-core-rotate {
            from { transform: translateX(-50%) translate3d(0, 0, 0) rotate(0deg); }
            to { transform: translateX(-50%) translate3d(0, 0, 0) rotate(360deg); }
          }
        `}</style>

        {/* Orbital Ring 1 - Inner - Hidden on mobile */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-80 h-80 hidden sm:block"
          style={{ top: 'calc(50% + 80px)', transform: 'translateX(-50%) translateY(-50%)' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20 * desktopSlowFactor, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative w-full h-full border border-orange-300/20 dark:border-orange-400/30 rounded-full">
            {/* Data Nodes on Orbit */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.div
                key={`inner-${i}`}
                className="absolute w-3 h-3 bg-gradient-to-r from-orange-400 to-yellow-400 dark:from-orange-300 dark:to-yellow-300 rounded-full shadow-lg"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-150px) rotate(-${angle}deg)`
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Orbital Ring 2 - Middle - Hidden on mobile */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] hidden md:block"
          style={{ top: 'calc(50% + 80px)', transform: 'translateX(-50%) translateY(-50%)' }}
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 35 * desktopSlowFactor, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative w-full h-full border border-yellow-300/15 dark:border-yellow-400/25 rounded-full">
            {/* Business Icons on Orbit */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.div
                key={`middle-${i}`}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-240px) rotate(-${angle}deg)`
                }}
              >
                <div className={`w-full h-full bg-gradient-to-br ${i % 4 === 0 ? 'from-orange-400 to-yellow-400' :
                  i % 4 === 1 ? 'from-yellow-400 to-orange-400' :
                    i % 4 === 2 ? 'from-primary to-accent' :
                      'from-accent to-primary'
                  } rounded-full opacity-60 dark:opacity-80`} />
                {/* Data pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-orange-300/50 dark:border-yellow-300/50"
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.8, 0, 0.8]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: i * 0.4
                  }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Orbital Ring 3 - Outer - Hidden on mobile */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 w-[700px] h-[700px] hidden lg:block"
          style={{ top: 'calc(50% + 80px)', transform: 'translateX(-50%) translateY(-50%)' }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 50 * desktopSlowFactor, repeat: Infinity, ease: "linear" }}
        >
          <div className="relative w-full h-full border border-orange-300/10 dark:border-orange-400/20 rounded-full">
            {/* Satellite Data Points */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
              <motion.div
                key={`outer-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-orange-400/70 to-yellow-400/70 dark:from-orange-300/80 dark:to-yellow-300/80 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-340px) rotate(-${angle}deg)`
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Dynamic Data Streams - Hidden on mobile */}
        <svg className="absolute inset-0 w-full h-full opacity-30 dark:opacity-30 hidden sm:block" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ transform: 'translateY(60px)' }}>
          {/* Reduced curvy lines - covering full screen */}
          <motion.path
            d="M 0 340 Q 300 240 600 340 Q 900 440 1200 340"
            stroke="url(#dataStream1)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="10,5"
            className="dark:stroke-[url(#dataStream1Dark)]"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 8 * desktopSlowFactor,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          />

          <motion.path
            d="M 0 190 Q 300 140 600 240 Q 900 340 1200 290"
            stroke="url(#sexyGradient1)"
            strokeWidth="2.5"
            fill="none"
            strokeDasharray="15,8"
            className="dark:stroke-[url(#sexyGradient1Dark)]"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: 12 * desktopSlowFactor,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
              times: [0, 0.4, 1]
            }}
          />

          {/* Data Binary Streams - Full screen coverage */}
          <motion.g opacity="0.6">
            {/* Top-left binary stream */}
            {[0, 1, 0, 1, 1].map((bit, i) => (
              <motion.text
                key={`binary-tl-${i}`}
                x={50 + i * 40}
                y={120}
                fill="url(#binaryGradient)"
                fontSize="12"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [120, 100, 80]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.3
                }}
              >
                {bit}
              </motion.text>
            ))}

            {/* Top-right binary stream - Always visible in large portraits */}
            {[1, 0, 1, 0, 1].map((bit, i) => (
              <motion.text
                key={`binary-tr-${i}`}
                x={800 + i * 35}
                y={180}
                fill="url(#binaryGradient)"
                fontSize="12"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [180, 160, 140]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.4
                }}
              >
                {bit}
              </motion.text>
            ))}

            {/* Center binary stream for large portraits */}
            {[1, 0, 1, 1, 0].map((bit, i) => (
              <motion.text
                key={`binary-c-${i}`}
                x={400 + i * 45}
                y={300}
                fill="url(#binaryGradient)"
                fontSize="11"
                fontFamily="monospace"
                className="lp:block"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [300, 280, 260]
                }}
                transition={{
                  duration: 4.2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.25
                }}
              >
                {bit}
              </motion.text>
            ))}

            {/* Bottom binary stream */}
            {[1, 1, 0, 1, 0].map((bit, i) => (
              <motion.text
                key={`binary-b-${i}`}
                x={300 + i * 50}
                y={620}
                fill="url(#binaryGradient)"
                fontSize="11"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [620, 600, 580]
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.35
                }}
              >
                {bit}
              </motion.text>
            ))}

            {/* Extended binary streams for large portraits */}
            {[0, 1, 0, 1].map((bit, i) => (
              <motion.text
                key={`binary-ext-${i}`}
                x={150 + i * 60}
                y={450}
                fill="url(#binaryGradient)"
                fontSize="10"
                fontFamily="monospace"
                className="lp:block"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [450, 430, 410]
                }}
                transition={{
                  duration: 5.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.5
                }}
              >
                {bit}
              </motion.text>
            ))}
          </motion.g>

          {/* Database/Server Icons - Full screen distribution */}
          <motion.g>
            {/* Top-left server stack */}
            <motion.rect
              x="80"
              y="250"
              width="25"
              height="6"
              rx="1"
              fill="url(#serverGradient)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            />
            <motion.rect
              x="80"
              y="259"
              width="25"
              height="6"
              rx="1"
              fill="url(#serverGradient)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />
            <motion.rect
              x="80"
              y="268"
              width="25"
              height="6"
              rx="1"
              fill="url(#serverGradient)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />

            {/* Center server stack for large portraits */}
            <motion.rect
              x="500"
              y="350"
              width="28"
              height="7"
              rx="1"
              fill="url(#serverGradient)"
              className="lp:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 0.8 }}
            />
            <motion.rect
              x="500"
              y="360"
              width="28"
              height="7"
              rx="1"
              fill="url(#serverGradient)"
              className="lp:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3.2, repeat: Infinity, delay: 1.3 }}
            />

            {/* Bottom-right server stack */}
            <motion.rect
              x="1000"
              y="520"
              width="30"
              height="7"
              rx="1"
              fill="url(#serverGradient)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1.5 }}
            />
            <motion.rect
              x="1000"
              y="530"
              width="30"
              height="7"
              rx="1"
              fill="url(#serverGradient)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
            />

            {/* Far right server for wide screens */}
            <motion.rect
              x="1100"
              y="300"
              width="22"
              height="5"
              rx="1"
              fill="url(#serverGradient)"
              className="lp:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 2.5 }}
            />
          </motion.g>

          {/* Cloud Computing Shapes - Extended coverage */}
          <motion.g>
            {/* Top-right cloud */}
            <motion.path
              d="M 950 150 Q 965 135 985 150 Q 1005 135 1020 150 Q 1035 165 1020 180 Q 1005 165 985 180 Q 965 165 950 150"
              fill="url(#cloudGradient)"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [0.8, 1.1, 0.8],
                y: [0, -8, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Left-center cloud */}
            <motion.path
              d="M 120 350 Q 135 335 155 350 Q 175 335 190 350 Q 205 365 190 380 Q 175 365 155 380 Q 135 365 120 350"
              fill="url(#cloudGradient)"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [0.9, 1.2, 0.9],
                y: [0, -12, 0]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Center cloud for large portraits */}
            <motion.path
              d="M 550 450 Q 565 435 585 450 Q 605 435 620 450 Q 635 465 620 480 Q 605 465 585 480 Q 565 465 550 450"
              fill="url(#cloudGradient)"
              className="lp:block"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.25, 0.55, 0.25],
                scale: [0.85, 1.15, 0.85],
                y: [0, -10, 0]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />

            {/* Bottom-center cloud */}
            <motion.path
              d="M 350 580 Q 365 565 385 580 Q 405 565 420 580 Q 435 595 420 610 Q 405 595 385 610 Q 365 595 350 580"
              fill="url(#cloudGradient)"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.25, 0.55, 0.25],
                scale: [0.85, 1.15, 0.85],
                y: [0, -10, 0]
              }}
              transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 3.5 }}
            />

            {/* Far top cloud */}
            <motion.path
              d="M 700 80 Q 715 65 735 80 Q 755 65 770 80 Q 785 95 770 110 Q 755 95 735 110 Q 715 95 700 80"
              fill="url(#cloudGradient)"
              className="lp:block"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [0.8, 1.0, 0.8],
                y: [0, -6, 0]
              }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            />
          </motion.g>

          {/* Network Nodes - Full screen distribution */}
          <motion.g>
            {/* Top network cluster */}
            {[
              [200, 200], [280, 180], [340, 220]
            ].map(([x, y], i) => (
              <motion.circle
                key={`node-top-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="url(#nodeGradient)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.3, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}

            {/* Center network cluster for large portraits */}
            {[
              [550, 300], [620, 280], [680, 320]
            ].map(([x, y], i) => (
              <motion.circle
                key={`node-center-${i}`}
                cx={x}
                cy={y}
                r="2.5"
                fill="url(#nodeGradient)"
                className="lp:block"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.7, 1.2, 0.7]
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.35 + 1.5
                }}
              />
            ))}

            {/* Bottom-right network cluster */}
            {[
              [800, 480], [880, 460], [920, 500]
            ].map(([x, y], i) => (
              <motion.circle
                key={`node-br-${i}`}
                cx={x}
                cy={y}
                r="2.5"
                fill="url(#nodeGradient)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  scale: [0.7, 1.2, 0.7]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4 + 1
                }}
              />
            ))}

            {/* Far right nodes for wide screens */}
            {[
              [1050, 350], [1120, 370]
            ].map(([x, y], i) => (
              <motion.circle
                key={`node-far-${i}`}
                cx={x}
                cy={y}
                r="2"
                fill="url(#nodeGradient)"
                className="lp:block"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [0.6, 1.1, 0.6]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5 + 2.5
                }}
              />
            ))}

            {/* Network connections - Extended */}
            <motion.line
              x1="200" y1="200" x2="280" y2="180"
              stroke="url(#connectionGradient)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            <motion.line
              x1="800" y1="480" x2="880" y2="460"
              stroke="url(#connectionGradient)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
            <motion.line
              x1="550" y1="300" x2="620" y2="280"
              stroke="url(#connectionGradient)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              className="lp:block"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 2.5 }}
            />
            <motion.line
              x1="1050" y1="350" x2="1120" y2="370"
              stroke="url(#connectionGradient)"
              strokeWidth="0.6"
              strokeDasharray="1.5,1"
              className="lp:block"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 3.5 }}
            />
          </motion.g>

          {/* Data Chart Bars - Full screen distribution */}
          <motion.g>
            {/* Top-right mini chart */}
            {[15, 25, 12, 28].map((height, i) => (
              <motion.rect
                key={`chart-tr-${i}`}
                x={950 + i * 12}
                y={250 - height}
                width="8"
                height={height}
                fill="url(#chartGradient)"
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: [0, 1, 0.8, 1],
                  opacity: [0.4, 0.8, 0.6, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
                style={{ transformOrigin: 'bottom' }}
              />
            ))}

            {/* Center chart for large portraits */}
            {[22, 35, 18, 40, 25].map((height, i) => (
              <motion.rect
                key={`chart-center-${i}`}
                x={500 + i * 14}
                y={500 - height}
                width="10"
                height={height}
                fill="url(#chartGradient)"
                className="lp:block"
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: [0, 1, 0.7, 1],
                  opacity: [0.3, 0.7, 0.5, 0.7]
                }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.25 + 1
                }}
                style={{ transformOrigin: 'bottom' }}
              />
            ))}

            {/* Bottom-left mini chart */}
            {[18, 30, 20].map((height, i) => (
              <motion.rect
                key={`chart-bl-${i}`}
                x={150 + i * 15}
                y={550 - height}
                width="10"
                height={height}
                fill="url(#chartGradient)"
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: [0, 1, 0.7, 1],
                  opacity: [0.3, 0.7, 0.5, 0.7]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3 + 1.5
                }}
                style={{ transformOrigin: 'bottom' }}
              />
            ))}

            {/* Far right chart */}
            {[16, 24, 14, 30].map((height, i) => (
              <motion.rect
                key={`chart-far-${i}`}
                x={1080 + i * 10}
                y={450 - height}
                width="7"
                height={height}
                fill="url(#chartGradient)"
                className="lp:block"
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: [0, 1, 0.8, 1],
                  opacity: [0.2, 0.6, 0.4, 0.6]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2 + 2
                }}
                style={{ transformOrigin: 'bottom' }}
              />
            ))}
          </motion.g>

          {/* CPU/Processor Representation - Extended coverage */}
          <motion.g>
            {/* Top-center CPU */}
            <motion.rect
              x="450"
              y="180"
              width="20"
              height="20"
              rx="1"
              fill="url(#cpuGradient)"
              stroke="url(#cpuBorderGradient)"
              strokeWidth="0.8"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* CPU pins */}
            {[0, 1, 2].map((i) => (
              <motion.rect
                key={`pin-tc-${i}`}
                x={449 + i * 6}
                y="204"
                width="1.5"
                height="5"
                fill="url(#pinGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}

            {/* Center CPU for large portraits */}
            <motion.rect
              x="600"
              y="400"
              width="22"
              height="22"
              rx="1"
              fill="url(#cpuGradient)"
              stroke="url(#cpuBorderGradient)"
              strokeWidth="0.9"
              className="lp:block"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.88, 1.08, 0.88]
              }}
              transition={{ duration: 4.5, repeat: Infinity, delay: 1.5 }}
            />

            {/* CPU pins for center */}
            {[0, 1, 2, 3].map((i) => (
              <motion.rect
                key={`pin-center-${i}`}
                x={599 + i * 5.5}
                y="426"
                width="1.5"
                height="5"
                fill="url(#pinGradient)"
                className="lp:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.12 + 1.5 }}
              />
            ))}

            {/* Bottom-right CPU */}
            <motion.rect
              x="880"
              y="550"
              width="25"
              height="25"
              rx="1.5"
              fill="url(#cpuGradient)"
              stroke="url(#cpuBorderGradient)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.85, 1.05, 0.85]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            />

            {/* CPU pins for bottom-right */}
            {[0, 1, 2, 3].map((i) => (
              <motion.rect
                key={`pin-br-${i}`}
                x={879 + i * 6}
                y="580"
                width="2"
                height="6"
                fill="url(#pinGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 + 2 }}
              />
            ))}

            {/* Far right CPU for wide screens */}
            <motion.rect
              x="1050"
              y="200"
              width="18"
              height="18"
              rx="1"
              fill="url(#cpuGradient)"
              stroke="url(#cpuBorderGradient)"
              strokeWidth="0.7"
              className="lp:block"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ duration: 6, repeat: Infinity, delay: 3 }}
            />

            {/* CPU pins for far right */}
            {[0, 1, 2].map((i) => (
              <motion.rect
                key={`pin-far-${i}`}
                x={1049 + i * 5}
                y="222"
                width="1.2"
                height="4"
                fill="url(#pinGradient)"
                className="lp:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 + 3 }}
              />
            ))}
          </motion.g>

          {/* Network Nodes - Dispersed across screen */}
          <motion.g className="hidden lg:block">
            {/* Top network cluster */}
            {[
              [200, 200], [280, 180], [340, 220]
            ].map(([x, y], i) => (
              <motion.circle
                key={`node-top-${i}`}
                cx={x}
                cy={y}
                r="3"
                fill="url(#nodeGradient)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1.3, 0.8]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3
                }}
              />
            ))}

            {/* Bottom-right network cluster */}
            {[
              [700, 380], [780, 360], [820, 400]
            ].map(([x, y], i) => (
              <motion.circle
                key={`node-br-${i}`}
                cx={x}
                cy={y}
                r="2.5"
                fill="url(#nodeGradient)"
                className="hidden xl:block"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.4, 0.9, 0.4],
                  scale: [0.7, 1.2, 0.7]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4 + 1
                }}
              />
            ))}

            {/* Network connections */}
            <motion.line
              x1="200" y1="200" x2="280" y2="180"
              stroke="url(#connectionGradient)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            />
            <motion.line
              x1="700" y1="380" x2="780" y2="360"
              stroke="url(#connectionGradient)"
              strokeWidth="0.8"
              strokeDasharray="2,1"
              className="hidden xl:block"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
          </motion.g>

          {/* Data Chart Bars - Dispersed */}
          <motion.g className="hidden md:block">
            {/* Top-right mini chart */}
            {[15, 25, 12, 28].map((height, i) => (
              <motion.rect
                key={`chart-tr-${i}`}
                x={850 + i * 12}
                y={300 - height}
                width="8"
                height={height}
                fill="url(#chartGradient)"
                className="hidden lg:block"
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: [0, 1, 0.8, 1],
                  opacity: [0.4, 0.8, 0.6, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
                style={{ transformOrigin: 'bottom' }}
              />
            ))}

            {/* Bottom-left mini chart */}
            {[18, 30, 20].map((height, i) => (
              <motion.rect
                key={`chart-bl-${i}`}
                x={150 + i * 15}
                y={450 - height}
                width="10"
                height={height}
                fill="url(#chartGradient)"
                initial={{ scaleY: 0 }}
                animate={{
                  scaleY: [0, 1, 0.7, 1],
                  opacity: [0.3, 0.7, 0.5, 0.7]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3 + 1.5
                }}
                style={{ transformOrigin: 'bottom' }}
              />
            ))}
          </motion.g>

          {/* CPU/Processor Representation - Dispersed */}
          <motion.g className="hidden lg:block">
            {/* Top-center CPU */}
            <motion.rect
              x="450"
              y="180"
              width="20"
              height="20"
              rx="1"
              fill="url(#cpuGradient)"
              stroke="url(#cpuBorderGradient)"
              strokeWidth="0.8"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* CPU pins */}
            {[0, 1, 2].map((i) => (
              <motion.rect
                key={`pin-tc-${i}`}
                x={449 + i * 6}
                y="204"
                width="1.5"
                height="5"
                fill="url(#pinGradient)"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}

            {/* Bottom-right CPU */}
            <motion.rect
              x="780"
              y="450"
              width="25"
              height="25"
              rx="1.5"
              fill="url(#cpuGradient)"
              stroke="url(#cpuBorderGradient)"
              strokeWidth="1"
              className="hidden xl:block"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [0.85, 1.05, 0.85]
              }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            />

            {/* CPU pins for bottom-right */}
            {[0, 1, 2, 3].map((i) => (
              <motion.rect
                key={`pin-br-${i}`}
                x={779 + i * 6}
                y="480"
                width="2"
                height="6"
                fill="url(#pinGradient)"
                className="hidden xl:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 + 2 }}
              />
            ))}
          </motion.g>

          <defs>
            {/* Light theme gradients */}
            <linearGradient id="dataStream1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#475569" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="sexyGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="30%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="binaryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="serverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#475569" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="cpuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id="cpuBorderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="pinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.25" />
            </linearGradient>

            {/* Dark theme gradients */}
            <linearGradient id="dataStream1Dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="sexyGradient1Dark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#eab308" stopOpacity="1" />
              <stop offset="70%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="binaryGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="serverGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="cloudGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="nodeGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="connectionGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="chartGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="cpuGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="cpuBorderGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="pinGradientDark" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Enhanced Floating Data Particles - Reduced for mobile */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute w-1.5 h-1.5 rounded-full hidden sm:block ${i % 3 === 0 ? 'bg-orange-400/80 dark:bg-orange-300' :
              i % 3 === 1 ? 'bg-yellow-400/80 dark:bg-yellow-300' :
                'bg-blue-400/70 dark:bg-yellow-400'
              }`}
            style={{
              left: `${15 + (i * 7) % 70}%`,
              top: `${20 + (i * 11) % 60}%`
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.5, 1, 0.5],
              scale: [0.6, 1.4, 0.6]
            }}
            transition={{
              duration: 6 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}

        {/* Simplified particles for mobile - CSS animations for better performance */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`mobile-particle-${i}`}
            className={`absolute w-1 h-1 rounded-full sm:hidden ${i % 2 === 0 ? 'bg-orange-400/50' : 'bg-blue-400/40'}`}
            style={{
              left: `${25 + (i * 25) % 50}%`,
              top: `${35 + (i * 20) % 30}%`,
              animation: `float-${i} ${6 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 1}s`
            }}
          />
        ))}

        {/* CSS keyframes for mobile particles - Hardware accelerated */}
        <style>{`
          @keyframes float-0 {
            0%, 100% { transform: translate3d(0, 0px, 0); opacity: 0.4; }
            50% { transform: translate3d(0, -10px, 0); opacity: 0.7; }
          }
          @keyframes float-1 {
            0%, 100% { transform: translate3d(0, 0px, 0); opacity: 0.3; }
            50% { transform: translate3d(0, -12px, 0); opacity: 0.6; }
          }
          @keyframes float-2 {
            0%, 100% { transform: translate3d(0, 0px, 0); opacity: 0.5; }
            50% { transform: translate3d(0, -8px, 0); opacity: 0.8; }
          }
        `}</style>

        {/* Light Theme Floating Geometric Shapes - Hidden on mobile */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-8 h-8 bg-gradient-to-br from-orange-300/40 to-yellow-300/30 dark:opacity-0 rounded-lg rotate-45 hidden sm:block"
          animate={{
            rotate: [45, 225, 45],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-gradient-to-br from-blue-300/40 to-indigo-300/30 dark:opacity-0 rounded-full hidden sm:block"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            y: [0, -15, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
        <motion.div
          className="absolute top-1/3 left-1/5 w-4 h-12 bg-gradient-to-b from-yellow-300/35 to-orange-300/25 dark:opacity-0 rounded-full hidden sm:block"
          animate={{
            rotate: [0, 180, 360],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
        />

        {/* Floating Blue and Orange Dots for Light Theme - Reduced for mobile */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`floating-dot-${i}`}
            className={`absolute rounded-full dark:opacity-0 hidden sm:block ${i % 3 === 0 ? 'w-3 h-3 bg-orange-400/60' :
              i % 3 === 1 ? 'w-2 h-2 bg-blue-500/50' :
                'w-4 h-4 bg-orange-300/40'
              }`}
            style={{
              left: `${10 + (i * 13) % 80}%`,
              top: `${15 + (i * 17) % 70}%`
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7
            }}
          />
        ))}

        {/* Simplified dots for mobile - CSS animations */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`mobile-dot-${i}`}
            className={`absolute rounded-full dark:opacity-0 sm:hidden ${i % 2 === 0 ? 'w-2 h-2 bg-orange-400/40' : 'w-2 h-2 bg-blue-400/35'}`}
            style={{
              left: `${20 + (i * 20) % 60}%`,
              top: `${25 + (i * 25) % 50}%`,
              animation: `dot-float-${i} ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`
            }}
          />
        ))}

        {/* CSS keyframes for mobile dots - Hardware accelerated */}
        <style>{`
          @keyframes dot-float-0 {
            0%, 100% { transform: translate3d(0, 0px, 0); opacity: 0.3; }
            50% { transform: translate3d(0, -15px, 0); opacity: 0.6; }
          }
          @keyframes dot-float-1 {
            0%, 100% { transform: translate3d(0, 0px, 0); opacity: 0.25; }
            50% { transform: translate3d(0, -18px, 0); opacity: 0.55; }
          }
          @keyframes dot-float-2 {
            0%, 100% { transform: translate3d(0, 0px, 0); opacity: 0.35; }
            50% { transform: translate3d(0, -12px, 0); opacity: 0.65; }
          }
          @keyframes dot-float-3 {
            0%, 100% { transform: translate3d(0, 0px, 0); opacity: 0.3; }
            50% { transform: translate3d(0, -16px, 0); opacity: 0.6; }
          }
        `}</style>

        {/* Additional Larger Floating Dots - Hidden on mobile */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`large-dot-${i}`}
            className={`absolute rounded-full dark:opacity-0 hidden sm:block ${i % 2 === 0 ? 'w-6 h-6 bg-blue-400/30' : 'w-5 h-5 bg-orange-400/35'
              }`}
            style={{
              left: `${20 + (i * 11) % 60}%`,
              top: `${25 + (i * 19) % 50}%`
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 12 + (i % 3),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2
            }}
          />
        ))}

        {/* Enhanced Ambient Glow Effects for Light Theme */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-300/25 to-yellow-300/20 dark:from-orange-400/20 dark:to-yellow-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-indigo-300/25 dark:from-primary/20 dark:to-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />

        {/* Additional Light Theme Glow Elements */}
        <motion.div
          className="absolute top-1/3 left-10 w-64 h-64 bg-gradient-to-br from-yellow-200/30 to-orange-200/25 dark:opacity-0 rounded-full blur-2xl"
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 20, 0],
            y: [0, -15, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-1/3 right-10 w-72 h-72 bg-gradient-to-br from-blue-200/25 to-purple-200/20 dark:opacity-0 rounded-full blur-2xl"
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -25, 0],
            y: [0, 10, 0]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        />
      </div>

      {/* Main Hero Content */}
      <motion.main
        className="relative z-10 flex flex-col items-center justify-center min-h-[600px] md:min-h-[700px] lg:min-h-screen px-6 pt-20 pb-8 lg:px-8 lg:pt-32 lg:pb-12"
        style={{ paddingTop: '120px', willChange: 'opacity' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0.2 : 0.3, ease: "easeOut" }}
      >
        {/* Animated Strip Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Third Strip Line (diagonal) */}
          <motion.div
            className="absolute w-px h-full bg-gradient-to-b from-transparent via-purple-400/20 to-transparent dark:via-purple-300/30"
            style={{
              left: '15%',
              transform: 'rotate(15deg)',
              transformOrigin: 'center',
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scaleY: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 12 * desktopSlowFactor,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Fourth Strip Line (diagonal opposite) */}
          <motion.div
            className="absolute w-px h-full bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent dark:via-emerald-300/30"
            style={{
              right: '15%',
              transform: 'rotate(-15deg)',
              transformOrigin: 'center',
            }}
            animate={{
              opacity: [0.6, 0.2, 0.6],
              scaleY: [1, 0.5, 1],
            }}
            transition={{
              duration: 10 * desktopSlowFactor,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        {/* Hero Headline */}
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-center text-slate-900 dark:text-slate-100 max-w-6xl leading-tight"
          style={{ willChange: 'opacity, transform' }}
          initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.3 : 0.5, delay: isMobile ? 0.05 : 0.1, ease: "easeOut" }}
        >
          The Connection That Counts
          <br />
          <span className="bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 bg-clip-text text-transparent animate-gradient-x bg-size-200">
            The Result That Lasts
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="mt-6 text-xl sm:text-2xl md:text-2xl text-slate-600 dark:text-slate-300 text-center max-w-4xl leading-relaxed"
          style={{ willChange: 'opacity, transform' }}
          initial={{ opacity: 0, y: isMobile ? 8 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.25 : 0.4, delay: isMobile ? 0.1 : 0.2, ease: "easeOut" }}
        >
          Your one-stop solution for CRM, ERP, HRMS, SFA, and more.
          <span className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Transform your business operations</span> with our comprehensive suite of enterprise software.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          style={{ willChange: 'opacity, transform' }}
          initial={{ opacity: 0, y: isMobile ? 8 : 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.25 : 0.4, delay: isMobile ? 0.15 : 0.3, ease: "easeOut" }}
        >
          <motion.div
            whileHover={isMobile ? {} : { scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            style={{ willChange: 'transform' }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 hover:from-orange-600 hover:via-yellow-500 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/demo-request')}
            >
              <Play className="w-5 h-5 mr-2" />
              Request a Demo
            </Button>
          </motion.div>

          <motion.div
            whileHover={isMobile ? {} : { scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            style={{ willChange: 'transform' }}
          >
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-orange-300 dark:border-orange-400 text-orange-600 dark:text-orange-400 hover:border-orange-500 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 px-8 py-4 text-lg font-semibold transition-all duration-300"
              onClick={() => navigate('/auto-site')}
            >
              Website Builder
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-slate-500 dark:text-slate-400"
          style={{ willChange: 'opacity, transform' }}
          initial={{ opacity: 0, y: isMobile ? 5 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: isMobile ? 0.2 : 0.3, delay: isMobile ? 0.2 : 0.4, ease: "easeOut" }}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">Trusted by 100+ companies</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">99.9% uptime target</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium">24/7 expert support</span>
          </div>
        </motion.div>
      </motion.main>

      {/* Manacle Success & Trust Section */}
      <motion.section
        className="relative z-10 px-6 lg:px-8 py-12 lg:py-20"
        initial={isMobilePortrait ? { opacity: 0 } : { opacity: 0, y: 50 }}
        whileInView={isMobilePortrait
          ? { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
          : { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Cursive Header */}
          <motion.div
            className="text-center mb-16"
            initial={isMobilePortrait ? { opacity: 0 } : { opacity: 0 }}
            whileInView={isMobilePortrait
              ? { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
              : { opacity: 1, transition: { duration: 0.6, ease: "easeOut", delay: 0.3 } }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-medium text-slate-800 dark:text-slate-200 mb-4" style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '500' }}>
              Transforming Business Dreams into Digital Reality
            </h2>
            <p className="text-xl sm:text-2xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Where innovation meets execution - we turn your boldest business visions into powerful, scalable solutions that drive extraordinary growth.
            </p>
          </motion.div>

          {/* Achievement Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Left: Key Achievements */}
            <motion.div
              className="space-y-8"
              initial={isMobilePortrait ? { opacity: 0 } : { opacity: 0, x: -50 }}
              whileInView={isMobilePortrait
                ? { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
                : { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="bg-gradient-to-br from-white/90 to-blue-50/90 dark:from-slate-800/90 dark:to-slate-700/90 backdrop-blur-lg rounded-3xl p-5 md:p-8 shadow-2xl border border-white/30 dark:border-slate-600/30 text-center mx-auto max-w-md sm:max-w-lg lg:max-w-none">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-6 text-slate-800 dark:text-slate-200" style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '500' }}>
                  The Manacle Advantage
                </h3>

                <div className="space-y-6">
                  <motion.div
                    className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700"
                    whileHover={isMobilePortrait ? undefined : { scale: 1.02, x: 5 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      ✓
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">200+ Happy Customers</p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">Businesses successfully transformed</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-700"
                    whileHover={isMobilePortrait ? undefined : { scale: 1.02, x: 5 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      ⚡
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">2000+ Distributors Onboard</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Active distribution network across regions</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl border border-purple-200 dark:border-purple-700"
                    whileHover={isMobilePortrait ? undefined : { scale: 1.02, x: 5 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      ★
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">10,000+ Active Salespeople</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Empowered by our SFA solutions</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border border-orange-200 dark:border-orange-700"
                    whileHover={isMobilePortrait ? undefined : { scale: 1.02, x: 5 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      🏆
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-orange-800 dark:text-orange-200">End-to-End Solutions Provider</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">CRM, ERP, HRMS, SFA & more</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right: Live Metrics */}
            <motion.div
              className="space-y-8"
              initial={isMobilePortrait ? { opacity: 0 } : { opacity: 0, x: 50 }}
              whileInView={isMobilePortrait
                ? { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
                : { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.4 } }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-8 bg-transparent sm:bg-gradient-to-br sm:from-white/90 sm:to-purple-50/90 dark:sm:from-slate-800/90 dark:sm:to-purple-900/20 sm:backdrop-blur-lg sm:shadow-2xl sm:border sm:border-white/30 dark:sm:border-slate-600/30 overflow-hidden mx-auto max-w-md sm:max-w-none text-center">
                <div className="relative">
                  <motion.div
                    className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-2xl"
                    animate={isMobilePortrait ? undefined : { rotate: [0, 360] }}
                    transition={isMobilePortrait ? undefined : { duration: 15, repeat: Infinity, ease: "linear" }}
                  />

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-4 sm:mb-6 md:mb-8 text-slate-800 dark:text-slate-200 relative z-10 text-center" style={{ fontFamily: 'Fredoka, sans-serif', fontWeight: '500' }}>
                    Success by the Numbers
                  </h3>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 relative z-10">
                    <motion.div
                      className="text-center p-2 sm:p-3 md:p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-400/20 dark:to-emerald-400/20 rounded-lg sm:rounded-xl md:rounded-2xl border border-green-200/40 sm:border-green-200/50 dark:border-green-600/30"
                      animate={isMobilePortrait ? undefined : {
                        boxShadow: [
                          "0 0 20px rgba(34, 197, 94, 0.2)",
                          "0 0 30px rgba(34, 197, 94, 0.4)",
                          "0 0 20px rgba(34, 197, 94, 0.2)"
                        ]
                      }}
                      transition={isMobilePortrait ? undefined : { duration: 3, repeat: Infinity }}
                    >
                      <motion.p
                        className="text-xl sm:text-2xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-0.5 sm:mb-1 md:mb-2"
                        animate={isMobilePortrait ? undefined : { scale: [1, 1.05, 1] }}
                        transition={isMobilePortrait ? undefined : { duration: 2, repeat: Infinity }}
                      >
                        15+
                      </motion.p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-green-700 dark:text-green-300 font-medium">Years in Industry</p>
                    </motion.div>

                    <motion.div
                      className="text-center p-2 sm:p-3 md:p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20 rounded-lg sm:rounded-xl md:rounded-2xl border border-blue-200/40 sm:border-blue-200/50 dark:border-blue-600/30"
                      animate={isMobilePortrait ? undefined : {
                        boxShadow: [
                          "0 0 20px rgba(59, 130, 246, 0.2)",
                          "0 0 30px rgba(59, 130, 246, 0.4)",
                          "0 0 20px rgba(59, 130, 246, 0.2)"
                        ]
                      }}
                      transition={isMobilePortrait ? undefined : { duration: 3, repeat: Infinity, delay: 1 }}
                    >
                      <motion.p
                        className="text-xl sm:text-2xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-0.5 sm:mb-1 md:mb-2"
                        animate={isMobilePortrait ? undefined : { scale: [1, 1.05, 1] }}
                        transition={isMobilePortrait ? undefined : { duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        200+
                      </motion.p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-blue-700 dark:text-blue-300 font-medium">Satisfied Clients</p>
                    </motion.div>

                    <motion.div
                      className="text-center p-2 sm:p-3 md:p-6 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-400/20 dark:to-violet-400/20 rounded-lg sm:rounded-xl md:rounded-2xl border border-purple-200/40 sm:border-purple-200/50 dark:border-purple-600/30"
                      animate={isMobilePortrait ? undefined : {
                        boxShadow: [
                          "0 0 20px rgba(147, 51, 234, 0.2)",
                          "0 0 30px rgba(147, 51, 234, 0.4)",
                          "0 0 20px rgba(147, 51, 234, 0.2)"
                        ]
                      }}
                      transition={isMobilePortrait ? undefined : { duration: 3, repeat: Infinity, delay: 2 }}
                    >
                      <motion.p
                        className="text-xl sm:text-2xl md:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-0.5 sm:mb-1 md:mb-2"
                        animate={isMobilePortrait ? undefined : { scale: [1, 1.05, 1] }}
                        transition={isMobilePortrait ? undefined : { duration: 2, repeat: Infinity, delay: 2 }}
                      >
                        24/7
                      </motion.p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-purple-700 dark:text-purple-300 font-medium">Expert Support</p>
                    </motion.div>

                    <motion.div
                      className="text-center p-2 sm:p-3 md:p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-400/20 dark:to-red-400/20 rounded-lg sm:rounded-xl md:rounded-2xl border border-orange-200/40 sm:border-orange-200/50 dark:border-orange-600/30"
                      animate={isMobilePortrait ? undefined : {
                        boxShadow: [
                          "0 0 20px rgba(249, 115, 22, 0.2)",
                          "0 0 30px rgba(249, 115, 22, 0.4)",
                          "0 0 20px rgba(249, 115, 22, 0.2)"
                        ]
                      }}
                      transition={isMobilePortrait ? undefined : { duration: 3, repeat: Infinity, delay: 0.5 }}
                    >
                      <motion.p
                        className="text-xl sm:text-2xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-0.5 sm:mb-1 md:mb-2"
                        animate={isMobilePortrait ? undefined : { scale: [1, 1.05, 1] }}
                        transition={isMobilePortrait ? undefined : { duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        100%
                      </motion.p>
                      <p className="text-[10px] sm:text-xs md:text-sm text-orange-700 dark:text-orange-300 font-medium">Custom Solutions</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Compact Solutions Section */}
      <div className="relative z-10">
        <CompactSolutions />
      </div>
    </div>
  );
}
