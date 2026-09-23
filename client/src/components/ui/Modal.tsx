import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from './Icons';

export const useLockScroll = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
};

export const useEscape = (active: boolean, onClose: () => void) => {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose]);
};

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: 'right' | 'center' | 'top' | 'left';
  label: string;
  className?: string;
}

const panelMotion = {
  right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
  left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
  center: { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 24 } },
};

const placement = {
  right: 'right-0 top-0 h-full w-full max-w-[460px]',
  left: 'left-0 top-0 h-full w-full max-w-[420px]',
  top: 'left-0 top-0 w-full',
  center: 'left-1/2 top-1/2 max-h-[92vh] w-[min(1040px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto',
};

const Modal = ({ open, onClose, children, side = 'right', label, className = '' }: Props) => {
  useLockScroll(open);
  useEscape(open, onClose);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onClose}
          />
          <div className={`absolute ${placement[side]}`}>
            <motion.div
              {...panelMotion[side]}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`relative h-full bg-ivory shadow-soft ${className}`}
            >
              <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 z-10 p-2 text-ink transition hover:rotate-90 hover:text-gold duration-700">
                <CloseIcon />
              </button>
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
