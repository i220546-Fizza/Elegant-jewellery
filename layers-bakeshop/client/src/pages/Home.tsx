import Hero from '../components/Hero';
import FeaturedProducts from '../components/FeaturedProducts';
import BrandStory from '../components/BrandStory';
import SpecialOffers from '../components/SpecialOffers';
import GalleryTeaser from '../components/GalleryTeaser';
import CtaBanner from '../components/CtaBanner';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <BrandStory />
      <SpecialOffers />
      <GalleryTeaser />
      <CtaBanner />
    </>
  );
}
