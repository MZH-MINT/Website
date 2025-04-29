import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/CartItem";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InsertOrder, insertOrderSchema } from "@shared/schema";
import { Helmet } from "react-helmet";

// Extend the order schema with validation for address
const checkoutSchema = insertOrderSchema.extend({
  shippingAddress: z.string().min(10, {
    message: "Address must be at least 10 characters",
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CartItemWithProduct {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number | string;
    image: string;
    brand: string;
    category: string;
    stock: number;
  };
}

export default function CartPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch cart items
  const { data: cartItems = [], isLoading, refetch } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });
  
  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const deliveryCharge = subtotal > 0 ? (subtotal >= 5000 ? 0 : 150) : 0;
  const total = subtotal + deliveryCharge;
  
  // Update cart item quantity
  const updateCartMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Remove item from cart
  const removeCartItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "Item removed",
        description: "Product has been removed from your cart",
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
  
  // Place order
  const placeOrderMutation = useMutation({
    mutationFn: async (formData: CheckoutFormValues) => {
      // Create order and order items
      const orderData: InsertOrder = {
        userId: user!.id,
        status: "pending",
        total: total,
        shippingAddress: formData.shippingAddress,
      };
      
      // Create order items from cart
      const items = cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.product.price),
      }));
      
      const res = await apiRequest("POST", "/api/orders", { orderData, items });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully",
        description: "Your order has been placed and will be processed shortly.",
      });
      
      // Clear cart queries and redirect to profile page
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Setup form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      userId: user?.id || 0,
      status: "pending",
      total: 0,
      shippingAddress: user?.address || "",
    },
  });
  
  const onSubmit = (data: CheckoutFormValues) => {
    // Update total before submitting
    data.total = total;
    placeOrderMutation.mutate(data);
  };
  
  // Empty cart view
  if (!isLoading && cartItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Your Cart - PowerMaster Enterprises</title>
          <meta name="description" content="View and manage items in your shopping cart" />
        </Helmet>
        
        <main className="py-10 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-240px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center max-w-xl mx-auto">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
              <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
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
        
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Your Cart - PowerMaster Enterprises</title>
        <meta name="description" content="View and manage items in your shopping cart" />
      </Helmet>
      
      <main className="py-10 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Cart</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600 mb-4" />
                    <p className="text-gray-600">Loading your cart...</p>
                  </div>
                ) : (
                  <>
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">Items ({cartItems.length})</h2>
                    </div>
                    <ul>
                      {cartItems.map((item) => (
                        <CartItem 
                          key={item.id}
                          item={item}
                          onUpdateQuantity={(quantity) => 
                            updateCartMutation.mutate({ id: item.id, quantity })
                          }
                          onRemove={() => removeCartItemMutation.mutate(item.id)}
                        />
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
            
            {/* Order Summary & Checkout */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Order Summary</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charge</span>
                    <span>
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${deliveryCharge.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
                
                {/* Checkout Form */}
                <div className="p-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="shippingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter your complete address with pincode"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full bg-primary-700 hover:bg-primary-600"
                        disabled={placeOrderMutation.isPending || cartItems.length === 0}
                      >
                        {placeOrderMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </>
  );
}
