import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '@shared/schema';

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function migrateTables() {
  try {
    console.log('Starting database migration...');
    
    // Drop existing tables if they exist
    console.log('Dropping any existing tables...');
    try {
      await db.execute(sql`
        DROP TABLE IF EXISTS 
          "inverter_compatibility", 
          "car_compatibility", 
          "reviews",
          "order_items", 
          "orders", 
          "wishlist_items", 
          "cart_items", 
          "products", 
          "users",
          "user_sessions"
        CASCADE
      `);
    } catch (error) {
      console.error('Warning during table dropping:', error);
    }
    
    // Create tables
    console.log('Creating database tables...');
    
    await db.execute(sql`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "phone" TEXT,
        "address" TEXT,
        "language" TEXT DEFAULT 'en'
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "products" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" NUMERIC(10, 2) NOT NULL,
        "discount_price" NUMERIC(10, 2),
        "image" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "brand" TEXT NOT NULL,
        "type" TEXT,
        "warranty" TEXT,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "ratings" DOUBLE PRECISION DEFAULT 0,
        "review_count" INTEGER DEFAULT 0,
        "featured" BOOLEAN DEFAULT false,
        "best_seller" BOOLEAN DEFAULT false,
        "new_arrival" BOOLEAN DEFAULT false,
        "limited_stock" BOOLEAN DEFAULT false,
        "specifications" JSONB
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "cart_items" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "quantity" INTEGER NOT NULL DEFAULT 1
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "wishlist_items" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "orders" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "order_date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "total" NUMERIC(10, 2) NOT NULL,
        "shipping_address" TEXT NOT NULL
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "order_items" (
        "id" SERIAL PRIMARY KEY,
        "order_id" INTEGER NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id"),
        "quantity" INTEGER NOT NULL,
        "price" NUMERIC(10, 2) NOT NULL
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "car_compatibility" (
        "id" SERIAL PRIMARY KEY,
        "car_brand" TEXT NOT NULL,
        "car_model" TEXT NOT NULL,
        "year" TEXT NOT NULL,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "inverter_compatibility" (
        "id" SERIAL PRIMARY KEY,
        "inverter_brand" TEXT NOT NULL,
        "capacity" TEXT NOT NULL,
        "backup_hours" TEXT NOT NULL,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE "reviews" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "product_id" INTEGER NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Seed the database with initial data
    console.log('Seeding database with initial data...');
    
    // Create a sample user
    const [user] = await db.insert(schema.users).values({
      username: 'demo',
      password: '$2b$10$GzKFGqr3umLMGLXNvNfvQeKayGt3KPXgpu7Q2e1.61SnKKr7J/nEG', // hashed "password"
      name: 'Demo User',
      email: 'demo@example.com',
      phone: '+91 9876543210',
      address: '123 Main St, Delhi',
      language: 'en'
    }).returning();
    
    // Create sample products
    const products = await db.insert(schema.products).values([
      {
        name: 'Exide Premium 60Ah Car Battery',
        description: 'Premium maintenance-free car battery with extended warranty and high cranking power',
        price: '5999',
        category: 'car-battery',
        brand: 'Exide',
        type: 'Maintenance Free',
        image: '/images/exide-premium.jpg',
        warranty: '36 months',
        stock: 45,
        featured: true,
        specifications: JSON.stringify({
          capacity: '60Ah',
          warranty: '36 months',
          technology: 'Silver Calcium',
          terminalType: 'Right Positive',
          dimensions: '242 x 175 x 175 mm',
          weight: '14.5 kg'
        })
      },
      {
        name: 'Amaron Pro 150Ah Inverter Battery',
        description: 'High capacity tubular battery for home UPS and inverter applications with long backup time',
        price: '12499',
        category: 'inverter-battery',
        brand: 'Amaron',
        type: 'Tubular',
        image: '/images/amaron-pro.jpg',
        warranty: '48 months',
        stock: 20,
        featured: true,
        specifications: JSON.stringify({
          capacity: '150Ah',
          warranty: '48 months',
          technology: 'Tubular',
          terminalType: 'Top Terminal',
          dimensions: '502 x 189 x 410 mm',
          weight: '47 kg'
        })
      },
      {
        name: 'Luminous Eco Volt 900VA Inverter',
        description: 'Compact home inverter with digital display and intelligent charging system',
        price: '4999',
        discountPrice: '3999',
        category: 'inverter',
        brand: 'Luminous',
        type: 'Square Wave',
        image: '/images/luminous-eco.jpg',
        warranty: '24 months',
        stock: 15,
        featured: false,
        specifications: JSON.stringify({
          capacity: '900VA',
          warranty: '24 months',
          technology: 'Square Wave',
          backupTime: '3-6 hours',
          dimensions: '275 x 195 x 330 mm',
          weight: '7.5 kg'
        })
      }
    ]).returning();
    
    // Add car compatibility records
    await db.insert(schema.carCompatibility).values([
      {
        carBrand: 'Maruti Suzuki',
        carModel: 'Swift',
        year: '2018-2023',
        productId: products[0].id
      },
      {
        carBrand: 'Hyundai',
        carModel: 'i20',
        year: '2019-2023',
        productId: products[0].id
      },
      {
        carBrand: 'Tata',
        carModel: 'Nexon',
        year: '2020-2023',
        productId: products[0].id
      }
    ]);
    
    // Add inverter compatibility records
    await db.insert(schema.inverterCompatibility).values([
      {
        inverterBrand: 'Luminous',
        capacity: '900VA',
        backupHours: '4-6',
        productId: products[1].id
      },
      {
        inverterBrand: 'Microtek',
        capacity: '1100VA',
        backupHours: '6-8',
        productId: products[1].id
      }
    ]);
    
    console.log('Database migration and seeding completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrateTables().catch(console.error);