import React, { useMemo } from "react";
import { CalendarClock, Layers3, ShieldCheck, Truck, Wallet } from "lucide-react";
import { TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import { palette } from "../app/theme.js";
import { useProjects } from "../projects/ProjectStore.jsx";
import { getProjectBudgetMetrics, getProjectSubsystemIds } from "../projects/projectSelectors.js";

const SHARED_POOL_META = {
  id: "SHARED",
  label: "Shared / depot pool",
  full: "Shared project tooling",
};

const fmt = (value) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const pct = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const lifecycleLabel = (tool) => {
  const lifecycle = tool?.lifecycle || {};
  const intervalValue = Number(lifecycle.intervalValue);
  const unit = lifecycle.intervalUnit === "months" ? "month" : "year";

  if (lifecycle.type === "consumable") {
    if (intervalValue > 0) {
      return `Consumable replenishment every ${intervalValue} ${unit}${intervalValue > 1 ? "s" : ""}`;
    }
    return "Consumable replenishment";
  }

  if (lifecycle.type === "periodic_replacement") {
    if (intervalValue > 0) {
      return `Periodic replacement every ${intervalValue} ${unit}${intervalValue > 1 ? "s" : ""}`;
    }
    return "Periodic replacement";
  }

  if (lifecycle.type === "condition_based") {
    return "Condition-based replacement";
  }

  return "Durable tool";
};

const cardStyle = {
  background: palette.surfaceLowest,
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 16px 34px rgba(17, 24, 39, 0.06)",
};

function KpiCard({ icon: Icon, label, value, note, accent, tone }) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          width: "46px",
          height: "46px",
          borderRadius: "14px",
          background: tone,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          marginBottom: "16px",
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ color: palette.inkMuted, fontSize: "13px", marginBottom: "8px" }}>{label}</div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "30px",
          fontWeight: 700,
          color: accent,
          marginBottom: "10px",
        }}
      >
        {value}
      </div>
      <div style={{ color: palette.inkSoft, lineHeight: 1.55, fontSize: "14px" }}>{note}</div>
    </div>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      <div style={{ color: palette.inkSoft, lineHeight: 1.6 }}>{description}</div>
    </div>
  );
}

function StackedBarChart({ rows, total }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "14px" }}>
      <SectionTitle
        title="Tooling cost by subsystem"
        description="Mobilization, renewals and calibration / verification service are stacked to show the full tooling contract footprint by subsystem."
      />

      <div style={{ display: "grid", gap: "14px" }}>
        {rows.map((row) => {
          const mobilizationWidth = total ? (row.mobilization / total) * 100 : 0;
          const renewalsWidth = total ? (row.renewals / total) * 100 : 0;
          const serviceWidth = total ? (row.service / total) * 100 : 0;
          return (
            <div key={row.subsystemId} style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline" }}>
                <div>
                  <div style={{ fontWeight: 700, color: palette.ink }}>{row.label}</div>
                  <div style={{ color: palette.inkMuted, fontSize: "12px" }}>{row.full}</div>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: palette.primary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(row.total)} EUR
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  height: "14px",
                  borderRadius: "999px",
                  overflow: "hidden",
                  background: palette.surfaceLow,
                }}
              >
                <div
                  style={{
                    width: `${mobilizationWidth}%`,
                    background: palette.teal,
                    minWidth: row.mobilization > 0 ? "2px" : 0,
                  }}
                />
                <div
                  style={{
                    width: `${renewalsWidth}%`,
                    background: "#7c3aed",
                    minWidth: row.renewals > 0 ? "2px" : 0,
                  }}
                />
                <div
                  style={{
                    width: `${serviceWidth}%`,
                    background: "#f97316",
                    minWidth: row.service > 0 ? "2px" : 0,
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", fontSize: "12px", color: palette.inkMuted }}>
                <span>Mobilization: <strong style={{ color: palette.teal }}>{fmt(row.mobilization)} EUR</strong></span>
                <span>Renewals: <strong style={{ color: "#7c3aed" }}>{fmt(row.renewals)} EUR</strong></span>
                <span>Service: <strong style={{ color: "#f97316" }}>{fmt(row.service)} EUR</strong></span>
                <span>Renewals/year: <strong style={{ color: palette.ink }}>{fmt(row.annualRenewals)} EUR</strong></span>
                <span>Service/year: <strong style={{ color: palette.ink }}>{fmt(row.annualService)} EUR</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: palette.inkMuted }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: palette.teal }} />
          Mobilization
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#7c3aed" }} />
          Renewals
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#f97316" }} />
          Calibration / verification
        </span>
      </div>
    </div>
  );
}

