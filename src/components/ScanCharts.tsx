import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type Props = {
  riskScore: number;
  total: number;
  vulnerable: number;
  safe: number;
};

const COLORS = ["#ef4444", "#22c55e"]; // red, green

export const ScanCharts = ({ riskScore, total, vulnerable, safe }: Props) => {
  const pieData = [
    { name: "Vulnerable", value: vulnerable },
    { name: "Safe", value: safe },
  ];

  const meterData = [
    { name: "Score", value: riskScore },
    { name: "Remaining", value: 10 - riskScore },
  ];

  const meterColor =
    riskScore > 6 ? "#ef4444" : riskScore > 3 ? "#facc15" : "#22c55e"; // red / yellow / green

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Risk Score Meter */}
      <div className="bg-white p-4 shadow rounded text-center">
        <h3 className="font-semibold mb-2">⚠️ Risk Score</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={meterData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              isAnimationActive={false}
            >
              <Cell key="score" fill={meterColor} />
              <Cell key="remaining" fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-lg font-bold mt-2" style={{ color: meterColor }}>
          {riskScore}/10{" "}
          <span className="text-sm font-normal">
            {riskScore > 6
              ? "High Risk"
              : riskScore > 3
              ? "Medium Risk"
              : "Low Risk"}
          </span>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white p-4 shadow rounded text-center">
        <h3 className="font-semibold mb-2">📊 Package Status</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              label
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <p className="text-sm mt-2">Total Packages: {total}</p>
      </div>
    </div>
  );
};
