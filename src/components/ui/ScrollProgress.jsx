import React from 'react';
import { motion, useScroll } from 'framer-motion';

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-tucasa-600 to-yellow-400 origin-left z-[100]"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

export default ScrollProgress;