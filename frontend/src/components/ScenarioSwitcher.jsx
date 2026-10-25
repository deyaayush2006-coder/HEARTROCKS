const SCENARIOS = [
  { id: "normal", label: "Normal", color: "emerald", desc: "Healthy resting vitals" },
  { id: "arrhythmia", label: "Arrhythmia", color: "yellow", desc: "Irregular rhythm (AFib sim)" },
  { id: "tachycardia", label: "Tachycardia", color: "orange", desc: "Rapid heart rate >140" },
  { id: "lowOxygen", label: "Hypoxemia", color: "red", desc: "Low SpO₂ <93%" },
];

const COLOR = {
  emerald: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
  yellow: "border-yellow-500/50 text-yellow-400 bg-yellow-500/10",
  orange: "border-orange-500/50 text-orange-400 bg-orange-500/10",
  red: "border-red-500/50 text-red-400 bg-red-500/10",
};
const INACTIVE = "border-gray-700 text-gray-500 bg-transparent hover:border-gray-600";

export default function ScenarioSwitcher({ scenario, setScenario }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-gray-600 font-mono uppercase tracking-widest">Demo Scenario:</span>
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          onClick={() => setScenario(s.id)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
            scenario === s.id ? COLOR[s.color] : INACTIVE
          }`}
          title={s.desc}
        >
          {s.label}
        </button>
      ))}
      <span className="text-xs text-gray-700 hidden sm:block">
        · Replace with real Socket.io backend for live data
      </span>
    </div>
  );
}