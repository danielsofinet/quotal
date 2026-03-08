"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import Problem from "./Problem";
import HowItWorks from "./HowItWorks";
import Demo from "./Demo";
import Features from "./Features";
import SocialProof from "./SocialProof";
import Pricing from "./Pricing";
import CTA from "./CTA";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="landing-light min-h-screen bg-bg">
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Demo />
        <Features />
        <SocialProof />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
