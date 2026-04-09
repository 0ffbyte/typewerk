"use client";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import useAppStore from "@/store/app-store";
import { Button } from "@/components/ui/button";

export default function Sonner() {
  const [isVisible, setIsVisible] = React.useState(false);
  const alert = useAppStore((state) => state.sonner);

  React.useEffect(() => {
    if (!alert) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const timerId = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timerId);
  }, [alert]);

  return (
    <div className="fixed top-0 left-0 w-full h-fit flex items-center justify-center pt-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {isVisible && alert && (
          <motion.div
            layout
            key={alert.timestamp}
            whileTap={{
              scale: 0.9,
            }}
            initial={{
              filter: "blur(8px)",
              opacity: 0,
              y: -100,
              scale: 0.8,
            }}
            animate={{
              filter: "blur(0px)",
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 18,
                opacity: { duration: 0.2 },
                filter: { duration: 0.2 },
              },
            }}
            style={{
              willChange: "transform",
            }}
            exit={{ filter: "blur(8px)", opacity: 0, y: -40, scale: 0.8 }}
            className="max-w-[260px] backdrop-blur-xs text-zinc-200 z-50 rounded-lg shadow-lg border border-border/20 bg-zinc-900/80 min-w-[128px] w-fit p-4 pr-4 flex justify-start items-start pointer-events-auto gap-2"
            tabIndex={0}
          >
            <motion.div
              layout
              className="hidden h-[42px] rounded-[42px] aspect-square bg-zinc-400"
            />
            <motion.div
              key={alert.timestamp}
              layout="position"
              initial={{ opacity: 0, filter: "blur(8px)" }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                transition: { delay: 0.1 },
              }}
              className="flex flex-col"
            >
              <p>{alert.title}</p>
              <p className="text-sm mb-2">{alert.message}</p>
              <Button className="w-fit" onClick={() => setIsVisible(false)}>
                Dismiss
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
