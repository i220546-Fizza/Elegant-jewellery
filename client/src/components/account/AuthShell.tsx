import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import ProductImage from '../product/ProductImage';

/** Split editorial layout used by sign-in, register and password pages. */
const AuthShell = ({ eyebrow, title, children, image = '/uploads/products/eclat-2.webp' }: { eyebrow: string; title: string; children: ReactNode; image?: string }) => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="relative hidden overflow-hidden bg-taupe lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(248,247,243,0.9),transparent_62%)]" />
      <motion.div initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-[10%]">
        <ProductImage src={image} alt="" eager className="h-full w-full object-contain" />
      </motion.div>
      <p className="absolute bottom-10 left-10 max-w-xs font-serif text-3xl font-light leading-tight">A fragrance is the most intimate form of memory.</p>
    </div>
    <div className="flex items-center justify-center px-6 pb-16 pt-32 lg:px-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
        <p className="eyebrow flex items-center gap-4">
          <span className="gold-rule" /> {eyebrow}
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light sm:text-6xl">{title}</h1>
        <div className="mt-12">{children}</div>
      </motion.div>
    </div>
  </div>
);

export default AuthShell;
