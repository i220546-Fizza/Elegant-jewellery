import { Link } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader';
import Reveal from '../components/ui/Reveal';
import { EditorialStill, PILLARS } from '../components/home/StoryTeaser';
import ProductImage from '../components/product/ProductImage';
import { ArrowRight } from '../components/ui/Icons';
import { useTitle } from '../lib/useTitle';

const CHAPTERS = [
  {
    eyebrow: 'Chapter I — The idea',
    title: 'A house built on restraint',
    text: 'NB Classic Scents began with a belief that luxury should whisper. In a world of loud launches and fleeting trends, we set out to compose fragrances with the quiet assurance of a well-cut coat — pieces you return to for years.',
  },
  {
    eyebrow: 'Chapter II — The craft',
    title: 'Composed slowly, finished by hand',
    text: 'Each formula is refined over months of trials. Our eaux de parfum are macerated for weeks, chilled and filtered in small batches, then filled into heavy-based glass flacons and finished with a weighted cap. Nothing is rushed.',
  },
  {
    eyebrow: 'Chapter III — The materials',
    title: 'Ingredients chosen without compromise',
    text: 'We work with aged oud, Taif rose, Florentine orris, Mysore-style sandalwood and Calabrian bergamot — materials selected for their character and longevity, not their cost. The result is depth you can feel from the first spray to the last trace.',
  },
];

const OurStory = () => {
  useTitle('Our Story', 'The story of NB Classic Scents — a fragrance house devoted to craftsmanship, premium ingredients and timeless elegance.');
  return (
    <>
      <PageHeader eyebrow="The NB Classic Scents story" title={<>More than a fragrance.<br /><span className="italic text-stone">A signature.</span></>} crumbs={[{ label: 'Home', to: '/' }, { label: 'Our Story' }]}>
        We believe the most personal thing you wear is invisible. Our purpose is to compose fragrances that become part of who you are.
      </PageHeader>

      <section className="container-lux py-24 lg:py-32">
        <EditorialStill className="aspect-[4/5] sm:aspect-[16/9]" />
      </section>

      <section className="container-lux space-y-24 pb-24 lg:space-y-36 lg:pb-36">
        {CHAPTERS.map((c, i) => (
          <div key={c.title} className="grid items-center gap-12 lg:grid-cols-12">
            <Reveal className={`lg:col-span-5 ${i % 2 ? 'lg:order-2 lg:col-start-8' : ''}`}>
              <p className="eyebrow">{c.eyebrow}</p>
              <h2 className="heading-lg mt-5">{c.title}</h2>
              <p className="mt-6 text-[15px] leading-relaxed text-stone">{c.text}</p>
            </Reveal>
            <Reveal delay={0.15} className={`relative aspect-[5/4] overflow-hidden bg-taupe/50 lg:col-span-6 ${i % 2 ? 'lg:order-1' : 'lg:col-start-7'}`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(248,247,243,0.9),transparent_60%)]" />
              <ProductImage src={`/uploads/products/${['aurum', 'oud-imperial', 'jardin-divoire'][i]}-3.webp`} alt="" className="absolute inset-0 h-full w-full object-contain p-6" />
            </Reveal>
          </div>
        ))}
      </section>

      <section className="bg-ink py-24 text-ivory lg:py-32">
        <div className="container-lux">
          <p className="eyebrow !text-ivory/50">Our philosophy</p>
          <div className="mt-12 grid gap-px bg-ivory/10 sm:grid-cols-2 lg:grid-cols-4">
            {[...PILLARS, { n: '05', title: 'Elegance', text: 'Every detail — from the weight of the cap to the stroke of the label — is considered, then refined again.' }].slice(0, 4).map((p) => (
              <div key={p.n} className="bg-ink p-8">
                <p className="font-serif text-4xl text-gold">{p.n}</p>
                <p className="mt-6 font-sans text-[11px] uppercase tracking-wide2">{p.title}</p>
                <p className="mt-4 text-sm leading-relaxed text-ivory/60">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-lux py-24 text-center lg:py-32">
        <Reveal>
          <p className="mx-auto max-w-3xl font-serif text-3xl font-light italic leading-snug sm:text-5xl">“We do not make fragrances for a season. We make them for the moments you will want to remember.”</p>
          <p className="eyebrow mt-8">The founder, NB Classic Scents</p>
          <Link to="/fragrances" className="btn-dark mt-12">
            Find your signature <ArrowRight size={14} />
          </Link>
        </Reveal>
      </section>
    </>
  );
};

export default OurStory;
