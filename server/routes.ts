import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertCartItemSchema,
  insertWishlistItemSchema,
  insertReviewSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import bcrypt from "bcrypt";
import { pool } from "./db";
import 'express-session';
import passport from "passport";

declare module 'express-session' {
  interface SessionData {
    adminId?: number;
  }
}
export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth routes
  setupAuth(app);

  // Create admin user if none exists
  app.post("/api/admin/create", async (req, res) => {
    try {
      const { userId, password } = req.body;
      console.log('Creating admin user:', { userId });

      // Check if admin already exists
      const existingAdmin = await pool.query('SELECT * FROM admins WHERE user_id = $1', [userId]);
      if (existingAdmin.rows.length > 0) {
        return res.status(400).json({ message: 'Admin user already exists' });
      }

      // Create new admin
      const result = await pool.query(
        'INSERT INTO admins (user_id, password_hash) VALUES ($1, $2) RETURNING *',
        [userId, password]
      );
      
      console.log('Admin created:', result.rows[0]);
      res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error: any) {
      console.error('Create admin error:', error);
      res.status(500).json({ message: 'Server error', error: error?.message || 'Unknown error' });
    }
  });

  // Admin login route
  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate("admin-local", (err: Error, admin: any, info: any) => {
      if (err) {
        console.error("Admin login error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (!admin) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(admin, (err) => {
        if (err) {
          console.error("Session error:", err);
          return res.status(500).json({ error: "Session error" });
        }
        return res.json({ message: "Login successful", admin });
      });
    })(req, res, next);
  });

  // Admin check route
  app.get("/api/admin/check", (req, res) => {
    if (req.isAuthenticated() && req.user?.isAdmin) {
      res.json({ isAdmin: true, admin: req.user });
    } else {
      res.json({ isAdmin: false });
    }
  });

  // Admin logout route
  app.post("/api/admin/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Products routes
  app.get("/api/products", (req, res, next) => {
    const { category, brand } = req.query;
    
    if (category && typeof category === 'string') {
      storage.getProductsByCategory(category)
        .then(products => res.json(products))
        .catch(next);
    } else if (brand && typeof brand === 'string') {
      storage.getProductsByBrand(brand)
        .then(products => res.json(products))
        .catch(next);
    } else {
      storage.getAllProducts()
        .then(products => res.json(products))
        .catch(next);
    }
  });
  
  app.get("/api/products/featured", (req, res, next) => {
    storage.getFeaturedProducts()
      .then(products => res.json(products))
      .catch(next);
  });
  
  app.get("/api/products/:id", (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });
    
    storage.getProduct(id)
      .then(product => {
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
      })
      .catch(next);
  });
  
  // Cart routes
  app.get("/api/cart", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    storage.getCartItemWithProduct(userId)
      .then(items => res.json(items))
      .catch(next);
  });
  
  app.post("/api/cart", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const cartItemData = insertCartItemSchema.parse({ ...req.body, userId });
      
      storage.addToCart(cartItemData)
        .then(cartItem => res.status(201).json(cartItem))
        .catch(next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart item data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.put("/api/cart/:id", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid cart item ID" });
    
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(400).json({ message: "Quantity must be a number" });
    }
    
    storage.updateCartItem(id, quantity)
      .then(cartItem => {
        if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
        res.json(cartItem);
      })
      .catch(next);
  });
  
  app.delete("/api/cart/:id", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid cart item ID" });
    
    storage.removeFromCart(id)
      .then(success => {
        if (!success) return res.status(404).json({ message: "Cart item not found" });
        res.sendStatus(204);
      })
      .catch(next);
  });
  
  app.delete("/api/cart", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    storage.clearCart(userId)
      .then(() => res.sendStatus(204))
      .catch(next);
  });
  
  // Wishlist routes
  app.get("/api/wishlist", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    storage.getWishlistItemWithProduct(userId)
      .then(items => res.json(items))
      .catch(next);
  });
  
  app.post("/api/wishlist", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const wishlistItemData = insertWishlistItemSchema.parse({ ...req.body, userId });
      
      storage.addToWishlist(wishlistItemData)
        .then(wishlistItem => res.status(201).json(wishlistItem))
        .catch(next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid wishlist item data", errors: error.errors });
      }
      next(error);
    }
  });
  
  app.delete("/api/wishlist/:id", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid wishlist item ID" });
    
    storage.removeFromWishlist(id)
      .then(success => {
        if (!success) return res.status(404).json({ message: "Wishlist item not found" });
        res.sendStatus(204);
      })
      .catch(next);
  });
  
  // Battery compatibility assistant routes
  app.get("/api/compatibility/car", (req, res, next) => {
    const { brand, model, year } = req.query;
    
    storage.findCompatibleCarBatteries(
      typeof brand === 'string' ? brand : 'any',
      typeof model === 'string' ? model : 'any',
      typeof year === 'string' ? year : 'any'
    )
      .then(products => res.json(products))
      .catch(next);
  });
  
  app.get("/api/compatibility/inverter", (req, res, next) => {
    const { brand, capacity, backupHours } = req.query;
    
    storage.findCompatibleInverterBatteries(
      typeof brand === 'string' ? brand : 'any',
      typeof capacity === 'string' ? capacity : 'any',
      typeof backupHours === 'string' ? backupHours : 'any'
    )
      .then(products => res.json(products))
      .catch(next);
  });
  
  // Reviews routes
  app.get("/api/products/:id/reviews", (req, res, next) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ message: "Invalid product ID" });
    
    storage.getProductReviews(productId)
      .then(reviews => res.json(reviews))
      .catch(next);
  });
  
  app.post("/api/reviews", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const reviewData = insertReviewSchema.parse({ ...req.body, userId });
      
      storage.createReview(reviewData)
        .then(review => res.status(201).json(review))
        .catch(next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      next(error);
    }
  });
  
  // Orders routes
  app.get("/api/orders", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const userId = req.user!.id;
    storage.getOrders(userId)
      .then(orders => res.json(orders))
      .catch(next);
  });
  
  app.get("/api/orders/:id", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
    
    storage.getOrderById(id)
      .then(order => {
        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.userId !== req.user!.id) return res.status(403).json({ message: "Unauthorized" });
        res.json(order);
      })
      .catch(next);
  });
  
  app.get("/api/orders/:id/items", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
  
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid order ID" });
  
    try {
      const order = await storage.getOrderById(id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      if (order.userId !== req.user!.id) return res.status(403).json({ message: "Unauthorized" });
  
      const items = await storage.getOrderItems(id);
      res.json(items);
    } catch (err) {
      next(err);
    }
  });
  
  app.post("/api/orders", (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = req.user!.id;
      const { orderData, items } = req.body;
      
      const validOrderData = insertOrderSchema.parse({ ...orderData, userId });
      
      // Validate all order items
      const validItems = items.map((item: any) => 
        insertOrderItemSchema.parse(item)
      );
      
      storage.createOrder(validOrderData, validItems)
        .then(order => {
          // Clear the user's cart after successful order
          return storage.clearCart(userId).then(() => order);
        })
        .then(order => res.status(201).json(order))
        .catch(next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      next(error);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
