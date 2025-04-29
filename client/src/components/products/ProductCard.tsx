import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Loader2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCartItemSchema, insertWishlistItemSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/auth");
        return null;
      }
      
      const cartItem = insertCartItemSchema.parse({
        userId: user.id,
        productId: product.id,
        quantity: 1
      });
      
      const res = await apiRequest("POST", "/api/cart", cartItem);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart",
      });
      // Invalidate cart queries to refresh cart count
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/auth");
        return null;
      }
      
      const wishlistItem = insertWishlistItemSchema.parse({
        userId: user.id,
        productId: product.id
      });
      
      const res = await apiRequest("POST", "/api/wishlist", wishlistItem);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist",
      });
      // Invalidate wishlist queries to refresh wishlist count
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  return (
    <Card 
      className="overflow-hidden transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-48 object-cover cursor-pointer"
          />
        </Link>
        
        {/* Product badges */}
        <div className="absolute top-2 left-2">
          {product.bestSeller && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded block mb-1">Best Seller</span>
          )}
          {product.newArrival && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded block mb-1">New Arrival</span>
          )}
          {product.limitedStock && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded block mb-1">Limited Stock</span>
          )}
        </div>
        
        {/* Wishlist button */}
        <div className="absolute top-2 right-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-white shadow-sm"
            onClick={() => addToWishlistMutation.mutate()}
            disabled={addToWishlistMutation.isPending}
          >
            {addToWishlistMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center text-sm text-yellow-500 mb-1">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              className={i < Math.floor(Number(product.ratings)) ? "fill-current" : i < Number(product.ratings) ? "fill-current" : "text-gray-300"}
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24"
            >
              {i < Math.floor(Number(product.ratings)) ? (
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              ) : i < Number(product.ratings) ? (
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fillOpacity="0.5" />
              ) : (
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="none" stroke="currentColor" />
              )}
            </svg>
          ))}
          <span className="ml-1 text-gray-500">({product.reviewCount})</span>
        </div>
        
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-1 hover:text-primary-700">{product.name}</h3>
        </Link>
        <p className="text-sm text-gray-500 mb-3">For {product.category === 'car' ? 'Vehicles' : 'Home Backup'}</p>
        
        <div className="flex justify-between items-end">
          <div>
            <span className="text-lg font-bold text-gray-900">₹{Number(product.price).toLocaleString()}</span>
            {product.discountPrice && (
              <span className="text-sm text-gray-500 line-through ml-1">
                ₹{Number(product.discountPrice).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0">
        <Button 
          className="w-full"
          onClick={() => addToCartMutation.mutate()}
          disabled={addToCartMutation.isPending || product.stock === 0}
        >
          {addToCartMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
