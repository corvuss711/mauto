import { motion } from 'framer-motion';
import { LoadingSpinner } from './loading-spinner';

interface LogoutLoaderProps {
  isVisible: boolean;
}

export const LogoutLoader = ({ isVisible }: LogoutLoaderProps) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex flex-col items-center space-y-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <LoadingSpinner size="lg" />
        <motion.div
          className="text-center"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Logging Out
          </h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we securely log you out...
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LogoutLoader;
