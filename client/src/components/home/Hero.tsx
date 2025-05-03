import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  const marqueeItems = [
    "✓ Premium Quality Batteries",
    "✓ 24-Month Warranty",
    "✓ Free Installation",
    "✓ Free Battery Health Check",
    "✓ Same Day Delivery",
    "✓ 24/7 Support",
  ];

  return (
    <section className="relative overflow-hidden bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-10 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Power Solutions for Every Need
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-8">
              Premium car and inverter batteries with expert guidance, warranty, and doorstep delivery services.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                asChild
              >
                <Link href="/products/car">
                  Shop Car Batteries
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary-800 text-primary-800 dark:border-primary-400 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-black"
                asChild
              >
                <Link href="/products/inverter">
                  Shop Inverter Batteries
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 sm:h-80 md:h-96">
            <img 
              src="https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
              alt="Car battery being installed" 
              className="rounded-lg shadow-lg object-cover h-full w-full"
            />
            <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-primary-800 font-bold px-4 py-2 rounded-md shadow-lg transform rotate-3">
              Free Delivery
            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-700 py-3 relative overflow-hidden">
        <div className="flex w-full">
          <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap min-w-full">
            {marqueeItems.map((item, idx) => (
              <span key={idx} className="text-sm font-medium text-white px-4 first:pl-0 last:pr-0">{item}</span>
            ))}
          </div>
          <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap min-w-full" aria-hidden="true">
            {marqueeItems.map((item, idx) => (
              <span key={idx} className="text-sm font-medium text-white px-4 first:pl-0 last:pr-0">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
