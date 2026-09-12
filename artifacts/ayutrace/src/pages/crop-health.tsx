import { useState } from "react";
import { diagnoseCropHealth, CropHealthDiagnosisResult } from "@/lib/gemini-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Stethoscope,
  Upload,
  Sparkles,
  AlertOctagon,
  CheckCircle,
  ShieldAlert,
  Leaf,
  Bug,
  Activity,
  RefreshCw,
  ArrowRight,
  Info,
  Droplets,
  Sprout
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const SAMPLE_LEAF_IMAGES = [
  {
    name: "Tomato Blight",
    hint: "Tomato Leaf Early Blight",
    url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500&auto=format&fit=crop&q=60",
    issue: "Early Blight",
  },
  {
    name: "Apple Scab",
    hint: "Apple Leaf Spot Disease",
    url: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=500&auto=format&fit=crop&q=60",
    issue: "Fungal Scab",
  },
  {
    name: "Nitrogen Deficiency",
    hint: "Leaf Yellowing Chlorosis",
    url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500&auto=format&fit=crop&q=60",
    issue: "Nutrient Lack",
  },
  {
    name: "Healthy Crop",
    hint: "Fresh Green Leaf",
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop&q=60",
    issue: "Optimal",
  },
];

export default function CropHealthPage() {
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_LEAF_IMAGES[0].url);
  const [cropHint, setCropHint] = useState<string>("Tomato Leaf Spot");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CropHealthDiagnosisResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
        setResult(null);
        setCropHint(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async () => {
    setLoading(true);
    try {
      const res = await diagnoseCropHealth(selectedImage, "image/jpeg", cropHint);
      setResult(res);
      toast.success("Gemini Crop Health Diagnosis Complete!");
    } catch (err) {
      toast.error("Failed to diagnose crop health");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-500/30 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Stethoscope className="w-80 h-80 text-emerald-400" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gemini Vision Agronomist API
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Pest & Crop Health Early-Warning Scanner 🔬🌿
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Snap or upload photos of unhealthy leaves, stem lesions, or soil patches. Gemini identifies pathogens, fungal blights, or nutrient deficiencies, recommending organic bio-remediation protocols before entire fields degrade.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Selector */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/90 border-emerald-500/30 shadow-xl overflow-hidden">
            <CardHeader className="bg-emerald-950/40 border-b border-border/40 pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" /> Crop Leaf Image
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40">
                  Diagnostic Vision
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Preview Box */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-emerald-500/40 bg-muted/40 group">
                <img
                  src={selectedImage}
                  alt="Leaf Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg">
                    <Upload className="w-4 h-4" /> Upload Leaf Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Bug className="w-3.5 h-3.5 text-amber-400" /> Or select a sample leaf photo:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SAMPLE_LEAF_IMAGES.map((sample) => (
                    <button
                      key={sample.name}
                      onClick={() => {
                        setSelectedImage(sample.url);
                        setCropHint(sample.hint);
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
                onClick={handleDiagnose}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Diagnosing Pathogens with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Run AI Pathology Diagnostic
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pathology Report */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <Card className="bg-card/60 border-dashed border-emerald-500/30 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Stethoscope className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Ready for Crop Diagnosis</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Upload a crop photo and click "Run AI Pathology Diagnostic" to identify early stage blights, pests, or nutrient chlorosis with organic remediation protocols.
              </p>
            </Card>
          )}

          {loading && (
            <Card className="bg-card/90 border-emerald-500/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Activity className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Gemini Plant Pathology API Active</h3>
                <p className="text-xs text-emerald-300 font-mono">
                  Matching fungal spore patterns, leaf spot concentric halos, and vascular wilts...
                </p>
              </div>
            </Card>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="bg-gradient-to-br from-card/95 to-emerald-950/50 border-emerald-500/40 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-1">
                        Pathology Audit ({result.confidenceScore}% Confidence)
                      </Badge>
                      <CardTitle className="text-xl font-bold font-serif text-foreground">
                        {result.detectedIssue}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`text-xs px-3 py-1 font-bold ${
                        result.severityLevel === "Critical" || result.severityLevel === "High"
                          ? "bg-red-600 text-white"
                          : result.severityLevel === "Medium"
                          ? "bg-amber-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      Severity: {result.severityLevel}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Category & Crop Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-3 rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] text-muted-foreground font-semibold block">Crop Type</span>
                      <span className="text-xs font-bold text-foreground font-mono mt-0.5 block">{result.cropName}</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-xl border border-emerald-500/20">
                      <span className="text-[10px] text-muted-foreground font-semibold block">Pathogen Category</span>
                      <span className="text-xs font-bold text-amber-300 font-mono mt-0.5 block">{result.issueCategory}</span>
                    </div>
                  </div>

                  {/* Observed Symptoms */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-400" /> Observed Visual Symptoms:
                    </h4>
                    <div className="space-y-1">
                      {result.symptomsObserved.map((sym, idx) => (
                        <div key={idx} className="text-xs text-emerald-100 flex items-center gap-2 bg-muted/40 p-2 rounded-lg">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{sym}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Organic Bio-Remediation Protocol */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-400" /> Recommended Organic Remediation:
                    </h4>
                    <div className="space-y-1.5">
                      {result.organicRemediationProtocol.map((proto, idx) => (
                        <div key={idx} className="text-xs text-emerald-100 bg-emerald-950/60 border border-emerald-500/30 p-2.5 rounded-xl flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{proto}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chemical Option fallback */}
                  {result.chemicalRemediationOption && (
                    <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 text-xs space-y-1">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" /> Chemical Remediation Option (Fallback):
                      </span>
                      <p className="text-amber-100/90 text-[11px]">{result.chemicalRemediationOption}</p>
                    </div>
                  )}

                  {/* Preventative Steps */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-teal-400" /> Preventative Agricultural Actions:
                    </h4>
                    <div className="space-y-1">
                      {result.preventativeMeasures.map((prev, idx) => (
                        <div key={idx} className="text-[11px] text-muted-foreground flex items-start gap-2">
                          <span className="text-teal-400 font-bold">•</span>
                          <span>{prev}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button
                      onClick={() => setLocation("/community")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 flex-1"
                    >
                      Ask Kisan Mitra Community <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => setLocation("/map")}
                      variant="outline"
                      className="text-xs font-semibold gap-1.5"
                    >
                      Find Nearby Bio-Pesticide Hub
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
