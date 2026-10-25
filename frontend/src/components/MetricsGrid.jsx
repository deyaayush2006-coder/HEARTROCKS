const COLOR_TEXT = {
  emerald: "text-emerald-400",
  green: "text-green-400",
  yellow: "text-yellow-400",
  orange: "text-orange-400",
  red: "text-red-400",
  blue: "text-blue-400",
};
const COLOR_BG = {
  emerald: "bg-emerald-500/10 border-emerald-500/20",
  green: "bg-green-500/10 border-green-500/20",
  yellow: "bg-yellow-500/10 border-yellow-500/20",
  orange: "bg-orange-500/10 border-orange-500/20",
  red: "bg-red-500/10 border-red-500/20",
  blue: "bg-blue-500/10 border-blue-500/20",
};

function SmallMetric({ icon, label, value, unit, statusLabel, color = "emerald", description }) {
  return (
    <div className={`rounded-xl border p-3 ${COLOR_BG[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-base">{icon}</span>
        <span className={`text-xs font-semibold ${COLOR_TEXT[color]}`}>{statusLabel}</span>
      </div>
      <div className={`text-xl font-black tabular-nums ${COLOR_TEXT[color]}`}>
        {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {description && <div className="text-xs text-gray-600 mt-1 leading-tight">{description}</div>}
    </div>
  );
}

export default function MetricsGrid({ analysis, arrhythmia }) {
  if (!analysis) return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <div className="text-sm text-gray-500">Awaiting data...</div>
    </div>
  );

  const { hrv, stress, respiratory } = analysis;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <h2 className="text-sm font-bold text-white mb-1">Extended Vitals</h2>
      <p className="text-xs text-gray-500 font-mono mb-4">Derived metrics · estimates</p>

      <div className="grid grid-cols-2 gap-3">
        <SmallMetric
          icon="🧘"
          label="Stress Index"
          value={stress.level}
          unit=""
          statusLabel={stress.level}
          color={stress.color}
        />
        <SmallMetric
          icon="🫁"
          label="Resp. Rate"
          value={respiratory.rate}
          unit="brpm"
          statusLabel={respiratory.status}
          color={respiratory.color}
        />
        <SmallMetric
          icon="📊"
          label="Est. HRV"
          value={hrv.value}
          unit="ms"
          statusLabel={hrv.value > 50 ? "Healthy" : hrv.value > 30 ? "Average" : "Low"}
          color={hrv.value > 50 ? "emerald" : hrv.value > 30 ? "yellow" : "red"}
        />
        <SmallMetric
          icon="⚡"
          label="Cardiac Load"
          value={
            analysis.bpm.category === "tachycardia"
              ? "High"
              : analysis.bpm.category === "bradycardia"
              ? "Low"
              : "Normal"
          }
          unit=""
          statusLabel={
            analysis.bpm.category === "tachycardia"
              ? "Elevated"
              : analysis.bpm.category === "bradycardia"
              ? "Reduced"
              : "Normal"
          }
          color={
            analysis.bpm.category === "tachycardia"
              ? "orange"
              : analysis.bpm.category === "bradycardia"
              ? "blue"
              : "emerald"
          }
        />
      </div>

      {/* BPM Zone description */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="text-xs font-semibold text-gray-400 mb-1">Heart Rate Analysis</div>
        <div className="text-xs text-gray-500 leading-relaxed">{analysis.bpm.description}</div>
      </div>

      <div className="mt-3 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="text-xs font-semibold text-gray-400 mb-1">SpO₂ Analysis</div>
        <div className="text-xs text-gray-500 leading-relaxed">{analysis.spo2.description}</div>
      </div>
    </div>
  );
}