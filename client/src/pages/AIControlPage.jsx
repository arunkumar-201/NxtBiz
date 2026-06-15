import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export function AIControlPage() {
  const {
    data: agents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => (await api.get("/api/agents")).data,
  });

  const {
    data: executions = [],
    refetch: refetchExecutions,
  } = useQuery({
    queryKey: ["executions"],
    queryFn: async () =>
      (await api.get("/api/agents/executions")).data,
  });

  const runAgentMutation = useMutation({
    mutationFn: async (agentId) => {
      const response = await api.post("/api/agents/run", {
        agentId,
      });
      return response.data;
    },

    onSuccess: () => {
      alert("Agent execution started!");
      setTimeout(() => {
        refetchExecutions();
      }, 1000);
    },

    onError: (error) => {
      console.error("Agent run failed:", error);
      alert("Failed to run agent");
    },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">AI Control Center</h1>
        <p className="page-subtitle">
          Monitor and manage AI agents across the NxtBiz platform.
        </p>
      </div>

      {isLoading && (
        <div className="panel">
          <p>Loading agents...</p>
        </div>
      )}

      {error && (
        <div className="panel">
          <p className="text-red-500">
            Failed to load agents.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => (
              <div
                key={agent._id}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <h3 className="text-lg font-semibold">
                  {agent.name || agent.agentId}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {agent.agentId}
                </p>

                <div className="mt-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    {agent.status || "Idle"}
                  </span>
                </div>

                <button
                  onClick={() =>
                    runAgentMutation.mutate(agent.agentId)
                  }
                  disabled={runAgentMutation.isPending}
                  className="mt-4 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {runAgentMutation.isPending
                    ? "Running..."
                    : "Run Agent"}
                </button>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2 className="mb-4 text-lg font-semibold">
              Execution History
            </h2>

            {executions.length === 0 ? (
              <p className="text-sm text-gray-500">
                No agent executions yet.
              </p>
            ) : (
              <div className="space-y-3">
                {executions.map((execution) => (
                  <div
                    key={execution._id}
                    className="rounded-lg border p-3"
                  >
                    <div className="font-medium">
                      {execution.agentId}
                    </div>

                    <div className="text-sm text-gray-600">
                      Status: {execution.status}
                    </div>

                    <div className="text-xs text-gray-400">
                      Started:
                      {" "}
                      {new Date(
                        execution.startedAt ||
                          execution.createdAt
                      ).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}