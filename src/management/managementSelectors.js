import { inferToolLifecycleBaseline } from "../../railway_tooling.jsx";
import { MANAGEMENT_PPE_CATALOG } from "./managementPpeCatalog.js";

export const MANAGEMENT_SUBSYSTEM_LABEL = "Management";
export const MANAGEMENT_ALLOCATION_LEVEL = "Manager";

function getContractDurationMonths(project) {
  const duration = Math.max(1, Number(project?.maintenanceContract?.duration) || 1);
  const unit = project?.maintenanceContract?.unit === "months" ? "months" : "years";
  return unit === "years" ? duration * 12 : duration;
}

function toMonths(value, unit) {
  const numeric = Number(value) || 0;
  return unit === "years" ? numeric * 12 : numeric;
}

function getRenewalCount(contractDurationMonths, lifecycle) {
  if (!["periodic_replacement", "consumable"].includes(lifecycle.type)) return 0;
  const intervalMonths = toMonths(lifecycle.intervalValue, lifecycle.intervalUnit);
  if (!intervalMonths) return 0;
  return Math.max(0, Math.ceil(contractDurationMonths / intervalMonths) - 1);
}

function roundAmount(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function getProjectManagement(project) {
  return {
    managers: Math.max(0, Number(project?.management?.managers ?? 2)),
    selectedPpeUids: Array.isArray(project?.management?.selectedPpeUids)
      ? project.management.selectedPpeUids
      : [],
  };
}

export function getManagementPpeMetrics(project) {
  const { managers, selectedPpeUids } = getProjectManagement(project);
  const selected = new Set(selectedPpeUids);
  const contractDurationMonths = getContractDurationMonths(project);
  const contractYears = contractDurationMonths / 12;

  const resolvedItems = MANAGEMENT_PPE_CATALOG.filter((item) => selected.has(item.uid)).map((item) => {
    const lifecycle = inferToolLifecycleBaseline(item);
    const mobilizationCost = roundAmount(item.qty * item.price * managers);
    const renewalCount = getRenewalCount(contractDurationMonths, lifecycle);
    const renewalCost = roundAmount(
      mobilizationCost * renewalCount * ((Number(lifecycle.replacementRatio) || 100) / 100)
    );
    return {
      ...item,
      multiplier: managers,
      lifecycle,
      renewalCount,
      mobilizationCost,
      renewalCost,
      serviceCost: 0,
      contractCost: roundAmount(mobilizationCost + renewalCost),
    };
  });

  const mobilization = roundAmount(resolvedItems.reduce((sum, item) => sum + item.mobilizationCost, 0));
  const renewals = roundAmount(resolvedItems.reduce((sum, item) => sum + item.renewalCost, 0));
  const contractTotal = roundAmount(mobilization + renewals);
  const annualRenewals = contractYears > 0 ? roundAmount(renewals / contractYears) : 0;

  return {
    managers,
    catalog: MANAGEMENT_PPE_CATALOG,
    selectedCount: resolvedItems.length,
    mobilization,
    renewals,
    service: 0,
    contractTotal,
    annualRenewals,
    contractDurationMonths,
    contractYears,
    items: resolvedItems,
  };
}

export function getManagementCostMatrixRows(project) {
  if (!project) return [];
  const metrics = getManagementPpeMetrics(project);
  if (metrics.selectedCount === 0) return [];

  const { contractYears, managers } = metrics;
  const contextId = project?.contextId || "";

  const rowsByKey = metrics.items.reduce((map, item) => {
    const key = [project.name, contextId, "Management", "PPE", item.cat, "Manager"].join("|");
    const current = map.get(key) || {
      "Project Name": project.name,
      Context: contextId,
      Subsystem: MANAGEMENT_SUBSYSTEM_LABEL,
      "Cost Bucket": "PPE",
      "Source Category": "PPE",
      "Allocation Level": MANAGEMENT_ALLOCATION_LEVEL,
      "Technician Count": managers,
      "Team Count": 0,
      "Depot Count": 0,
      "Contract Duration (Years)": Number(contractYears.toFixed(2)),
      "Mobilization Unit Cost (EUR)": 0,
      "Mobilization Total Cost (EUR)": 0,
      "Renewal Contract Total (EUR)": 0,
      "Calibration Contract Total (EUR)": 0,
    };
    current["Mobilization Unit Cost (EUR)"] += item.qty * item.price;
    current["Mobilization Total Cost (EUR)"] += item.mobilizationCost;
    current["Renewal Contract Total (EUR)"] += item.renewalCost;
    map.set(key, current);
    return map;
  }, new Map());

  return Array.from(rowsByKey.values()).map((row) => {
    const recurring = row["Renewal Contract Total (EUR)"] + row["Calibration Contract Total (EUR)"];
    row["Recurring Contract Total (EUR)"] = recurring;
    row["Renewal Avg / Year (EUR)"] = contractYears > 0 ? row["Renewal Contract Total (EUR)"] / contractYears : 0;
    row["Calibration Avg / Year (EUR)"] = 0;
    row["Recurring Avg / Year (EUR)"] = row["Renewal Avg / Year (EUR)"];
    row["Contract Total Excl. Mobilization (EUR)"] = recurring;
    row["Contract Grand Total (EUR)"] = row["Mobilization Total Cost (EUR)"] + recurring;
    return row;
  });
}

export function getManagementSupplierRfqRows(project) {
  if (!project) return [];
  const metrics = getManagementPpeMetrics(project);
  if (metrics.selectedCount === 0) return [];

  const rowsByKey = metrics.items.reduce((map, item) => {
    const brand = String(item.brand || "").trim().toLowerCase();
    const model = String(item.model || "").trim().toLowerCase();
    const key = model ? `${brand}|${model}` : `${brand}|${item.name.trim().toLowerCase()}`;

    const current = map.get(key) || {
      "Tool Description": item.name,
      Reference: item.model,
      "Supplier / Manufacturer": item.brand,
      Category: "PPE",
      "Allocation Level": MANAGEMENT_ALLOCATION_LEVEL,
      "Calibration Required": "No",
      "Product URL": item.productUrl || "",
      "Current Unit Price (EUR)": item.price,
      "Current Calibration Cost (EUR)": 0,
      "Estimated Total Qty": 0,
      "Requested Unit Price (EUR)": "",
      "Requested Calibration Cost (EUR)": "",
      "Comments / Supplier Feedback": "",
    };
    current["Estimated Total Qty"] += item.qty * metrics.managers;
    map.set(key, current);
    return map;
  }, new Map());

  return Array.from(rowsByKey.values()).map((row) => ({
    ...row,
    "Current Unit Price (EUR)": Number(Number(row["Current Unit Price (EUR)"]).toFixed(2)),
    "Estimated Total Qty": Number(Number(row["Estimated Total Qty"]).toFixed(2)),
  }));
}
