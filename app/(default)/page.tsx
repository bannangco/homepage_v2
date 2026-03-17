import Hero from '@/components/hero-home';
import Features from '@/components/features';
import Workflows from '@/components/workflows';
import PastServices from '@/components/past-services';
import Announcements from '@/components/announcements';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Announcements />
      <Workflows />
      <PastServices />
    </>
  );
}
