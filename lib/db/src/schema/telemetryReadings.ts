import { pgTable, serial, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const telemetryReadingsTable = pgTable("telemetry_readings", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  batchId: text("batch_id").notNull(),
  produce: text("produce").notNull(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  shelfLifeHours: real("shelf_life_hours").notNull(),
  status: text("status").notNull(), // 'OK' | 'ALERT'
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertTelemetryReadingSchema = createInsertSchema(telemetryReadingsTable).omit({ id: true, recordedAt: true });
export type InsertTelemetryReading = z.infer<typeof insertTelemetryReadingSchema>;
export type TelemetryReading = typeof telemetryReadingsTable.$inferSelect;
