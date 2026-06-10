import { Navbar1 } from "@/components/ui/navbar-1"
import { HeroSection } from "@/components/landing/hero"
import { BentoGrid } from "@/components/landing/bento-grid"
import { FeatureCascade } from "@/components/landing/feature-cascade"
import { PricingSection } from "@/components/landing/pricing"
import { DocsSection } from "@/components/landing/docs"
import { CtaFooter } from "@/components/landing/cta-footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000d1a]">
      <Navbar1 />
      <main>
        <HeroSection />
        <BentoGrid />
        <FeatureCascade />
        <PricingSection />
        <DocsSection />
      </main>
      <CtaFooter />
    </div>
  );
}
