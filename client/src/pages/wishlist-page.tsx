import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, Loader2, ArrowRight } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCartItemSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Helmet } from "react-helmet";

interface WishlistItemWithProduct {
  id: number;
  userId: number;
  productId: number;
  product: {
    id: number;
    name: string;
    price: number | string;
    image: string;
    brand: string;
    category: string;
    discountPrice?: number | string;
  };
}

export default function WishlistPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch wishlist items
  const { data: wishlistItems = [], isLoading, refetch } = useQuery<WishlistItemWithProduct[]>({
    queryKey: ["/api/wishlist"],
  });
  
  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/wishlist/${id}`);
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Item removed",
        description: "Product has been removed from your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!user) return null;
      
      const cartItem = insertCartItemSchema.parse({
        userId: user.id,
        productId: productId,
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
  
  // Empty wishlist view
  if (!isLoading && wishlistItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Your Wishlist - PowerMaster Enterprises</title>
          <meta name="description" content="View and manage your saved products" />
        </Helmet>
        <Header />
        <main className="py-10 bg-gray-50 min-h-[calc(100vh-240px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
              <p className="text-gray-600 mb-6">Save your favorite products to your wishlist for later.</p>
              <Button 
                size="lg"
                onClick={() => navigate("/products")}
                className="bg-primary-700 hover:bg-primary-600"
              >
                Browse Products
                <ArrowRight className="ml-2 h-4 w-4" />
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
        <title>Your Wishlist - PowerMaster Enterprises</title>
        <meta name="description" content="View and manage your saved products" />
      </Helmet>
      <Header />
      <main className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Wishlist</h1>
          
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
              <p className="text-gray-600">Loading your wishlist...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="h-full w-full object-cover"
                        onClick={() => navigate(`/product/${item.product.id}`)}
                        style={{ cursor: 'pointer' }}
                      />
                      <button 
                        className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 hover:text-red-700 shadow-sm"
                        onClick={() => removeFromWishlistMutation.mutate(item.id)}
                        disabled={removeFromWishlistMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <h3 
                      className="font-medium text-gray-900 mb-1 hover:text-primary-700 cursor-pointer"
                      onClick={() => navigate(`/product/${item.product.id}`)}
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{item.product.brand}</p>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900">₹{Number(item.product.price).toLocaleString()}</span>
                      {item.product.discountPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₹{Number(item.product.discountPrice).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => addToCartMutation.mutate(item.product.id)}
                      disabled={addToCartMutation.isPending}
                    >
                      {addToCartMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
