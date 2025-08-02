// app/page.jsx

// --- Core Sections ---
import { HeroSection } from "@/components/hero-section";
import { DashboardPreview } from "@/components/dashboard-preview";
import { SocialProof } from "@/components/social-proof";
import { ValueProposition } from "@/components/value-proposition";
import { CybersecurityBento } from "@/components/cybersecurity-bento";
import { WhyTerminalSix } from "@/components/why-terminalsix";
import { StatsStrip } from "@/components/stats-strip";

// --- User Journey & Conversion Sections ---
import { GettingStarted } from "@/components/getting-started";
import { TestimonialGridSection } from "@/components/testimonial-grid-section";
import { CommunitySection } from "@/components/community-section";
import { PricingSection } from "@/components/pricing-section";
import { FAQSection } from "@/components/faq-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 1. The Hook & Initial Proof */}
      <HeroSection />
      <DashboardPreview />
      <SocialProof />

      {/* 2. Explaining the Product */}
      <ValueProposition />
      <CybersecurityBento />
      <WhyTerminalSix />
      <StatsStrip />

      {/* 3. Guiding the User */}
      <GettingStarted />
      <TestimonialGridSection />
      <CommunitySection />

      {/* 4. Sealing the Deal */}
      <PricingSection />
      <FAQSection />
      <CTASection />

      {/* 5. Footer */}
      <Footer />
    </div>
  );
}
