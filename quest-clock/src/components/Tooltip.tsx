import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [show, setShow] = useState(false);
  return (
    <div 
      className="relative flex items-center justify-center group" 
      onMouseEnter={() => setShow(true)} 
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 px-2 py-1 bg-quest-bg/90 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase font-bold tracking-wider rounded whitespace-nowrap z-50 pointer-events-none shadow-lg"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
