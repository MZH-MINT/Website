import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CartPage from "@/pages/cart-page";
import WishlistPage from "@/pages/wishlist-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminLogin from "@/pages/admin-login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:category" component={ProductsPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/wishlist" component={WishlistPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <TooltipProvider>
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
        <Toaster />
      </TooltipProvider>
    </div>
  );
}

export default App;
