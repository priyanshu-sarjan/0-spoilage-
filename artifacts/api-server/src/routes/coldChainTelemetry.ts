import { Router } from "express";
import { db, telemetryReadingsTable, marketplaceListingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ColdChainTelemetryBody } from "@workspace/api-zod";

const router = Router();

// In-memory store for demo & offline mode
interface TelemetryRecord {
  id: string | number;
  device_id: string;
  batch_id: string;
  produce: string;
  temperature: number;
  humidity: number;
  latitude: number;
  longitude: number;
  shelf_life_hours: number;
  status: "OK" | "ALERT";
  recorded_at: string;
  alerts?: {
    driverWhatsapp: string;
    managerWhatsapp: string;
    slackIncident: string;
  };
  discountApplied?: {
    discount_pct: number;
    discount_reason: string;
  };
}

const memoryListings: Record<string, { produce: string; price: number; discount_pct: number; discount_reason: string | null; updated_at: string }> = {
  "BATCH-TOMATO-NSK-9021": { produce: "Fresh Tomatoes", price: 180, discount_pct: 0, discount_reason: null, updated_at: new Date().toISOString() },
  "BATCH-MANGO-GWL-4410": { produce: "Dasheri Mangoes", price: 350, discount_pct: 0, discount_reason: null, updated_at: new Date().toISOString() },
  "BATCH-HERB-ASHWA-001": { produce: "Organic Ashwagandha Root", price: 450, discount_pct: 0, discount_reason: null, updated_at: new Date().toISOString() },
};

