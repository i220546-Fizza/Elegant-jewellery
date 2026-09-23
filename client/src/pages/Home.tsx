import Hero from '../components/home/Hero';
import SignatureScents from '../components/home/SignatureScents';
import SignatureTrio from '../components/home/SignatureTrio';
import Marquee from '../components/home/Marquee';
import ShopCollection from '../components/home/ShopCollection';
import Composition from '../components/home/Composition';
import StoryTeaser from '../components/home/StoryTeaser';
import Services from '../components/home/Services';
import { useTitle } from '../lib/useTitle';

const Home = () => {
  useTitle();
  return (
    <>
      <Hero />
      <SignatureTrio />
      <Marquee />
      <SignatureScents />
      <ShopCollection />
      <Composition />
      <StoryTeaser />
      <Services />
    </>
  );
};

export default Home;
