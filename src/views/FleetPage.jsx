import React, { useMemo, useState } from "react";
import { CarFront, ChevronDown, ChevronUp, Fuel, Globe2, Landmark } from "lucide-react";
import { TOOLING_SUBSYSTEMS } from "../../railway_tooling.jsx";
import { palette } from "../app/theme.js";
import {
  createRecommendedFleetLine,
  FLEET_ALLOCATION_TYPES,
  FLEET_MAINTENANCE_MODES,
  FLEET_REGIONS,
  FLEET_VEHICLE_TYPES,
  getProjectFleetMetrics,
} from "../fleet/fleetSelectors.js";
import { useProjects } from "../projects/ProjectStore.jsx";
import { getProjectSubsystemIds } from "../projects/projectSelectors.js";

const cardStyle = {
  background: palette.surfaceLowest,
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 16px 34px rgba(17, 24, 39, 0.06)",
};

const inputStyle = {
  width: "100%",
  borderRadius: "12px",
  border: "1px solid rgba(71, 84, 103, 0.14)",
  background: palette.surfaceLowest,
  color: palette.ink,
  padding: "10px 12px",
  minHeight: "42px",
};

const inactiveFieldStyle = {
  opacity: 0.5,
};

const fmt = (value) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value || 0);

function SummaryCard({ icon: Icon, label, value, note, tone, accent }) {
  return (
    <div style={cardStyle}>
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "14px",
          background: tone,
          color: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ fontSize: "13px", color: palette.inkMuted, marginBottom: "8px" }}>{label}</div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "28px",
          fontWeight: 700,
          color: accent,
          marginBottom: "8px",
        }}
      >
        {value}
      </div>
      <div style={{ color: palette.inkSoft, lineHeight: 1.55, fontSize: "14px" }}>{note}</div>
    </div>
  );
}