const memoryReadings: TelemetryRecord[] = [
  {
    id: "init-1",
    device_id: "IOT-SENS-NSK-09",
    batch_id: "BATCH-TOMATO-NSK-9021",
    produce: "Fresh Tomatoes",
    temperature: 14.5,
    humidity: 88,
    latitude: 19.9975,
    longitude: 73.7898,
    shelf_life_hours: 18,
    status: "ALERT",
    recorded_at: new Date(Date.now() - 15 * 60000).toISOString(),
    discountApplied: { discount_pct: 25, discount_reason: "spoilage_risk_auto_markdown" },
    alerts: {
      driverWhatsapp: "COLD CHAIN ALERT for batch BATCH-TOMATO-NSK-9021 (Fresh Tomatoes). Temp 14.5C, est. shelf life 18h. Device IOT-SENS-NSK-09. Take immediate action.",
      managerWhatsapp: "COLD CHAIN ALERT: batch BATCH-TOMATO-NSK-9021 (Fresh Tomatoes) at risk. Temp 14.5C, shelf life 18h at device IOT-SENS-NSK-09. Please intervene.",
      slackIncident: "🚨 *COLD CHAIN INCIDENT* 🚨\n*Batch:* BATCH-TOMATO-NSK-9021 (Fresh Tomatoes)\n*Device:* IOT-SENS-NSK-09\n*Temperature:* 14.5°C\n*Humidity:* 88%\n*Est. shelf life:* 18h\n*Location:* 19.9975, 73.7898\nAutomated markdown discount applied to clear stock.",
    },
  },
  {
    id: "init-2",
    device_id: "IOT-SENS-GWL-02",
    batch_id: "BATCH-MANGO-GWL-4410",
    produce: "Dasheri Mangoes",
    temperature: 4.2,
    humidity: 82,
    latitude: 26.2183,
    longitude: 78.1828,
    shelf_life_hours: 72,
    status: "OK",
    recorded_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
];

// POST /cold-chain-telemetry or POST / (main webhook endpoint matching n8n webhook)
router.post("/", async (req, res) => {
  // Support both raw payload ({ device_id, ... }) and n8n webhook format ({ body: { device_id, ... } })
  const rawPayload = req.body?.body ? req.body.body : req.body;
  const parsed = ColdChainTelemetryBody.safeParse(rawPayload);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid telemetry payload", details: parsed.error });
    return;
  }

  const { device_id, batch_id, produce, temperature, humidity, latitude, longitude, shelf_life_hours } = parsed.data;

  // n8n IF Condition: temperature > 10 OR shelf_life_hours < 24
  const isAnomaly = temperature > 10 || shelf_life_hours < 24;
  const status: "OK" | "ALERT" = isAnomaly ? "ALERT" : "OK";
  const recordedAt = new Date().toISOString();

  let discountApplied: { discount_pct: number; discount_reason: string } | undefined;
  let alerts: { driverWhatsapp: string; managerWhatsapp: string; slackIncident: string } | undefined;

  if (isAnomaly) {
    // 1. WhatsApp Driver Alert
    const driverWhatsapp = `COLD CHAIN ALERT for batch ${batch_id} (${produce}). Temp ${temperature}C, est. shelf life ${shelf_life_hours}h. Device ${device_id}. Take immediate action.`;

    // 2. WhatsApp Storage Manager Alert
    const managerWhatsapp = `COLD CHAIN ALERT: batch ${batch_id} (${produce}) at risk. Temp ${temperature}C, shelf life ${shelf_life_hours}h at device ${device_id}. Please intervene.`;

    // 3. Slack Incident Alert
    const slackIncident = `🚨 *COLD CHAIN INCIDENT* 🚨\n*Batch:* ${batch_id} (${produce})\n*Device:* ${device_id}\n*Temperature:* ${temperature}°C\n*Humidity:* ${humidity}%\n*Est. shelf life:* ${shelf_life_hours}h\n*Location:* ${latitude}, ${longitude}\nAutomated markdown discount applied to clear stock.`;

    alerts = { driverWhatsapp, managerWhatsapp, slackIncident };

    // 4. Apply Discount in Marketplace Listings (25% auto markdown)
    discountApplied = {
      discount_pct: 25,
      discount_reason: "spoilage_risk_auto_markdown",
    };

    memoryListings[batch_id] = {
      produce,
      price: memoryListings[batch_id]?.price ?? 200,
      discount_pct: 25,
      discount_reason: "spoilage_risk_auto_markdown",
      updated_at: recordedAt,
    };

    try {
      await db.insert(marketplaceListingsTable).values({
        batchId: batch_id,
        produce,
        price: 200,
        discountPct: 25,
        discountReason: "spoilage_risk_auto_markdown",
      }).onConflictDoUpdate({
        target: marketplaceListingsTable.batchId,
        set: {
          discountPct: 25,
          discountReason: "spoilage_risk_auto_markdown",
          updatedAt: new Date(),
        },
      });
    } catch {
      /* DB fallback to in-memory */
    }
  }

  // 5. Log Telemetry Reading
  const record: TelemetryRecord = {
    id: `tel-${Date.now()}`,
    device_id,
    batch_id,
    produce,
    temperature,
    humidity,
    latitude,
    longitude,
    shelf_life_hours,
    status,
    recorded_at: recordedAt,
    discountApplied,
    alerts,
  };

  memoryReadings.unshift(record);

  try {
    await db.insert(telemetryReadingsTable).values({
      deviceId: device_id,
      batchId: batch_id,
      produce,
      temperature,
      humidity,
      latitude,
      longitude,
      shelfLifeHours: shelf_life_hours,
      status,
    });
  } catch {
    /* DB fallback to in-memory */
  }

  res.status(200).json({
    anomaly: isAnomaly,
    status,
    discountApplied,
    alerts,
    reading: record,
    n8nWorkflow: {
      executedNodes: isAnomaly
        ? ["Telemetry Webhook", "Threshold Exceeded?", "Anomaly Detected", "Alert Driver (WhatsApp)", "Alert Storage Manager (WhatsApp)", "Post Slack Incident", "Apply Discount", "Log Reading (Alert)"]
        : ["Telemetry Webhook", "Threshold Exceeded?", "Log Reading (OK)"],
    },
  });
});

