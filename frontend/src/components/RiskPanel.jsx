export default function RiskPanel({ analysis, arrhythmia }) {
  if (!analysis) return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <div className="text-sm text-gray-500">Awaiting data...</div>
    </div>
  );

  const { heartAttack, bpm, spo2 } = analysis;
  const risk = heartAttack.risk;
  const angle = (risk / 100) * 180 - 90; // -90 to 90 degrees

  const riskColor = heartAttack.color === "emerald" || heartAttack.color === "green"
    ? "#10b981"
    : heartAttack.color === "yellow"
    ? "#eab308"
    : heartAttack.color === "orange"
    ? "#f97316"
    : "#ef4444";

  const factors = [
    {
      label: "Heart Rate",
      status: bpm.zone,
      risk: bpm.category === "tachycardia" ? "elevated" : bpm.category === "bradycardia" ? "mild" : "low",
    },
    {
      label: "Blood Oxygen",
      status: spo2.zone,
      risk: spo2.zone === "Optimal" || spo2.zone === "Normal" ? "low" : spo2.zone === "Below Normal" ? "mild" : "elevated",
    },
    {
      label: "Arrhythmia",
      status: arrhythmia?.detected ? arrhythmia.type?.split("(")[0].trim() : "None detected",
      risk: arrhythmia?.detected ? (arrhythmia.severity === "critical" ? "elevated" : "mild") : "low",
    },
    {
      label: "Combined Vitals",
      status: analysis.overallStatus.charAt(0).toUpperCase() + analysis.overallStatus.slice(1),
      risk: analysis.overallStatus === "normal" ? "low" : analysis.overallStatus === "warning" ? "mild" : "elevated",
    },
  ];

  const riskClasses = {
    low: "text-emerald-400 bg-emerald-500/10",
    mild: "text-yellow-400 bg-yellow-500/10",
    elevated: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <h2 className="text-sm font-bold text-white mb-1">Cardiac Risk Assessment</h2>
      <p className="text-xs text-gray-500 font-mono mb-4">Heart attack probability · real-time</p>

      {/* Gauge */}
      <div className="flex flex-col items-center mb-5">
        <svg viewBox="0 0 200 110" className="w-48">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1f2937"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Color segments */}
          <path d="M 20 100 A 80 80 0 0 1 60 35" fill="none" stroke="#10b981" strokeWidth="16" strokeLinecap="butt" opacity="0.4" />
          <path d="M 60 35 A 80 80 0 0 1 100 20" fill="none" stroke="#eab308" strokeWidth="16" strokeLinecap="butt" opacity="0.4" />
          <path d="M 100 20 A 80 80 0 0 1 140 35" fill="none" stroke="#f97316" strokeWidth="16" strokeLinecap="butt" opacity="0.4" />
          <path d="M 140 35 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="16" strokeLinecap="butt" opacity="0.4" />

          {/* Needle */}
          <g transform={`rotate(${angle}, 100, 100)`}>
            <line x1="100" y1="100" x2="100" y2="28" stroke={riskColor} strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill={riskColor} />
          </g>

          {/* Labels */}
          <text x="12" y="112" fill="#6b7280" fontSize="9">Low</text>
          <text x="85" y="18" fill="#6b7280" fontSize="9">Mod</text>
          <text x="163" y="112" fill="#6b7280" fontSize="9">High</text>
        </svg>

        <div className="text-center -mt-2">
          <div className="text-3xl font-black tabular-nums" style={{ color: riskColor }}>{risk}%</div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: riskColor }}>{heartAttack.level} Risk</div>
        </div>
      </div>

      {/* Contributing factors */}
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-mono">Risk Factors</div>
      <div className="space-y-1.5">
        {factors.map((f) => (
          <div key={f.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{f.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${riskClasses[f.risk]}`}>
              {f.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}