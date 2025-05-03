import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useQuery } from "@tanstack/react-query";
import { Search, Heart, ShoppingCart, User, Menu, LogOut, Zap, UserCircle, Phone, MessageCircle, Mail } from "lucide-react";
import { useState, useEffect } from "react";
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

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Car Batteries", href: "/products/car" },
    { name: "Inverter Batteries", href: "/products/inverter" },
    { name: "Battery Assistant", href: "/#battery-assistant" },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const isActive = (path: string) => {
    if (path === "/") return location === "/";
    return location.startsWith(path);
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/admin/check", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Contact Information Bar */}
      <div className="bg-primary text-primary-foreground py-1 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between">
          <div className="flex items-center space-x-6 text-base font-medium">
            <a href="tel:+917010511894" className="flex items-center text-base hover:underline">
              <Phone className="h-5 w-5 mr-1" />
              <span>+91 7010511894</span>
            </a>
            <a href="https://wa.me/917010511894" target="_blank" rel="noopener noreferrer" className="flex items-center text-base hover:underline">
              <MessageCircle className="h-5 w-5 mr-1" />
              <span>WhatsApp: +91 7010511894</span>
            </a>
            <a href="mailto:info@powermaster.in" className="flex items-center text-base hover:underline cursor-pointer">
              <Mail className="h-5 w-5 mr-1" />
              <span>info@powermaster.in</span>
            </a>
          </div>
        </div>
      </div>
      
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
                  onClick={() => window.scrollTo(0, 0)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User Actions */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="flex flex-row items-center space-x-4">
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
                onClick={() => { navigate("/wishlist"); window.scrollTo(0, 0); }}
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
                onClick={() => { navigate("/cart"); window.scrollTo(0, 0); }}
              >
                <ShoppingCart className="h-5 w-5" />
                {user && (
                  <CartCount />
                )}
              </Button>
              {/* User Profile / Account */}
              {user && !isAdmin ? (
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
                    <DropdownMenuItem onClick={() => { navigate("/profile"); window.scrollTo(0, 0); }}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { navigate("/wishlist"); window.scrollTo(0, 0); }}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { navigate("/cart"); window.scrollTo(0, 0); }}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Cart</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : !user && !isAdmin ? (
                <Button 
                  variant="outline" 
                  className="flex text-sm rounded-full items-center space-x-1 px-3 py-1"
                  onClick={() => { navigate("/auth"); window.scrollTo(0, 0); }}
                >
                  <User className="h-4 w-4" />
                  <span className="font-medium">Account</span>
                </Button>
              ) : null}
              {!user && !isAdmin && (
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-full"
                  onClick={() => navigate("/admin-login")}
                >
                  Admin Login
                </Button>
              )}
              {isAdmin && (
                <Button
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-full"
                  onClick={() => { navigate("/admin-login"); window.scrollTo(0, 0); }}
                >
                  Admin Dashboard
                </Button>
              )}
            </div>
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
                  
                  {/* Contact Info in Mobile Menu */}
                  <div className="mb-6 space-y-3">
                    <a href="tel:+917010511894" className="flex items-center text-sm text-foreground hover:underline">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>+91 7010511894</span>
                    </a>
                    <a href="https://wa.me/917010511894" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-foreground hover:underline">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      <span>WhatsApp: +91 7010511894</span>
                    </a>
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
                          onClick={() => window.scrollTo(0, 0)}
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
                          onClick={() => window.scrollTo(0, 0)}
                        >
                          <User className="h-5 w-5 mr-2" />
                          <span>Account</span>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link
                          href="/wishlist"
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                          onClick={() => window.scrollTo(0, 0)}
                        >
                          <Heart className="h-5 w-5 mr-2" />
                          <span>Wishlist</span>
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link
                          href="/cart"
                          className="flex items-center px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted"
                          onClick={() => window.scrollTo(0, 0)}
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