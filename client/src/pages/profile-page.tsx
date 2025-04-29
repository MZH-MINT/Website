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
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200';
    }
  };

  if (!user) {
    return (
      <>
        <main className="py-10 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-240px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
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

      <main className="py-10 bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 bg-primary-700 dark:bg-primary-800 text-white dark:text-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 dark:bg-gray-700/20 flex items-center justify-center">
                      <UserIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{user.name}</h2>
                      <p className="text-sm text-white/80 dark:text-gray-200">{user.email}</p>
                    </div>
                  </div>
                </div>

                <nav className="p-4">
                  <ul className="space-y-1">
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'profile' ? 'bg-gray-100 dark:bg-gray-700' : ''} dark:text-gray-200`}
                        onClick={() => setActiveTab('profile')}
                      >
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'orders' ? 'bg-gray-100 dark:bg-gray-700' : ''} dark:text-gray-200`}
                        onClick={() => setActiveTab('orders')}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start ${activeTab === 'settings' ? 'bg-gray-100 dark:bg-gray-700' : ''} dark:text-gray-200`}
                        onClick={() => setActiveTab('settings')}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:text-red-500 dark:hover:bg-gray-700"
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                {activeTab === 'profile' && (
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h1>

                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} className="dark:bg-gray-700 dark:text-gray-200" />
                              </FormControl>
                              <FormMessage className="text-red-600 dark:text-red-400" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300">Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} className="dark:bg-gray-700 dark:text-gray-200" />
                              </FormControl>
                              <FormMessage className="text-red-600 dark:text-red-400" />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-300">Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} className="dark:bg-gray-700 dark:text-gray-200" />
                                </FormControl>
                                <FormMessage className="text-red-600 dark:text-red-400" />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-300">Preferred Language</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select language" className="dark:bg-gray-700 dark:text-gray-200" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="hi">Hindi</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-600 dark:text-red-400" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 dark:text-gray-300">Address</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Enter your full address"
                                  className="resize-none dark:bg-gray-700 dark:text-gray-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage className="text-red-600 dark:text-red-400" />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit"
                          className="bg-primary-700 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin dark:text-gray-200" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4 dark:text-gray-200" />
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Order History</h1>

                    {isLoadingOrders ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600 dark:text-primary-400" />
                        <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                          <FileClock className="h-8 w-8 text-gray-400 dark:text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No orders yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't placed any orders with us yet.</p>
                        <Button
                          onClick={() => navigate("/products")}
                          className="bg-primary-700 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500"
                        >
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card key={order.id} className="dark:bg-gray-800">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-gray-900 dark:text-gray-100">Order #{order.id}</CardTitle>
                                  <CardDescription className="text-gray-500 dark:text-gray-400">{formatDate(order.orderDate)}</CardDescription>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="dark:text-gray-200">
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <strong>Shipping Address:</strong> {order.shippingAddress}
                              </div>
                              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Total: ₹{Number(order.total).toLocaleString()}
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" size="sm" className="mr-2 dark:text-gray-200 dark:hover:bg-gray-600">
                                View Details
                              </Button>
                              <Button variant="outline" size="sm" className="dark:text-gray-200 dark:hover:bg-gray-600">
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Account Settings</h1>

                    <Tabs defaultValue="preferences">
                      <TabsList className="mb-6">
                        <TabsTrigger value="preferences">Preferences</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      </TabsList>

                      <TabsContent value="preferences">
                        <Card className="dark:bg-gray-800">
                          <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">Language Preferences</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">Manage your preferred language settings</CardDescription>
                          </CardHeader>
                          <CardContent className="dark:text-gray-200">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Display Language
                                </label>
                                <Select defaultValue={user.language}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" className="dark:bg-gray-700 dark:text-gray-200" />
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
                            <Button className="bg-primary-700 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500">Save Preferences</Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>

                      <TabsContent value="password">
                        <Card className="dark:bg-gray-800">
                          <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">Change Password</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">Update your password to keep your account secure</CardDescription>
                          </CardHeader>
                          <CardContent className="dark:text-gray-200">
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Current Password
                                </label>
                                <Input type="password" className="dark:bg-gray-700 dark:text-gray-200" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  New Password
                                </label>
                                <Input type="password" className="dark:bg-gray-700 dark:text-gray-200" />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Confirm New Password
                                </label>
                                <Input type="password" className="dark:bg-gray-700 dark:text-gray-200" />
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button className="bg-primary-700 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500">Update Password</Button>
                          </CardFooter>
                        </Card>
                      </TabsContent>

                      <TabsContent value="notifications">
                        <Card className="dark:bg-gray-800">
                          <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-gray-100">Notification Settings</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">Manage how we communicate with you</CardDescription>
                          </CardHeader>
                          <CardContent className="dark:text-gray-200">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
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