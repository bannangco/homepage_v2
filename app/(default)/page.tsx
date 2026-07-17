import type { Metadata } from "next";

import CompanyIntro from "@/components/company-intro";
import Contact from "@/components/contact";
import Hero from "@/components/hero-home";
import ServicesPortfolio from "@/components/services-portfolio";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <CompanyIntro />
      <ServicesPortfolio />
      <Contact />
    </>
  );
}
