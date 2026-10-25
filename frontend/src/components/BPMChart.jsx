import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-gray-400">{payload[0]?.payload?.label}</div>
      <div className="text-red-400 font-bold text-sm">{payload[0]?.value?.toFixed(1)} BPM</div>
    </div>
  );
};

export default function BPMChart({ readings }) {
  const display = readings.slice(-60);
  const bpms = display.map((r) => r.bpm);
  const minBPM = Math.max(30, Math.min(...bpms, 50) - 5);
  const maxBPM = Math.min(220, Math.max(...bpms, 100) + 5);

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white">Heart Rate</h2>
          <p className="text-xs text-gray-500 font-mono">Last 60 readings · BPM</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Brady &lt;60</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> Tachy &gt;100</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={display} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="bpmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b7280", fontSize: 9 }}
            interval={Math.floor(display.length / 6)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minBPM, maxBPM]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Zone reference lines */}
          <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "60", fill: "#3b82f6", fontSize: 9 }} />
          <ReferenceLine y={100} stroke="#f97316" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "100", fill: "#f97316", fontSize: 9 }} />
          <ReferenceLine y={150} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "150", fill: "#ef4444", fontSize: 9 }} />

          <Area
            type="monotone"
            dataKey="bpm"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#bpmGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#ef4444" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}