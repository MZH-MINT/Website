import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User as UserIcon, 
  Package, 
  Settings, 
  LogOut, 
  Loader2, 
  FileClock,
  Check
} from "lucide-react";
import { User } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Helmet } from "react-helmet";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  language: z.enum(["en", "hi"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface Order {
  id: number;
  orderDate: string;
  status: string;
  total: number | string;
  shippingAddress: string;
}

export default function ProfilePage() {
  const { user, updateProfileMutation, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch orders
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: activeTab === "orders",
  });
  
  // Setup profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      language: (user?.language as "en" | "hi") || "en",
    },
  });
  
  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  if (!user) {
    return (
      <>
        
        <main className="py-10 bg-gray-50 min-h-[calc(100vh-240px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          </div>
        </main>
        
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Your Profile - PowerMaster Enterprises</title>
        <meta name="description" content="Manage your profile and view your order history" />
      </Helmet>
      
      <main className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 bg-primary-700 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{user.name}</h2>
                      <p className="text-sm text-white/80">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <nav className="p-4">
                  <ul className="space-y-1">
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'profile' ? 'bg-gray-100' : ''}`}
                        onClick={() => setActiveTab('profile')}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'orders' ? 'bg-gray-100' : ''}`}
                        onClick={() => setActiveTab('orders')}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'settings' ? 'bg-gray-100' : ''}`}
                        onClick={() => setActiveTab('settings')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-9">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {activeTab === 'profile' && (
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h1>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preferred Language</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter your full address"
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
                          className="bg-primary-700 hover:bg-primary-600"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
                
                {activeTab === 'orders' && (
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
                    
                    {isLoadingOrders ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                        <p className="text-gray-600">Loading your orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FileClock className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                        <p className="text-gray-600 mb-4">You haven't placed any orders with us yet.</p>
                        <Button
                          onClick={() => navigate("/products")}
                          className="bg-primary-700 hover:bg-primary-600"
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>Order #{order.id}</CardTitle>
                                  <CardDescription>{formatDate(order.orderDate)}</CardDescription>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-gray-500 mb-2">
                                <strong>Shipping Address:</strong> {order.shippingAddress}
                              </div>
                              <div className="text-lg font-semibold">
                                Total: ₹{Number(order.total).toLocaleString()}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" size="sm" className="mr-2">
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                Download Invoice
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
                    
                    <Tabs defaultValue="preferences">
                      <TabsList className="mb-6">
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="preferences">
                        <Card>
                          <CardHeader>
                            <CardTitle>Language Preferences</CardTitle>
                            <CardDescription>Manage your preferred language settings</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Display Language
                                </label>
                                <Select defaultValue={user.language}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button className="bg-primary-700 hover:bg-primary-600">Save Preferences</Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="password">
                        <Card>
                          <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your password to keep your account secure</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Current Password
                                </label>
                                <Input type="password" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  New Password
                                </label>
                                <Input type="password" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Confirm New Password
                                </label>
                                <Input type="password" />
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button className="bg-primary-700 hover:bg-primary-600">Update Password</Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="notifications">
                        <Card>
                          <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Manage how we communicate with you</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-500 mb-6">
                              Notification settings will be available in a future update.
                            </p>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
    </>
  );
}
