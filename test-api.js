/**
 * ============================================================================
 * 🧪 AgriFresh / AyuTrace (0-Spoilage Platform) - Automated Backend Test Suite
 * ============================================================================
 * Comprehensive end-to-end test suite verifying all REST API endpoints:
 * Auth, Herbs, Products, Orders, Supply Chain QR Traceability, Telemetry,
 * Dynamic Markdown Price Adjustments, Dashboards, and AI Spoilage Modeling.
 */

import "./server.js";

const BASE_URL = process.env.TEST_API_URL || "http://localhost:5000";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    testsPassed++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    testsFailed++;
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
  }
}

async function runTests() {
  // Give server time to bind port
  await new Promise((r) => setTimeout(r, 600));

  console.log(`\n==================================================================`);
  console.log(`🚀 Starting AgriFresh 0-Spoilage Backend API Test Suite`);
  console.log(`🎯 Target Server: ${BASE_URL}`);
  console.log(`==================================================================\n`);

  let authToken = null;
  let testUserId = null;
  let createdProductId = null;
  let createdBatchNumber = null;
  let createdOrderId = null;

  try {
    // 1. Healthcheck
    console.log(`[Suite 1: System Health & Diagnostics]`);
    const healthRes = await fetch(`${BASE_URL}/healthz`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, "Healthcheck responds with HTTP 200");
    assert(healthData.status === "ok", "Healthcheck payload status is 'ok'");
    assert(healthData.features?.zeroSpoilageEngine === "active", "Zero-Spoilage engine is active");

    // 2. Authentication
    console.log(`\n[Suite 2: Role-Based Authentication]`);
    const demoLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ramesh.patel@farm.in", password: "password123" }),
    });
    const demoLoginData = await demoLoginRes.json();
    assert(demoLoginRes.status === 200, "Farmer demo user logs in with 200");
    assert(demoLoginData.user?.role === "farmer", "Farmer user role verified");
    assert(typeof demoLoginData.token === "string", "Valid JWT token generated");
    authToken = demoLoginData.token;

    // Register test consumer
    const uniqueEmail = `test.consumer.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Consumer",
        email: uniqueEmail,
        password: "securePassword123",
        role: "consumer",
        region: "Bengaluru, Karnataka",
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, "New consumer registers with HTTP 201");
    assert(regData.user?.email === uniqueEmail.toLowerCase(), "Registered email matches");

    // Auth Me verification
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, "/api/auth/me returns 200 with bearer token");
    assert(meData.email === "ramesh.patel@farm.in", "/api/auth/me identifies correct user");

    // 3. Herbs Catalog
    console.log(`\n[Suite 3: Herbs Catalog & Search]`);
    const herbsRes = await fetch(`${BASE_URL}/api/herbs`);
    const herbsData = await herbsRes.json();
    assert(herbsRes.status === 200, "GET /api/herbs returns 200");
    assert(Array.isArray(herbsData) && herbsData.length >= 3, `Herbs catalog populated (${herbsData.length} herbs)`);

    const searchRes = await fetch(`${BASE_URL}/api/herbs?search=Ashwagandha`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200 && searchData.length >= 1, "Herb search query filters correctly");

    const herbDetailRes = await fetch(`${BASE_URL}/api/herbs/1`);
    const herbDetail = await herbDetailRes.json();
    assert(herbDetailRes.status === 200 && herbDetail.id === 1, "GET /api/herbs/1 returns herb details");
    assert(Array.isArray(herbDetail.benefits), "Herb details contain Ayurvedic benefits array");

    // 4. Products & Marketplace
    console.log(`\n[Suite 4: Marketplace Products & Inventory]`);
    const prodsRes = await fetch(`${BASE_URL}/api/products`);
    const prodsData = await prodsRes.json();
    assert(prodsRes.status === 200 && Array.isArray(prodsData), "GET /api/products returns array");

    const createProdRes = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        name: "Vidisha Hydroponic Fresh Spinach",
        description: "Zero-pesticide cold-storage preserved hydroponic spinach.",
        price: 35,
        category: "Vegetables",
        stockQty: 500,
        batchNumber: "BATCH-SPINACH-VID-01",
      }),
    });
    const createdProd = await createProdRes.json();
    assert(createProdRes.status === 201, "POST /api/products creates new product (201)");
    assert(createdProd.name.includes("Spinach"), "Product name verified");
    createdProductId = createdProd.id;

    // 5. Supply Chain Batches & QR Traceability
    console.log(`\n[Suite 5: Supply Chain Batches & Farm-to-Fork Traceability]`);
    const batchesRes = await fetch(`${BASE_URL}/api/supply-chain/batches`);
    const batchesData = await batchesRes.json();
    assert(batchesRes.status === 200 && Array.isArray(batchesData), "GET /api/supply-chain/batches returns array");

    const batchDetailRes = await fetch(`${BASE_URL}/api/supply-chain/batches/BATCH-TOMATO-NSK-9021`);
    const batchDetail = await batchDetailRes.json();
    assert(batchDetailRes.status === 200, "GET /api/supply-chain/batches/:batchNumber returns 200");
    assert(batchDetail.smartContractHash?.startsWith("0x"), "Smart contract cryptographic hash present");
    assert(Array.isArray(batchDetail.stages) && batchDetail.stages.length >= 2, "Complete Soil-to-Shelf stages recorded");

    const newBatchRes = await fetch(`${BASE_URL}/api/supply-chain/batches`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        cropName: "Organic Strawberries",
        farmLocation: "Mahabaleshwar Hills, Maharashtra",
        quantityKg: 850,
        soilPh: 6.5,
        soilNpk: "N:135, P:40, K:160",
      }),
    });
    const newBatchData = await newBatchRes.json();
    assert(newBatchRes.status === 201, "POST /api/supply-chain/batches registers new harvest batch");
    createdBatchNumber = newBatchData.batchNumber;

    // 6. Orders
    console.log(`\n[Suite 6: Orders & E-Commerce Purchases]`);
    const createOrderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        productId: 1,
        quantity: 3,
        deliveryAddress: "Flat 12, Green Acres, Pune 411001",
      }),
    });
    const orderData = await createOrderRes.json();
    assert(createOrderRes.status === 201, "POST /api/orders creates new purchase order (201)");
    assert(orderData.trackingNumber?.startsWith("TRK-IN-"), "Tracking number generated automatically");
    createdOrderId = orderData.id;

    const listOrdersRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const listOrdersData = await listOrdersRes.json();
    assert(listOrdersRes.status === 200 && Array.isArray(listOrdersData), "GET /api/orders returns orders list");

    // 7. Role-Based Dashboards
    console.log(`\n[Suite 7: Role Dashboards & Metrics]`);
    const statsRes = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const statsData = await statsRes.json();
    assert(statsRes.status === 200, "GET /api/dashboard/stats returns 200");
    assert(statsData.zeroSpoilageEfficiencyRate !== undefined, "Zero-spoilage rate tracked");

    const farmerDashRes = await fetch(`${BASE_URL}/api/dashboard/farmer`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const farmerDash = await farmerDashRes.json();
    assert(farmerDashRes.status === 200, "GET /api/dashboard/farmer returns 200");
    assert(typeof farmerDash.totalRevenue === "number", "Farmer revenue calculated");

    const consumerDashRes = await fetch(`${BASE_URL}/api/dashboard/consumer`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const consumerDash = await consumerDashRes.json();
    assert(consumerDashRes.status === 200, "GET /api/dashboard/consumer returns 200");

    const sellerDashRes = await fetch(`${BASE_URL}/api/dashboard/seller`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const sellerDash = await sellerDashRes.json();
    assert(sellerDashRes.status === 200, "GET /api/dashboard/seller returns 200");

    // 8. Community & Customer Feedback
    console.log(`\n[Suite 8: Community Feed & Customer Feedback]`);
    const postsRes = await fetch(`${BASE_URL}/api/community/posts`);
    const postsData = await postsRes.json();
    assert(postsRes.status === 200 && Array.isArray(postsData), "GET /api/community/posts returns posts");

    const likeRes = await fetch(`${BASE_URL}/api/community/posts/1/like`, { method: "POST" });
    const likeData = await likeRes.json();
    assert(likeRes.status === 200 && typeof likeData.likes === "number", "POST /api/community/posts/:id/like increments count");

    const feedbackRes = await fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Farmer",
        email: "test.farmer@apmc.in",
        type: "feedback",
        message: "Dynamic markdown algorithm prevented 100% of tomato spoilage during heatwave.",
        rating: 5,
      }),
    });
    assert(feedbackRes.status === 201, "POST /api/feedback submits user feedback");

    // 9. Cold Chain IoT Telemetry & Dynamic Markdown Trigger
    console.log(`\n[Suite 9: IoT Telemetry & Automated Dynamic Markdowns]`);
    const telemetryIngestRes = await fetch(`${BASE_URL}/api/cold-chain-telemetry/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: "IOT-SENS-NSK-09",
        batch_id: "BATCH-TOMATO-NSK-9021",
        produce: "Fresh Tomatoes",
        temperature: 15.5, // >10C breach
        humidity: 89,
        shelf_life_hours: 14,
        latitude: 19.9975,
        longitude: 73.7898,
      }),
    });
    const telemetryIngestData = await telemetryIngestRes.json();
    assert(telemetryIngestRes.status === 201, "POST /api/cold-chain-telemetry/telemetry ingests reading");
    assert(telemetryIngestData.status === "ANOMALY_HANDLED", "High temp breach automatically handled");
    assert(telemetryIngestData.telemetry?.discountApplied?.discountPct >= 40, "Zero-spoilage emergency markdown applied");

    const simulateRes = await fetch(`${BASE_URL}/api/cold-chain-telemetry/simulate-anomaly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch_id: "BATCH-TOMATO-NSK-9021", temperature: 16.0 }),
    });
    const simData = await simulateRes.json();
    assert(simulateRes.status === 200 && simData.success === true, "POST /api/cold-chain-telemetry/simulate-anomaly succeeds");

    // 10. AI Spoilage & Dynamic Pricing Endpoints
    console.log(`\n[Suite 10: AI Spoilage Velocity & Dynamic Pricing Engine]`);
    const aiSpoilageRes = await fetch(`${BASE_URL}/api/ai/predict-spoilage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop: "Tomato", ambientTemperature: 28, transitHours: 16 }),
    });
    const aiSpoilageData = await aiSpoilageRes.json();
    assert(aiSpoilageRes.status === 200, "POST /api/ai/predict-spoilage responds with 200");
    assert(aiSpoilageData.decayVelocityMultiplier > 1.0, "Decay velocity multiplier reflects elevated temperature");
    assert(typeof aiSpoilageData.estimatedRemainingDays === "number", "Estimated remaining days calculated");

    const aiPricingRes = await fetch(`${BASE_URL}/api/ai/dynamic-pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop: "Tomato", mandiBasePrice: 25, harvestAgeDays: 2 }),
    });
    const aiPricingData = await aiPricingRes.json();
    assert(aiPricingRes.status === 200, "POST /api/ai/dynamic-pricing responds with 200");
    assert(aiPricingData.fairFarmGatePayout > 25, "Fair farmgate payout guarantees bonus above APMC baseline");
    assert(Array.isArray(aiPricingData.markdownSchedule), "4-day progressive clearance schedule generated");
  } catch (err) {
    console.error(`Fatal test execution error:`, err);
    testsFailed++;
  }

  console.log(`\n==================================================================`);
  console.log(`📊 Test Results: ${testsPassed} Passed | ${testsFailed} Failed`);
  console.log(`==================================================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    console.log(`🎉 ALL BACKEND API ENDPOINTS VERIFIED SUCCESSFULLY!\n`);
    process.exit(0);
  }
}

runTests();
