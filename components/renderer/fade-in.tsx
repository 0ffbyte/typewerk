"use client";
import { motion } from "framer-motion";

const FadeIn = ({
  children,
  delay,
  duration,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: duration, ease: "easeInOut" }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
