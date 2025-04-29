import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { 

import { useQuery } from "@tanstack/react-query";

function WishlistCount() {
  const { data: wishlistItems = [] } = useQuery<any[]>({
    queryKey: ["/api/wishlist"],
  });

  return (
    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
      {wishlistItems.length}
    </span>
  );
}

function CartCount() {
  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ["/api/cart"],
  });

  return (
    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-4 h-4 flex items-center justify-center">
      {cartItems.length}
    </span>
  );
}

  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  Menu, 
  LogOut, 
  Zap,
  UserCircle
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Car Batteries", href: "/products/car" },
    { name: "Inverter Batteries", href: "/products/inverter" },
    { name: "Battery Assistant", href: "/#battery-assistant" },
    { name: "Contact", href: "/#contact" },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Zap className="h-6 w-6 text-yellow-400" />
                <span className="text-foreground font-bold text-xl ml-2">PowerMaster</span>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    isActive(link.href)
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User Actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Search */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Wishlist */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground relative"
              onClick={() => navigate("/wishlist")}
            >
              <Heart className="h-5 w-5" />
              {user && (
                <WishlistCount />
              )}
            </Button>
            
            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {user && (
                <CartCount />
              )}
            </Button>
            
            {/* User Profile / Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex text-sm rounded-full items-center space-x-1 px-3 py-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user.name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Wishlist</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/cart")}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Cart</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="flex text-sm rounded-full items-center space-x-1 px-3 py-1"
                onClick={() => navigate("/auth")}
              >
                <User className="h-4 w-4" />
                <span className="font-medium">Account</span>
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden space-x-2">
            <ThemeToggle />
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-4">
                  <div className="flex items-center mb-8">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    <span className="text-foreground font-bold text-xl ml-2">PowerMaster</span>
                  </div>
                  
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <SheetClose key={link.name} asChild>
                        <Link
                          href={link.href}
                          className={cn(
                            "block px-3 py-2 rounded-md text-base font-medium",
                            isActive(link.href)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          {link.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <div className="space-y-3">
                      <SheetClose asChild>
                        <Link
                          href="/auth"
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                        >
                          <User className="h-5 w-5 mr-2" />
                          <span>Account</span>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link
                          href="/wishlist"
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                        >
                          <Heart className="h-5 w-5 mr-2" />
                          <span>Wishlist</span>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link
                          href="/cart"
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          <span>Cart</span>
                        </Link>
                      </SheetClose>
                      
                      {user && (
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                        >
                          <LogOut className="h-5 w-5 mr-2" />
                          <span>Logout</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
