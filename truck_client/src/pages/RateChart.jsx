import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function RateChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-secondary py-5">
        No trend data available.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: "USD / tonne", angle: -90, position: "insideLeft", fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => (value == null ? "—" : `$${value}/tonne`)}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="historicalRate"
            name="Historical Rate"
            stroke="#c99400"
            strokeWidth={3}
            dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="projectedRate"
            name="Projected Rate"
            stroke="#c99400"
            strokeWidth={3}
            strokeDasharray="6 4"
            dot={{ r: 3 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RateChart;