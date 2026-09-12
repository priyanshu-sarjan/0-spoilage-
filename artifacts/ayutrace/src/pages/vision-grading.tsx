import { useState } from "react";
import { gradeProduceVision, VisionGradingResult } from "@/lib/gemini-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, DialogDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Eye,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  Thermometer,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Camera,
  Apple,
  Leaf,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// Sample produce images with embedded high-quality data URLs / placeholders
const SAMPLE_PRODUCE = [
  {
    name: "Red Tomatoes",
    hint: "Fresh Red Tomatoes",
    url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60",
    gradeHint: "Grade A",
  },
  {
    name: "Shimla Apples",
    hint: "Royal Delicious Apples",
    url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60",
    gradeHint: "Grade A",
  },
  {
    name: "Alphonso Mangoes",
    hint: "Ratnagiri Alphonso Mango",
    url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=60",
    gradeHint: "Grade B",
  },
  {
    name: "Organic Spinach",
    hint: "Fresh Green Spinach Leafy",
    url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60",
    gradeHint: "Grade A",
  },
];

export default function VisionGradingPage() {
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_PRODUCE[0].url);
  const [produceHint, setProduceHint] = useState<string>("Fresh Hybrid Red Tomatoes");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionGradingResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
        setResult(null);
        setProduceHint(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await gradeProduceVision(selectedImage, "image/jpeg", produceHint);
      setResult(res);
      toast.success("Gemini Multimodal Vision Analysis Complete!");
    } catch (err) {
      toast.error("Failed to analyze produce image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-500/30 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Eye className="w-80 h-80 text-emerald-400" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gemini 1.5 Flash Vision API
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Visual Quality & Produce Ripeness Grading 📸✨
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Upload or snap a photo of harvested produce. Gemini’s computer vision grades quality (Grade A/B/C), calculates ripeness %, detects surface blemishes, estimates shelf life, and provides storage guidelines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Selector & Input */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/90 border-emerald-500/30 shadow-xl overflow-hidden">
            <CardHeader className="bg-emerald-950/40 border-b border-border/40 pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" /> Upload Produce Photo
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40">
                  Multimodal Input
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Preview Box */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-emerald-500/40 bg-muted/40 group">
                <img
                  src={selectedImage}
                  alt="Produce Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg">
                    <Upload className="w-4 h-4" /> Change Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Apple className="w-3.5 h-3.5 text-emerald-400" /> Or pick a sample harvest image:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_PRODUCE.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => {
                        setSelectedImage(sample.url);
                        setProduceHint(sample.hint);
                        setResult(null);
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === sample.url ? "border-emerald-400 ring-2 ring-emerald-500/40 scale-95" : "border-transparent opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center py-0.5 font-medium truncate px-0.5">
                        {sample.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Gemini Vision Grading in Progress...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Run Gemini AI Vision Inspection
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Gemini Result Dashboard */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <Card className="bg-card/60 border-dashed border-emerald-500/30 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Ready for Visual Quality Grading</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Click "Run Gemini AI Vision Inspection" to analyze ripeness %, detect surface scarring or mold, categorize commercial grade, and estimate shelf life.
              </p>
            </Card>
          )}

          {loading && (
            <Card className="bg-card/90 border-emerald-500/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Sparkles className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Gemini Multimodal Vision API Processing</h3>
                <p className="text-xs text-emerald-300 font-mono">
                  Evaluating RGB color spectrum, skin elasticity, stem condition, and defect density...
                </p>
              </div>
            </Card>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Primary Scorecard */}
              <Card className="bg-gradient-to-br from-card/95 to-emerald-950/40 border-emerald-500/40 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-1">
                        Inspection Verified
                      </Badge>
                      <CardTitle className="text-xl font-bold font-serif text-foreground">
                        {result.produceType}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`text-xs px-3 py-1 font-bold ${
                        result.grade.includes("Grade A")
                          ? "bg-emerald-600 text-white"
                          : result.grade.includes("Grade B")
                          ? "bg-amber-600 text-white"
                          : "bg-orange-600 text-white"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {result.grade}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Ripeness Progress Meter */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ripeness Index:
                      </span>
                      <span className="text-emerald-400 font-mono font-bold text-sm">
                        {result.ripenessPercentage}% Optimal Ripeness
                      </span>
                    </div>
                    <Progress value={result.ripenessPercentage} className="h-3 bg-muted/60" />
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-3.5 rounded-2xl border border-emerald-500/20">
                      <span className="text-[11px] text-muted-foreground font-medium block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-400" /> Estimated Shelf Life
                      </span>
                      <span className="text-lg font-bold text-foreground font-mono mt-1 block">
                        {result.shelfLifeDays} Days
                      </span>
                    </div>

                    <div className="bg-muted/50 p-3.5 rounded-2xl border border-emerald-500/20">
                      <span className="text-[11px] text-muted-foreground font-medium block flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Storage Advice
                      </span>
                      <span className="text-xs font-semibold text-emerald-300 mt-1 block line-clamp-2">
                        {result.storageAdvice}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-muted/50 p-3.5 rounded-2xl border border-emerald-500/20">
                      <span className="text-[11px] text-muted-foreground font-medium block flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Action Trigger
                      </span>
                      <span className="text-xs font-semibold text-foreground mt-1 block">
                        {result.recommendedAction}
                      </span>
                    </div>
                  </div>

                  {/* Surface Defects & Blemishes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Detected Surface Features & Defects:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.defects.map((d, i) => (
                        <span
                          key={i}
                          className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <Info className="w-3 h-3 text-amber-400" /> {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Nutritional Highlights */}
                  {result.nutritionalHighlights && result.nutritionalHighlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Nutritional Highlights:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.nutritionalHighlights.map((nh, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg"
                          >
                            🌱 {nh}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Step Actions */}
                  <div className="pt-4 border-t border-border/40 flex flex-wrap gap-3">
                    <Button
                      onClick={() => setLocation("/dynamic-pricing")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 flex-1"
                    >
                      Check Dynamic Pricing <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => setLocation("/products")}
                      variant="outline"
                      className="text-xs font-semibold gap-1.5"
                    >
                      List on Fresh Marketplace
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