// GET /cold-chain-telemetry/readings - fetch all telemetry logs
router.get("/readings", async (_req, res) => {
  try {
    const dbReadings = await db.select().from(telemetryReadingsTable).orderBy(desc(telemetryReadingsTable.recordedAt)).limit(50);
    if (dbReadings && dbReadings.length > 0) {
      const formatted = dbReadings.map((r: typeof telemetryReadingsTable.$inferSelect) => ({

        id: r.id,
        device_id: r.deviceId,
        batch_id: r.batchId,
        produce: r.produce,
        temperature: r.temperature,
        humidity: r.humidity,
        latitude: r.latitude,
        longitude: r.longitude,
        shelf_life_hours: r.shelfLifeHours,
        status: r.status as "OK" | "ALERT",
        recorded_at: r.recordedAt.toISOString(),
      }));
      res.json({ readings: formatted, total: formatted.length });
      return;
    }
  } catch {
    /* Fallback to memory */
  }
  res.json({ readings: memoryReadings, total: memoryReadings.length });
});

// GET /cold-chain-telemetry/listings - fetch current marketplace markdown listings
router.get("/listings", async (_req, res) => {
  try {
    const dbListings = await db.select().from(marketplaceListingsTable);
    if (dbListings && dbListings.length > 0) {
      res.json({ listings: dbListings });
      return;
    }
  } catch {
    /* Fallback to memory */
  }
  res.json({ listings: memoryListings });
});

// POST /cold-chain-telemetry/simulate - Quick test simulator trigger
router.post("/simulate", async (req, res) => {
  const type = req.body?.type ?? "temp_breach";

  let sample: typeof ColdChainTelemetryBody._type;

  if (type === "temp_breach") {
    sample = {
      device_id: "IOT-COLD-HUB-NSK-44",
      batch_id: "BATCH-TOMATO-NSK-9021",
      produce: "Fresh Tomatoes",
      temperature: 15.2,
      humidity: 91,
      latitude: 20.011,
      longitude: 73.79,
      shelf_life_hours: 18,
    };
  } else if (type === "shelf_life_breach") {
    sample = {
      device_id: "IOT-SENS-GWL-09",
      batch_id: "BATCH-MANGO-GWL-4410",
      produce: "Dasheri Mangoes",
      temperature: 9.5,
      humidity: 85,
      latitude: 26.218,
      longitude: 78.182,
      shelf_life_hours: 12,
    };
  } else {
    sample = {
      device_id: "IOT-SENS-IND-01",
      batch_id: "BATCH-HERB-ASHWA-001",
      produce: "Organic Ashwagandha",
      temperature: 4.5,
      humidity: 80,
      latitude: 22.719,
      longitude: 75.857,
      shelf_life_hours: 120,
    };
  }

  // Forward internal call to POST handler logic
  const isAnomaly = sample.temperature > 10 || sample.shelf_life_hours < 24;
  const status: "OK" | "ALERT" = isAnomaly ? "ALERT" : "OK";
  const recordedAt = new Date().toISOString();

  let discountApplied;
  let alerts;

  if (isAnomaly) {
    alerts = {
      driverWhatsapp: `COLD CHAIN ALERT for batch ${sample.batch_id} (${sample.produce}). Temp ${sample.temperature}C, est. shelf life ${sample.shelf_life_hours}h. Device ${sample.device_id}. Take immediate action.`,
      managerWhatsapp: `COLD CHAIN ALERT: batch ${sample.batch_id} (${sample.produce}) at risk. Temp ${sample.temperature}C, shelf life ${sample.shelf_life_hours}h at device ${sample.device_id}. Please intervene.`,
      slackIncident: `🚨 *COLD CHAIN INCIDENT* 🚨\n*Batch:* ${sample.batch_id} (${sample.produce})\n*Device:* ${sample.device_id}\n*Temperature:* ${sample.temperature}°C\n*Humidity:* ${sample.humidity}%\n*Est. shelf life:* ${sample.shelf_life_hours}h\n*Location:* ${sample.latitude}, ${sample.longitude}\nAutomated markdown discount applied to clear stock.`,
    };
    discountApplied = {
      discount_pct: 25,
      discount_reason: "spoilage_risk_auto_markdown",
    };
  }

  const record: TelemetryRecord = {
    id: `sim-${Date.now()}`,
    ...sample,
    status,
    recorded_at: recordedAt,
    discountApplied,
    alerts,
  };

  memoryReadings.unshift(record);

  res.json({
    message: "Telemetry simulation executed successfully",
    anomaly: isAnomaly,
    status,
    reading: record,
    alerts,
    discountApplied,
  });
});

export default router;
