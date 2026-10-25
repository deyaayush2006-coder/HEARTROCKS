import { getStatusConfig } from "../utils/healthAnalysis";

export default function StatusHeader({ connected, analysis, currentReading }) {
  const status = analysis?.overallStatus || "normal";
  const cfg = getStatusConfig(status);

  return (
    <header className="px-6 pt-6 pb-4 flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xl">
            ♥
          </div>
          {connected && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-950" />
          )}
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-white font-display">
            HEART<span className="text-red-400">ROCKS</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono">
            {connected ? "● LIVE MONITORING" : "○ DISCONNECTED"}
          </p>
        </div>
      </div>

      <div className={`px-4 py-2 rounded-full border ${cfg.bg} ${cfg.border} flex items-center gap-2`}>
        <span className={`text-xs font-black uppercase tracking-widest ${cfg.text}`}>
          {cfg.label}
        </span>
        {status === "emergency" && (
          <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
        )}
      </div>

      <div className="text-right hidden sm:block">
        <div className="text-xs text-gray-500 font-mono">LAST READING</div>
        <div className="text-xs text-gray-400">
          {currentReading ? new Date(currentReading.time).toLocaleTimeString() : "--:--:--"}
        </div>
      </div>
    </header>
  );
}