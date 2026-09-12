import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Sparkles,
  Zap,
  RefreshCw,
  Truck,
  TrendingDown,
  ShieldAlert,
  ChevronUp,
  Maximize2,
  Minimize2,
  Terminal,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ToolResult {
  toolName: string;
  args: Record<string, any>;
  result: any;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  toolCall?: ToolResult;
  timestamp: string;
}

// Simulated MCP Telemetry & Logistics Data matching mcp-server
const REGIONAL_SURPLUS_DATA: Record<string, { surplusPercentage: number; crop: string; status: string }> = {
  "Ariyalur": { surplusPercentage: 108.2, crop: "Tomato", status: "Critical Overproduction" },
  "Perambalur": { surplusPercentage: 15.0, crop: "Onion", status: "Normal" },
  "Nashik": { surplusPercentage: 85.0, crop: "Tomato", status: "High Overproduction" },
  "Gwalior": { surplusPercentage: 42.0, crop: "Mango", status: "Moderate Overproduction" },
};

const COLD_STORAGE_FACILITIES: Record<string, { capacityFilled: number; availableTons: number }> = {
  "Facility A": { capacityFilled: 65, availableTons: 350 },
  "Facility B": { capacityFilled: 88, availableTons: 120 },
  "Mumbai Hub": { capacityFilled: 45, availableTons: 550 },
  "Pune APMC": { capacityFilled: 30, availableTons: 700 },
};

