import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Helmet } from "react-helmet";

type ProductFiltersType = {
  brand: string[];
  priceRange: [number, number];
};

export default function ProductsPage() {
  const params = useParams<{ category?: string }>();
  const [, navigate] = useLocation();
  const category = params?.category || "all";
  
  const [filters, setFilters] = useState<ProductFiltersType>({
    brand: [],
    priceRange: [0, 25000],
  });
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Fetch products based on category
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", category],
    queryFn: async () => {
      const endpoint = category === "all" 
        ? "/api/products" 
        : `/api/products?category=${category}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });
  
  // Apply filters to products
  useEffect(() => {
    if (products.length > 0) {
      let result = [...products];
      
      // Filter by brand if any selected
      if (filters.brand.length > 0) {
        result = result.filter(product => filters.brand.includes(product.brand));
      }
      
      // Filter by price range
      result = result.filter(product => {
        const price = Number(product.price);
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });
      
      setFilteredProducts(result);
    }
  }, [products, filters]);
  
  // Get all available brands from products for filter options
  const allBrands = [...new Set(products.map(product => product.brand))];
  
  // Get min and max price from products
  const priceRange = products.length > 0 
    ? [
        Math.min(...products.map(p => Number(p.price))),
        Math.max(...products.map(p => Number(p.price)))
      ] 
    : [0, 25000];
  
  // Update filters
  const handleFilterChange = (newFilters: Partial<ProductFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      brand: [],
      priceRange: [priceRange[0], priceRange[1]],
    });
  };
  
  // Get page title based on category
  const getPageTitle = () => {
    switch(category) {
      case 'car':
        return 'Car Batteries';
      case 'inverter':
        return 'Inverter Batteries';
      default:
        return 'All Batteries';
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{getPageTitle()} - PowerMaster Enterprises</title>
        <meta name="description" content={`Browse our selection of premium ${getPageTitle().toLowerCase()} with warranty and doorstep delivery services.`} />
      </Helmet>
      
      <main className="bg-gray-50 min-h-screen">
        {/* Page Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <a href="/" className="hover:text-primary-700">Home</a>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-gray-900">Products</span>
                  {category !== 'all' && (
                    <>
                      <ChevronRight className="h-4 w-4" />
                      <span className="font-medium text-gray-900 capitalize">{category}</span>
                    </>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
                <p className="text-gray-600 mt-1">
                  {category === 'car' 
                    ? 'Premium car batteries with extended warranty and free installation'
                    : category === 'inverter'
                    ? 'Long-lasting inverter batteries for reliable power backup'
                    : 'Browse our complete range of high-quality batteries'}
                </p>
              </div>
              
              {/* Mobile filter button */}
              <div className="md:hidden w-full">
                <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-full sm:max-w-md">
                    <div className="h-full py-6 px-2">
                      <h3 className="text-xl font-semibold mb-6">Filters</h3>
                      <ProductFilters
                        brands={allBrands}
                        priceRange={priceRange}
                        selectedFilters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        onApplyFilters={() => setIsMobileFiltersOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                <Button
                  variant="link"
                  onClick={() => navigate('/products')}
                  className={`${category === 'all' ? 'text-primary-700 font-medium' : 'text-gray-600'}`}
                >
                  All
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigate('/products/car')}
                  className={`${category === 'car' ? 'text-primary-700 font-medium' : 'text-gray-600'}`}
                >
                  Car Batteries
                </Button>
                <Button
                  variant="link"
                  onClick={() => navigate('/products/inverter')}
                  className={`${category === 'inverter' ? 'text-primary-700 font-medium' : 'text-gray-600'}`}
                >
                  Inverter Batteries
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h3 className="text-lg font-semibold mb-6">Filters</h3>
                <ProductFilters
                  brands={allBrands}
                  priceRange={priceRange}
                  selectedFilters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>
            
            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md h-80 animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-10 text-center">
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-600 mb-6">
                        No products match your current filter criteria. Try adjusting your filters or browse our categories.
                      </p>
                      <Button onClick={handleClearFilters}>Clear Filters</Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <p className="text-gray-600">Showing {filteredProducts.length} products</p>
                      </div>
                      <ProductGrid products={filteredProducts} />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
    </>
  );
}
