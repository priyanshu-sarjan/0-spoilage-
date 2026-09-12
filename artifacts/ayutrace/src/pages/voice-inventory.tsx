import { useState } from "react";
import { parseFarmerVoiceInventory, FarmerVoiceInventoryResult } from "@/lib/gemini-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  CheckCircle2,
  MapPin,
  Calendar,
  IndianRupee,
  Package,
  Languages,
  Warehouse,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const REGIONAL_LANGUAGES = [
  { code: "Hindi", label: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "Marathi", label: "मराठी (Marathi)", flag: "🚩" },
  { code: "Telugu", label: "తెలుగు (Telugu)", flag: "🌴" },
  { code: "Tamil", label: "தமிழ் (Tamil)", flag: "🌾" },
  { code: "English", label: "English", flag: "🌐" },
];

const PRESET_VOICE_SAMPLES = [
  {
    lang: "Hindi",
    title: "Hindi Tomato Sample",
    text: "नमस्ते, मेरे पास नासिक खेत से 500 किलो ताजा टमाटर है, 22 रुपये प्रति किलो बेचना है",
  },
  {
    lang: "Marathi",
    title: "Marathi Onion Sample",
    text: "नमस्कार शेतकरी दादा, माझ्याकडे 1000 किलो लाल कांदा आहे, 18 रुपये प्रति किलो दर पाहिजे",
  },
  {
    lang: "Telugu",
    title: "Telugu Spinach Sample",
    text: "నమస్కారం, నా వద్ద 150 కేజీల తాజా పాలకూర ఉంది, కేజీకి 15 రూపాయలకు అమ్మాలి",
  },
  {
    lang: "English",
    title: "English Apple Sample",
    text: "Hello, I harvested 300 kg Shimla apples today at expected rate 85 rupees per kg from Shimla valley",
  },
];

