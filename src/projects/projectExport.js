import { TOOLING_CONTEXTS } from "../../railway_tooling.jsx";
import { getProjectCostMatrixRows, getProjectSupplierRfqRows } from "./projectSelectors.js";

const SHEET_1_COLUMNS = [
  "Project Name",
  "Context",
  "Subsystem",
  "Cost Bucket",
  "Source Category",
  "Allocation Level",
  "Technician Count",
  "Team Count",
  "Depot Count",
  "Contract Duration (Years)",
  "Mobilization Unit Cost (EUR)",
  "Mobilization Total Cost (EUR)",
  "Renewal Contract Total (EUR)",
  "Calibration Contract Total (EUR)",
  "Recurring Contract Total (EUR)",
  "Renewal Avg / Year (EUR)",
  "Calibration Avg / Year (EUR)",
  "Recurring Avg / Year (EUR)",
  "Contract Total Excl. Mobilization (EUR)",
  "Contract Grand Total (EUR)",
];

const SHEET_2_COLUMNS = [
  "Tool Description",
  "Reference",
  "Supplier / Manufacturer",
  "Category",
  "Allocation Level",
  "Calibration Required",
  "Product URL",
  "Current Unit Price (EUR)",
  "Current Calibration Cost (EUR)",
  "Estimated Total Qty",
  "Requested Unit Price (EUR)",
  "Requested Calibration Cost (EUR)",
  "Comments / Supplier Feedback",
];

const LEGACY_SHEET_1_KEY_MAP = {
  "Mobilization Unit Cost (EUR)": ["Mobilization Unit Cost (€)", "Mobilization Unit Cost (â‚¬)", "Mobilization Unit Cost (Ã¢â€šÂ¬)"],
  "Mobilization Total Cost (EUR)": ["Mobilization Total Cost (€)", "Mobilization Total Cost (â‚¬)", "Mobilization Total Cost (Ã¢â€šÂ¬)"],
  "Renewal Contract Total (EUR)": ["Renewal Contract Total (€)", "Renewal Contract Total (â‚¬)", "Renewal Contract Total (Ã¢â€šÂ¬)"],
  "Calibration Contract Total (EUR)": [
    "Calibration Contract Total (€)",
    "Calibration Contract Total (â‚¬)",
    "Calibration Contract Total (Ã¢â€šÂ¬)",
  ],
  "Recurring Contract Total (EUR)": ["Recurring Contract Total (€)", "Recurring Contract Total (â‚¬)", "Recurring Contract Total (Ã¢â€šÂ¬)"],
  "Renewal Avg / Year (EUR)": ["Renewal Avg / Year (€)", "Renewal Avg / Year (â‚¬)", "Renewal Avg / Year (Ã¢â€šÂ¬)"],
  "Calibration Avg / Year (EUR)": [
    "Calibration Avg / Year (€)",
    "Calibration Avg / Year (â‚¬)",
    "Calibration Avg / Year (Ã¢â€šÂ¬)",
  ],
  "Recurring Avg / Year (EUR)": ["Recurring Avg / Year (€)", "Recurring Avg / Year (â‚¬)", "Recurring Avg / Year (Ã¢â€šÂ¬)"],
  "Contract Total Excl. Mobilization (EUR)": [
    "Contract Total Excl. Mobilization (€)",
    "Contract Total Excl. Mobilization (â‚¬)",
    "Contract Total Excl. Mobilization (Ã¢â€šÂ¬)",
  ],
  "Contract Grand Total (EUR)": ["Contract Grand Total (€)", "Contract Grand Total (â‚¬)", "Contract Grand Total (Ã¢â€šÂ¬)"],
};

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function isNumeric(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function toCell(value) {
  if (isNumeric(value)) {
    return `<Cell><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
}

function buildSheet(name, columns, rows) {
  const headerRow = `<Row>${columns
    .map((column) => `<Cell ss:StyleID="header"><Data ss:Type="String">${escapeXml(column)}</Data></Cell>`)
    .join("")}</Row>`;

  const dataRows = rows
    .map((row) => `<Row>${columns.map((column) => toCell(row[column])).join("")}</Row>`)
    .join("");

  return `<Worksheet ss:Name="${escapeXml(name)}"><Table>${headerRow}${dataRows}</Table></Worksheet>`;
}

function buildWorkbookXml(worksheets) {
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" ss:Size="11"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#DCEAF5" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 ${worksheets.join("")}
</Workbook>`;
}

function sanitizeFilePart(value) {
  return String(value || "project")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_")
    .slice(0, 80);
}

function roundIfNumeric(value) {
  return typeof value === "number" && Number.isFinite(value) ? Number(value.toFixed(2)) : value;
}

function resolveCostMatrixValue(row, column) {
  if (Object.prototype.hasOwnProperty.call(row, column)) {
    return row[column];
  }
  const candidates = LEGACY_SHEET_1_KEY_MAP[column] || [];
  const key = candidates.find((candidate) => Object.prototype.hasOwnProperty.call(row, candidate));
  return key ? row[key] : "";
}

function normalizeCostMatrixRow(row) {
  const contextLabel = TOOLING_CONTEXTS.find((context) => context.id === row.Context)?.label || row.Context;
  const normalized = {
    ...row,
    Context: contextLabel,
  };

  return SHEET_1_COLUMNS.reduce((acc, column) => {
    acc[column] = roundIfNumeric(resolveCostMatrixValue(normalized, column));
    return acc;
  }, {});
}

function normalizeRfqRow(row) {
  return SHEET_2_COLUMNS.reduce((acc, column) => {
    acc[column] = roundIfNumeric(row[column]);
    return acc;
  }, {});
}

export function exportProjectCostWorkbook(project) {
  if (!project) {
    throw new Error("No active project to export.");
  }

  const costMatrixRows = getProjectCostMatrixRows(project).map(normalizeCostMatrixRow);
  const supplierRfqRows = getProjectSupplierRfqRows(project).map(normalizeRfqRow);

  const xml = buildWorkbookXml([
    buildSheet("Project Cost Matrix", SHEET_1_COLUMNS, costMatrixRows),
    buildSheet("Supplier RFQ", SHEET_2_COLUMNS, supplierRfqRows),
  ]);

  const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFilePart(project.name)}_cost_matrix.xls`;
  anchor.click();
  URL.revokeObjectURL(url);
}
