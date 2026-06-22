import { FeatureCards } from "@/components/marketing/FeatureCards";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <Hero />
      <div className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <FeatureCards />
        <div className="mt-10">
          <HowItWorks />
        </div>
      </div>
    </>
  );
}
