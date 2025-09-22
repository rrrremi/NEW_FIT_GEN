'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2 -translate-y-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2 -translate-y-2';
    }
  };

  // Animation variants
  const tooltipVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: position === 'bottom' ? -5 : position === 'top' ? 5 : 0,
      x: position === 'right' ? -5 : position === 'left' ? 5 : 0
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 w-56 ${getPositionStyles()}`}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tooltipVariants}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              {/* Arrow */}
              <div 
                className={`absolute ${
                  position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-white/20' : 
                  position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-white/20' :
                  position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-white/20' :
                  'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-white/20'
                } w-0 h-0 border-solid border-transparent ${
                  position === 'top' ? 'border-x-[8px] border-t-[8px]' : 
                  position === 'bottom' ? 'border-x-[8px] border-b-[8px]' : 
                  position === 'left' ? 'border-y-[8px] border-l-[8px]' : 
                  'border-y-[8px] border-r-[8px]'
                }`}
              />
              
              {/* Content */}
              <div className="rounded-lg bg-black/80 backdrop-blur-md border border-white/10 p-3 text-xs text-white/90 shadow-xl">
                {content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
