import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface AlertNotificationProps {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function AlertNotification({
  title,
  message,
  type = 'error',
  duration = 5000,
  onClose
}: AlertNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Color based on type
  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'bg-[#4caf50]';
      case 'error':
        return 'bg-[#f44336]';
      case 'warning':
        return 'bg-[#ff9800]';
      case 'info':
      default:
        return 'bg-[#2196f3]';
    }
  };

  // Icon based on type
  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  // Close the alert
  const closeAlert = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Allow animation to complete
    }
  };

  // Auto close after duration
  useEffect(() => {
    if (duration) {
      const timeout = setTimeout(() => {
        closeAlert();
      }, duration);
      
      return () => clearTimeout(timeout);
    }
  }, [duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 right-4 ${getTypeColor()} text-white py-2 px-4 rounded-md shadow-md max-w-sm z-50`}
        >
          <div className="flex items-start">
            <span className="mr-2 mt-0.5">{getTypeIcon()}</span>
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
