import { Layers } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative">
      <div className="w-full h-80 md:h-96 overflow-hidden">
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=2070&q=80')" 
          }}
        />
        <div className="absolute inset-0 bg-gray-900/30"></div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 drop-shadow-lg">
            Your Perfect Trip, Planned by AI
          </h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto drop-shadow-md">
            Tell us your preferences and our AI will craft a personalized itinerary just for you.
          </p>
        </div>
      </div>
    </section>
  );
}
