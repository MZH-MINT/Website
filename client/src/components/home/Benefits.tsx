import { Award, Truck, RefreshCw, Headphones } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Genuine Products",
      description: "All our batteries are 100% genuine with manufacturer warranty"
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Free Delivery",
      description: "Free same-day delivery and installation for local orders"
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Easy Returns",
      description: "Hassle-free returns within 7 days if you're not satisfied"
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: "Expert Support",
      description: "Technical assistance and guidance from our battery experts"
    }
  ];
  
  return (
    <section className="py-12 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Why Choose PowerMaster</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">We offer more than just batteries - we provide complete power solutions with expert service</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div className="text-center" key={index}>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 text-primary-700 mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">{benefit.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        {/* Testimonial */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-900 rounded-xl p-8 relative">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-primary-900 px-4 py-1 rounded-full font-bold">
            Customer Stories
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3">
              <img 
                src="https://images.unsplash.com/photo-1603539279542-e5f7de79abab?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80" 
                alt="Happy customer with PowerMaster battery" 
                className="rounded-lg shadow-md w-full h-48 object-cover"
              />
            </div>
            
            <div className="md:w-2/3">
              <div className="flex mb-4 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                  </svg>
                ))}
              </div>
              <blockquote className="text-xl italic text-gray-800 dark:text-gray-200 mb-4">
                "PowerMaster provided exceptional service when my car wouldn't start. Their expert came, diagnosed the issue, and replaced my battery within hours. The new battery works perfectly and came with a solid warranty."
              </blockquote>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">Rajesh Kumar</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Hyundai Creta Owner, Delhi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
