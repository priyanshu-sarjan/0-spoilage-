import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import {
  Moon,
  Sun,
  Leaf,
  Map as MapIcon,
  ShoppingBag,
  Users,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Key,
  Mic,
  Eye,
  TrendingDown,
  QrCode,
  Stethoscope,
  CheckCircle,
  X,
} from "lucide-react";
import { getGeminiApiKey, setGeminiApiKey } from "@/lib/gemini-api";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location, setLocation] = useLocation();

  const [isKeyDialogOpen, setIsKeyDialogOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    const activeKey = getGeminiApiKey();
    setApiKeyInput(activeKey);
    setHasCustomKey(Boolean(activeKey));
  }, []);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKeyInput);
    setHasCustomKey(Boolean(apiKeyInput.trim()));
    setIsKeyDialogOpen(false);
  };

  const navLinks = [
    { href: "/vision-grading", label: "Produce Ripeness", icon: Eye, badge: "Gemini Vision" },
    { href: "/voice-inventory", label: "Farmer Voice", icon: Mic, badge: "Vernacular NLU" },
    { href: "/dynamic-pricing", label: "Dynamic Pricing", icon: TrendingDown, badge: "0-Spoilage" },
    { href: "/traceability", label: "Traceability", icon: QrCode, badge: "AI Story" },
    { href: "/crop-health", label: "Crop Health", icon: Stethoscope, badge: "Diagnostic" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-2 rounded-xl group-hover:scale-105 transition-all shadow-md shadow-emerald-900/30">
            <Leaf className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl tracking-tight text-foreground leading-none flex items-center gap-1.5">
              AgriFresh <span className="text-emerald-400 font-sans text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">0-Spoilage</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> PS Open Innovation • Gemini API
            </span>
          </div>
        </Link>

        {/* Gemini API Key Trigger Badge for Judges */}
        <div className="hidden xl:flex items-center gap-2">
          <button
            onClick={() => setIsKeyDialogOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-500/40 transition-all shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{hasCustomKey ? "Gemini API Key Active" : "Set Gemini API Key"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                    : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground h-9 w-9"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <button
            onClick={() => setIsKeyDialogOpen(true)}
            className="xl:hidden p-2 rounded-lg bg-emerald-950/50 text-amber-400 border border-emerald-500/30"
            title="Configure Gemini Key"
          >
            <Key className="w-4 h-4" />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")} className="gap-1.5 text-xs h-8">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { logout(); setLocation("/"); }} className="text-muted-foreground hover:text-destructive h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/login")} className="text-xs h-8">
                Sign In
              </Button>
              <Button size="sm" onClick={() => setLocation("/register")} className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-bar for mobile navigation */}
      <div className="lg:hidden flex items-center justify-around bg-card/90 border-t border-border/40 py-2 px-2 overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] font-medium px-2 py-1 rounded-md flex items-center gap-1 shrink-0 ${
                isActive ? "bg-emerald-600 text-white" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-3 h-3" />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Gemini API Key Dialog */}
      <Dialog open={isKeyDialogOpen} onOpenChange={setIsKeyDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card/95 backdrop-blur-xl border-emerald-500/40">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Key className="w-5 h-5 text-amber-400" /> Configure Gemini API Key 🤖⚡
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your Gemini API key (from Google AI Studio). If left blank, AgriFresh automatically provides high-fidelity simulated Gemini responses so judges can test instantly!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveKey} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Gemini API Key</label>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="bg-background/80 text-xs font-mono"
              />
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg text-[11px] text-emerald-300 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Simulated Fallback Mode Available
              </p>
              <p className="text-muted-foreground text-[10px]">
                No API Key? No problem! AgriFresh seamlessly provides structured AI vision, vernacular voice, and dynamic pricing outputs for live demos.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsKeyDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                Save & Activate Gemini
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
