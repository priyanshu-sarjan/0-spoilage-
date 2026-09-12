import { HeroInteractiveSection } from "@/components/home/hero-interactive";
import { GeminiFeaturesShowcase } from "@/components/home/gemini-features-showcase";
import { LiveOrderTicker } from "@/components/home/live-order-ticker";
import { ColdChainSimulator } from "@/components/home/cold-chain-simulator";
import { InteractiveHubTabs } from "@/components/home/interactive-hub-tabs";
import { DynamicDiscountBanner } from "@/components/discounts/dynamic-discount-banner";
import { VisionSpoilageScanner } from "@/components/spoilage/vision-scanner";
import { CommunityPollPreview } from "@/components/home/community-poll-preview";

export default function Home() {
  return (
    <div className="space-y-16 pb-20 overflow-x-hidden">
      {/* 1. Hero Section with Batch Tracer & Animated Metrics */}
      <HeroInteractiveSection />

      {/* 2. 5 High-Impact Gemini Multimodal Features Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <GeminiFeaturesShowcase />
      </section>

      {/* Live Activity & Telemetry Ticker */}
      <section className="max-w-7xl mx-auto px-4">
        <LiveOrderTicker />
      </section>

      {/* 3. Interactive IoT Cold-Chain & Spoilage Simulator */}
      <section className="max-w-7xl mx-auto px-4">
        <ColdChainSimulator />
      </section>

      {/* 4. Interactive Regional Grid & Mandi Intelligence Tabs */}
      <section className="max-w-7xl mx-auto px-4">
        <InteractiveHubTabs />
      </section>

      {/* 5. Zero Food Waste: Dynamic Flash Discount Deals */}
      <section className="max-w-7xl mx-auto px-4">
        <DynamicDiscountBanner />
      </section>

      {/* 6. AI Computer Vision Spoilage Diagnostic Scanner Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <VisionSpoilageScanner />
      </section>

      {/* 7. Kisan-Grahak Interactive Community Voting Poll */}
      <section className="max-w-7xl mx-auto px-4">
        <CommunityPollPreview />
      </section>
    </div>
  );
}
