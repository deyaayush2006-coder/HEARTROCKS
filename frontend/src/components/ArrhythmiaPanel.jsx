import { getHRVInterpretation } from "../utils/arrhythmiaDetection";

const MetricRow = ({ label, value, unit, color = "gray" }) => {
  const colors = {
    emerald: "text-emerald-400",
    green: "text-green-400",
    yellow: "text-yellow-400",
    orange: "text-orange-400",
    red: "text-red-400",
    blue: "text-blue-400",
    gray: "text-gray-300",
  };
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-mono font-bold ${colors[color]}`}>
        {value} <span className="text-gray-600 font-normal">{unit}</span>
      </span>
    </div>
  );
};

export default function ArrhythmiaPanel({ arrhythmia, readings }) {
  const metrics = arrhythmia?.metrics;
  const hrv = metrics ? getHRVInterpretation(metrics.sdnn) : null;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <h2 className="text-sm font-bold text-white mb-1">Arrhythmia Analysis</h2>
      <p className="text-xs text-gray-500 font-mono mb-4">RR variability · rhythm analysis</p>

      {/* Status */}
      <div
        className={`rounded-xl p-3 mb-4 border ${
          arrhythmia?.detected
            ? arrhythmia.severity === "critical"
              ? "bg-red-500/10 border-red-500/40"
              : "bg-yellow-500/10 border-yellow-500/40"
            : "bg-emerald-500/10 border-emerald-500/30"
        }`}
      >
        <div className={`text-sm font-bold mb-1 ${arrhythmia?.detected ? (arrhythmia.severity === "critical" ? "text-red-400" : "text-yellow-400") : "text-emerald-400"}`}>
          {arrhythmia?.detected ? `⚠ ${arrhythmia.type}` : "✓ Normal Sinus Rhythm"}
        </div>
        {arrhythmia?.detected && (
          <>
            <div className="text-xs text-gray-400 mb-2 leading-relaxed">{arrhythmia.description}</div>
            <div className="text-xs font-mono text-gray-500">
              Confidence: <span className="text-white font-bold">{arrhythmia.confidence}%</span>
            </div>
          </>
        )}
        {!arrhythmia?.detected && readings.length < 15 && (
          <div className="text-xs text-gray-500">Collecting data... ({readings.length}/15 samples)</div>
        )}
      </div>

      {/* HRV Metrics */}
      {metrics && (
        <>
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">HRV Metrics</div>
          <MetricRow label="SDNN (HRV)" value={metrics.sdnn} unit="ms" color={hrv?.color} />
          <MetricRow label="RMSSD" value={metrics.rmssd} unit="ms" color="gray" />
          <MetricRow label="pNN50" value={metrics.pnn50} unit="%" color="gray" />
          <MetricRow label="Mean BPM" value={metrics.meanBPM} unit="bpm" color="gray" />
          <MetricRow label="BPM Std Dev" value={metrics.bpmSd} unit="bpm" color="gray" />
          <MetricRow label="Irregular Beats" value={metrics.irregularPercent} unit="%" color={metrics.irregularPercent > 15 ? "orange" : "gray"} />
          {hrv && (
            <div className={`mt-3 text-xs rounded-lg px-3 py-2 ${hrv.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : hrv.color === "red" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
              HRV: <strong>{hrv.level}</strong> — {hrv.advice}
            </div>
          )}
        </>
      )}
    </div>
  );
}