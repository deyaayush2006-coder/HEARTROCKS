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
      <div className="text-cyan-400 font-bold text-sm">{payload[0]?.value?.toFixed(1)}%</div>
    </div>
  );
};

export default function SpO2Chart({ readings }) {
  const display = readings.slice(-60);
  const spo2s = display.map((r) => r.spo2);
  const minSpo2 = Math.max(80, Math.min(...spo2s, 94) - 2);
  const maxSpo2 = 101;

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white">Blood Oxygen (SpO₂)</h2>
          <p className="text-xs text-gray-500 font-mono">Last 60 readings · %</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &lt;92% Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ≥95% Normal</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={display} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
            domain={[minSpo2, maxSpo2]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />

          <ReferenceLine y={95} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "95%", fill: "#22c55e", fontSize: 9 }} />
          <ReferenceLine y={92} stroke="#f97316" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "92%", fill: "#f97316", fontSize: 9 }} />
          <ReferenceLine y={88} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "88%", fill: "#ef4444", fontSize: 9 }} />

          <Area
            type="monotone"
            dataKey="spo2"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#spo2Grad)"
            dot={false}
            activeDot={{ r: 4, fill: "#06b6d4" }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}