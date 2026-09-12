import { useState, useEffect } from "react";
import { generateHarvestStory, HarvestStoryResult } from "@/lib/gemini-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  QrCode,
  Sparkles,
  Search,
  User,
  MapPin,
  Calendar,
  Utensils,
  Leaf,
  ShieldCheck,
  ChefHat,
  Home,
  RefreshCw,
  ArrowRight,
  Award
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const PRESET_BATCHES = [
  {
    batchId: "AGRI-TOM-9021",
    crop: "Vine-Ripened Red Tomatoes",
    farmer: "Ramesh Patil",
    location: "Nashik Valley Eco-Farm",
    harvestDate: "Yesterday, 6:00 AM",
  },
  {
    batchId: "AGRI-APP-3310",
    crop: "Shimla Royal Apples",
    farmer: "Suresh Sharma",
    location: "Kinnaur Orchard Estate",
    harvestDate: "2 Days Ago",
  },
  {
    batchId: "AGRI-MAN-4412",
    crop: "Alphonso Mangoes",
    farmer: "Ganesh Kamble",
    location: "Ratnagiri Coastal Groves",
    harvestDate: "Yesterday Evening",
  },
];

export default function TraceabilityPage() {
  const [, setLocation] = useLocation();
  const [batchInput, setBatchInput] = useState<string>("AGRI-TOM-9021");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HarvestStoryResult | null>(null);

  const handleTrace = async (targetBatch?: string) => {
    const bId = targetBatch || batchInput;
    if (!bId.trim()) {
      toast.error("Please enter a valid Batch ID or scan QR code");
      return;
    }

    setLoading(true);
    try {
      const match = PRESET_BATCHES.find((p) => p.batchId === bId.toUpperCase()) || PRESET_BATCHES[0];
      const res = await generateHarvestStory(bId.toUpperCase(), match.farmer, match.location, match.harvestDate);
      setResult(res);
      toast.success("Gemini Farm-to-Fork Origin Story Generated!");
    } catch (err) {
      toast.error("Failed to generate harvest story");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleTrace("AGRI-TOM-9021");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-500/30 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <QrCode className="w-80 h-80 text-emerald-400" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gemini Generative Storyteller API
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Farm-to-Fork Traceability & Harvest Storyteller 📜🔍
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Consumers scan QR code or enter Batch ID. Gemini ingests soil health metrics, harvest timestamps, and eco-farming certifications to craft an interactive origin story, nutritional scorecard, chef recipe pairing, and household storage tips.
          </p>
        </div>
      </div>

      {/* QR & Batch Lookup Bar */}
      <Card className="bg-card/90 border-emerald-500/30 shadow-xl">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <QrCode className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <Input
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                placeholder="Scan QR or enter Batch ID (e.g. AGRI-TOM-9021)..."
                className="pl-10 bg-background/80 text-xs font-mono h-11"
              />
            </div>
            <Button
              onClick={() => handleTrace()}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-11 px-6 gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting Data...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> Trace Batch Story
                </>
              )}
            </Button>
          </div>

          {/* Quick Batch Presets */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pt-1">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Sample Batches:</span>
            {PRESET_BATCHES.map((pb) => (
              <button
                key={pb.batchId}
                onClick={() => {
                  setBatchInput(pb.batchId);
                  handleTrace(pb.batchId);
                }}
                className={`text-[11px] px-3 py-1 rounded-lg border transition-all whitespace-nowrap ${
                  batchInput.toUpperCase() === pb.batchId
                    ? "bg-emerald-600 text-white border-emerald-400 font-bold"
                    : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted"
                }`}
              >
                🏷️ {pb.batchId} ({pb.crop})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Output Dashboard */}
      {result && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Left Column: Origin Story & Farmer Card */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-gradient-to-br from-card/95 to-emerald-950/50 border-emerald-500/40 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-1">
                      100% Verified Farm Origin
                    </Badge>
                    <CardTitle className="text-xl font-bold font-serif text-foreground">
                      Batch #{result.batchId} Origin Story
                    </CardTitle>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Pesticide Free
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Story Paragraphs */}
                <div className="prose prose-invert max-w-none text-xs text-emerald-100/90 leading-relaxed space-y-3 font-sans">
                  {result.farmOriginStory.split("\n\n").map((para, i) => (
                    <p key={i} className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/20">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Farmer Profile Card */}
                <div className="bg-muted/50 p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      {result.farmerProfile.name}
                      <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40">
                        {result.farmerProfile.experienceYears} Yrs Experience
                      </Badge>
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-400" /> {result.farmerProfile.location}
                    </p>
                  </div>
                </div>

                {/* Soil Health Summary */}
                <div className="bg-muted/40 p-4 rounded-2xl border border-emerald-500/20 space-y-1">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5" /> Soil Health & Sustainability Certification:
                  </span>
                  <p className="text-xs text-muted-foreground">{result.soilHealthSummary}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Nutrition, Chef Recipes & Storage Tips */}
          <div className="lg:col-span-5 space-y-6">
            {/* Nutrient Card */}
            <Card className="bg-card/90 border-emerald-500/30 shadow-xl">
              <CardHeader className="bg-emerald-950/40 border-b border-border/40 pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" /> Nutritional Scorecard
                  </span>
                  <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">
                    {result.nutrientCard.antioxidantsScore}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center bg-muted/40 p-3 rounded-xl">
                  <span className="text-xs text-muted-foreground font-semibold">Energy:</span>
                  <span className="text-xs font-bold text-foreground font-mono">{result.nutrientCard.calories}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Vitamins & Minerals:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.nutrientCard.vitamins.concat(result.nutrientCard.minerals).map((item, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chef Recipe Pairings */}
            <Card className="bg-card/90 border-emerald-500/30 shadow-xl">
              <CardHeader className="bg-emerald-950/40 border-b border-border/40 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-emerald-400" /> AI Chef Recipe Pairings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {result.chefRecipePairings.map((recipe, idx) => (
                  <div key={idx} className="bg-muted/40 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{recipe.title}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{recipe.prepTime}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{recipe.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Kitchen Storage Tips */}
            <Card className="bg-card/90 border-emerald-500/30 shadow-xl">
              <CardHeader className="bg-emerald-950/40 border-b border-border/40 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Home className="w-4 h-4 text-teal-400" /> Kitchen Storage Tips (Zero Waste)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2">
                {result.householdStorageTips.map((tip, idx) => (
                  <div key={idx} className="text-xs text-emerald-100 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
