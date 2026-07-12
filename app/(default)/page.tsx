import type { Metadata } from "next";

import CurrentSignal from "@/components/current-signal";
import Features from "@/components/features";
import Hero from "@/components/hero-home";
import ServicesArchive from "@/components/services-archive";
import Workflows from "@/components/workflows";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <CurrentSignal />
      <ServicesArchive />
      <Features />
      <Workflows />
    </>
  );
}
