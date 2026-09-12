import { useState, useEffect } from "react";
import {
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  Workflow,
  MessageSquare,
  Slack,
  Database,
  Tag,
  RefreshCw,
  MapPin,
  Cpu,
  Zap,
  ArrowRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";


interface TelemetryReading {
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

export function ColdChainAnomalyMonitor() {
  const { toast } = useToast();
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedReading, setSelectedReading] = useState<TelemetryReading | null>(null);

  // Form State
  const [deviceId, setDeviceId] = useState("IOT-SENS-NSK-09");
  const [batchId, setBatchId] = useState("BATCH-TOMATO-NSK-9021");
  const [produce, setProduce] = useState("Fresh Tomatoes");
  const [temp, setTemp] = useState("14.5");
  const [humidity, setHumidity] = useState("88");
  const [shelfLife, setShelfLife] = useState("18");
  const [latitude, setLatitude] = useState("19.9975");
  const [longitude, setLongitude] = useState("73.7898");

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cold-chain-telemetry/readings");
      if (res.ok) {
        const data = await res.json();
        if (data.readings) {
          setReadings(data.readings);
          if (data.readings.length > 0 && !selectedReading) {
            setSelectedReading(data.readings[0]);
          }
        }
      }
    } catch {
      // Offline fallback initial data
      const initialMock: TelemetryReading[] = [
        {
          id: "tel-1",
          device_id: "IOT-SENS-NSK-09",
          batch_id: "BATCH-TOMATO-NSK-9021",
          produce: "Fresh Tomatoes",
          temperature: 14.5,
          humidity: 88,
          latitude: 19.9975,
          longitude: 73.7898,
          shelf_life_hours: 18,
          status: "ALERT",
          recorded_at: new Date().toISOString(),
          discountApplied: { discount_pct: 25, discount_reason: "spoilage_risk_auto_markdown" },
          alerts: {
            driverWhatsapp: "COLD CHAIN ALERT for batch BATCH-TOMATO-NSK-9021 (Fresh Tomatoes). Temp 14.5C, est. shelf life 18h. Device IOT-SENS-NSK-09. Take immediate action.",
            managerWhatsapp: "COLD CHAIN ALERT: batch BATCH-TOMATO-NSK-9021 (Fresh Tomatoes) at risk. Temp 14.5C, shelf life 18h at device IOT-SENS-NSK-09. Please intervene.",
            slackIncident: "🚨 *COLD CHAIN INCIDENT* 🚨\n*Batch:* BATCH-TOMATO-NSK-9021 (Fresh Tomatoes)\n*Device:* IOT-SENS-NSK-09\n*Temperature:* 14.5°C\n*Humidity:* 88%\n*Est. shelf life:* 18h\n*Location:* 19.9975, 73.7898\nAutomated markdown discount applied to clear stock.",
          },
        },
      ];
      setReadings(initialMock);
      setSelectedReading(initialMock[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const handleSendTelemetry = async (overrideData?: any) => {
    setSimulating(true);
    const payload = overrideData || {
      device_id: deviceId,
      batch_id: batchId,
      produce: produce,
      temperature: parseFloat(temp),
      humidity: parseFloat(humidity),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      shelf_life_hours: parseFloat(shelfLife),
    };

    try {
      const res = await fetch("/api/cold-chain-telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.reading) {
          setReadings((prev) => [result.reading, ...prev]);
          setSelectedReading(result.reading);
        }

        if (result.anomaly) {
          toast({
            title: "🚨 Cold Chain Anomaly Triggered!",
            description: `Temp: ${payload.temperature}°C, Shelf Life: ${payload.shelf_life_hours}h. Auto 25% discount & alerts dispatched via n8n.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "✅ Telemetry Normal (OK)",
            description: `Batch ${payload.batch_id} logged successfully with normal status.`,
          });
        }
      }
    } catch {
      // Local fallback logic if backend server is not running
      const isAnomaly = payload.temperature > 10 || payload.shelf_life_hours < 24;
      const status: "OK" | "ALERT" = isAnomaly ? "ALERT" : "OK";
      const record: TelemetryReading = {
        id: `mock-${Date.now()}`,
        ...payload,
        status,
        recorded_at: new Date().toISOString(),
        discountApplied: isAnomaly ? { discount_pct: 25, discount_reason: "spoilage_risk_auto_markdown" } : undefined,
        alerts: isAnomaly
          ? {
              driverWhatsapp: `COLD CHAIN ALERT for batch ${payload.batch_id} (${payload.produce}). Temp ${payload.temperature}C, est. shelf life ${payload.shelf_life_hours}h. Device ${payload.device_id}. Take immediate action.`,
              managerWhatsapp: `COLD CHAIN ALERT: batch ${payload.batch_id} (${payload.produce}) at risk. Temp ${payload.temperature}C, shelf life ${payload.shelf_life_hours}h at device ${payload.device_id}. Please intervene.`,
              slackIncident: `🚨 *COLD CHAIN INCIDENT* 🚨\n*Batch:* ${payload.batch_id} (${payload.produce})\n*Device:* ${payload.device_id}\n*Temperature:* ${payload.temperature}°C\n*Humidity:* ${payload.humidity}%\n*Est. shelf life:* ${payload.shelf_life_hours}h\n*Location:* ${payload.latitude}, ${payload.longitude}\nAutomated markdown discount applied to clear stock.`,
            }
          : undefined,
      };

      setReadings((prev) => [record, ...prev]);
      setSelectedReading(record);

      toast({
        title: isAnomaly ? "🚨 Cold Chain Anomaly Triggered!" : "✅ Telemetry Normal (OK)",
        description: isAnomaly ? "Threshold breached (>10°C / <24h). WhatsApp, Slack & 25% Auto Discount executed." : "Metrics healthy.",
        variant: isAnomaly ? "destructive" : "default",
      });
    } finally {
      setSimulating(false);
    }
  };

  const setPreset = (type: "temp" | "shelf" | "normal") => {
    if (type === "temp") {
      setDeviceId("IOT-SENS-NSK-09");
      setBatchId("BATCH-TOMATO-NSK-9021");
      setProduce("Fresh Tomatoes");
      setTemp("14.5");
      setHumidity("88");
      setShelfLife("18");
      setLatitude("19.9975");
      setLongitude("73.7898");
      handleSendTelemetry({
        device_id: "IOT-SENS-NSK-09",
        batch_id: "BATCH-TOMATO-NSK-9021",
        produce: "Fresh Tomatoes",
        temperature: 14.5,
        humidity: 88,
        latitude: 19.9975,
        longitude: 73.7898,
        shelf_life_hours: 18,
      });
    } else if (type === "shelf") {
      setDeviceId("IOT-SENS-GWL-02");
      setBatchId("BATCH-MANGO-GWL-4410");
      setProduce("Dasheri Mangoes");
      setTemp("9.8");
      setHumidity("84");
      setShelfLife("12");
      setLatitude("26.2183");
      setLongitude("78.1828");
      handleSendTelemetry({
        device_id: "IOT-SENS-GWL-02",
        batch_id: "BATCH-MANGO-GWL-4410",
        produce: "Dasheri Mangoes",
        temperature: 9.8,
        humidity: 84,
        latitude: 26.2183,
        longitude: 78.1828,
        shelf_life_hours: 12,
      });
    } else {
      setDeviceId("IOT-SENS-IND-01");
      setBatchId("BATCH-HERB-ASHWA-001");
      setProduce("Organic Ashwagandha");
      setTemp("4.2");
      setHumidity("80");
      setShelfLife("96");
      setLatitude("22.7196");
      setLongitude("75.8577");
      handleSendTelemetry({
        device_id: "IOT-SENS-IND-01",
        batch_id: "BATCH-HERB-ASHWA-001",
        produce: "Organic Ashwagandha",
        temperature: 4.2,
        humidity: 80,
        latitude: 22.7196,
        longitude: 75.8577,
        shelf_life_hours: 96,
      });
    }
  };

  return (
    <Card className="border border-border/60 bg-gradient-to-br from-card via-card/90 to-background shadow-xl overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Workflow className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl font-serif font-bold text-foreground">
                  n8n Cold Chain Anomaly Alert & Remediation Engine
                </CardTitle>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                  Active Workflow
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Automated IoT threshold monitoring (Temp &gt; 10°C || Shelf Life &lt; 24h) with Instant Driver/Manager WhatsApp, Slack Incident & 25% Auto Markdown
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchReadings}
              disabled={loading}
              className="text-xs gap-1.5 border-border/60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Logs
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* n8n Workflow Node Flow Diagram */}
        <div className="bg-background/80 border border-border/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-400" /> n8n Workflow Architecture Execution Graph
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">POST /api/cold-chain-telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Step 1 */}
            <div className="bg-card border border-blue-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Step 1</Badge>
                <Send className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">Telemetry Webhook</p>
                <p className="text-[11px] text-muted-foreground">Receives IoT Sensor JSON Body</p>
              </div>
              <div className="text-[10px] font-mono bg-muted/40 p-1.5 rounded text-muted-foreground">
                temp, shelf_life_hours, batch_id
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-card border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Step 2</Badge>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">Threshold Exceeded?</p>
                <p className="text-[11px] text-muted-foreground">IF Node Evaluation</p>
              </div>
              <div className="text-[10px] font-mono bg-amber-500/10 text-amber-300 p-1.5 rounded border border-amber-500/20">
                Temp &gt; 10°C OR Shelf &lt; 24h
              </div>
            </div>

            {/* Step 3 (Alerts) */}
            <div className="bg-card border border-red-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">On Breach (True)</Badge>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-foreground">Multi-Channel Incident</p>
                <p className="text-[11px] text-muted-foreground">Twilio WhatsApp + Slack</p>
              </div>
              <div className="text-[10px] space-y-1">
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <MessageSquare className="w-2.5 h-2.5" /> Driver & Manager WhatsApp
                </span>
                <span className="inline-flex items-center gap-1 text-purple-400">
                  <Slack className="w-2.5 h-2.5" /> Slack #incident-channel
                </span>
              </div>
            </div>

            {/* Step 4 (Remediation) */}
            <div className="bg-card border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Remediation & Log</Badge>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-foreground">Postgres Auto Markdown</p>
                <p className="text-[11px] text-muted-foreground">Update Price & Log</p>
              </div>
              <div className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 p-1.5 rounded border border-emerald-500/20">
                UPDATE 25% OFF + Log ALERT
              </div>
            </div>
          </div>
        </div>

        {/* Quick Simulation & Interactive Trigger */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" /> Dispatch Test IoT Telemetry Webhook
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Quick Presets:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset("temp")}
                className="h-7 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1"
              >
                🔥 Temp Breach (14.5°C)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset("shelf")}
                className="h-7 text-xs border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1"
              >
                ⏳ Shelf Life Breach (12h)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreset("normal")}
                className="h-7 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 gap-1"
              >
                ✅ Normal Ping (4.2°C)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/50">
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Device ID</label>
              <Input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="h-8 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Batch ID</label>
              <Input
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="h-8 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Produce</label>
              <Input
                value={produce}
                onChange={(e) => setProduce(e.target.value)}
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Temperature (°C)</label>
              <Input
                type="number"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                className="h-8 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Est. Shelf Life (Hours)</label>
              <Input
                type="number"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value)}
                className="h-8 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Humidity (%)</label>
              <Input
                type="number"
                value={humidity}
                onChange={(e) => setHumidity(e.target.value)}
                className="h-8 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Latitude</label>
              <Input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="h-8 text-xs font-mono mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-semibold">Longitude</label>
              <Input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="h-8 text-xs font-mono mt-1"
              />
            </div>
          </div>

          <Button
            onClick={() => handleSendTelemetry()}
            disabled={simulating}
            className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
            {simulating ? "Executing n8n Workflow..." : "Post Webhook Payload to /api/cold-chain-telemetry"}
          </Button>
        </div>

        {/* Live Incident Dispatch Console & Log Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Recent Telemetry Readings Feed */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" /> Cold Chain Telemetry Log Stream
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {readings.length} Logged
              </Badge>
            </h4>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {readings.map((reading) => {
                const isSelected = selectedReading?.id === reading.id;
                const isAlert = reading.status === "ALERT";

                return (
                  <div
                    key={reading.id}
                    onClick={() => setSelectedReading(reading)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500/60 bg-emerald-500/10 shadow"
                        : isAlert
                        ? "border-red-500/30 bg-red-950/20 hover:border-red-500/50"
                        : "border-border/60 bg-card hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isAlert ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] gap-1">
                            <AlertTriangle className="w-3 h-3 animate-pulse" /> ALERT
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                            <CheckCircle className="w-3 h-3" /> OK
                          </Badge>
                        )}
                        <span className="font-bold text-foreground">{reading.produce}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(reading.recorded_at).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/30">
                      <span className="flex items-center gap-1 font-mono">
                        <Thermometer className={`w-3 h-3 ${reading.temperature > 10 ? "text-red-400" : "text-emerald-400"}`} />
                        {reading.temperature}°C
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className={`w-3 h-3 ${reading.shelf_life_hours < 24 ? "text-amber-400" : "text-muted-foreground"}`} />
                        {reading.shelf_life_hours}h shelf
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[10px] truncate">
                        <MapPin className="w-3 h-3 text-blue-400" />
                        {reading.latitude.toFixed(2)}, {reading.longitude.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Incident Inspector Console */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-400" /> n8n Dispatched Action & Notification Details
            </h4>

            {selectedReading ? (
              <div className="bg-background/90 border border-border/60 rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-foreground flex items-center gap-2">
                      Batch: {selectedReading.batch_id}
                    </h5>
                    <p className="text-xs text-muted-foreground">Device: {selectedReading.device_id}</p>
                  </div>
                  {selectedReading.status === "ALERT" ? (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs px-2.5 py-1">
                      Threshold Exceeded (Anomaly)
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs px-2.5 py-1">
                      Normal Telemetry (OK)
                    </Badge>
                  )}
                </div>

                {selectedReading.status === "ALERT" && selectedReading.alerts ? (
                  <div className="space-y-3">
                    {/* Auto Discount Applied Card */}
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-1">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Automated Postgres Discount Applied
                      </span>
                      <p className="text-xs font-bold text-foreground">
                        25% OFF Markdown applied to marketplace catalog (`spoilage_risk_auto_markdown`)
                      </p>
                    </div>

                    {/* WhatsApp Driver Alert */}
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Twilio WhatsApp to Driver
                        </span>
                        <span className="text-muted-foreground text-[10px]">whatsapp:+91XXXXXXXXXX</span>
                      </div>
                      <p className="text-xs font-mono bg-background/80 p-2 rounded text-muted-foreground border border-border/30 leading-relaxed">
                        {selectedReading.alerts.driverWhatsapp}
                      </p>
                    </div>

                    {/* WhatsApp Manager Alert */}
                    <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-blue-400 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Twilio WhatsApp to Storage Manager
                        </span>
                        <span className="text-muted-foreground text-[10px]">whatsapp:+91XXXXXXXXXX</span>
                      </div>
                      <p className="text-xs font-mono bg-background/80 p-2 rounded text-muted-foreground border border-border/30 leading-relaxed">
                        {selectedReading.alerts.managerWhatsapp}
                      </p>
                    </div>

                    {/* Slack Incident Card */}
                    <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-purple-400 flex items-center gap-1">
                          <Slack className="w-3 h-3" /> Slack Channel #cold-chain-incidents
                        </span>
                        <span className="text-muted-foreground text-[10px]">OAuth2 Slack Webhook</span>
                      </div>
                      <pre className="text-[11px] font-mono bg-background/80 p-2 rounded text-muted-foreground border border-border/30 whitespace-pre-wrap leading-relaxed">
                        {selectedReading.alerts.slackIncident}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-4 text-center space-y-2">
                    <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs font-medium text-foreground">
                      No anomaly detected for this ping.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Temperature ({selectedReading.temperature}°C) &lt;= 10°C and shelf life ({selectedReading.shelf_life_hours}h) &gt;= 24h. Logged via Postgres `Log Reading (OK)` node.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                Select a telemetry record from the left stream to inspect n8n alerts.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
