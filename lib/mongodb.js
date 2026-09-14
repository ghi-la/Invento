import mongoose from "mongoose";

// Each API route compiles into its own isolated serverless function, so a
// route that populates a ref (e.g. Product -> Category) without importing
// that model directly will throw MissingSchemaError on a cold instance that
// never happened to load it. Importing every model here — since every route
// already imports dbConnect — registers them all up front, once, for good.
import "@/lib/models/User";
import "@/lib/models/Warehouse";
import "@/lib/models/Membership";
import "@/lib/models/Invitation";
import "@/lib/models/Category";
import "@/lib/models/Product";
import "@/lib/models/StockMovement";
import "@/lib/models/DashboardLayout";
import "@/lib/models/Supplier";
import "@/lib/models/Event";
import "@/lib/models/EventItem";
import "@/lib/models/EventReturn";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Add it to your .env.local (dev) or Vercel Project Settings (production)."
  );
}

// Reuse the connection across hot-reloads in dev and across invocations
// on Vercel's serverless functions to avoid exhausting Atlas connections.
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
