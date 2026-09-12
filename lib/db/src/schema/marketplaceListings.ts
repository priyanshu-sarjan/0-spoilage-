import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const marketplaceListingsTable = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  produce: text("produce").notNull(),
  price: real("price").notNull(),
  discountPct: integer("discount_pct").default(0).notNull(),
  discountReason: text("discount_reason"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListingsTable.$inferSelect;
