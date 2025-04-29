import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-16 bg-primary-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="battery-pattern" patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="rotate(45)">
              <rect x="15" y="0" width="2" height="30" fill="currentColor" />
              <rect x="0" y="15" width="30" height="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#battery-pattern)" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing the Right Battery?</h2>
          <p className="text-xl opacity-90 mb-8">Our experts are ready to assist you with personalized recommendations based on your specific requirements.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-primary-800 hover:bg-gray-100 border-white"
              asChild
            >
              <Link href="tel:18001234567" className="flex items-center justify-center">
                <Phone className="mr-2 h-5 w-5" />
                Call Now: 1800-123-4567
              </Link>
            </Button>
            <Button 
              size="lg" 
              className="bg-yellow-400 text-primary-900 hover:bg-yellow-500 border-none"
              asChild
            >
              <Link href="#contact" className="flex items-center justify-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat with Expert
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