function DonutLevelChart({ metrics }) {
  const segments = [
    {
      label: "Technician",
      mobilization: metrics.levelTotals.T,
      renewals: metrics.renewalLevelTotals.T,
      service: metrics.serviceLevelTotals.T,
      annualRenewals: metrics.renewalLevelAnnualTotals.T,
      annualService: metrics.serviceLevelAnnualTotals.T,
      color: palette.teal,
    },
    {
      label: "Team",
      mobilization: metrics.levelTotals.E,
      renewals: metrics.renewalLevelTotals.E,
      service: metrics.serviceLevelTotals.E,
      annualRenewals: metrics.renewalLevelAnnualTotals.E,
      annualService: metrics.serviceLevelAnnualTotals.E,
      color: palette.primary,
    },
    {
      label: "Project / depot",
      mobilization: metrics.levelTotals.P,
      renewals: metrics.renewalLevelTotals.P,
      service: metrics.serviceLevelTotals.P,
      annualRenewals: metrics.renewalLevelAnnualTotals.P,
      annualService: metrics.serviceLevelAnnualTotals.P,
      color: "#7c3aed",
    },
  ].map((segment) => ({
    ...segment,
    total: segment.mobilization + segment.renewals + segment.service,
  }));

  const total = segments.reduce((sum, segment) => sum + segment.total, 0);

  let cursor = 0;
  const gradient = segments
    .map((segment) => {
      const start = total ? (cursor / total) * 100 : 0;
      cursor += segment.total;
      const end = total ? (cursor / total) * 100 : 0;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div style={{ ...cardStyle, display: "grid", gap: "18px" }}>
      <SectionTitle
        title="Tooling contract mix by level"
        description="Distribution of mobilization, renewals and recurring service across Technician, Team and Project / depot tooling."
      />

      <div style={{ display: "grid", justifyItems: "center", gap: "18px" }}>
        <div
          style={{
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: total
              ? `conic-gradient(${gradient})`
              : palette.surfaceLow,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: "132px",
              height: "132px",
              borderRadius: "50%",
              background: palette.surfaceLowest,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: "16px",
            }}
          >
            <div>
              <div style={{ color: palette.inkMuted, fontSize: "12px", marginBottom: "6px" }}>Contract total</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: palette.ink,
                }}
              >
                {fmt(metrics.contractTotal)}
              </div>
              <div style={{ color: palette.inkMuted, fontSize: "11px", marginTop: "4px" }}>EUR</div>
            </div>
          </div>
        </div>

        <div style={{ width: "100%", display: "grid", gap: "10px" }}>
          {segments.map((segment) => (
            <div
              key={segment.label}
              style={{
                background: palette.surfaceLow,
                borderRadius: "14px",
                padding: "12px 14px",
                display: "grid",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 700, color: palette.ink }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: segment.color }} />
                  {segment.label}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: segment.color,
                  }}
                >
                  {fmt(segment.total)} EUR
                </div>
              </div>
              <div style={{ color: palette.inkMuted, fontSize: "12px", lineHeight: 1.5 }}>
                {pct(segment.total, total)}% of contract total
                <br />
                Mobilization {fmt(segment.mobilization)} EUR · Renewals {fmt(segment.renewals)} EUR · Service {fmt(segment.service)} EUR
                <br />
                Renewals/year {fmt(segment.annualRenewals)} EUR · Service/year {fmt(segment.annualService)} EUR
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubsystemTable({ rows, contractTotal }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Tooling budget table by subsystem"
        description="Main operating table for maintenance budgeting. Each row combines workforce footprint, tooling mobilization budget and lifecycle-driven renewals."
      />

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "980px" }}>
          <thead>
            <tr style={{ textAlign: "left", color: palette.inkMuted, fontSize: "12px" }}>
              {[ 
                "Subsystem",
                "Tech",
                "Team",
                "Project / depot",
                "Mobilization",
                "Renewals",
                "Calibration / verification",
                "Renewals / year",
                "Service / year",
                "Contract total",
                "% of total",
              ].map((label) => (
                <th key={label} style={{ padding: "0 0 12px", borderBottom: `1px solid ${palette.surfaceLow}` }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.subsystemId}>
                <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}` }}>
                  <div style={{ fontWeight: 700, color: palette.ink }}>{row.label}</div>
                  <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>{row.full}</div>
                </td>
                <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink }}>
                  {row.counts.tech}
                </td>
                <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink }}>
                  {row.counts.equipe}
                </td>
                <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink }}>
                  {row.counts.project}
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    borderBottom: `1px solid ${palette.surfaceLow}`,
                    color: palette.teal,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {fmt(row.mobilization)}
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    borderBottom: `1px solid ${palette.surfaceLow}`,
                    color: "#7c3aed",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {fmt(row.renewals)}
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    borderBottom: `1px solid ${palette.surfaceLow}`,
                    color: "#f97316",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {fmt(row.service)}
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    borderBottom: `1px solid ${palette.surfaceLow}`,
                    color: palette.ink,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {fmt(row.annualRenewals)}
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    borderBottom: `1px solid ${palette.surfaceLow}`,
                    color: palette.ink,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {fmt(row.annualService)}
                </td>
                <td
                  style={{
                    padding: "14px 8px",
                    borderBottom: `1px solid ${palette.surfaceLow}`,
                    color: palette.primary,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {fmt(row.total)}
                </td>
                <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink }}>
                  {pct(row.total, contractTotal)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RenewalDrivers({ metrics }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "14px" }}>
      <SectionTitle
        title="Main tooling renewal drivers"
        description="Highest projected renewal costs over the contract, based on the lifecycle assumptions currently stored on the selected tools."
      />

      <div style={{ display: "grid", gap: "12px" }}>
        {metrics.renewalDrivers.map((tool) => (
          <div
            key={tool.uid}
            style={{
              background: palette.surfaceLow,
              borderRadius: "14px",
              padding: "14px 16px",
              display: "grid",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontWeight: 700, color: palette.ink }}>{tool.name}</div>
                <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>
                  {tool.subsystem} · {tool.brand} · {tool.model}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#7c3aed",
                  whiteSpace: "nowrap",
                }}
              >
                {fmt(tool.renewalCost)} EUR
              </div>
            </div>
            <div style={{ color: palette.inkMuted, fontSize: "12px", lineHeight: 1.55 }}>
              {lifecycleLabel(tool)} · {tool.renewalCount} renewal cycle(s)
              <br />
              Renewals/year {fmt(tool.renewalCost / Math.max(1, metrics.contractDurationMonths / 12))} EUR
            </div>
          </div>
        ))}
        {metrics.renewalDrivers.length === 0 && (
          <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>
            No renewal budget is currently forecast for this project.
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceDrivers({ metrics }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "14px" }}>
      <SectionTitle
        title="Main tooling service-cost drivers"
        description="Highest projected calibration, verification or dielectric-testing costs over the contract."
      />

      <div style={{ display: "grid", gap: "12px" }}>
        {metrics.serviceDrivers.map((tool) => (
          <div
            key={tool.uid}
            style={{
              background: palette.surfaceLow,
              borderRadius: "14px",
              padding: "14px 16px",
              display: "grid",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontWeight: 700, color: palette.ink }}>{tool.name}</div>
                <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>
                  {tool.subsystem} · {tool.brand} · {tool.model}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#f97316",
                  whiteSpace: "nowrap",
                }}
              >
                {fmt(tool.serviceCost)} EUR
              </div>
            </div>
            <div style={{ color: palette.inkMuted, fontSize: "12px", lineHeight: 1.55 }}>
              {tool.service.type === "none" ? "No periodic service" : `${tool.service.type.replaceAll("_", " ")}`}
              {" · "}
              {tool.serviceEventCount} event(s) over contract
              <br />
              Service/year {fmt(tool.serviceCost / Math.max(1, metrics.contractDurationMonths / 12))} EUR
            </div>
          </div>
        ))}
        {metrics.serviceDrivers.length === 0 && (
          <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>
            No calibration or verification cost is currently forecast for this project.
          </div>
        )}
      </div>
    </div>
  );
}

function FleetBudgetTable({ title, description, headers, rows, renderRow, minWidth = "720px", emptyState }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle title={title} description={description} />
      {rows.length ? (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth }}>
            <thead>
              <tr style={{ textAlign: "left", color: palette.inkMuted, fontSize: "12px" }}>
                {headers.map((label) => (
                  <th key={label} style={{ padding: "0 0 12px", borderBottom: `1px solid ${palette.surfaceLow}` }}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{rows.map(renderRow)}</tbody>
          </table>
        </div>
      ) : (
        <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>{emptyState}</div>
      )}
    </div>
  );
}

export default function BudgetPage() {
  const { activeProject } = useProjects();
  const metrics = useMemo(() => getProjectBudgetMetrics(activeProject), [activeProject]);
  const activeSubsystemIds = useMemo(() => getProjectSubsystemIds(activeProject), [activeProject]);
  const coveragePct = metrics.mandatoryTotal
    ? Math.round((metrics.mandatorySelected / metrics.mandatoryTotal) * 100)
    : 0;

  const subsystemRows = useMemo(
    () => {
      const rowIds = metrics.hasSharedProjectPool ? [...activeSubsystemIds, SHARED_POOL_META.id] : activeSubsystemIds;
      return rowIds.map((subsystemId) => {
        const meta = TOOLING_SUBSYSTEMS.find((item) => item.id === subsystemId);
        const counts =
          subsystemId === SHARED_POOL_META.id
            ? { tech: "—", equipe: "—", project: "1" }
            : activeProject?.workforce?.[subsystemId] || {
                tech: 0,
                equipe: 0,
                project: 0,
              };
        const totals = metrics.subsystemTotals.find((item) => item.subsystem === subsystemId) || {
          mobilization: 0,
          renewals: 0,
          service: 0,
          annualRenewals: 0,
          annualService: 0,
          total: 0,
        };

        return {
          subsystemId,
          label: meta?.label || (subsystemId === SHARED_POOL_META.id ? SHARED_POOL_META.label : subsystemId),
          full: meta?.full || (subsystemId === SHARED_POOL_META.id ? SHARED_POOL_META.full : subsystemId),
          counts,
          mobilization: totals.mobilization,
          renewals: totals.renewals,
          service: totals.service,
          annualRenewals: totals.annualRenewals,
          annualService: totals.annualService,
          total: totals.total,
        };
      });
    },
    [activeProject, activeSubsystemIds, metrics.hasSharedProjectPool, metrics.subsystemTotals]
  );
  const fleetSubsystemRows = useMemo(
    () =>
      metrics.fleetMetrics.bySubsystem.map((row) => {
        const meta = TOOLING_SUBSYSTEMS.find((item) => item.id === row.subsystemId);
        return {
          ...row,
          label: meta?.label || row.subsystemId,
          full: meta?.full || row.subsystemId,
        };
      }),
    [metrics.fleetMetrics.bySubsystem]
  );
  const fleetStrategyRows = useMemo(
    () =>
      metrics.fleetMetrics.byStrategy.map((row) => ({
        ...row,
        label: row.strategy === "investment" ? "Investment" : "Rental",
      })),
    [metrics.fleetMetrics.byStrategy]
  );

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          ...cardStyle,
          padding: "28px",
          background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.primaryStrong} 100%)`,
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            opacity: 0.82,
            marginBottom: "12px",
          }}
        >
          Contract budget · {activeProject?.name}
        </div>
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "38px",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "12px",
          }}
        >
          {fmt(metrics.combinedContractTotal)} EUR
        </div>
        <div style={{ maxWidth: "820px", lineHeight: 1.6, opacity: 0.92 }}>
          Unified project view combining tooling and fleet. Tooling remains analyzed with lifecycle detail, while fleet stays on a simpler CAPEX/OPEX breakdown by subsystem and strategy.
        </div>
        <div
          style={{
            marginTop: "18px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Maintenance contract</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {metrics.contractDurationLabel}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Tooling recurring / year</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {fmt(metrics.annualRenewalBudget + metrics.annualServiceBudget)} EUR
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Fleet OPEX / year</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {fmt(metrics.fleetMetrics.annualOperatingCost)} EUR
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Mandatory coverage</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{coveragePct}%</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        <KpiCard
          icon={Layers3}
          label="Initial mobilization"
          value={`${fmt(metrics.initialMobilization)} EUR`}
          note="Budget needed before the maintenance contract starts."
          accent={palette.teal}
          tone={palette.tealSoft}
        />
        <KpiCard
          icon={CalendarClock}
          label="Renewals over contract"
          value={`${fmt(metrics.renewalBudget)} EUR`}
          note={`Average ${fmt(metrics.annualRenewalBudget)} EUR/year over ${metrics.contractDurationLabel}.`}
          accent="#7c3aed"
          tone="rgba(124, 58, 237, 0.08)"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Calibration / verification"
          value={`${fmt(metrics.serviceBudget)} EUR`}
          note={`Average ${fmt(metrics.annualServiceBudget)} EUR/year over ${metrics.contractDurationLabel}.`}
          accent="#f97316"
          tone="rgba(249, 115, 22, 0.10)"
        />
        <KpiCard
          icon={Wallet}
          label="Total contract tooling cost"
          value={`${fmt(metrics.contractTotal)} EUR`}
          note="Mobilization plus forecast renewals and calibration / verification service over the contract."
          accent={palette.primary}
          tone={palette.primarySoft}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
        }}
      >
        <KpiCard
          icon={Truck}
          label="Fleet mobilization CAPEX"
          value={`${fmt(metrics.fleetMetrics.mobilizationCapex)} EUR`}
          note="Initial owned-vehicle CAPEX only. Rental stays at zero here."
          accent={palette.teal}
          tone={palette.tealSoft}
        />
        <KpiCard
          icon={CalendarClock}
          label="Fleet renewal CAPEX net"
          value={`${fmt(metrics.fleetMetrics.renewalCapexNet)} EUR`}
          note={`Avg ${fmt(metrics.fleetMetrics.annualRenewalCapex)} EUR/year. End residual credit: ${fmt(metrics.fleetMetrics.endOfContractResidualCredit)} EUR.`}
          accent="#7c3aed"
          tone="rgba(124, 58, 237, 0.08)"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Fleet annual OPEX"
          value={`${fmt(metrics.fleetMetrics.annualOperatingCost)} EUR`}
          note={`Fuel ${fmt(metrics.fleetMetrics.annualFuelCost)} EUR/year. Region: ${metrics.fleetMetrics.region.label}.`}
          accent="#f97316"
          tone="rgba(249, 115, 22, 0.10)"
        />
        <KpiCard
          icon={Wallet}
          label="Total contract incl. fleet"
          value={`${fmt(metrics.combinedContractTotal)} EUR`}
          note={`Tooling ${fmt(metrics.contractTotal)} EUR + Fleet ${fmt(metrics.fleetMetrics.contractTotal)} EUR.`}
          accent={palette.primary}
          tone={palette.primarySoft}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(420px, 1.15fr) minmax(320px, 0.85fr)",
          gap: "18px",
        }}
      >
        <StackedBarChart rows={subsystemRows} total={metrics.contractTotal} />
        <DonutLevelChart metrics={metrics} />
      </div>

      <SubsystemTable rows={subsystemRows} contractTotal={metrics.contractTotal} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(360px, 1fr) minmax(320px, 0.9fr)",
          gap: "18px",
        }}
      >
        <FleetBudgetTable
          title="Fleet cost by subsystem"
          description="Simple fleet view by subsystem. No technician or team ratios are applied here."
          headers={["Subsystem", "Vehicles", "Mobilization CAPEX", "Renewal CAPEX net", "Avg annual renewal CAPEX", "Annual OPEX", "Contract total"]}
          rows={fleetSubsystemRows}
          emptyState="No fleet line configured on the active project."
          renderRow={(row) => (
            <tr key={row.subsystemId}>
              <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}` }}>
                <div style={{ fontWeight: 700, color: palette.ink }}>{row.label}</div>
                <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>{row.full}</div>
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink }}>
                {row.quantity}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.mobilizationCapex)}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.renewalCapexNet)}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.annualRenewalCapex)}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.annualCost)}
              </td>
              <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.contractTotal)}
              </td>
            </tr>
          )}
        />
        <FleetBudgetTable
          title="Fleet cost by strategy"
          description="Rental and investment are kept separate to make the CAPEX versus recurring OPEX split explicit."
          headers={["Strategy", "Vehicles", "Mobilization CAPEX", "Renewal CAPEX net", "Avg annual renewal CAPEX", "Annual OPEX", "Contract total"]}
          rows={fleetStrategyRows}
          minWidth="920px"
          emptyState="No fleet strategy is configured yet."
          renderRow={(row) => (
            <tr key={row.strategy}>
              <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}`, fontWeight: 700, color: palette.ink }}>
                {row.label}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink }}>
                {row.quantity}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.mobilizationCapex)}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.renewalCapexNet)}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.annualRenewalCapex)}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.annualCost)}
              </td>
              <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                {fmt(row.contractTotal)}
              </td>
            </tr>
          )}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "18px",
        }}
      >
        <RenewalDrivers metrics={metrics} />
        <ServiceDrivers metrics={metrics} />
      </div>
    </div>
  );
}
