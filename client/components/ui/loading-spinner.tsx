import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const innerSizeClasses = {
        sm: 'w-6 h-6 top-1 left-1',
        md: 'w-8 h-8 top-2 left-2',
        lg: 'w-12 h-12 top-2 left-2'
    };

    const dotSizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-1.5 h-1.5',
        lg: 'w-2 h-2'
    };

    const glowSizeClasses = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-20 h-20'
    };

    return (
        <motion.div
            className={`relative ${className}`}
            initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1]
            }}
        >
            {/* Outer glow ring */}
            <div
                className={`absolute top-1/2 left-1/2 ${glowSizeClasses[size]} border border-primary/20 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ripple`}
            />

            {/* Main outer ring with gradient */}
            <div
                className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 p-0.5 animate-spin-smooth`}
            >
                <div className={`w-full h-full rounded-full bg-background`} />
            </div>

            {/* Inner ring - counter rotating */}
            <div
                className={`absolute ${innerSizeClasses[size]} border-4 border-transparent rounded-full animate-spin-reverse`}
                style={{
                    borderTopColor: 'hsl(var(--primary))',
                    borderRightColor: 'hsl(var(--primary) / 0.3)',
                }}
            />

            {/* Center dot with glow */}
            <motion.div
                className={`absolute top-1/2 left-1/2 ${dotSizeClasses[size]} bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-glow-pulse`}
                animate={{
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Subtle sparkle effect */}
            <motion.div
                className="absolute top-0 right-0 w-1 h-1 bg-primary rounded-full"
                animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.3,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-0 left-0 w-0.5 h-0.5 bg-primary/60 rounded-full"
                animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.6,
                    ease: "easeInOut"
                }}
            />
        </motion.div>
    );
};

export default LoadingSpinner;
