export const FLEET_VEHICLE_TYPES = [
  {
    id: "small_van",
    label: "Small Van",
    category: "van",
    recommendedSubsystems: ["AFC", "PSD", "POS", "DEQ"],
    payloadClass: "light",
    defaultFuelType: "diesel",
    defaultConsumptionLPer100Km: 5.4,
    notes: "Urban maintenance van for light tools, diagnostics and spare parts.",
  },
  {
    id: "medium_van",
    label: "Medium Van",
    category: "van",
    recommendedSubsystems: ["POS", "PSD", "MEP", "AFC"],
    payloadClass: "medium",
    defaultFuelType: "diesel",
    defaultConsumptionLPer100Km: 7,
    notes: "Main maintenance van for team tools, ladders and recurring interventions.",
  },
  {
    id: "pickup_4x4",
    label: "Pickup 4x4",
    category: "pickup",
    recommendedSubsystems: ["CAT", "TRACK"],
    payloadClass: "medium",
    defaultFuelType: "diesel",
    defaultConsumptionLPer100Km: 9.5,
    notes: "Field access vehicle for rough access, open-site and infrastructure maintenance.",
  },
  {
    id: "crew_van",
    label: "Crew Van",
    category: "van",
    recommendedSubsystems: ["TRACK", "CAT", "MEP"],
    payloadClass: "high",
    defaultFuelType: "diesel",
    defaultConsumptionLPer100Km: 8,
    notes: "Crew transport vehicle for teams carrying shared tools and consumables.",
  },
  {
    id: "light_commercial_vehicle",
    label: "Light Commercial Vehicle",
    category: "utility",
    recommendedSubsystems: ["DEQ", "AFC", "POS", "PSD", "MEP"],
    payloadClass: "light",
    defaultFuelType: "diesel",
    defaultConsumptionLPer100Km: 5.8,
    notes: "Simple service vehicle for inspection, support and local maintenance rounds.",
  },
];

export const FLEET_MAINTENANCE_MODES = [
  { id: "flat", label: "Flat" },
  { id: "age_standard", label: "Age-based standard" },
  { id: "age_heavy_duty", label: "Age-based heavy-duty" },
];

const INVESTMENT_POLICY_DEFAULTS = {
  small_van: { renewalCycleYears: 5, residualValuePct: 35, maintenanceMode: "age_standard" },
  medium_van: { renewalCycleYears: 5, residualValuePct: 35, maintenanceMode: "age_standard" },
  pickup_4x4: { renewalCycleYears: 5, residualValuePct: 40, maintenanceMode: "age_standard" },
  crew_van: { renewalCycleYears: 5, residualValuePct: 30, maintenanceMode: "age_standard" },
  light_commercial_vehicle: { renewalCycleYears: 5, residualValuePct: 35, maintenanceMode: "age_standard" },
};

const VEHICLE_TYPE_IDS = new Set(FLEET_VEHICLE_TYPES.map((vehicle) => vehicle.id));
const MAINTENANCE_MODE_IDS = new Set(FLEET_MAINTENANCE_MODES.map((mode) => mode.id));

function createFleetLineId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `fleet-${crypto.randomUUID()}`;
  }
  return `fleet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeNonNegativeNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function normalizePositiveNumber(value, fallback = 1) {
  if (value === null || value === undefined || value === "") return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

export function isFleetVehicleTypeId(vehicleTypeId) {
  return VEHICLE_TYPE_IDS.has(vehicleTypeId);
}

export function getFleetVehicleType(vehicleTypeId) {
  return FLEET_VEHICLE_TYPES.find((vehicle) => vehicle.id === vehicleTypeId) || FLEET_VEHICLE_TYPES[0];
}

export function getRecommendedVehicleTypeId(subsystemId) {
  return (
    FLEET_VEHICLE_TYPES.find((vehicle) => vehicle.recommendedSubsystems.includes(subsystemId))?.id ||
    FLEET_VEHICLE_TYPES[0].id
  );
}

export function isFleetMaintenanceModeId(modeId) {
  return MAINTENANCE_MODE_IDS.has(modeId);
}

export function getDefaultInvestmentPolicy(vehicleTypeId) {
  return {
    ...(INVESTMENT_POLICY_DEFAULTS[vehicleTypeId] || INVESTMENT_POLICY_DEFAULTS.small_van),
  };
}

export function createFleetLine(overrides = {}) {
  const subsystemId = overrides.subsystemId || "POS";
  const vehicleTypeId = overrides.vehicleTypeId || getRecommendedVehicleTypeId(subsystemId);
  return {
    id: overrides.id || createFleetLineId(),
    subsystemId,
    vehicleTypeId,
    strategy: overrides.strategy === "investment" ? "investment" : "rental",
    quantity: normalizePositiveNumber(overrides.quantity, 1),
    kmPerMonth: normalizeNonNegativeNumber(overrides.kmPerMonth, 2500),
    overrides: {
      consumptionLPer100Km: null,
      monthlyRental: null,
      purchasePrice: null,
      annualMaintenance: null,
      annualL1Maintenance: null,
      fuelPricePerLitre: null,
      annualInsurance: null,
      annualRegistration: null,
      annualTyresReserve: null,
      ...(overrides.overrides || {}),
    },
    investmentPolicy: {
      ...getDefaultInvestmentPolicy(vehicleTypeId),
      ...(overrides.investmentPolicy || {}),
    },
  };
}
