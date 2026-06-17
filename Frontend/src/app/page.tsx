import { Navbar1 } from "@/components/ui/navbar-1"
import { HeroSection } from "@/components/landing/hero"
import dynamic from "next/dynamic"

const SectionFallback = ({ height = "h-[520px]" }: { height?: string }) => (
  <section className={`bg-black ${height} border-t border-white/5`} />
)

const BentoGrid = dynamic(
  () => import("@/components/landing/bento-grid").then((mod) => mod.BentoGrid),
  { loading: () => <SectionFallback height="h-[720px]" /> }
)
const FeatureCascade = dynamic(
  () =>
    import("@/components/landing/feature-cascade").then(
      (mod) => mod.FeatureCascade
    ),
  { loading: () => <SectionFallback height="h-[640px]" /> }
)
const Features = dynamic(() => import("@/components/ui/features-section"), {
  loading: () => <SectionFallback height="h-[620px]" />,
})
const PricingSection = dynamic(
  () => import("@/components/ui/pricing-section-4"),
  { loading: () => <SectionFallback height="h-[720px]" /> }
)
const DocsSection = dynamic(
  () => import("@/components/landing/docs").then((mod) => mod.DocsSection),
  { loading: () => <SectionFallback height="h-[560px]" /> }
)
const CtaFooter = dynamic(
  () => import("@/components/landing/cta-footer").then((mod) => mod.CtaFooter),
  { loading: () => <SectionFallback height="h-[520px]" /> }
)

export default function Home() {
  return (
    <div className="min-h-screen bg-[#000d1a]">
      <Navbar1 />
      <main>
        <HeroSection />
        <BentoGrid />
        <FeatureCascade />
        <Features />
        <PricingSection />
        <DocsSection />
      </main>
      <CtaFooter />
    </div>
  );
}