function BreakdownTable({ title, rows, firstColumn, emptyLabel }) {
  return (
    <div style={{ ...cardStyle, display: "grid", gap: "14px" }}>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: "22px",
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      {rows.length === 0 ? (
        <div style={{ color: palette.inkSoft }}>{emptyLabel}</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ color: palette.inkMuted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                <th style={{ textAlign: "left", padding: "0 0 12px" }}>{firstColumn}</th>
                <th style={{ textAlign: "right", padding: "0 0 12px" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "0 0 12px" }}>Annual</th>
                <th style={{ textAlign: "right", padding: "0 0 12px" }}>Contract</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label || row.strategy || row.subsystemId || row.vehicleTypeId}>
                  <td style={{ padding: "10px 0", borderTop: "1px solid rgba(71, 84, 103, 0.12)" }}>
                    {row.label || row.strategy}
                  </td>
                  <td style={{ padding: "10px 0", borderTop: "1px solid rgba(71, 84, 103, 0.12)", textAlign: "right" }}>
                    {fmt(row.quantity)}
                  </td>
                  <td style={{ padding: "10px 0", borderTop: "1px solid rgba(71, 84, 103, 0.12)", textAlign: "right" }}>
                    {fmt(row.annualCost)} EUR
                  </td>
                  <td style={{ padding: "10px 0", borderTop: "1px solid rgba(71, 84, 103, 0.12)", textAlign: "right" }}>
                    {fmt(row.contractTotal)} EUR
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function isFieldApplicable(strategy, field) {
  if (strategy === "rental") {
    return !["purchasePrice", "annualMaintenance", "annualInsurance", "annualRegistration"].includes(field);
  }
  if (strategy === "investment") {
    return !["monthlyRental", "annualL1Maintenance"].includes(field);
  }
  return true;
}

export default function FleetPage() {
  const {
    activeProject,
    setProjectFleetRegion,
    addProjectFleetLine,
    updateProjectFleetLine,
    removeProjectFleetLine,
    resetProjectFleetLineOverrides,
  } = useProjects();
  const [helpOpen, setHelpOpen] = useState(false);

  const subsystemIds = getProjectSubsystemIds(activeProject);
  const metrics = useMemo(() => getProjectFleetMetrics(activeProject), [activeProject]);

  const handleAddLine = () => {
    addProjectFleetLine(createRecommendedFleetLine(activeProject));
  };

  const handleLinePatch = (lineId, patch) => {
    updateProjectFleetLine(lineId, patch);
  };

  const handleOverridePatch = (line, field, value) => {
    handleLinePatch(line.id, {
      overrides: {
        ...(line.overrides || {}),
        [field]: toNumberOrNull(value),
      },
    });
  };

  const handleInvestmentPolicyPatch = (line, field, value) => {
    handleLinePatch(line.id, {
      investmentPolicy: {
        ...(line.investmentPolicy || {}),
        [field]: value,
      },
    });
  };

  return (
    <div style={{ display: "grid", gap: "22px" }}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
              Fleet strategy setup
            </div>
            <div style={{ color: palette.inkSoft, lineHeight: 1.6, maxWidth: "860px" }}>
              Define the service vehicles needed by subsystem, choose rental or investment, then adapt benchmark regional defaults
              for fuel, maintenance and commercial conditions.
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <select
              value={metrics.region.id}
              onChange={(event) => setProjectFleetRegion(event.target.value)}
              style={{ ...inputStyle, minWidth: "220px" }}
            >
              {FLEET_REGIONS.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddLine}
              style={{
                border: "none",
                borderRadius: "12px",
                background: palette.primary,
                color: "#fff",
                padding: "11px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Add vehicle line
            </button>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, display: "grid", gap: helpOpen ? "16px" : "0" }}>
        <button
          onClick={() => setHelpOpen((current) => !current)}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            cursor: "pointer",
            color: palette.ink,
            textAlign: "left",
          }}
        >
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "20px", fontWeight: 700, marginBottom: "6px" }}>
              Fleet calculation help
            </div>
            <div style={{ color: palette.inkSoft, lineHeight: 1.6 }}>
              Short explanation of rental, investment, renewal and residual-value logic used in this page.
            </div>
          </div>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: palette.surfaceLow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: palette.primary,
              flexShrink: 0,
            }}
          >
            {helpOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {helpOpen && (
          <div
            style={{
              display: "grid",
              gap: "12px",
              paddingTop: "4px",
              color: palette.inkSoft,
              lineHeight: 1.65,
              fontSize: "14px",
            }}
          >
            <div>
              <strong style={{ color: palette.ink }}>Rental:</strong> contract total is based on monthly rental, annual L1 maintenance, fuel and tyres reserve over the contract duration. Insurance and registration are treated as included by default.
            </div>
            <div>
              <strong style={{ color: palette.ink }}>Investment:</strong> contract total is based on initial purchase CAPEX, renewal CAPEX net, recurring operating costs and the end-of-contract residual credit.
            </div>
            <div>
              <strong style={{ color: palette.ink }}>Annual fuel:</strong> `quantity × km/month × 12 × consumption/100 × fuel price`.
            </div>
            <div>
              <strong style={{ color: palette.ink }}>Renewal CAPEX net:</strong> renewal purchase cost minus internal resale credit at each renewal event.
            </div>
            <div>
              <strong style={{ color: palette.ink }}>Average annual renewal CAPEX:</strong> `renewal CAPEX net ÷ contract years`.
            </div>
            <div>
              <strong style={{ color: palette.ink }}>End residual credit:</strong> value deducted for the last owned vehicle still in service at contract end, based on its age and the selected residual value policy.
            </div>
            <div>
              <strong style={{ color: palette.ink }}>Last-year rule:</strong> if a renewal point falls in the last contract year, the simulator does not buy a replacement vehicle.
            </div>
            <div>
              <strong style={{ color: palette.ink }}>Regional defaults:</strong> all costs start from regional benchmarks and can be overridden line by line by the user.
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <SummaryCard
          icon={Landmark}
          label="Mobilization CAPEX"
          value={`${fmt(metrics.mobilizationCapex)} EUR`}
          note="Purchase cost at contract start for investment lines."
          tone={palette.primarySoft}
          accent={palette.primary}
        />
        <SummaryCard
          icon={CarFront}
          label="Annual Fleet OPEX"
          value={`${fmt(metrics.annualOperatingCost)} EUR`}
          note="Average annual fleet operating cost across the contract duration."
          tone={palette.tealSoft}
          accent={palette.teal}
        />
        <SummaryCard
          icon={Landmark}
          label="Renewal CAPEX Net"
          value={`${fmt(metrics.renewalCapexNet)} EUR`}
          note={`Gross renewals ${fmt(metrics.renewalCapexGross)} EUR less internal resale credit ${fmt(metrics.renewalResaleCredit)} EUR.`}
          tone={palette.surfaceLow}
          accent={palette.ink}
        />
        <SummaryCard
          icon={Globe2}
          label="End Residual Credit"
          value={`${fmt(metrics.endOfContractResidualCredit)} EUR`}
          note="Residual value deducted for the last owned vehicle at contract end."
          tone={palette.surfaceLow}
          accent={palette.ink}
        />
        <SummaryCard
          icon={Fuel}
          label="Annual Fuel"
          value={`${fmt(metrics.annualFuelCost)} EUR`}
          note="Derived from km per month, consumption and regional fuel price."
          tone={palette.safetySoft}
          accent={palette.safety}
        />
        <SummaryCard
          icon={Globe2}
          label="Contract Total"
          value={`${fmt(metrics.contractTotal)} EUR`}
          note={`Total over ${fmt(metrics.contractYears)} contract year(s) using the ${metrics.region.label} profile.`}
          tone={palette.primarySoft}
          accent={palette.primary}
        />
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {metrics.lines.length === 0 ? (
          <div style={cardStyle}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
              Vehicle plan by subsystem
            </div>
            <div style={{ color: palette.inkSoft, lineHeight: 1.6 }}>
              No vehicle line is defined yet. Start with one recommended line and then adjust vehicle type, strategy, quantity and regional overrides.
            </div>
          </div>
        ) : (
          metrics.lines.map((line) => (
            <div key={line.id} style={{ ...cardStyle, display: "grid", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>
                    {line.vehicle.label}
                  </div>
                  <div style={{ color: palette.inkSoft, lineHeight: 1.55 }}>
                    {line.subsystemLabel} | {line.strategy === "investment" ? "Investment" : "Rental"} | {fmt(line.quantity)} vehicle(s)
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => resetProjectFleetLineOverrides(line.id)}
                    style={{
                      border: "1px solid rgba(71, 84, 103, 0.16)",
                      borderRadius: "12px",
                      background: palette.surfaceLowest,
                      color: palette.ink,
                      padding: "10px 14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Reset regional costs
                  </button>
                  <button
                    onClick={() => removeProjectFleetLine(line.id)}
                    style={{
                      border: "1px solid rgba(159, 66, 0, 0.18)",
                      borderRadius: "12px",
                      background: palette.safetySoft,
                      color: palette.safety,
                      padding: "10px 14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Remove line
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: palette.inkMuted }}>Category</span>
                  <select
                    value={line.allocationType || "subsystem"}
                    onChange={(event) => handleLinePatch(line.id, { allocationType: event.target.value })}
                    style={inputStyle}
                  >
                    {FLEET_ALLOCATION_TYPES.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: palette.inkMuted }}>Subsystem</span>
                  <select
                    value={line.subsystemId}
                    onChange={(event) => handleLinePatch(line.id, { subsystemId: event.target.value })}
                    disabled={line.allocationType === "management"}
                    style={{
                      ...inputStyle,
                      ...(line.allocationType === "management"
                        ? {
                            background: palette.surfaceLow,
                            color: palette.inkMuted,
                            cursor: "not-allowed",
                          }
                        : null),
                    }}
                  >
                    {subsystemIds.map((subsystemId) => {
                      const meta = TOOLING_SUBSYSTEMS.find((item) => item.id === subsystemId);
                      return (
                        <option key={subsystemId} value={subsystemId}>
                          {meta?.label || subsystemId}
                        </option>
                      );
                    })}
                  </select>
                </label>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: palette.inkMuted }}>Vehicle type</span>
                  <select value={line.vehicleTypeId} onChange={(event) => handleLinePatch(line.id, { vehicleTypeId: event.target.value })} style={inputStyle}>
                    {FLEET_VEHICLE_TYPES.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: palette.inkMuted }}>Strategy</span>
                  <select value={line.strategy} onChange={(event) => handleLinePatch(line.id, { strategy: event.target.value })} style={inputStyle}>
                    <option value="rental">Rental</option>
                    <option value="investment">Investment</option>
                  </select>
                </label>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: palette.inkMuted }}>Quantity</span>
                  <input type="number" min="1" value={line.quantity} onChange={(event) => handleLinePatch(line.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} style={inputStyle} />
                </label>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontSize: "12px", color: palette.inkMuted }}>km / month</span>
                  <input type="number" min="0" value={line.kmPerMonth} onChange={(event) => handleLinePatch(line.id, { kmPerMonth: Math.max(0, Number(event.target.value) || 0) })} style={inputStyle} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {[
                  ["consumptionLPer100Km", "Consumption (L/100km)", line.consumptionLPer100Km],
                  ["monthlyRental", "Monthly rental (EUR)", line.monthlyRental],
                  ["purchasePrice", "Purchase price (EUR)", line.purchasePrice],
                  ["annualL1Maintenance", "Annual L1 maintenance (EUR)", line.annualL1Maintenance],
                  ["annualMaintenance", "Annual full maintenance (EUR)", line.annualMaintenance],
                  ["fuelPricePerLitre", "Fuel / litre (EUR)", line.fuelPricePerLitre],
                  ["annualInsurance", "Annual insurance (EUR)", line.annualInsurance],
                  ["annualRegistration", "Annual registration (EUR)", line.annualRegistration],
                  ["annualTyresReserve", "Annual tyres reserve (EUR)", line.annualTyresReserve],
                ].map(([field, label, value]) => {
                  const applicable = isFieldApplicable(line.strategy, field);
                  return (
                  <label key={field} style={{ display: "grid", gap: "6px", ...(applicable ? null : inactiveFieldStyle) }}>
                    <span style={{ fontSize: "12px", color: palette.inkMuted }}>
                      {label}
                      {!applicable ? ` (${line.strategy === "rental" ? "not used for rental" : "not used for investment"})` : ""}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={value}
                      disabled={!applicable}
                      onChange={(event) => handleOverridePatch(line, field, event.target.value)}
                      style={{
                        ...inputStyle,
                        ...(applicable
                          ? null
                          : {
                              background: palette.surfaceLow,
                              color: palette.inkMuted,
                              cursor: "not-allowed",
                            }),
                      }}
                    />
                  </label>
                )})}
              </div>

              {line.strategy === "investment" ? (
                <div style={{ ...cardStyle, background: palette.surfaceLow, padding: "16px", display: "grid", gap: "12px" }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "18px", fontWeight: 700 }}>
                    Investment lifecycle policy
                  </div>
                  <div style={{ color: palette.inkSoft, lineHeight: 1.55 }}>
                    Renewal assumptions apply only to owned vehicles. Maintenance resets after each renewal cycle and resale credit offsets the next acquisition.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                    <label style={{ display: "grid", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: palette.inkMuted }}>Renewal cycle (years)</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={line.investmentPolicy?.renewalCycleYears ?? 5}
                        onChange={(event) =>
                          handleInvestmentPolicyPatch(line, "renewalCycleYears", Math.max(1, Number(event.target.value) || 1))
                        }
                        style={inputStyle}
                      />
                    </label>
                    <label style={{ display: "grid", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: palette.inkMuted }}>Residual value (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        step="1"
                        value={line.investmentPolicy?.residualValuePct ?? 35}
                        onChange={(event) =>
                          handleInvestmentPolicyPatch(
                            line,
                            "residualValuePct",
                            Math.max(0, Math.min(90, Number(event.target.value) || 0))
                          )
                        }
                        style={inputStyle}
                      />
                    </label>
                    <label style={{ display: "grid", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: palette.inkMuted }}>Maintenance curve</span>
                      <select
                        value={line.investmentPolicy?.maintenanceMode || "age_standard"}
                        onChange={(event) => handleInvestmentPolicyPatch(line, "maintenanceMode", event.target.value)}
                        style={inputStyle}
                      >
                        {FLEET_MAINTENANCE_MODES.map((mode) => (
                          <option key={mode.id} value={mode.id}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>Final vehicle age</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        {fmt(line.finalVehicleAgeMonths / 12)} year(s)
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>End residual value</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        {fmt(line.endOfContractResidualPct)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>End residual credit</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                        {fmt(line.endOfContractResidualCredit)} EUR
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", borderTop: "1px solid rgba(71, 84, 103, 0.12)", paddingTop: "14px" }}>
                {[
                  ["Annual fuel", `${fmt(line.annualFuelCost)} EUR`, true],
                  ["Mobilization CAPEX", `${fmt(line.mobilizationCapex)} EUR`, line.strategy === "investment"],
                  ["Renewal CAPEX net", `${fmt(line.renewalCapexNet)} EUR`, line.strategy === "investment"],
                  ["Resale credit", `${fmt(line.renewalResaleCredit)} EUR`, line.strategy === "investment"],
                  ["End residual credit", `${fmt(line.endOfContractResidualCredit)} EUR`, line.strategy === "investment"],
                  ["Annual operating", `${fmt(line.annualOperatingCost)} EUR`, true],
                  ["Contract total", `${fmt(line.contractTotal)} EUR`, true],
                ].map(([label, value, applicable]) => (
                  <div key={label} style={applicable ? null : inactiveFieldStyle}>
                    <div style={{ fontSize: "12px", color: palette.inkMuted, marginBottom: "6px" }}>{label}</div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        color: applicable ? palette.ink : palette.inkMuted,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        <BreakdownTable title="Cost by subsystem" rows={metrics.bySubsystem} firstColumn="Subsystem" emptyLabel="No subsystem allocation yet." />
        <BreakdownTable
          title="Cost by strategy"
          rows={metrics.byStrategy.map((row) => ({ ...row, label: row.strategy === "investment" ? "Investment" : "Rental" }))}
          firstColumn="Strategy"
          emptyLabel="No strategy split yet."
        />
        <BreakdownTable title="Cost by vehicle type" rows={metrics.byVehicleType} firstColumn="Vehicle type" emptyLabel="No vehicle type selected yet." />
      </div>
    </div>
  );
}
