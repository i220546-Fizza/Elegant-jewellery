const WORDS = ['Timeless', 'Elegance', 'Craftsmanship', 'Eau de Parfum', 'Rare Ingredients', 'Signature'];

/** A slow typographic band between sections. */
const Marquee = () => (
  <div className="overflow-hidden border-y border-taupe/80 py-6" aria-hidden>
    <div className="flex w-max animate-marquee">
      {[0, 1].map((k) => (
        <div key={k} className="flex shrink-0 items-center">
          {WORDS.map((w) => (
            <span key={w} className="flex items-center font-serif text-3xl font-light uppercase tracking-[0.18em] text-ink/80 sm:text-4xl">
              <span className="px-10">{w}</span>
              <span className="text-lg text-gold">✦</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Marquee;
