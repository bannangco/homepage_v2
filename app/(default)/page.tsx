import type { Metadata } from "next";

import Hero from '@/components/hero-home';
import Features from '@/components/features';
import Workflows from '@/components/workflows';
import PastServices from '@/components/past-services';

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Workflows />
      <PastServices />
    </>
  );
}
