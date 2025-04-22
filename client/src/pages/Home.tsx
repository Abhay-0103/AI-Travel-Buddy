import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TravelPlannerForm from "@/components/TravelPlannerForm";
import TravelItinerary from "@/components/TravelItinerary";
import Footer from "@/components/Footer";
import { TravelPlan } from "@shared/schema";

export default function Home() {
  const [generatedPlan, setGeneratedPlan] = useState<TravelPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePlanGenerated = (plan: TravelPlan) => {
    setGeneratedPlan(plan);
    setIsGenerating(false);
  };

  const handleModifyPlan = () => {
    setGeneratedPlan(null);
  };

  return (
    <div className="bg-gray-50 font-sans text-gray-800 min-h-screen flex flex-col">
      <Header />
      <Hero />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        {!generatedPlan ? (
          <TravelPlannerForm 
            onGeneratePlan={handlePlanGenerated} 
            isGenerating={isGenerating}
            onGeneratingStateChange={setIsGenerating}
          />
        ) : (
          <TravelItinerary plan={generatedPlan} onModifyPlan={handleModifyPlan} />
        )}
      </main>
      <Footer />
    </div>
  );
}
