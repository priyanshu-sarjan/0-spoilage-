#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Simulated AyuTrace Telemetry & Mandi Data
const REGIONAL_SURPLUS_DATA: Record<string, { surplusPercentage: number; crop: string; status: string }> = {
  "Ariyalur": { surplusPercentage: 108.2, crop: "Tomato", status: "Critical Overproduction" },
  "Perambalur": { surplusPercentage: 15.0, crop: "Onion", status: "Normal" },
  "Nashik": { surplusPercentage: 85.0, crop: "Tomato", status: "High Overproduction" },
  "Gwalior": { surplusPercentage: 42.0, crop: "Mango", status: "Moderate Overproduction" },
};

const COLD_STORAGE_FACILITIES: Record<string, { capacityFilled: number; availableTons: number }> = {
  "Facility A": { capacityFilled: 65, availableTons: 350 },
  "Facility B": { capacityFilled: 88, availableTons: 120 },
  "Mumbai Hub": { capacityFilled: 45, availableTons: 550 },
  "Pune APMC": { capacityFilled: 30, availableTons: 700 },
};

const server = new Server(
  {
    name: "ayutrace-logistics-engine",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 1. List Available MCP Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "check_regional_surplus",
        description: "Scans GIS telemetry and district-level crop data to identify overproduction gluts and surplus percentages.",
        inputSchema: {
          type: "object",
          properties: {
            district: { type: "string", description: "District name (e.g. Ariyalur, Nashik, Gwalior)" },
          },
          required: ["district"],
        },
      },
      {
        name: "predict_spoilage_velocity",
        description: "Calculates the decay index, estimated shelf-life, and assigned priority dispatch tier based on transit conditions.",
        inputSchema: {
          type: "object",
          properties: {
            crop: { type: "string", description: "Type of produce (e.g., Tomato, Mango, Leafy Greens)" },
            ambientTemperature: { type: "number", description: "Storage/Transit temperature in Celsius" },
            transitDurationHours: { type: "number", description: "Current or projected duration in hours" },
          },
          required: ["crop", "ambientTemperature", "transitDurationHours"],
        },
      },
      {
        name: "divert_shipment",
        description: "Reassigns an in-transit load to alternate cold hubs or high-demand wholesale mandis.",
        inputSchema: {
          type: "object",
          properties: {
            truckId: { type: "string", description: "Identifier of the transport vehicle" },
            targetFacility: { type: "string", description: "Destination hub (e.g., Mumbai Hub, Pune APMC)" },
            reason: { type: "string", description: "Reason for emergency reroute" },
          },
          required: ["truckId", "targetFacility", "reason"],
        },
      },
      {
        name: "trigger_flash_clearance",
        description: "Automates markdown discounts (30%-50% OFF) on consumer and retail portals for rapid uptake of expiring batches.",
        inputSchema: {
          type: "object",
          properties: {
            batchId: { type: "string", description: "Harvest batch ID" },
            decayScore: { type: "number", description: "Calculated decay index (0-100)" },
          },
          required: ["batchId", "decayScore"],
        },
      },
    ],
  };
});

// 2. Tool Execution Logic
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "check_regional_surplus": {
        const district = String(args?.district);
        const data = REGIONAL_SURPLUS_DATA[district];
        if (!data) {
          return {
            content: [{ type: "text", text: `District '${district}' not found in active telemetry. Normal baseline assumed.` }],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                district,
                ...data,
                actionNeeded: data.surplusPercentage > 50 ? "Trigger Priority Dispatch & Reroute" : "Standard Logistics",
              }, null, 2),
            },
          ],
        };
      }

      case "predict_spoilage_velocity": {
        const temp = Number(args?.ambientTemperature);
        const duration = Number(args?.transitDurationHours);
        const crop = String(args?.crop);

        // Decay calculation based on AyuTrace formula
        const decayScore = Math.min(100, Math.round((temp / 40) * (duration / 72) * 100));
        const priorityTier = decayScore > 60 ? "Priority 1 (Urgent)" : "Priority 2 (Standard)";
        const estimatedShelfLifeHours = Math.max(0, 96 - Math.round((temp * duration) / 15));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                crop,
                ambientTemperature: `${temp}°C`,
                transitDuration: `${duration} hrs`,
                decayScore: `${decayScore}/100`,
                priorityTier,
                estimatedShelfLife: `${estimatedShelfLifeHours} hours remaining`,
                status: decayScore > 75 ? "CRITICAL_SPOILAGE_RISK" : "STABLE",
              }, null, 2),
            },
          ],
        };
      }

      case "divert_shipment": {
        const truckId = String(args?.truckId);
        const targetFacility = String(args?.targetFacility);
        const facility = COLD_STORAGE_FACILITIES[targetFacility];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "REROUTE_SUCCESSFUL",
                truckId,
                newDestination: targetFacility,
                targetCapacityFilled: facility ? `${facility.capacityFilled}%` : "Unknown",
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }

      case "trigger_flash_clearance": {
        const batchId = String(args?.batchId);
        const decayScore = Number(args?.decayScore);
        const discountPercentage = decayScore >= 75 ? 50 : decayScore >= 50 ? 30 : 15;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                action: "FLASH_SALE_TRIGGERED",
                batchId,
                discountApplied: `${discountPercentage}% OFF`,
                portalUpdate: "Active on consumer mandi catalog",
                revenueRecoveryExpected: "High",
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Tool error: ${error.message}` }],
    };
  }
});

// 3. Start Stdio Transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch((error) => {
  console.error("Fatal error running AyuTrace MCP Server:", error);
  process.exit(1);
});
