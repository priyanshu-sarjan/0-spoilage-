import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Mic,
  TrendingDown,
  QrCode,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Zap,
  Bot
} from "lucide-react";

const GEMINI_MODULES = [
  {
    href: "/vision-grading",
    title: "Produce Visual Quality Grading",
    icon: Eye,
    tag: "Gemini 1.5 Flash Vision",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    desc: "Upload photos of harvested produce. Gemini computes ripeness %, detects skin scarring/bruising, categorizes Grade A/B/C, and estimates shelf life.",
    cta: "Run Vision Scan",
  },
  {
    href: "/voice-inventory",
    title: "Vernacular Voice Assistant",
    icon: Mic,
    tag: "Multilingual NLU Engine",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    desc: "Speak naturally in Hindi, Marathi, Telugu, Tamil, or English. Gemini converts spoken input into structured inventory cards & local confirmation speech.",
    cta: "Speak Listing",
  },
  {
    href: "/dynamic-pricing",
    title: "Dynamic Freshness Pricing",
    icon: TrendingDown,
    tag: "0-Spoilage Reasoning",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    desc: "Multi-parameter AI pricing matrix. Ingests Mandi benchmarks, transit hours, and humidity to calculate fair grower rates & auto-scheduled consumer discounts.",
    cta: "Calculate Price",
  },
  {
    href: "/traceability",
    title: "Farm-to-Fork Traceability",
    icon: QrCode,
    tag: "Generative Storyteller",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    desc: "Consumers scan QR code. Gemini ingests soil health metrics & harvest timestamps to write origin stories, recipe pairings, and kitchen storage tips.",
    cta: "Trace Batch",
  },
  {
    href: "/crop-health",
    title: "Pest & Crop Health Early-Warning",
    icon: Stethoscope,
    tag: "Diagnostic Vision",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    desc: "Snap leaf or soil photos. Gemini identifies pathogens, fungal blights, or nutrient chlorosis, recommending organic bio-remediation protocols.",
    cta: "Diagnose Leaf",
  },
];

export function GeminiFeaturesShowcase() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Powered by Gemini API 🤖⚡
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
          5 High-Impact Gemini Multimodal Features for AgriFresh
        </h2>
        <p className="text-xs text-muted-foreground">
          Solving agricultural supply-chain bottlenecks and eliminating food waste with computer vision, audio vernacular NLU, dynamic pricing, and AI storytelling.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GEMINI_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={mod.href} className="group">
              <Card className="h-full bg-card/80 hover:bg-card border-emerald-500/30 hover:border-emerald-400/60 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative group-hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon className="w-24 h-24 text-emerald-400" />
                </div>
                <CardContent className="p-6 space-y-4 flex flex-col justify-between h-full relative z-10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge className={`text-[10px] ${mod.badgeColor}`}>{mod.tag}</Badge>
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-emerald-400 transition-colors font-serif">
                      {mod.title}
                    </h3>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                    <span>{mod.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
