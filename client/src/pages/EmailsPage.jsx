import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Send, RefreshCw } from "lucide-react";
import { api } from "../lib/api.js";

const initialForm = {
  sender: "",
  subject: "",
  body: ""
};

export function EmailsPage() {
  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();

  const {
    data: emails = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["emails"],
    queryFn: async () => (await api.get("/api/emails")).data
  });

  const processMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/api/emails/process", payload)).data,
    onSuccess: () => {
      toast.success("Email processed successfully");
      setForm(initialForm);
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to process email");
    }
  });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    processMutation.mutate(form);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="page-title">Email Dashboard</h1>
          <p className="page-subtitle">Process customer messages into sentiment, intent, urgency, and follow-up actions.</p>
        </div>
        <button className="secondary-button" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="section-title">Process Incoming Email</h2>
            <p className="text-sm text-steel dark:text-slate-400">Submit an email for NxtBiz analysis and orchestration.</p>
          </div>

          <div>
            <label className="field-label">Email input</label>
            <input
              className="field"
              type="email"
              value={form.sender}
              onChange={(event) => updateField("sender", event.target.value)}
              placeholder="customer@example.com"
              required
            />
          </div>

          <div>
            <label className="field-label">Subject</label>
            <input
              className="field"
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              placeholder="Invoice question or support request"
              required
            />
          </div>

          <div>
            <label className="field-label">Message body</label>
            <textarea
              className="field min-h-36 resize-y py-2"
              value={form.body}
              onChange={(event) => updateField("body", event.target.value)}
              placeholder="Paste the customer email body here..."
              required
            />
          </div>

          <button className="primary-button flex w-full items-center justify-center gap-2" disabled={processMutation.isPending}>
            <Send size={16} />
            {processMutation.isPending ? "Processing..." : "Process Email"}
          </button>
        </form>

        <div className="panel">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title mb-0">Processed Emails</h2>
            <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-neutral-800 dark:text-slate-300">
              {emails.length} records
            </span>
          </div>

          {isLoading && <StateMessage message="Loading processed emails..." />}
          {error && <StateMessage tone="error" message="Unable to load processed emails." />}
          {!isLoading && !error && emails.length === 0 && <StateMessage message="No processed emails yet." />}

          {emails.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Sender</th>
                    <th className="table-th">Subject</th>
                    <th className="table-th">Intent</th>
                    <th className="table-th">Urgency</th>
                    <th className="table-th">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr className="table-row" key={email._id}>
                      <td className="table-td">{email.sender}</td>
                      <td className="table-td max-w-xs truncate">{email.subject}</td>
                      <td className="table-td"><Badge>{email.intent ?? "general"}</Badge></td>
                      <td className="table-td"><Badge tone={urgencyTone(email.urgency)}>{email.urgency ?? "low"}</Badge></td>
                      <td className="table-td"><Badge tone={sentimentTone(email.sentiment)}>{email.sentiment ?? "neutral"}</Badge></td>
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

function StateMessage({ message, tone = "muted" }) {
  return <p className={tone === "error" ? "text-sm text-red-600" : "text-sm text-steel dark:text-slate-400"}>{message}</p>;
}

function Badge({ children, tone = "neutral" }) {
  const classes = {
    neutral: "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300",
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
  };
  return <span className={`rounded px-2 py-1 text-xs font-medium ${classes[tone]}`}>{children}</span>;
}

function urgencyTone(value) {
  if (value === "critical" || value === "high") return "danger";
  if (value === "medium") return "warning";
  return "good";
}

function sentimentTone(value) {
  if (value === "positive") return "good";
  if (value === "negative") return "danger";
  return "neutral";
}
