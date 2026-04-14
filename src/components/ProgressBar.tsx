import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  isLoading: boolean;
  duration?: number; // in milliseconds
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ isLoading, duration = 5000, className = "" }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      const startTime = Date.now();
      
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 95); // Stay at 95% until done
        setProgress(newProgress);
      }, 100);
    } else {
      setProgress(100);
      const timeout = setTimeout(() => setProgress(0), 500);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, duration]);

  if (!isLoading && progress === 0) return null;

  return (
    <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className="bg-blue-600 h-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      />
    </div>
  );
};
