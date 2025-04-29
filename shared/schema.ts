import { pgTable, text, serial, integer, boolean, timestamp, numeric, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  language: text("language").default("en"),
});

export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  orders: many(orders),
  reviews: many(reviews),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  address: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: numeric("discount_price", { precision: 10, scale: 2 }),
  image: text("image").notNull(),
  category: text("category").notNull(), // 'car-battery', 'inverter-battery', etc.
  brand: text("brand").notNull(),
  type: text("type"),
  warranty: text("warranty"),
  stock: integer("stock").notNull().default(0),
  ratings: doublePrecision("ratings").default(0),
  reviewCount: integer("review_count").default(0),
  featured: boolean("featured").default(false),
  bestSeller: boolean("best_seller").default(false),
  newArrival: boolean("new_arrival").default(false),
  limitedStock: boolean("limited_stock").default(false),
  specifications: jsonb("specifications"),
});

export const productsRelations = relations(products, ({ many }) => ({
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  orderItems: many(orderItems),
  carCompatibilities: many(carCompatibility),
  inverterCompatibilities: many(inverterCompatibility),
  reviews: many(reviews),
}));

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Cart schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
});

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Wishlist schema
export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
});

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  user: one(users, {
    fields: [wishlistItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
});

export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  status: text("status").notNull().default("pending"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Compatibility schema for car battery fitment
export const carCompatibility = pgTable("car_compatibility", {
  id: serial("id").primaryKey(),
  carBrand: text("car_brand").notNull(),
  carModel: text("car_model").notNull(),
  year: text("year").notNull(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
});

export const carCompatibilityRelations = relations(carCompatibility, ({ one }) => ({
  product: one(products, {
    fields: [carCompatibility.productId],
    references: [products.id],
  }),
}));

export const insertCarCompatibilitySchema = createInsertSchema(carCompatibility).omit({
  id: true,
});

export type InsertCarCompatibility = z.infer<typeof insertCarCompatibilitySchema>;
export type CarCompatibility = typeof carCompatibility.$inferSelect;

// Compatibility schema for inverter battery fitment
export const inverterCompatibility = pgTable("inverter_compatibility", {
  id: serial("id").primaryKey(),
  inverterBrand: text("inverter_brand").notNull(),
  capacity: text("capacity").notNull(),
  backupHours: text("backup_hours").notNull(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
});

export const inverterCompatibilityRelations = relations(inverterCompatibility, ({ one }) => ({
  product: one(products, {
    fields: [inverterCompatibility.productId],
    references: [products.id],
  }),
}));

export const insertInverterCompatibilitySchema = createInsertSchema(inverterCompatibility).omit({
  id: true,
});

export type InsertInverterCompatibility = z.infer<typeof insertInverterCompatibilitySchema>;
export type InverterCompatibility = typeof inverterCompatibility.$inferSelect;

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  date: timestamp("date").notNull().defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  date: true,
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
