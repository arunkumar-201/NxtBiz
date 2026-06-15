import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Download, Plus } from "lucide-react";
import { api } from "../lib/api.js";

const initialInvoice = {
  customer: "",
  amount: "",
  dueDate: ""
};

export function InvoicesPage() {
  const [form, setForm] = useState(initialInvoice);
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => (await api.get("/api/invoices")).data
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/api/invoices", {
      ...payload,
      amount: Number(payload.amount),
      customerName: payload.customer,
      lineItems: [{ description: "NxtBiz generated invoice", amount: Number(payload.amount) }]
    })).data,
    onSuccess: () => {
      toast.success("Invoice generated");
      setForm(initialInvoice);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to generate invoice");
    }
  });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="page-title">Invoice Management</h1>
        <p className="page-subtitle">Generate invoices, track payment status, and download customer PDFs.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <h2 className="section-title">Create Invoice</h2>
          <Field label="Customer" value={form.customer} onChange={(value) => updateField("customer", value)} placeholder="Customer or company name" required />
          <Field label="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={(value) => updateField("amount", value)} placeholder="2500.00" required />
          <Field label="Due Date" type="date" value={form.dueDate} onChange={(value) => updateField("dueDate", value)} required />
          <button className="primary-button flex w-full items-center justify-center gap-2" disabled={createMutation.isPending}>
            <Plus size={16} />
            {createMutation.isPending ? "Generating..." : "Generate Invoice"}
          </button>
        </form>

        <div className="panel">
          <h2 className="section-title">Invoice Table</h2>
          {isLoading && <StateMessage message="Loading invoices..." />}
          {error && <StateMessage tone="error" message="Unable to load invoices." />}
          {!isLoading && !error && invoices.length === 0 && <StateMessage message="No invoices generated yet." />}

          {invoices.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Customer</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Due Date</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr className="table-row" key={invoice._id}>
                      <td className="table-td">{invoice.customerName ?? invoice.customer ?? invoice.customerId ?? "Customer"}</td>
                      <td className="table-td">${Number(invoice.amount ?? 0).toLocaleString()}</td>
                      <td className="table-td">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "Not set"}</td>
                      <td className="table-td"><Badge>{invoice.status ?? "draft"}</Badge></td>
                      <td className="table-td">
                        <a className="secondary-button inline-flex" href={`${api.defaults.baseURL}/api/invoices/${invoice._id}/download`} target="_blank" rel="noreferrer">
                          <Download size={14} />
                          Download
                        </a>
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
