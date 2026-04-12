import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  Database,
  FolderKanban,
  Layers3,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { TOOLING_CONTEXTS, TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import { palette } from "../app/theme.js";
import { useProjects } from "../projects/ProjectStore.jsx";
import {
  getProjectBudgetMetrics,
  getProjectReportingMetrics,
  getProjectSubsystemIds,
} from "../projects/projectSelectors.js";

const SHARED_POOL_META = {
  id: "SHARED",
  label: "Shared / depot pool",
  full: "Shared project tooling",
};

const cardStyle = {
  background: palette.surfaceLowest,
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 16px 34px rgba(17, 24, 39, 0.06)",
};

const monoStyle = {
  fontFamily: "'JetBrains Mono', monospace",
  fontWeight: 700,
};

const fmt = (value) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));

const lifecycleLabel = (tool) => {
  const lifecycle = tool?.lifecycle || {};
  const intervalValue = Number(lifecycle.intervalValue);
  const unit = lifecycle.intervalUnit === "months" ? "month" : "year";

  if (lifecycle.type === "consumable") {
    return intervalValue > 0
      ? `Consumable replenishment every ${intervalValue} ${unit}${intervalValue > 1 ? "s" : ""}`
      : "Consumable replenishment";
  }
  if (lifecycle.type === "periodic_replacement") {
    return intervalValue > 0
      ? `Periodic replacement every ${intervalValue} ${unit}${intervalValue > 1 ? "s" : ""}`
      : "Periodic replacement";
  }
  if (lifecycle.type === "condition_based") {
    return "Condition-based replacement";
  }
  return "Durable tool";
};

