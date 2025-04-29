
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export default function ProductCategories() {
  const brands = [
    "Exide", "Amaron", "Luminous", "SF Sonic", "Tata Green", "Microtek"
  ];
  
  return (
    <section className="py-12 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Our Premium Battery Collection</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Browse through our wide range of high-quality batteries</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Car Batteries */}
          <div className="relative overflow-hidden group rounded-xl bg-white dark:bg-gray-900 shadow-md transition-all hover:shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1603539279542-e5f7de79abab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
              alt="Car Batteries Collection" 
              className="h-72 w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent flex items-end p-6">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Car Batteries</h3>
                <p className="mb-4 max-w-md">High-performance batteries for all car models with nationwide warranty</p>
                <Link 
                  href="/products/car" 
                  className="inline-flex items-center text-white bg-primary-700 px-4 py-2 rounded-lg hover:bg-primary-600 transition"
                >
                  View Collection
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Inverter Batteries */}
          <div className="relative overflow-hidden group rounded-xl bg-white dark:bg-gray-900 shadow-md transition-all hover:shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80" 
              alt="Inverter Batteries Collection" 
              className="h-72 w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent flex items-end p-6">
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-2">Inverter Batteries</h3>
                <p className="mb-4 max-w-md">Long-lasting batteries for uninterrupted power with extended warranty</p>
                <Link 
                  href="/products/inverter" 
                  className="inline-flex items-center text-white bg-primary-700 px-4 py-2 rounded-lg hover:bg-primary-600 transition"
                >
                  View Collection
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Brands */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-center mb-8 text-gray-900 dark:text-white">Top Battery Brands We Offer</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
            {brands.map((brand) => (
              <div key={brand} className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                <div className="h-12 w-full flex items-center justify-center">
                  <div className="text-center font-bold text-lg text-gray-500 dark:text-gray-400">{brand}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
