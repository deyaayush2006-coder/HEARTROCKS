import { useEffect, useRef, useState } from "react";

const COLOR_MAP = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", glow: "shadow-green-500/20" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", glow: "shadow-yellow-500/20" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", glow: "shadow-orange-500/20" },
  red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", glow: "shadow-red-500/20" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/20" },
};

export default function VitalCard({ label, value, unit, zone, color = "emerald", icon, pulse, bpm }) {
  const c = COLOR_MAP[color] || COLOR_MAP.emerald;
  const beatInterval = bpm ? (60 / bpm) * 1000 : null;
  const [beating, setBeating] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!pulse || !beatInterval) return;
    const tick = () => {
      setBeating(true);
      setTimeout(() => setBeating(false), 150);
    };
    tick();
    timerRef.current = setInterval(tick, beatInterval);
    return () => clearInterval(timerRef.current);
  }, [pulse, beatInterval]);

  return (
    <div
      className={`
        rounded-2xl border ${c.bg} ${c.border}
        p-4 flex flex-col gap-1
        shadow-lg ${c.glow}
        transition-all duration-300
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">{label}</span>
        <span
          className={`text-lg transition-transform duration-150 ${beating ? "scale-125" : "scale-100"} ${c.text}`}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-3xl font-black tabular-nums ${c.text}`}>{value}</span>
        <span className="text-sm text-gray-500 mb-1">{unit}</span>
      </div>
      <div className={`text-xs font-semibold ${c.text} opacity-80`}>{zone}</div>
    </div>
  );
}