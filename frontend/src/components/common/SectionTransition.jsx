import { AnimatePresence, motion } from "framer-motion";

export default function SectionTransition({ children, sectionKey }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sectionKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="grid gap-4"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
