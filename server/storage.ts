import {
  User, InsertUser, users,
  Product, InsertProduct, products,
  CartItem, InsertCartItem, cartItems,
  WishlistItem, InsertWishlistItem, wishlistItems,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
  CarCompatibility, InsertCarCompatibility, carCompatibility,
  InverterCompatibility, InsertInverterCompatibility, inverterCompatibility,
  Review, InsertReview, reviews
} from "@shared/schema";
import session from "express-session";
import { db, pool } from "./db";
import { eq, and, inArray } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsByBrand(brand: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItemWithProduct(userId: number): Promise<Array<CartItem & { product: Product }>>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Wishlist operations
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  getWishlistItemWithProduct(userId: number): Promise<Array<WishlistItem & { product: Product }>>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number): Promise<boolean>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  
  // Compatibility assistant operations
  findCompatibleCarBatteries(brand: string, model: string, year: string): Promise<Product[]>;
  findCompatibleInverterBatteries(brand: string, capacity: string, backupHours: string): Promise<Product[]>;
  
  // Review operations
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: any; // Using any temporarily to avoid express-session typing issues
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getProductsByBrand(brand: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.brand, brand));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true));
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItemWithProduct(userId: number): Promise<Array<CartItem & { product: Product }>> {
    const result = await db.select({
      cartItem: cartItems,
      product: products
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId));

    return result.map(({ cartItem, product }) => ({
      ...cartItem,
      product
    }));
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if item already exists for user
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItemData.userId),
          eq(cartItems.productId, cartItemData.productId)
        )
      );

    if (existingItem) {
      // Update quantity if it exists
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + cartItemData.quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    // Insert new item if it doesn't exist
    const [cartItem] = await db.insert(cartItems).values(cartItemData).returning();
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return result.count > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId));
    return true;
  }

  // Wishlist operations
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async getWishlistItemWithProduct(userId: number): Promise<Array<WishlistItem & { product: Product }>> {
    const result = await db.select({
      wishlistItem: wishlistItems,
      product: products
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.userId, userId));

    return result.map(({ wishlistItem, product }) => ({
      ...wishlistItem,
      product
    }));
  }

  async addToWishlist(wishlistItemData: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists for user
    const [existingItem] = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.userId, wishlistItemData.userId),
          eq(wishlistItems.productId, wishlistItemData.productId)
        )
      );

    if (existingItem) {
      return existingItem;
    }

    // Insert new item if it doesn't exist
    const [wishlistItem] = await db.insert(wishlistItems).values(wishlistItemData).returning();
    return wishlistItem;
  }

  async removeFromWishlist(id: number): Promise<boolean> {
    const result = await db.delete(wishlistItems).where(eq(wishlistItems.id, id));
    return result.count > 0;
  }

  // Order operations
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the order
      const [order] = await tx.insert(orders).values(orderData).returning();

      // Insert all order items
      if (items.length > 0) {
        await tx.insert(orderItems).values(
          items.map(item => ({
            ...item,
            orderId: order.id
          }))
        );
      }

      return order;
    });
  }

  async getOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // Compatibility assistant operations
  async findCompatibleCarBatteries(brand: string, model: string, year: string): Promise<Product[]> {
    const compatibilities = await db.select()
      .from(carCompatibility)
      .where(
        and(
          eq(carCompatibility.carBrand, brand),
          eq(carCompatibility.carModel, model),
          eq(carCompatibility.year, year)
        )
      );
    
    if (compatibilities.length === 0) {
      return [];
    }
    
    const productIds = compatibilities.map(c => c.productId);
    return await db.select()
      .from(products)
      .where(inArray(products.id, productIds));
  }

  async findCompatibleInverterBatteries(brand: string, capacity: string, backupHours: string): Promise<Product[]> {
    const compatibilities = await db.select()
      .from(inverterCompatibility)
      .where(
        and(
          eq(inverterCompatibility.inverterBrand, brand),
          eq(inverterCompatibility.capacity, capacity),
          eq(inverterCompatibility.backupHours, backupHours)
        )
      );
    
    if (compatibilities.length === 0) {
      return [];
    }
    
    const productIds = compatibilities.map(c => c.productId);
    return await db.select()
      .from(products)
      .where(inArray(products.id, productIds));
  }

  // Review operations
  async getProductReviews(productId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.productId, productId));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }
}

export const storage = new DatabaseStorage();