import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  wishlistItems, type WishlistItem, type InsertWishlistItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  carCompatibility, type CarCompatibility, type InsertCarCompatibility,
  inverterCompatibility, type InverterCompatibility, type InsertInverterCompatibility,
  reviews, type Review, type InsertReview
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private wishlistItems: Map<number, WishlistItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private carCompatibility: Map<number, CarCompatibility>;
  private inverterCompatibility: Map<number, InverterCompatibility>;
  private reviews: Map<number, Review>;
  
  currentUserId: number;
  currentProductId: number;
  currentCartItemId: number;
  currentWishlistItemId: number;
  currentOrderId: number;
  currentOrderItemId: number;
  currentCarCompatibilityId: number;
  currentInverterCompatibilityId: number;
  currentReviewId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.carCompatibility = new Map();
    this.inverterCompatibility = new Map();
    this.reviews = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentWishlistItemId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentCarCompatibilityId = 1;
    this.currentInverterCompatibilityId = 1;
    this.currentReviewId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with some sample products
    this.initializeProducts();
    this.initializeCompatibility();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, language: "en" };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }
  
  async getProductsByBrand(brand: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.brand === brand
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured
    );
  }
  
  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...productData, 
      id,
      ratings: 0,
      reviewCount: 0,
      featured: false,
      bestSeller: false,
      newArrival: false,
      limitedStock: false
    };
    this.products.set(id, product);
    return product;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getCartItemWithProduct(userId: number): Promise<Array<CartItem & { product: Product }>> {
    const cartItems = await this.getCartItems(userId);
    return Promise.all(
      cartItems.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      })
    );
  }
  
  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    // Check if the item already exists in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.userId === cartItemData.userId && item.productId === cartItemData.productId
    );
    
    if (existingItem) {
      // Update quantity instead of adding a new item
      return this.updateCartItem(existingItem.id, existingItem.quantity + cartItemData.quantity) as Promise<CartItem>;
    }
    
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { ...cartItemData, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = await this.getCartItems(userId);
    userCartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }
  
  // Wishlist operations
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async getWishlistItemWithProduct(userId: number): Promise<Array<WishlistItem & { product: Product }>> {
    const wishlistItems = await this.getWishlistItems(userId);
    return Promise.all(
      wishlistItems.map(async (item) => {
        const product = await this.getProduct(item.productId);
        return { ...item, product: product! };
      })
    );
  }
  
  async addToWishlist(wishlistItemData: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists in wishlist
    const existingItem = Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === wishlistItemData.userId && item.productId === wishlistItemData.productId
    );
    
    if (existingItem) {
      return existingItem;
    }
    
    const id = this.currentWishlistItemId++;
    const wishlistItem: WishlistItem = { ...wishlistItemData, id };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }
  
  async removeFromWishlist(id: number): Promise<boolean> {
    return this.wishlistItems.delete(id);
  }
  
  // Order operations
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...orderData, 
      id, 
      orderDate: new Date() 
    };
    this.orders.set(id, order);
    
    // Add all order items
    items.forEach(item => {
      const orderItemId = this.currentOrderItemId++;
      const orderItem: OrderItem = { ...item, id: orderItemId, orderId: id };
      this.orderItems.set(orderItemId, orderItem);
    });
    
    return order;
  }
  
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }
  
  // Compatibility assistant operations
  async findCompatibleCarBatteries(brand: string, model: string, year: string): Promise<Product[]> {
    const compatItems = Array.from(this.carCompatibility.values()).filter(
      (item) => 
        (brand === 'any' || item.brand === brand) && 
        (model === 'any' || item.model === model) && 
        (year === 'any' || item.year === year)
    );
    
    const productIds = compatItems.map(item => item.productId);
    return Array.from(this.products.values()).filter(
      (product) => productIds.includes(product.id)
    );
  }
  
  async findCompatibleInverterBatteries(brand: string, capacity: string, backupHours: string): Promise<Product[]> {
    const compatItems = Array.from(this.inverterCompatibility.values()).filter(
      (item) => 
        (brand === 'any' || item.brand === brand) && 
        (capacity === 'any' || item.capacity === capacity) && 
        (backupHours === 'any' || item.backupHours === backupHours)
    );
    
    const productIds = compatItems.map(item => item.productId);
    return Array.from(this.products.values()).filter(
      (product) => productIds.includes(product.id)
    );
  }
  
  // Review operations
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = { ...reviewData, id, date: new Date() };
    this.reviews.set(id, review);
    
    // Update product ratings
    const product = await this.getProduct(reviewData.productId);
    if (product) {
      const productReviews = await this.getProductReviews(reviewData.productId);
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      await this.updateProduct(reviewData.productId, {
        ratings: averageRating,
        reviewCount: productReviews.length
      });
    }
    
    return review;
  }

  // Initialize sample products
  private initializeProducts() {
    const products: InsertProduct[] = [
      {
        name: "Exide Premium 60Ah Car Battery",
        description: "High-performance car battery for Hyundai, Honda, Maruti (Petrol). Features advanced lead-acid technology for reliable starting power and long life.",
        price: 6999,
        discountPrice: 8499,
        image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d",
        category: "car",
        brand: "Exide",
        type: "Premium",
        warranty: "48 Months",
        stock: 25,
        ratings: 4.5,
        reviewCount: 34,
        featured: true,
        bestSeller: true,
        newArrival: false,
        limitedStock: false,
        specifications: JSON.stringify({
          capacity: "60Ah",
          voltage: "12V",
          terminalLayout: "Right Positive",
          dimensions: "242 x 175 x 190 mm",
          warranty: "48 Months",
          batteryType: "Lead Acid",
          maintenanceType: "Low Maintenance"
        })
      },
      {
        name: "Amaron Tall Tubular 150Ah",
        description: "Long-lasting inverter battery designed for home use with 60 months warranty. Provides reliable backup during power outages.",
        price: 15499,
        discountPrice: 17999,
        image: "https://images.unsplash.com/photo-1603539279542-e5f7de79abab",
        category: "inverter",
        brand: "Amaron",
        type: "Tubular",
        warranty: "60 Months",
        stock: 15,
        ratings: 5.0,
        reviewCount: 42,
        featured: true,
        bestSeller: false,
        newArrival: false,
        limitedStock: false,
        specifications: JSON.stringify({
          capacity: "150Ah",
          voltage: "12V",
          batteryType: "Tubular",
          dimensions: "502 x 189 x 415 mm",
          warranty: "60 Months",
          backupTime: "6-8 hours",
          chargeTime: "10-12 hours"
        })
      },
      {
        name: "SF Sonic Flash Start 35Ah",
        description: "Maintenance-free battery for hatchbacks and small cars. Provides quick starting power even in cold conditions.",
        price: 4599,
        discountPrice: 5299,
        image: "https://images.unsplash.com/photo-1603539279542-e5f7de79abab",
        category: "car",
        brand: "SF Sonic",
        type: "Flash Start",
        warranty: "36 Months",
        stock: 30,
        ratings: 4.0,
        reviewCount: 18,
        featured: true,
        bestSeller: false,
        newArrival: true,
        limitedStock: false,
        specifications: JSON.stringify({
          capacity: "35Ah",
          voltage: "12V",
          terminalLayout: "Right Positive",
          dimensions: "197 x 129 x 227 mm",
          warranty: "36 Months",
          batteryType: "Lead Acid",
          maintenanceType: "Zero Maintenance"
        })
      },
      {
        name: "Luminous Red Charge RC 18000",
        description: "Heavy-duty 150Ah tubular inverter battery with long backup time. Ideal for areas with frequent power cuts.",
        price: 16999,
        discountPrice: 18900,
        image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d",
        category: "inverter",
        brand: "Luminous",
        type: "Tubular",
        warranty: "60 Months",
        stock: 10,
        ratings: 4.0,
        reviewCount: 27,
        featured: true,
        bestSeller: false,
        newArrival: false,
        limitedStock: true,
        specifications: JSON.stringify({
          capacity: "150Ah",
          voltage: "12V",
          batteryType: "Tubular",
          dimensions: "502 x 191 x 418 mm",
          warranty: "60 Months",
          backupTime: "6-8 hours",
          chargeTime: "10-12 hours"
        })
      },
      {
        name: "Exide Inva Master Tall 200Ah",
        description: "Heavy-duty inverter battery with extra capacity for longer backup. Perfect for commercial establishments.",
        price: 19500,
        discountPrice: 21000,
        image: "https://images.unsplash.com/photo-1603539279542-e5f7de79abab",
        category: "inverter",
        brand: "Exide",
        type: "Tall Tubular",
        warranty: "60 Months",
        stock: 8,
        ratings: 4.8,
        reviewCount: 15,
        featured: false,
        bestSeller: false,
        newArrival: false,
        limitedStock: true,
        specifications: JSON.stringify({
          capacity: "200Ah",
          voltage: "12V",
          batteryType: "Tall Tubular",
          dimensions: "518 x 276 x 415 mm",
          warranty: "60 Months",
          backupTime: "8-10 hours",
          chargeTime: "12-14 hours"
        })
      },
      {
        name: "Amaron Pro 55Ah Car Battery",
        description: "High-performance car battery suitable for SUVs and midsize sedans. Provides reliable starting power in all conditions.",
        price: 6500,
        discountPrice: 7200,
        image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d",
        category: "car",
        brand: "Amaron",
        type: "Pro",
        warranty: "48 Months",
        stock: 22,
        ratings: 4.6,
        reviewCount: 30,
        featured: false,
        bestSeller: true,
        newArrival: false,
        limitedStock: false,
        specifications: JSON.stringify({
          capacity: "55Ah",
          voltage: "12V",
          terminalLayout: "Right Positive",
          dimensions: "238 x 172 x 185 mm",
          warranty: "48 Months",
          batteryType: "Lead Acid",
          maintenanceType: "Low Maintenance"
        })
      }
    ];

    products.forEach(product => {
      this.createProduct(product);
    });
  }

  // Initialize compatibility data
  private initializeCompatibility() {
    // Car compatibility
    const carCompatibilityItems: InsertCarCompatibility[] = [
      { brand: "Maruti Suzuki", model: "Swift", year: "2020", productId: 1 },
      { brand: "Maruti Suzuki", model: "Swift", year: "2021", productId: 1 },
      { brand: "Maruti Suzuki", model: "Swift", year: "2022", productId: 1 },
      { brand: "Maruti Suzuki", model: "Baleno", year: "2021", productId: 1 },
      { brand: "Hyundai", model: "i20", year: "2020", productId: 1 },
      { brand: "Hyundai", model: "i20", year: "2021", productId: 1 },
      { brand: "Honda", model: "City", year: "2020", productId: 1 },
      { brand: "Honda", model: "City", year: "2021", productId: 1 },
      { brand: "Maruti Suzuki", model: "Alto", year: "2020", productId: 3 },
      { brand: "Maruti Suzuki", model: "Alto", year: "2021", productId: 3 },
      { brand: "Maruti Suzuki", model: "Alto", year: "2022", productId: 3 },
      { brand: "Maruti Suzuki", model: "Wagon R", year: "2020", productId: 3 },
      { brand: "Hyundai", model: "Creta", year: "2021", productId: 6 },
      { brand: "Hyundai", model: "Creta", year: "2022", productId: 6 },
      { brand: "Hyundai", model: "Venue", year: "2021", productId: 6 },
      { brand: "Tata", model: "Nexon", year: "2021", productId: 6 },
      { brand: "Tata", model: "Nexon", year: "2022", productId: 6 },
      { brand: "Mahindra", model: "XUV300", year: "2021", productId: 6 }
    ];

    carCompatibilityItems.forEach((item, index) => {
      const id = this.currentCarCompatibilityId++;
      this.carCompatibility.set(id, { ...item, id });
    });

    // Inverter compatibility
    const inverterCompatibilityItems: InsertInverterCompatibility[] = [
      { brand: "Luminous", capacity: "800 VA", backupHours: "2-4 Hours", productId: 2 },
      { brand: "Luminous", capacity: "1100 VA", backupHours: "2-4 Hours", productId: 2 },
      { brand: "Luminous", capacity: "1500 VA", backupHours: "4-6 Hours", productId: 2 },
      { brand: "Microtek", capacity: "800 VA", backupHours: "2-4 Hours", productId: 2 },
      { brand: "Microtek", capacity: "1100 VA", backupHours: "2-4 Hours", productId: 2 },
      { brand: "Exide", capacity: "800 VA", backupHours: "2-4 Hours", productId: 2 },
      { brand: "Luminous", capacity: "1100 VA", backupHours: "6-8 Hours", productId: 4 },
      { brand: "Luminous", capacity: "1500 VA", backupHours: "6-8 Hours", productId: 4 },
      { brand: "Su-Kam", capacity: "1100 VA", backupHours: "6-8 Hours", productId: 4 },
      { brand: "Su-Kam", capacity: "1500 VA", backupHours: "6-8 Hours", productId: 4 },
      { brand: "V-Guard", capacity: "1100 VA", backupHours: "6-8 Hours", productId: 4 },
      { brand: "Luminous", capacity: "1500 VA", backupHours: "8+ Hours", productId: 5 },
      { brand: "Exide", capacity: "1500 VA", backupHours: "8+ Hours", productId: 5 },
      { brand: "Su-Kam", capacity: "1500 VA", backupHours: "8+ Hours", productId: 5 }
    ];

    inverterCompatibilityItems.forEach((item, index) => {
      const id = this.currentInverterCompatibilityId++;
      this.inverterCompatibility.set(id, { ...item, id });
    });
  }
}

export const storage = new MemStorage();
