import type { ProcedureStats } from "../../types/internal/general";

const COLORS = {
    PENDIENTE: "#FFC107",
    APROBADO: "#28A745",
    CANCELADO: "#9966FF",
    RECHAZADO: "#DC3545",
    FINALIZADO: "#6C757D",
};

function MeterGroup({ stats }:{stats: ProcedureStats}) {
  if (!stats) return null;
  const total = Object.values(stats.stats).reduce((sum, count) => sum + count, 0);

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{
        display: "flex",
        height: 30,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 4px #0001",
        marginBottom: 10,
      }}>
        {Object.entries(stats.stats).map(([state, count]) => (
          <div
            key={state}
            style={{
              width: `${total ? (count / total) * 100 : 0}%`,
              background: COLORS[state as keyof typeof COLORS] || "#ccc",
              display: count === 0 ? "none" : "block",
              transition: "width 0.5s",
            }}
            title={`${state}: ${count} (${total ? Math.round((count / total) * 100) : 0}%)`}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, fontSize: 14 }}>
        {Object.entries(stats.stats).map(([state, count]) => (
          <span key={state}>
            <span style={{
              display: "inline-block",
              width: 12,
              height: 12,
              background: COLORS[state as keyof typeof COLORS] || "#ccc",
              borderRadius: 2,
              marginRight: 6,
              verticalAlign: "middle"
            }} />
            {state}: {count} ({total ? Math.round((count / total) * 100) : 0}%)
          </span>
        ))}
      </div>
    </div>
  );
}

export default MeterGroup;