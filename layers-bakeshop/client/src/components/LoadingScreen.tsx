import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  isLoading: boolean;
}

const layers = [
  { color: '#6e1e2c', width: 64 },
  { color: '#8c3341', width: 84 },
  { color: '#c9a24b', width: 104 },
];

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-layers-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        >
          <div className="flex flex-col items-center gap-1.5" aria-hidden="true">
            {layers.map((layer, i) => (
              <motion.span
                key={layer.width}
                className="h-3 rounded-full"
                style={{ backgroundColor: layer.color, width: layer.width }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </div>
          <motion.p
            className="layers-eyebrow mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Layers Bakeshop
          </motion.p>
          <span className="sr-only" role="status">
            Loading Layers Bakeshop
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
