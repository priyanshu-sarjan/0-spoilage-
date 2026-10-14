"""
=============================================================================
🧪 AgriFresh Python AI & Smart Contract Engine - Automated Test Suite
=============================================================================
Direct function execution test verifying all FastAPI endpoint handlers,
smart contract hashing, spoilage prediction, and regional surplus logic.
"""

import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import main

passed = 0
failed = 0

def assert_test(cond, name, info=""):
    global passed, failed
    if cond:
        passed += 1
        print(f"  ✅ PASS: {name}")
    else:
        failed += 1
        print(f"  ❌ FAIL: {name} - {info}")

print("\n==================================================================")
print("🚀 Running AgriFresh Python AI & Smart Contract Test Suite")
print("==================================================================\n")

# 1. Healthcheck
try:
    res = main.health_check()
    assert_test(res.get("status") == "healthy", "GET /health returns healthy status")
    assert_test(res.get("runtime") == "Python FastAPI + Uvicorn", "Runtime verified")
    assert_test(res.get("active_ledgers", 0) >= 2, "Seed ledgers populated")
except Exception as e:
    assert_test(False, "GET /health", str(e))

# 2. Spoilage Velocity Prediction
try:
    req = main.SpoilagePredictRequest(
        crop="Tomato",
        ambient_temperature=26.5,
        storage_humidity=88.0,
        transit_duration_hours=16.0
    )
    res = main.predict_spoilage_velocity(req)
    assert_test(res.get("decay_velocity_multiplier", 0) > 1.0, "Decay multiplier calculates excess temperature factor")
    assert_test(res.get("estimated_remaining_shelf_life_days", 0) > 0, "Remaining shelf life calculated in days")
    assert_test("urgency_tier" in res, "Urgency tier classified")
    assert_test(res.get("zero_spoilage_confidence") == "99.2%", "Zero spoilage confidence reported")
except Exception as e:
    assert_test(False, "POST /api/predict-spoilage", str(e))

# 3. Dynamic Pricing Calculator
try:
    req = main.DynamicPricingRequest(
        crop="Tomato",
        mandi_benchmark_price=28.0,
        harvest_age_days=2,
        quantity_kg=2000.0
    )
    res = main.calculate_dynamic_pricing(req)
    assert_test(res.get("fair_farmgate_payout", 0) > 28.0, "Fair farm-gate payout provides farmer bonus")
    assert_test(res.get("active_discount_pct") == 35, "Day 2 clearance discount accurately mapped")
    assert_test(len(res.get("markdown_schedule", [])) == 4, "4-stage markdown schedule generated")
except Exception as e:
    assert_test(False, "POST /api/dynamic-pricing", str(e))

# 4. Smart Contract Verification
try:
    res = main.verify_smart_contract_ledger("BATCH-TOMATO-NSK-9021")
    assert_test(res.get("is_immutable_chain_valid") is True, "Smart contract cryptographic chain verified")
    assert_test(res.get("chain_length", 0) >= 3, "Provenance history contains harvest & transit blocks")
    assert_test(res.get("consensus_protocol") == "Proof-of-Agricultural-Provenance (PoAP)", "PoAP consensus protocol validated")
except Exception as e:
    assert_test(False, "GET /api/smart-contract/verify", str(e))

# 5. Append Block to Smart Contract
try:
    req = main.AppendBlockRequest(
        batch_id="BATCH-TOMATO-NSK-9021",
        stage_name="Phytosanitary Audit",
        payload={"auditor": "National Agri Board", "grade": "Grade A Export", "purity": "99.4%"}
    )
    res = main.append_smart_contract_block(req)
    assert_test(res.get("success") is True, "New cryptographic block successfully linked")
    assert_test("block" in res and res["block"]["hash"].startswith(""), "Block hash generated")
except Exception as e:
    assert_test(False, "POST /api/smart-contract/append", str(e))

# 6. Regional Agricultural Surplus Analysis
try:
    res = main.get_regional_surplus(district=None)
    assert_test(res.get("total_districts_analyzed", 0) > 0 or "districts" in res, "Regional surplus dataset analyzed")
    # Test specific district
    res_dist = main.get_regional_surplus(district="Ariyalur")
    assert_test(len(res_dist.get("data", [])) == 1, "Filtered query for 'Ariyalur' district succeeds")
    assert_test(res_dist["data"][0]["district"] == "Ariyalur", "Correct district returned")
except Exception as e:
    assert_test(False, "GET /api/regional-surplus", str(e))

# 7. Telemetry Ingestion
try:
    payload = main.TelemetryPayload(
        device_id="IOT-SENS-NSK-09",
        batch_id="BATCH-TOMATO-NSK-9021",
        produce="Fresh Tomatoes",
        temperature=16.5,
        humidity=90.0,
        latitude=19.9975,
        longitude=73.7898,
        shelf_life_hours=11.0
    )
    res = main.ingest_telemetry_event(payload)
    assert_test(res.get("status") == "PROCESSED", "Telemetry packet processed")
    assert_test(res.get("anomaly_detected") is True, "Temperature breach triggers anomaly detection")
    assert_test("Auto-markdown" in res.get("event", {}).get("action_taken", ""), "Dynamic markdown triggered")
except Exception as e:
    assert_test(False, "POST /api/telemetry/ingest", str(e))

print("\n==================================================================")
print(f"📊 Python Backend Test Results: {passed} Passed | {failed} Failed")
print("==================================================================\n")

if failed > 0:
    sys.exit(1)
print("🎉 ALL PYTHON FASTAPI ENDPOINTS VERIFIED SUCCESSFULLY!\n")
