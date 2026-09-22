import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MagneticButton from '../components/MagneticButton';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-5 py-24 text-center">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-8xl text-layers-accent-soft sm:text-9xl"
      >
        404
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-2 font-display text-3xl text-layers-ink"
      >
        This layer doesn't exist.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-3 max-w-sm text-layers-muted"
      >
        The page you're looking for may have been moved or is no longer available.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <MagneticButton
          type="button"
          onClick={() => navigate('/')}
          data-cursor-hover
          className="mt-8 rounded-full bg-layers-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-layers-primary-hover"
        >
          Back to Home
        </MagneticButton>
      </motion.div>
    </div>
  );
}
