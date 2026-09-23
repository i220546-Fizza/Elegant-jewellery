import type { Notes } from '../../types';
import Reveal from '../ui/Reveal';

const ROWS: { key: keyof Notes; title: string; width: string }[] = [
  { key: 'top', title: 'Top notes', width: 'w-[62%]' },
  { key: 'heart', title: 'Heart notes', width: 'w-[80%]' },
  { key: 'base', title: 'Base notes', width: 'w-full' },
];

const NotesPyramid = ({ notes }: { notes: Notes }) => (
  <div className="flex flex-col items-center gap-3">
    {ROWS.map((r, i) => (
      <Reveal key={r.key} delay={i * 0.15} className={`${r.width} border border-taupe bg-white/40 px-5 py-6 text-center transition-colors duration-700 hover:border-gold`}>
        <p className="eyebrow">{r.title}</p>
        <p className="mt-3 font-serif text-xl sm:text-2xl">{notes[r.key].join(' · ') || '—'}</p>
      </Reveal>
    ))}
  </div>
);

export default NotesPyramid;