export default function VoiceInventoryPage() {
  const [, setLocation] = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi");
  const [voiceText, setVoiceText] = useState(PRESET_VOICE_SAMPLES[0].text);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FarmerVoiceInventoryResult | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.info("Voice recording captured.");
    } else {
      setIsRecording(true);
      toast.success("Listening... speak your harvest details in your language!");
      // Simulate Web Speech API recording timeout
      setTimeout(() => {
        setIsRecording(false);
        setVoiceText("राम राम किसान भाई, मेरे पास नासिक से 450 किलो ताजा टमाटर है, 22 रुपये भाव चाहिए");
        toast.success("Voice transcript extracted successfully!");
      }, 3000);
    }
  };

  const handleProcessVoice = async () => {
    if (!voiceText.trim()) {
      toast.error("Please enter or record voice prompt");
      return;
    }
    setLoading(true);
    try {
      const res = await parseFarmerVoiceInventory(voiceText, selectedLanguage);
      setResult(res);
      toast.success("Gemini Vernacular NLU Processed Inventory Listing!");
    } catch (err) {
      toast.error("Failed to process voice inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border border-emerald-500/30 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none">
          <Mic className="w-80 h-80 text-emerald-400" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Gemini Audio & Vernacular NLU API
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Multilingual Vernacular Voice Assistant 🎙️🌾
          </h1>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Eliminates complex app forms for regional farmers. Speak naturally in Hindi, Marathi, Telugu, Tamil, or English. Gemini converts natural speech into structured inventory cards, recommended rate per kg, and nearest cold hub assignment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Voice Recording & Language Selector */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card/90 border-emerald-500/30 shadow-xl">
            <CardHeader className="bg-emerald-950/40 border-b border-border/40 pb-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-emerald-400" /> Farmer Voice Interface
                </span>
                <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40">
                  Regional Audio NLU
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Select Spoken Language:</label>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONAL_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                        selectedLanguage === lang.code
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-md"
                          : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted"
                      }`}
                    >
                      <span>{lang.flag} {lang.label}</span>
                      {selectedLanguage === lang.code && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Mic Record Trigger Button */}
              <div className="flex flex-col items-center justify-center p-6 bg-emerald-950/30 rounded-2xl border border-emerald-500/20 space-y-3 text-center">
                <button
                  onClick={toggleRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse ring-4 ring-red-500/40 scale-110"
                      : "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white hover:scale-105"
                  }`}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    {isRecording ? "Listening... Speak Now" : "Tap Microphone to Speak"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {isRecording ? "Capturing audio input..." : "Speech-to-Text Vernacular Engine"}
                  </span>
                </div>
              </div>

              {/* Voice Transcript Text Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Spoken Voice Transcript / Input:</label>
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  rows={3}
                  className="w-full bg-background/80 border border-emerald-500/30 rounded-xl p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. नमस्ते, मेरे पास 500 किलो टमाटर है..."
                />
              </div>

              {/* Preset Voice Triggers */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Try Regional Voice Samples:</label>
                <div className="space-y-1.5">
                  {PRESET_VOICE_SAMPLES.map((sample) => (
                    <button
                      key={sample.title}
                      onClick={() => {
                        setSelectedLanguage(sample.lang);
                        setVoiceText(sample.text);
                        setResult(null);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-muted/40 hover:bg-emerald-500/10 text-[11px] text-muted-foreground hover:text-emerald-300 border border-transparent hover:border-emerald-500/30 transition-all flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{sample.title}</span>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleProcessVoice}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white h-12 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-900/30 gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Voice with Gemini NLU...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" /> Extract Inventory with Gemini AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Extracted Structured Inventory Result */}
        <div className="lg:col-span-7 space-y-6">
          {!result && !loading && (
            <Card className="bg-card/60 border-dashed border-emerald-500/30 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Volume2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Awaiting Farmer Voice Input</h3>
              <p className="text-xs text-muted-foreground max-w-md">
                Speak or select a regional voice sample. Gemini NLU automatically parses raw audio/text into structured inventory records without manual form filling!
              </p>
            </Card>
          )}

          {loading && (
            <Card className="bg-card/90 border-emerald-500/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Mic className="w-8 h-8 text-amber-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Gemini Vernacular NLU Parsing</h3>
                <p className="text-xs text-emerald-300 font-mono">
                  Translating dialect, parsing crop entity, rate expectation, and location metadata...
                </p>
              </div>
            </Card>
          )}

          {result && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Voice Confirmation Card */}
              <Card className="bg-gradient-to-br from-card/95 to-emerald-950/50 border-emerald-500/40 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 mb-1">
                        Vernacular NLU Verified ({result.detectedLanguage})
                      </Badge>
                      <CardTitle className="text-xl font-bold font-serif text-foreground">
                        {result.produceName}
                      </CardTitle>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-bold text-xs px-3 py-1">
                      {result.qualityTag}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Farmer Audio Confirmation Response Box */}
                  <div className="bg-emerald-950/60 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Volume2 className="w-4 h-4 animate-bounce" /> Gemini Voice Confirmation ({result.detectedLanguage}):
                    </div>
                    <p className="text-sm font-medium text-emerald-100 italic leading-relaxed">
                      "{result.farmerConfirmationMessage}"
                    </p>
                  </div>

                  {/* Extracted Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-muted/50 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                        <Package className="w-3 h-3 text-emerald-400" /> Quantity
                      </span>
                      <span className="text-base font-bold text-foreground font-mono block">
                        {result.quantityKg} kg
                      </span>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                        <IndianRupee className="w-3 h-3 text-amber-400" /> Expected Rate
                      </span>
                      <span className="text-base font-bold text-amber-300 font-mono block">
                        ₹{result.expectedRatePerKg}/kg
                      </span>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                        <MapPin className="w-3 h-3 text-teal-400" /> Location
                      </span>
                      <span className="text-xs font-semibold text-foreground truncate block">
                        {result.farmLocation}
                      </span>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3 text-emerald-400" /> Harvest Date
                      </span>
                      <span className="text-xs font-semibold text-foreground block">
                        {result.harvestDate}
                      </span>
                    </div>
                  </div>

                  {/* Storage Hub Assignment */}
                  <div className="bg-muted/40 p-4 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">Assigned Cold Storage Hub</span>
                        <span className="text-[11px] text-muted-foreground">{result.recommendedStorageHub}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/40">
                      Bay Slot Reserved
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <Button
                      onClick={() => setLocation("/dynamic-pricing")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-1.5 flex-1"
                    >
                      Calculate Dynamic Pricing <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => setLocation("/products")}
                      variant="outline"
                      className="text-xs font-semibold gap-1.5"
                    >
                      View Marketplace Inventory
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