export function AIAgentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "agent",
      text: "⚡ **AyuTrace MCP Logistics & Spoilage Agent Active**\nConnected to `ayutrace-logistics-engine v1.0.0` MCP Server.\n\nI can execute real-time telemetry scans, calculate spoilage velocity, reroute cold transport loads, and trigger emergency flash clearances.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Execute Simulated MCP Tools matching exact logic in mcp-server/src/index.ts
  const executeMCPTool = (name: string, args: Record<string, any>): any => {
    switch (name) {
      case "check_regional_surplus": {
        const district = String(args.district || "Ariyalur");
        const data = REGIONAL_SURPLUS_DATA[district];
        if (!data) {
          return {
            district,
            message: `District '${district}' not found in active telemetry. Normal baseline assumed.`,
          };
        }
        return {
          district,
          ...data,
          actionNeeded: data.surplusPercentage > 50 ? "Trigger Priority Dispatch & Reroute" : "Standard Logistics",
        };
      }

      case "predict_spoilage_velocity": {
        const temp = Number(args.ambientTemperature || 35);
        const duration = Number(args.transitDurationHours || 24);
        const crop = String(args.crop || "Tomato");

        const decayScore = Math.min(100, Math.round((temp / 40) * (duration / 72) * 100));
        const priorityTier = decayScore > 60 ? "Priority 1 (Urgent)" : "Priority 2 (Standard)";
        const estimatedShelfLifeHours = Math.max(0, 96 - Math.round((temp * duration) / 15));

        return {
          crop,
          ambientTemperature: `${temp}°C`,
          transitDuration: `${duration} hrs`,
          decayScore: `${decayScore}/100`,
          priorityTier,
          estimatedShelfLife: `${estimatedShelfLifeHours} hours remaining`,
          status: decayScore > 75 ? "CRITICAL_SPOILAGE_RISK" : "STABLE",
        };
      }

      case "divert_shipment": {
        const truckId = String(args.truckId || "TN-45-A-9012");
        const targetFacility = String(args.targetFacility || "Mumbai Hub");
        const facility = COLD_STORAGE_FACILITIES[targetFacility];

        return {
          status: "REROUTE_SUCCESSFUL",
          truckId,
          newDestination: targetFacility,
          targetCapacityFilled: facility ? `${facility.capacityFilled}%` : "Unknown",
          timestamp: new Date().toISOString(),
        };
      }

      case "trigger_flash_clearance": {
        const batchId = String(args.batchId || "AYU-TOM-8821");
        const decayScore = Number(args.decayScore || 78);
        const discountPercentage = decayScore >= 75 ? 50 : decayScore >= 50 ? 30 : 15;

        return {
          action: "FLASH_SALE_TRIGGERED",
          batchId,
          discountApplied: `${discountPercentage}% OFF`,
          portalUpdate: "Active on consumer mandi catalog",
          revenueRecoveryExpected: "High",
        };
      }

      default:
        throw new Error(`Unknown MCP Tool: ${name}`);
    }
  };

  const handleSend = (overrideQuery?: string, toolPreset?: { name: string; args: Record<string, any> }) => {
    const query = overrideQuery || input;
    if (!query.trim() && !toolPreset) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideQuery) setInput("");
    setLoading(true);

    setTimeout(() => {
      let toolCall: ToolResult | undefined;
      let replyText = "";

      const lower = query.toLowerCase();

      if (toolPreset) {
        const res = executeMCPTool(toolPreset.name, toolPreset.args);
        toolCall = {
          toolName: toolPreset.name,
          args: toolPreset.args,
          result: res,
        };
        replyText = `Executed MCP tool \`${toolPreset.name}\` successfully. Telemetry response returned below:`;
      } else if (lower.includes("surplus") || lower.includes("ariyalur") || lower.includes("nashik") || lower.includes("gwalior")) {
        const dist = lower.includes("nashik") ? "Nashik" : lower.includes("gwalior") ? "Gwalior" : lower.includes("perambalur") ? "Perambalur" : "Ariyalur";
        const args = { district: dist };
        const res = executeMCPTool("check_regional_surplus", args);
        toolCall = { toolName: "check_regional_surplus", args, result: res };
        replyText = `🔍 **MCP GIS Surplus Scan**: District \`${dist}\` shows **+${res.surplusPercentage || 0}%** overproduction. Recommendation: **${res.actionNeeded || "Standard"}**.`;
      } else if (lower.includes("spoilage") || lower.includes("decay") || lower.includes("temp") || lower.includes("shelf")) {
        const args = { crop: lower.includes("mango") ? "Mango" : "Tomato", ambientTemperature: 36, transitDurationHours: 32 };
        const res = executeMCPTool("predict_spoilage_velocity", args);
        toolCall = { toolName: "predict_spoilage_velocity", args, result: res };
        replyText = `🌡️ **MCP Spoilage Prediction**: Decay Index is **${res.decayScore}**. Assigned **${res.priorityTier}** with **${res.estimatedShelfLife}**.`;
      } else if (lower.includes("divert") || lower.includes("reroute") || lower.includes("truck")) {
        const args = { truckId: "TN-45-A-9012", targetFacility: "Mumbai Hub", reason: "Prevent heat stress spoilage" };
        const res = executeMCPTool("divert_shipment", args);
        toolCall = { toolName: "divert_shipment", args, result: res };
        replyText = `🚚 **MCP Reroute Execution**: Truck \`TN-45-A-9012\` successfully diverted to **Mumbai Hub** (Capacity: ${res.targetCapacityFilled}).`;
      } else if (lower.includes("discount") || lower.includes("clearance") || lower.includes("flash") || lower.includes("markdown")) {
        const args = { batchId: "AYU-TOM-8821", decayScore: 82 };
        const res = executeMCPTool("trigger_flash_clearance", args);
        toolCall = { toolName: "trigger_flash_clearance", args, result: res };
        replyText = `⚡ **MCP Flash Clearance**: Automated **${res.discountApplied}** discount published to consumer portals for Batch \`${res.batchId}\`.`;
      } else {
        replyText = `🤖 **AyuTrace MCP Engine**: I can invoke tools like \`check_regional_surplus\`, \`predict_spoilage_velocity\`, \`divert_shipment\`, and \`trigger_flash_clearance\`. Click any quick tool chip below to test MCP capabilities!`;
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        text: replyText,
        toolCall,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-emerald-500/25 border border-emerald-400/40"
          aria-label="Open AyuTrace AI Agent"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-300 border-2 border-emerald-700 animate-ping" />
          </div>
          <span className="font-semibold text-xs tracking-wide pr-1 hidden sm:inline-block">
            MCP AI Agent
          </span>
          <Badge className="bg-emerald-950/80 text-emerald-300 text-[10px] border-emerald-400/40 px-1.5 py-0.5">
            v1.0
          </Badge>
        </button>
      )}

      {/* Floating Pop-Up Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-card/95 backdrop-blur-2xl border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden ${
            isExpanded
              ? "bottom-4 right-4 left-4 sm:left-auto sm:w-[650px] h-[85vh]"
              : "bottom-6 right-6 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[82vh]"
          }`}
        >
          {/* Header */}
          <div className="bg-emerald-950/80 border-b border-emerald-500/30 p-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
                  AyuTrace Agri-Fresh AI Agent
                  <span className="flex items-center gap-1 text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    MCP Online
                  </span>
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono">
                  ayutrace-logistics-engine (Stdio Transport)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick MCP Tool Action Chips */}
          <div className="bg-emerald-950/30 border-b border-border/40 p-2 flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
            <span className="text-[10px] font-semibold text-emerald-400 shrink-0 flex items-center gap-1 px-1">
              <Zap className="w-3 h-3" /> MCP Tools:
            </span>
            <button
              onClick={() =>
                handleSend("Check regional surplus for Ariyalur", {
                  name: "check_regional_surplus",
                  args: { district: "Ariyalur" },
                })
              }
              className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg px-2 py-1 transition-all whitespace-nowrap shrink-0"
            >
              📊 Surplus (Ariyalur)
            </button>
            <button
              onClick={() =>
                handleSend("Predict spoilage velocity for Tomato at 36°C for 32 hrs", {
                  name: "predict_spoilage_velocity",
                  args: { crop: "Tomato", ambientTemperature: 36, transitDurationHours: 32 },
                })
              }
              className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg px-2 py-1 transition-all whitespace-nowrap shrink-0"
            >
              🌡️ Predict Spoilage
            </button>
            <button
              onClick={() =>
                handleSend("Divert shipment for truck TN-45-A-9012 to Mumbai Hub", {
                  name: "divert_shipment",
                  args: { truckId: "TN-45-A-9012", targetFacility: "Mumbai Hub", reason: "Prevent heat stress spoilage" },
                })
              }
              className="text-[11px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg px-2 py-1 transition-all whitespace-nowrap shrink-0"
            >
              🚚 Reroute Load
            </button>
            <button
              onClick={() =>
                handleSend("Trigger flash clearance for batch AYU-TOM-8821", {
                  name: "trigger_flash_clearance",
                  args: { batchId: "AYU-TOM-8821", decayScore: 82 },
                })
              }
              className="text-[11px] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg px-2 py-1 transition-all whitespace-nowrap shrink-0"
            >
              ⚡ Flash Discount
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-muted/90 border border-emerald-500/20 text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {/* Render MCP Tool Result Box if present */}
                  {m.toolCall && (
                    <div className="mt-2.5 bg-black/40 border border-emerald-500/30 rounded-lg p-2.5 space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between text-emerald-400 font-bold pb-1 border-b border-emerald-500/20">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          MCP Tool Execution: {m.toolCall.toolName}
                        </span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                          SUCCESS
                        </Badge>
                      </div>

                      <div className="text-muted-foreground text-[10px]">
                        <strong>Inputs:</strong> {JSON.stringify(m.toolCall.args)}
                      </div>

                      <pre className="bg-emerald-950/60 p-2 rounded text-[10px] text-emerald-300 overflow-x-auto custom-scrollbar border border-emerald-500/20">
                        {JSON.stringify(m.toolCall.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  <span className="text-[9px] opacity-60 block mt-1 text-right">{m.timestamp}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 italic bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20 max-w-[75%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Executing MCP Protocol tool request...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-emerald-950/40 border-t border-emerald-500/20 flex gap-2 shrink-0"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask MCP Agent (e.g. check surplus for Nashik)..."
              className="flex-1 bg-background/80 text-xs h-9 focus-visible:ring-emerald-500"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 h-9 px-3 gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
