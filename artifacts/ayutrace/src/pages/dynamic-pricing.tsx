import { useState } from "react";
import { calculateDynamicPricing, DynamicPricingResult } from "@/lib/gemini-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingDown,
  Sparkles,
  IndianRupee,
  Clock,
  Thermometer,
  Percent,
  ShieldAlert,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Info,
  DollarSign,
  TrendingUp,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function DynamicPricingPage() {
  const [, setLocation] = useLocation();
  const [mandiPrice, setMandiPrice] = useState<number>(30);
  const [transitHours, setTransitHours] = useState<number>(24);
  const [tempC, setTempC] = useState<number>(28);
  const [humidity, setHumidity] = useState<number>(75);
  const [demandIndex, setDemandIndex] = useState<string>("High Urban Demand");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DynamicPricingResult | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await calculateDynamicPricing(mandiPrice, transitHours, tempC, humidity, demandIndex);
      setResult(res);
      toast.success("Gemini Dynamic Pricing Matrix Calculated!");
    } catch (err) {
      toast.error("Failed to calculate dynamic pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-500/30 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <TrendingDown className="w-80 h-80 text-emerald-400" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gemini Structured Pricing Reasoning
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Dynamic Pricing & 0-Spoilage Markdown Engine 📈⚡
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Multi-parameter AI pricing matrix. Ingests wholesale Mandi benchmarks, elapsed harvest hours, cold chain storage temperature/humidity, and local demand trends to ensure fair farm-gate payouts for growers and auto-schedules progressive consumer discounts before produce spoils.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Parameter Sliders */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/90 border-emerald-500/30 shadow-xl">
            <CardHeader className="bg-emerald-950/40 border-b border-border/40 pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Multi-Parameter Inputs
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40">
                  Real-time Parameters
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Mandi Benchmark Price */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-amber-400" /> Mandi Benchmark Rate:
                  </span>
                  <span className="text-amber-300 font-mono font-bold">₹{mandiPrice}/kg</span>
                </div>
                <Slider
                  value={[mandiPrice]}
                  min={10}
                  max={150}
                  step={1}
                  onValueChange={(val) => setMandiPrice(val[0])}
                  className="py-1"
                />
              </div>

              {/* Time since harvest */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" /> Elapsed Harvest Time:
                  </span>
                  <span className="text-teal-300 font-mono font-bold">{transitHours} Hours</span>
                </div>
                <Slider
                  value={[transitHours]}
                  min={2}
                  max={96}
                  step={2}
                  onValueChange={(val) => setTransitHours(val[0])}
                  className="py-1"
                />
              </div>

              {/* Storage Temp */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Storage Temperature:
                  </span>
                  <span className={`font-mono font-bold ${tempC > 30 ? "text-red-400" : "text-emerald-400"}`}>
                    {tempC}°C
                  </span>
                </div>
                <Slider
                  value={[tempC]}
                  min={4}
                  max={40}
                  step={1}
                  onValueChange={(val) => setTempC(val[0])}
                  className="py-1"
                />
              </div>

              {/* Relative Humidity */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-emerald-400" /> Relative Humidity:
                  </span>
                  <span className="text-emerald-300 font-mono font-bold">{humidity}% RH</span>
                </div>
                <Slider
                  value={[humidity]}
                  min={30}
                  max={95}
                  step={5}
                  onValueChange={(val) => setHumidity(val[0])}
                  className="py-1"
                />
              </div>

              {/* Regional Demand Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Regional Demand Trend:</label>
                <select
                  value={demandIndex}
                  onChange={(e) => setDemandIndex(e.target.value)}
                  className="w-full bg-background/80 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-foreground focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="High Urban Demand">High Urban Demand (Metro Surge)</option>
                  <option value="Moderate Demand">Moderate Steady Demand</option>
                  <option value="Local Surplus">Local Harvest Surplus (High Supply)</option>
                </select>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Calculating Gemini Pricing Rationale...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Run Gemini Dynamic Pricing Engine
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Output Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <Card className="bg-card/60 border-dashed border-emerald-500/30 p-12 text-center flex flex-col items-center justify-center min-h-[460px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingDown className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Awaiting Pricing Parameters</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Adjust Mandi price, harvest hours, and storage temperature, then click "Run Gemini Dynamic Pricing Engine" to generate fair farm-gate payouts and auto-scheduled markdown discounts.
              </p>
            </Card>
          )}

          {loading && (
            <Card className="bg-card/90 border-emerald-500/40 p-12 text-center flex flex-col items-center justify-center min-h-[460px] space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Zap className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Gemini Pricing Optimization</h3>
                <p className="text-xs text-emerald-300 font-mono">
                  Calculating farm-gate grower profit, transit decay curve, and consumer markdown schedule...
                </p>
              </div>
            </Card>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Primary Pricing Cards */}
              <Card className="bg-gradient-to-br from-card/95 to-emerald-950/50 border-emerald-500/40 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-1">
                        AI Dynamic Rate Matrix
                      </Badge>
                      <CardTitle className="text-xl font-bold font-serif text-foreground">
                        0-Spoilage Price Allocation
                      </CardTitle>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1">
                      {result.wasteEliminationEstimate}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Price Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-2xl border border-amber-500/30 space-y-1">
                      <span className="text-xs text-muted-foreground font-medium block">
                        Traditional Mandi Rate
                      </span>
                      <span className="text-xl font-bold text-muted-foreground font-mono block line-through">
                        ₹{result.mandiBenchmarkRate}/kg
                      </span>
                      <span className="text-[10px] text-muted-foreground">Standard Wholesale</span>
                    </div>

                    <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-500/40 space-y-1 shadow-md">
                      <span className="text-xs text-emerald-300 font-medium block flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Fair Farm-Gate Payout
                      </span>
                      <span className="text-2xl font-bold text-emerald-300 font-mono block">
                        ₹{result.recommendedFarmGatePrice}/kg
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">+15% Higher for Grower</span>
                    </div>

                    <div className="bg-teal-950/60 p-4 rounded-2xl border border-teal-500/40 space-y-1 shadow-md">
                      <span className="text-xs text-teal-300 font-medium block">
                        Target Retail Price
                      </span>
                      <span className="text-2xl font-bold text-white font-mono block">
                        ₹{result.recommendedConsumerPrice}/kg
                      </span>
                      <span className="text-[10px] text-teal-300">Base Day-0 Consumer Rate</span>
                    </div>
                  </div>

                  {/* Spoilage Risk Score Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Spoilage Risk Decay Index:
                      </span>
                      <span className={`font-mono font-bold ${result.spoilageRiskScore > 60 ? "text-red-400" : "text-emerald-400"}`}>
                        {result.spoilageRiskScore}/100 Risk Score
                      </span>
                    </div>
                    <Progress value={result.spoilageRiskScore} className="h-3 bg-muted/60" />
                  </div>

                  {/* Progressive Markdown Discount Schedule */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Auto-Scheduled 0-Spoilage Consumer Markdowns:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.markdownSchedule.map((item) => (
                        <div
                          key={item.dayOffset}
                          className="bg-muted/40 p-3.5 rounded-xl border border-emerald-500/20 flex items-center justify-between"
                        >
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              Day {item.dayOffset} {item.dayOffset === 0 ? "(Fresh Arrival)" : item.dayOffset === 3 ? "(Flash Clearance)" : ""}
                            </span>
                            <span className="text-[11px] text-muted-foreground">{item.targetSegment}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-400 font-mono block">
                              ₹{item.discountedPrice}/kg
                            </span>
                            {item.discountPercent > 0 ? (
                              <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">
                                {item.discountPercent}% OFF
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-300 font-semibold">Full Price</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Reasoning Rationale */}
                  <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/20 space-y-1 text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Gemini Reasoning Rationale:
                    </span>
                    <p className="text-emerald-100/90 leading-relaxed text-[11px]">
                      {result.aiRationale}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button
                      onClick={() => setLocation("/traceability")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 flex-1"
                    >
                      View Farm Traceability Story <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => setLocation("/products")}
                      variant="outline"
                      className="text-xs font-semibold gap-1.5"
                    >
                      Publish to Marketplace Catalog
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
