import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export function ModulePage({ title, endpoint }) {
  const query = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await api.get(endpoint)).data,
    enabled: Boolean(endpoint)
  });

  const rows = Array.isArray(query.data) ? query.data : [];

  return (
    <section className="space-y-5">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">Spec-aligned NxtBiz module surface for operational workflows.</p>
      </div>
      <div className="panel">
        {!endpoint && <p className="text-sm text-steel">Runtime settings will be connected in a later phase.</p>}
        {query.isLoading && <p className="text-sm text-steel">Loading records...</p>}
        {query.error && <p className="text-sm text-red-600">Unable to load this module.</p>}
        {endpoint && !query.isLoading && !rows.length && <p className="text-sm text-steel">No records yet.</p>}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase text-steel dark:border-neutral-800 dark:text-slate-400">
                <tr>
                  {Object.keys(rows[0]).slice(0, 5).map((key) => <th className="py-2 pr-4" key={key}>{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-b border-slate-100 dark:border-neutral-800" key={row._id ?? JSON.stringify(row)}>
                    {Object.keys(rows[0]).slice(0, 5).map((key) => (
                      <td className="max-w-xs truncate py-3 pr-4" key={key}>{String(row[key] ?? "")}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
