import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronRight, 
  Truck, 
  Shield, 
  ShoppingCart, 
  Heart, 
  Check, 
  Loader2, 
  ChevronLeft
} from "lucide-react";
import { Product, insertCartItemSchema, insertWishlistItemSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ProductCard } from "@/components/products/ProductCard";
import { Helmet } from "react-helmet";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
    retry: false,
  });
  
  // Fetch similar products (same category)
  const { data: similarProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", product?.category],
    enabled: !!product,
    select: (data) => data.filter(p => p.id !== Number(id)).slice(0, 4),
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        navigate("/auth");
        return null;
      }
      
      const cartItem = insertCartItemSchema.parse({
        userId: user.id,
        productId: Number(id),
        quantity: quantity
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
        productId: Number(id)
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
  
  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };
  
  // Parse specifications from JSON string
  const getSpecifications = () => {
    if (!product?.specifications) return null;
    
    try {
      return JSON.parse(product.specifications);
    } catch (e) {
      return null;
    }
  };
  
  const specs = getSpecifications();
  
  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Error state
  if (error || !product) {
    return (
      <>
        <Header />
        <main className="py-10 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-6">Sorry, the product you're looking for could not be found or has been removed.</p>
              <Button onClick={() => navigate("/products")}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{product.name} - PowerMaster Enterprises</title>
        <meta name="description" content={product.description.slice(0, 160)} />
      </Helmet>
      <Header />
      <main className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-primary-700">Home</a>
            <ChevronRight className="h-4 w-4 mx-2" />
            <a href="/products" className="hover:text-primary-700">Products</a>
            <ChevronRight className="h-4 w-4 mx-2" />
            <a href={`/products/${product.category}`} className="hover:text-primary-700 capitalize">{product.category}</a>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
          
          {/* Product Details */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              {/* Product Image */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-md">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full object-cover rounded-lg shadow-md"
                  />
                  {product.bestSeller && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Best Seller</span>
                    </div>
                  )}
                  {product.newArrival && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">New Arrival</span>
                    </div>
                  )}
                  {product.limitedStock && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">Limited Stock</span>
                    </div>
                  )}
                  {product.discountPrice && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        {Math.round((1 - Number(product.price) / Number(product.discountPrice)) * 100)}% Off
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Product Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
                <div className="flex items-center text-sm text-yellow-500 mb-2">
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
                
                <p className="text-gray-600 mb-6">{product.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-gray-900">₹{Number(product.price).toLocaleString()}</span>
                    {product.discountPrice && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ₹{Number(product.discountPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="text-green-600 text-sm">
                    In Stock: {product.stock} {product.stock < 10 && "(Low Stock)"}
                  </span>
                </div>
                
                <div className="border-t border-b border-gray-200 py-4 my-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Shield className="text-green-600 h-5 w-5 mr-2" />
                      <span className="text-sm">{product.warranty} Warranty</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="text-green-600 h-5 w-5 mr-2" />
                      <span className="text-sm">Free Delivery</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center mb-6">
                  <div className="mr-4">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        onClick={decreaseQuantity} 
                        className="px-3 py-1 text-gray-500 hover:text-gray-700"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={increaseQuantity} 
                        className="px-3 py-1 text-gray-500 hover:text-gray-700"
                        disabled={product.stock <= quantity}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-900">Brand:</span>
                    <span className="ml-1 text-gray-600">{product.brand}</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1"
                    onClick={() => addToCartMutation.mutate()}
                    disabled={addToCartMutation.isPending || product.stock === 0}
                  >
                    {addToCartMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
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
            </div>
            
            {/* Product Details Tabs */}
            <div className="border-t border-gray-200 p-6">
              <Tabs defaultValue="specs">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="desc">Description</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="specs" className="pt-4">
                  {specs ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                      {Object.entries(specs).map(([key, value]) => (
                        <div key={key} className="py-2 border-b border-gray-100">
                          <div className="flex justify-between">
                            <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                            <span className="font-medium text-gray-900">{String(value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No detailed specifications available for this product.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="desc" className="pt-4">
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{product.description}</p>
                    
                    <h3 className="text-lg font-semibold mt-4 mb-2">Features:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <Check className="text-green-600 h-5 w-5 mr-2 mt-0.5" />
                        <span>High-quality materials for extended battery life</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-green-600 h-5 w-5 mr-2 mt-0.5" />
                        <span>Enhanced performance in extreme weather conditions</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-green-600 h-5 w-5 mr-2 mt-0.5" />
                        <span>Low maintenance requirements</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="text-green-600 h-5 w-5 mr-2 mt-0.5" />
                        <span>Nationwide warranty coverage</span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="pt-4">
                  {product.reviewCount > 0 ? (
                    <p className="text-gray-600">Reviews will appear here. Currently, this product has {product.reviewCount} reviews with an average rating of {product.ratings} out of 5.</p>
                  ) : (
                    <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products You May Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