const severityMeta = {
  high: { tone: palette.safetySoft, color: palette.safety, label: "High" },
  medium: { tone: palette.primarySoft, color: palette.primary, label: "Medium" },
  low: { tone: palette.tealSoft, color: palette.teal, label: "Low" },
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
          ...monoStyle,
          fontSize: "28px",
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

function SimpleTable({ headers, rows, renderRow, minWidth = "880px" }) {
  return (
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
  );
}

function CostByCategoryTable({ rows, contractTotal }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Cost by category"
        description="Global category split for the active project, combining mobilization, project-phase renewals, calibration / verification cost and annualized recurring exposure."
      />
      <SimpleTable
        headers={["Category", "Mobilization", "Project phase renewals", "Calibration / verification", "Avg recurring / year", "Contract total", "% total"]}
        rows={rows}
        renderRow={(row) => (
          <tr key={row.id}>
            <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}`, fontWeight: 700, color: palette.ink }}>
              {row.label}
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>
              {fmt(row.mobilization)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>
              {fmt(row.renewals)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>
              {fmt(row.service)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>
              {fmt(row.annualRenewals + row.annualService)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, ...monoStyle }}>
              {fmt(row.total)} EUR
            </td>
            <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>
              {contractTotal ? Math.round((row.total / contractTotal) * 100) : 0}%
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function CostBySubsystemTable({ rows }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Tooling cost by subsystem"
        description="Financial footprint of each subsystem selected on the active project, including recurring service-cost assumptions."
      />
      <SimpleTable
        headers={["Subsystem", "Mobilization", "Project phase renewals", "Calibration / verification", "Avg recurring / year", "Contract total"]}
        rows={rows}
        minWidth="760px"
        renderRow={(row) => (
          <tr key={row.id}>
            <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}` }}>
              <div style={{ fontWeight: 700, color: palette.ink }}>{row.label}</div>
              <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>{row.full}</div>
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>
              {fmt(row.mobilization)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>
              {fmt(row.renewals)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>
              {fmt(row.service)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>
              {fmt(row.annualRenewals + row.annualService)} EUR
            </td>
            <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, ...monoStyle }}>
              {fmt(row.total)} EUR
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function AllocationLevelMatrix({ rows }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Tooling subsystem x allocation level matrix"
        description="Mobilization, project-phase renewals, calibration / verification cost and annualized recurring exposure split between Technician, Team and Project / depot."
      />
      <SimpleTable
        headers={[
          "Subsystem",
          "Tech mob",
          "Team mob",
          "Project mob",
          "Tech renewals",
          "Team renewals",
          "Project renewals",
          "Tech service",
          "Team service",
          "Project service",
          "Tech avg/year",
          "Team avg/year",
          "Project avg/year",
        ]}
        rows={rows}
        minWidth="1540px"
        renderRow={(row) => (
          <tr key={row.subsystem}>
            <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}`, fontWeight: 700, color: palette.ink }}>
              {row.label}
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>{fmt(row.techMob)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>{fmt(row.teamMob)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>{fmt(row.projectMob)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>{fmt(row.techRenewals)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>{fmt(row.teamRenewals)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>{fmt(row.projectRenewals)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>{fmt(row.techService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>{fmt(row.teamService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>{fmt(row.projectService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>{fmt(row.techAnnualRenewals + row.techAnnualService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>{fmt(row.teamAnnualRenewals + row.teamAnnualService)}</td>
            <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>{fmt(row.projectAnnualRenewals + row.projectAnnualService)}</td>
          </tr>
        )}
      />
    </div>
  );
}

function DetailedSubsystemBreakdown({ subsystemTabs, activeSubsystem, onChange, rows }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Detailed tooling subsystem breakdown"
        description="Category-level cost split inside each subsystem, with separate Technician, Team and Project / depot views for mobilization, renewals and recurring service."
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {subsystemTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              border: `1px solid ${activeSubsystem === tab.id ? palette.primary : "rgba(71, 84, 103, 0.14)"}`,
              borderRadius: "999px",
              background: activeSubsystem === tab.id ? palette.primarySoft : palette.surfaceLow,
              color: activeSubsystem === tab.id ? palette.primary : palette.inkSoft,
              padding: "9px 12px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SimpleTable
        headers={[
          "Category",
          "Tech mob",
          "Team mob",
          "Project mob",
          "Tech renewals",
          "Team renewals",
          "Project renewals",
          "Tech service",
          "Team service",
          "Project service",
          "Tech avg/year",
          "Team avg/year",
          "Project avg/year",
          "Contract total",
        ]}
        rows={rows}
        minWidth="1700px"
        renderRow={(row) => (
          <tr key={row.id}>
            <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}`, fontWeight: 700, color: palette.ink }}>
              {row.label}
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>{fmt(row.techMob)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>{fmt(row.teamMob)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>{fmt(row.projectMob)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>{fmt(row.techRenewals)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>{fmt(row.teamRenewals)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>{fmt(row.projectRenewals)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>{fmt(row.techService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>{fmt(row.teamService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>{fmt(row.projectService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>{fmt(row.techAnnualRenewals + row.techAnnualService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>{fmt(row.teamAnnualRenewals + row.teamAnnualService)}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>{fmt(row.projectAnnualRenewals + row.projectAnnualService)}</td>
            <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, ...monoStyle }}>{fmt(row.total)}</td>
          </tr>
        )}
      />
    </div>
  );
}

function ComplianceMatrix({ rows }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Tooling compliance by subsystem"
        description="Mandatory tooling coverage and renewal exposure for each subsystem enabled on the active project."
      />
      <SimpleTable
        headers={["Subsystem", "Visible tools", "Selected", "Mandatory", "Mandatory selected", "Coverage", "Renewal-sensitive", "Renewal budget"]}
        rows={rows}
        renderRow={(row) => (
          <tr key={row.subsystem}>
            <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}` }}>
              <div style={{ fontWeight: 700, color: palette.ink }}>{row.label}</div>
              <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>{row.full}</div>
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.visibleCount}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.selectedCount}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.mandatoryCount}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.selectedMandatoryCount}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  background: row.coveragePct === 100 ? palette.tealSoft : palette.safetySoft,
                  color: row.coveragePct === 100 ? palette.teal : palette.safety,
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              >
                {row.coveragePct}%
              </div>
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.renewalSensitiveCount}</td>
            <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>
              {fmt(row.renewalBudget)} EUR
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function FleetReportingTable({ title, description, headers, rows, renderRow, minWidth = "720px", emptyState }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle title={title} description={description} />
      {rows.length ? (
        <SimpleTable headers={headers} rows={rows} renderRow={renderRow} minWidth={minWidth} />
      ) : (
        <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>{emptyState}</div>
      )}
    </div>
  );
}

function AlertsPanel({ alerts, missingMandatoryTools }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Critical alerts"
        description="Priority findings that should be resolved before relying on the current tooling baseline."
      />
      <div style={{ display: "grid", gap: "12px" }}>
        {alerts.map((alert) => {
          const meta = severityMeta[alert.severity] || severityMeta.medium;
          return (
            <div
              key={`${alert.severity}-${alert.title}`}
              style={{
                background: meta.tone,
                color: meta.color,
                borderRadius: "14px",
                padding: "14px 16px",
                display: "grid",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>{alert.title}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {meta.label}
                </div>
              </div>
              <div style={{ lineHeight: 1.55, fontSize: "13px" }}>{alert.detail}</div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>
            No critical alert on the active project. Mandatory coverage and data assumptions are currently stable.
          </div>
        )}
      </div>
      {missingMandatoryTools.length > 0 && (
        <div style={{ display: "grid", gap: "10px" }}>
          <div style={{ fontWeight: 700, color: palette.ink }}>Missing mandatory references</div>
          {missingMandatoryTools.slice(0, 6).map((tool) => (
            <div key={tool.uid} style={{ background: palette.surfaceLow, borderRadius: "12px", padding: "12px 14px", display: "grid", gap: "4px" }}>
              <div style={{ fontWeight: 700, color: palette.ink }}>{tool.name}</div>
              <div style={{ color: palette.inkMuted, fontSize: "12px" }}>
                {tool.subsystem} · {tool.brand} · {tool.model}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RenewalWatchlist({ tools, contractDurationLabel, contractDurationMonths }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Renewal watchlist"
        description={`Projected renewal-sensitive tools over the ${contractDurationLabel} maintenance contract. Without a contract start date, this view shows cadence and exposure rather than calendar dates.`}
      />
      <div style={{ display: "grid", gap: "12px" }}>
        {tools.map((tool) => (
          <div key={tool.uid} style={{ background: palette.surfaceLow, borderRadius: "14px", padding: "14px 16px", display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontWeight: 700, color: palette.ink }}>{tool.name}</div>
                <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>
                  {tool.subsystem} · {tool.brand} · {tool.model}
                </div>
              </div>
              <div style={{ color: "#7c3aed", ...monoStyle, whiteSpace: "nowrap" }}>{fmt(tool.renewalCost)} EUR</div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: palette.primarySoft, color: palette.primary, fontSize: "12px", fontWeight: 700 }}>
                {tool.level === "T" ? "Technician" : tool.level === "E" ? "Team" : "Project / depot"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: palette.tealSoft, color: palette.teal, fontSize: "12px", fontWeight: 700 }}>
                {tool.renewalCount} cycle(s)
              </span>
            </div>
            <div style={{ color: palette.inkMuted, fontSize: "12px", lineHeight: 1.55 }}>
              {lifecycleLabel(tool)}
              <br />
              Renewals/year {fmt(tool.renewalCost / Math.max(1, contractDurationMonths / 12))} EUR
            </div>
          </div>
        ))}
        {tools.length === 0 && (
          <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>
            No renewal-sensitive tooling is currently forecast on the active project.
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceWatchlist({ tools, contractDurationLabel, contractDurationMonths }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Calibration / verification watchlist"
        description={`Recurring service-cost exposure over the ${contractDurationLabel} maintenance contract. This covers calibration, verification and dielectric-test assumptions currently stored on the selected tools.`}
      />
      <div style={{ display: "grid", gap: "12px" }}>
        {tools.map((tool) => (
          <div key={tool.uid} style={{ background: palette.surfaceLow, borderRadius: "14px", padding: "14px 16px", display: "grid", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontWeight: 700, color: palette.ink }}>{tool.name}</div>
                <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>
                  {tool.subsystem} · {tool.brand} · {tool.model}
                </div>
              </div>
              <div style={{ color: "#f97316", ...monoStyle, whiteSpace: "nowrap" }}>{fmt(tool.serviceCost)} EUR</div>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: palette.primarySoft, color: palette.primary, fontSize: "12px", fontWeight: 700 }}>
                {tool.level === "T" ? "Technician" : tool.level === "E" ? "Team" : "Project / depot"}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: "rgba(249, 115, 22, 0.10)", color: "#f97316", fontSize: "12px", fontWeight: 700 }}>
                {tool.serviceEventCount} event(s)
              </span>
            </div>
            <div style={{ color: palette.inkMuted, fontSize: "12px", lineHeight: 1.55 }}>
              {tool.service.type === "none" ? "No recurring service" : tool.service.type.replaceAll("_", " ")}
              <br />
              Service/year {fmt(tool.serviceCost / Math.max(1, contractDurationMonths / 12))} EUR
            </div>
          </div>
        ))}
        {tools.length === 0 && (
          <div style={{ color: palette.inkMuted, lineHeight: 1.6 }}>
            No calibration or verification cost is currently forecast on the active project.
          </div>
        )}
      </div>
    </div>
  );
}

function DataQualityPanel({ metrics }) {
  const items = [
    { label: "No price reference", value: metrics.selectedWithoutPriceReferenceCount, tone: palette.primarySoft, color: palette.primary },
    { label: "No lifecycle reference", value: metrics.selectedWithoutLifecycleReferenceCount, tone: palette.tealSoft, color: palette.teal },
    { label: "No service reference", value: metrics.selectedWithoutServiceReferenceCount, tone: "rgba(249, 115, 22, 0.10)", color: "#f97316" },
    { label: "Missing image", value: metrics.selectedWithoutImagesCount, tone: palette.surfaceLow, color: palette.ink },
    { label: "Fragile links", value: metrics.fragileLinks, tone: palette.safetySoft, color: palette.safety },
  ];

  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Data quality and assumptions"
        description="This block shows where the tooling baseline still relies on undocumented price, lifecycle or service assumptions, weak links or missing media."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
        {items.map((item) => (
          <div key={item.label} style={{ background: item.tone, borderRadius: "14px", padding: "14px 16px", display: "grid", gap: "8px" }}>
            <div style={{ color: item.color, fontSize: "12px", fontWeight: 700 }}>{item.label}</div>
            <div style={{ color: item.color, fontSize: "22px", ...monoStyle }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={{ color: palette.inkSoft, lineHeight: 1.6, fontSize: "13px" }}>
        Manual price references documented: <strong style={{ color: palette.ink }}>{metrics.selectedWithManualPriceCount}</strong>
        <br />
        Manual lifecycle assumptions documented: <strong style={{ color: palette.ink }}>{metrics.selectedWithManualLifecycleCount}</strong>
        <br />
        Manual service-cost assumptions documented: <strong style={{ color: palette.ink }}>{metrics.selectedWithManualServiceCount}</strong>
        <br />
        Catalog image coverage in active project perimeter: <strong style={{ color: palette.ink }}>{metrics.imageCoveragePct}%</strong>
      </div>
    </div>
  );
}

function PortfolioSnapshot({ rows }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "16px" }}>
      <SectionTitle
        title="Portfolio snapshot"
        description="Cross-project view stored in the browser. This helps compare coverage, budget and renewal exposure across the maintenance portfolio."
      />
      <SimpleTable
        headers={["Project", "Context", "Subsystems", "Selected tools", "Mandatory coverage", "Renewal-sensitive", "Contract total", "Status"]}
        rows={rows}
        minWidth="980px"
        renderRow={(row) => (
          <tr key={row.id}>
            <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}` }}>
              <div style={{ fontWeight: 700, color: palette.ink }}>{row.name}</div>
              <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>{row.contractLabel}</div>
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.context}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.subsystems}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.selectedCount}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: row.coverage === 100 ? palette.tealSoft : palette.safetySoft, color: row.coverage === 100 ? palette.teal : palette.safety, fontSize: "12px", fontWeight: 700 }}>
                {row.coverage}%
              </span>
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.renewalExposure}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, ...monoStyle }}>{fmt(row.contractTotal)} EUR</td>
            <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "999px", background: row.status === "archived" ? palette.surfaceLow : palette.primarySoft, color: row.status === "archived" ? palette.inkSoft : palette.primary, fontSize: "12px", fontWeight: 700 }}>
                {row.status === "archived" ? "Archived" : "Active"}
              </span>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

