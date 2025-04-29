import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RefreshCw } from "lucide-react";

interface ProductFiltersProps {
  brands: string[];
  priceRange: [number, number];
  selectedFilters: {
    brand: string[];
    priceRange: [number, number];
  };
  onFilterChange: (
    filters: Partial<{
      brand: string[];
      priceRange: [number, number];
    }>
  ) => void;
  onClearFilters: () => void;
  onApplyFilters?: () => void;
}

export function ProductFilters({
  brands,
  priceRange,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(selectedFilters.priceRange);
  
  // Update local price range when selected filters change
  useEffect(() => {
    setLocalPriceRange(selectedFilters.priceRange);
  }, [selectedFilters.priceRange]);
  
  // Format price for display
  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };
  
  // Handle brand filter change
  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedFilters.brand, brand]
      : selectedFilters.brand.filter((b) => b !== brand);
    
    onFilterChange({ brand: newBrands });
  };
  
  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setLocalPriceRange([value[0], value[1]]);
  };
  
  // Apply price range when slider is released
  const handlePriceChangeEnd = () => {
    onFilterChange({ priceRange: localPriceRange });
  };
  
  return (
    <div className="space-y-6">
      {/* Brand Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Brand</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedFilters.brand.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
              />
              <Label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-600">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Price Range Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
        <div className="mb-6">
          <Slider
            defaultValue={[priceRange[0], priceRange[1]]}
            min={priceRange[0]}
            max={priceRange[1]}
            step={100}
            value={[localPriceRange[0], localPriceRange[1]]}
            onValueChange={handlePriceChange}
            onValueCommit={handlePriceChangeEnd}
            className="my-6"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPrice(localPriceRange[0])}</span>
            <span>{formatPrice(localPriceRange[1])}</span>
          </div>
        </div>
      </div>
      
      {/* Filter Actions */}
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={onClearFilters}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
        
        {onApplyFilters && (
          <Button 
            size="sm" 
            className="w-full bg-primary-700 hover:bg-primary-600"
            onClick={onApplyFilters}
          >
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );
}
