import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Download, FilePlus } from "lucide-react";
import { api } from "../lib/api.js";

const initialReport = {
  title: "",
  type: "weekly"
};

export function ReportsPage() {
  const [form, setForm] = useState(initialReport);
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await api.get("/api/reports")).data
  });

  const generateMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/api/reports/generate", {
      ...payload,
      summary: `${payload.title} generated from the NxtBiz operations console.`,
      metrics: {
        revenue: "tracked",
        tickets: "tracked",
        meetings: "tracked"
      },
      recommendations: ["Review high-priority tickets", "Follow up on open invoices", "Inspect agent execution history"]
    })).data,
    onSuccess: () => {
      toast.success("Report generated");
      setForm(initialReport);
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to generate report");
    }
  });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    generateMutation.mutate(form);
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="page-title">Report Management</h1>
        <p className="page-subtitle">Generate operational reports and keep executive history accessible.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <h2 className="section-title">Generate Report</h2>
          <Field label="Report Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Weekly Operations Report" required />
          <div>
            <label className="field-label">Report Type</label>
            <select className="field" value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option value="weekly">weekly</option>
              <option value="executive">executive</option>
              <option value="customer_health">customer_health</option>
              <option value="agent_execution">agent_execution</option>
            </select>
          </div>
          <button className="primary-button flex w-full items-center justify-center gap-2" disabled={generateMutation.isPending}>
            <FilePlus size={16} />
            {generateMutation.isPending ? "Generating..." : "Generate Report"}
          </button>
        </form>

        <div className="panel">
          <h2 className="section-title">Report History</h2>
          {isLoading && <StateMessage message="Loading reports..." />}
          {error && <StateMessage tone="error" message="Unable to load reports." />}
          {!isLoading && !error && reports.length === 0 && <StateMessage message="No reports generated yet." />}

          {reports.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Title</th>
                    <th className="table-th">Type</th>
                    <th className="table-th">Generated</th>
                    <th className="table-th">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr className="table-row" key={report._id}>
                      <td className="table-td font-medium">{report.title}</td>
                      <td className="table-td"><Badge>{report.type ?? "report"}</Badge></td>
                      <td className="table-td">{report.createdAt ? new Date(report.createdAt).toLocaleString() : "Unknown"}</td>
                      <td className="table-td">
                        {report.pdfUrl ? (
                          <a className="secondary-button inline-flex" href={report.pdfUrl} target="_blank" rel="noreferrer">
                            <Download size={14} />
                            Download
                          </a>
                        ) : (
                          <span className="text-sm text-steel dark:text-slate-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input className="field" value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  );
}

function Badge({ children }) {
  return <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-neutral-800 dark:text-slate-300">{children}</span>;
}

function StateMessage({ message, tone = "muted" }) {
  return <p className={tone === "error" ? "text-sm text-red-600" : "text-sm text-steel dark:text-slate-400"}>{message}</p>;
}
