import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { api } from "../lib/api.js";

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/api/dashboard")).data
  });

  if (isLoading) return <div className="panel">Loading NxtBiz dashboard...</div>;
  if (error) return <div className="panel text-red-600">Dashboard failed to load.</div>;

  const chartData = Object.entries(data.health.factors).map(([name, value]) => ({ name, value }));

  return (
    <section className="space-y-5">
      <div>
        <h1 className="page-title">Executive Dashboard</h1>
        <p className="page-subtitle">Revenue, business health, activity, and execution history.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Revenue" value={`$${data.revenue.toLocaleString()}`} />
        <Metric label="Customers" value={data.customers} />
        <Metric label="Open tickets" value={data.openTickets} />
        <Metric label="Health score" value={data.health.score} />
      </div>
      <div className="panel h-80">
        <h2 className="section-title">Health Factors</h2>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1f9d8a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="panel">
      <div className="text-sm text-steel dark:text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}