export default function ReportingPage() {
  const { activeProject, projects } = useProjects();
  const [activeSubsystemDetail, setActiveSubsystemDetail] = useState("POS");
  const metrics = useMemo(() => getProjectReportingMetrics(activeProject), [activeProject]);
  const budgetMetrics = useMemo(() => getProjectBudgetMetrics(activeProject), [activeProject]);
  const activeSubsystemIds = useMemo(() => getProjectSubsystemIds(activeProject), [activeProject]);

  useEffect(() => {
    if (!activeSubsystemIds.includes(activeSubsystemDetail)) {
      setActiveSubsystemDetail(activeSubsystemIds[0] || "POS");
    }
  }, [activeSubsystemIds, activeSubsystemDetail]);

  const context = useMemo(
    () => TOOLING_CONTEXTS.find((item) => item.id === activeProject?.contextId),
    [activeProject]
  );

  const subsystemMetaMap = useMemo(
    () =>
      Object.fromEntries([
        ...TOOLING_SUBSYSTEMS.map((subsystem) => [subsystem.id, subsystem]),
        [SHARED_POOL_META.id, SHARED_POOL_META],
      ]),
    []
  );

  const subsystemCoverageRows = useMemo(
    () =>
      metrics.subsystemCoverage.map((row) => ({
        ...row,
        label: subsystemMetaMap[row.subsystem]?.label || row.subsystem,
        full: subsystemMetaMap[row.subsystem]?.full || row.subsystem,
      })),
    [metrics.subsystemCoverage, subsystemMetaMap]
  );

  const subsystemCostRows = useMemo(
    () =>
      metrics.subsystemCostRows.map((row) => ({
        ...row,
        label: subsystemMetaMap[row.id]?.label || row.id,
        full: subsystemMetaMap[row.id]?.full || row.id,
      })),
    [metrics.subsystemCostRows, subsystemMetaMap]
  );
  const fleetSubsystemRows = useMemo(
    () =>
      metrics.fleetMetrics.bySubsystem.map((row) => ({
        ...row,
        label: subsystemMetaMap[row.subsystemId]?.label || row.subsystemId,
        full: subsystemMetaMap[row.subsystemId]?.full || row.subsystemId,
      })),
    [metrics.fleetMetrics.bySubsystem, subsystemMetaMap]
  );
  const fleetStrategyRows = useMemo(
    () =>
      metrics.fleetMetrics.byStrategy.map((row) => ({
        ...row,
        label: row.strategy === "investment" ? "Investment" : "Rental",
      })),
    [metrics.fleetMetrics.byStrategy]
  );
  const fleetVehicleTypeRows = useMemo(() => metrics.fleetMetrics.byVehicleType, [metrics.fleetMetrics.byVehicleType]);

  const subsystemLevelRows = useMemo(
    () =>
      metrics.subsystemLevelRows.map((row) => ({
        ...row,
        label: subsystemMetaMap[row.subsystem]?.label || row.subsystem,
      })),
    [metrics.subsystemLevelRows, subsystemMetaMap]
  );

  const detailTabs = useMemo(
    () =>
      Object.keys(metrics.subsystemCategoryRows).map((subsystemId) => ({
        id: subsystemId,
        label: subsystemMetaMap[subsystemId]?.label || subsystemId,
      })),
    [metrics.subsystemCategoryRows, subsystemMetaMap]
  );

  const activeSubsystemRows = metrics.subsystemCategoryRows[activeSubsystemDetail] || [];

  const portfolioRows = useMemo(
    () =>
      projects.map((project) => {
        const projectMetrics = getProjectReportingMetrics(project);
        const projectBudget = getProjectBudgetMetrics(project);
        const contextMeta = TOOLING_CONTEXTS.find((item) => item.id === project.contextId);
        return {
          id: project.id,
          name: project.name,
          context: contextMeta?.label || project.contextId,
          subsystems: getProjectSubsystemIds(project).join(", "),
          selectedCount: projectMetrics.selectedCount,
          coverage: projectMetrics.coveragePct,
          renewalExposure: projectMetrics.renewalExposure,
          contractTotal: projectBudget.combinedContractTotal,
          contractLabel: projectBudget.contractDurationLabel,
          status: project.status === "archived" ? "archived" : "active",
        };
      }),
    [projects]
  );

  const activePortfolioCount = portfolioRows.filter((row) => row.status === "active").length;
  const portfolioContractTotal = portfolioRows
    .filter((row) => row.status === "active")
    .reduce((sum, row) => sum + row.contractTotal, 0);

  const issueCount =
    metrics.missingMandatoryCount +
    metrics.selectedWithoutPriceReferenceCount +
    metrics.selectedWithoutLifecycleReferenceCount +
    metrics.selectedWithoutServiceReferenceCount +
    metrics.fragileLinks;

  const cards = [
    {
      label: "Mandatory coverage",
      value: `${metrics.coveragePct}%`,
      note: `${metrics.selectedMandatoryCount}/${metrics.mandatoryCount} mandatory references currently selected.`,
      icon: ShieldAlert,
      accent: metrics.coveragePct === 100 ? palette.teal : palette.safety,
      tone: metrics.coveragePct === 100 ? palette.tealSoft : palette.safetySoft,
    },
    {
      label: "Selected tools",
      value: `${metrics.selectedCount}`,
      note: `${metrics.levelSelection.T} technician · ${metrics.levelSelection.E} team · ${metrics.levelSelection.P} project/depot`,
      icon: Layers3,
      accent: palette.primary,
      tone: palette.primarySoft,
    },
    {
      label: "Renewal-sensitive tools",
      value: `${metrics.renewalExposure}`,
      note: `${fmt(budgetMetrics.renewalBudget)} EUR forecast renewals over contract.`,
      icon: CalendarClock,
      accent: "#7c3aed",
      tone: "rgba(124, 58, 237, 0.08)",
    },
    {
      label: "Calibration / verification",
      value: `${fmt(budgetMetrics.serviceBudget)} EUR`,
      note: `${metrics.serviceTrackedCount} selected tool(s) currently carry a recurring service-cost assumption.`,
      icon: CalendarClock,
      accent: "#f97316",
      tone: "rgba(249, 115, 22, 0.10)",
    },
    {
      label: "Fleet contract total",
      value: `${fmt(metrics.fleetMetrics.contractTotal)} EUR`,
      note: `${metrics.fleetMetrics.lines.length} vehicle line(s). Avg renewal CAPEX ${fmt(metrics.fleetMetrics.annualRenewalCapex)} EUR/year.`,
      icon: Truck,
      accent: palette.teal,
      tone: palette.tealSoft,
    },
    {
      label: "Data quality issues",
      value: `${issueCount}`,
      note: `${metrics.selectedWithoutPriceReferenceCount} price gaps · ${metrics.selectedWithoutLifecycleReferenceCount} lifecycle gaps · ${metrics.selectedWithoutServiceReferenceCount} service gaps.`,
      icon: Database,
      accent: palette.ink,
      tone: palette.surfaceLow,
    },
    {
      label: "Portfolio active projects",
      value: `${activePortfolioCount}`,
      note: `${fmt(portfolioContractTotal)} EUR total active portfolio exposure.`,
      icon: FolderKanban,
      accent: palette.primary,
      tone: palette.primarySoft,
    },
  ];

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
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.82, marginBottom: "12px" }}>
          Reporting cockpit · {activeProject?.name}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "38px", fontWeight: 700, lineHeight: 1.1, marginBottom: "12px" }}>
          Operational readiness, cost analytics and contract control
        </div>
        <div style={{ maxWidth: "920px", lineHeight: 1.6, opacity: 0.92 }}>
          Reporting is the dense pilotage view: it combines conformity, category costs, subsystem costs,
          allocation-level split, renewal-sensitive tooling, calibration / verification exposure, fleet cost visibility and portfolio exposure.
        </div>
        <div style={{ marginTop: "18px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Active context</div>
            <div style={{ ...monoStyle }}>{context?.label || activeProject?.contextId}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Enabled subsystems</div>
            <div style={{ ...monoStyle }}>{activeSubsystemIds.join(", ") || "—"}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Maintenance contract</div>
            <div style={{ ...monoStyle }}>{budgetMetrics.contractDurationLabel}</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Catalog image coverage</div>
            <div style={{ ...monoStyle }}>{metrics.imageCoveragePct}%</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: "14px", padding: "14px 16px" }}>
            <div style={{ fontSize: "11px", opacity: 0.82, marginBottom: "6px" }}>Fleet region</div>
            <div style={{ ...monoStyle }}>{metrics.fleetMetrics.region.label}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
        {cards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "18px" }}>
        <CostByCategoryTable rows={metrics.categoryCostRows} contractTotal={budgetMetrics.contractTotal} />
        <CostBySubsystemTable rows={subsystemCostRows} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(360px, 0.9fr)", gap: "18px" }}>
        <FleetReportingTable
          title="Fleet cost by subsystem"
          description="Simple fleet footprint by subsystem. Fleet stays outside the tooling allocation-level logic."
          headers={["Subsystem", "Vehicles", "Mobilization CAPEX", "Renewal CAPEX net", "Avg annual renewal CAPEX", "Annual OPEX", "Contract total"]}
          rows={fleetSubsystemRows}
          emptyState="No fleet line configured on the active project."
          renderRow={(row) => (
            <tr key={row.subsystemId}>
              <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}` }}>
                <div style={{ fontWeight: 700, color: palette.ink }}>{row.label}</div>
                <div style={{ color: palette.inkMuted, fontSize: "12px", marginTop: "4px" }}>{row.full}</div>
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.quantity}</td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>
                {fmt(row.mobilizationCapex)} EUR
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>
                {fmt(row.renewalCapexNet)} EUR
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>
                {fmt(row.annualRenewalCapex)} EUR
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>
                {fmt(row.annualCost)} EUR
              </td>
              <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, ...monoStyle }}>
                {fmt(row.contractTotal)} EUR
              </td>
            </tr>
          )}
        />
        <FleetReportingTable
          title="Fleet cost by strategy"
          description="Rental and investment kept separate for a direct strategy readout."
          headers={["Strategy", "Vehicles", "Mobilization CAPEX", "Renewal CAPEX net", "Avg annual renewal CAPEX", "Annual OPEX", "Contract total"]}
          rows={fleetStrategyRows}
          minWidth="920px"
          emptyState="No fleet strategy is configured yet."
          renderRow={(row) => (
            <tr key={row.strategy}>
              <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}`, fontWeight: 700, color: palette.ink }}>
                {row.label}
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.quantity}</td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>
                {fmt(row.mobilizationCapex)} EUR
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>
                {fmt(row.renewalCapexNet)} EUR
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>
                {fmt(row.annualRenewalCapex)} EUR
              </td>
              <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>
                {fmt(row.annualCost)} EUR
              </td>
              <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, ...monoStyle }}>
                {fmt(row.contractTotal)} EUR
              </td>
            </tr>
          )}
        />
      </div>

      <FleetReportingTable
        title="Fleet cost by vehicle type"
        description="Contract footprint by vehicle family, useful for quickly spotting whether pickups, vans or crew vehicles drive the fleet budget."
        headers={["Vehicle type", "Vehicles", "Mobilization CAPEX", "Renewal CAPEX net", "Avg annual renewal CAPEX", "Annual OPEX", "Contract total"]}
        rows={fleetVehicleTypeRows}
        minWidth="1040px"
        emptyState="No vehicle type is configured yet."
        renderRow={(row) => (
          <tr key={row.vehicleTypeId}>
            <td style={{ padding: "14px 8px 14px 0", borderBottom: `1px solid ${palette.surfaceLow}`, fontWeight: 700, color: palette.ink }}>
              {row.label}
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}` }}>{row.quantity}</td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.teal, ...monoStyle }}>
              {fmt(row.mobilizationCapex)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#7c3aed", ...monoStyle }}>
              {fmt(row.renewalCapexNet)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.ink, ...monoStyle }}>
              {fmt(row.annualRenewalCapex)} EUR
            </td>
            <td style={{ padding: "14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: "#f97316", ...monoStyle }}>
              {fmt(row.annualCost)} EUR
            </td>
            <td style={{ padding: "14px 0 14px 8px", borderBottom: `1px solid ${palette.surfaceLow}`, color: palette.primary, ...monoStyle }}>
              {fmt(row.contractTotal)} EUR
            </td>
          </tr>
        )}
      />

      <AllocationLevelMatrix rows={subsystemLevelRows} />

      <DetailedSubsystemBreakdown
        subsystemTabs={detailTabs}
        activeSubsystem={activeSubsystemDetail}
        onChange={setActiveSubsystemDetail}
        rows={activeSubsystemRows}
      />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: "18px" }}>
        <ComplianceMatrix rows={subsystemCoverageRows} />
        <AlertsPanel alerts={metrics.alerts} missingMandatoryTools={metrics.missingMandatoryTools} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "18px" }}>
        <RenewalWatchlist
          tools={metrics.renewalSensitiveTools}
          contractDurationLabel={budgetMetrics.contractDurationLabel}
          contractDurationMonths={budgetMetrics.contractDurationMonths}
        />
        <ServiceWatchlist
          tools={metrics.serviceTrackedTools}
          contractDurationLabel={budgetMetrics.contractDurationLabel}
          contractDurationMonths={budgetMetrics.contractDurationMonths}
        />
      </div>

      <DataQualityPanel metrics={metrics} />

      <PortfolioSnapshot rows={portfolioRows} />
    </div>
  );
}
