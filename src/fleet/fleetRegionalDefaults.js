// Benchmarked defaults anchored on a Western Europe baseline.
const BASE_VEHICLE_COSTS = {
  small_van: {
    monthlyRental: 850,
    purchasePrice: 25000,
    annualMaintenance: 1300,
    annualL1Maintenance: 320,
    fuelPricePerLitre: 1.72,
    annualInsurance: 850,
    annualRegistration: 240,
    annualTyresReserve: 320,
  },
  medium_van: {
    monthlyRental: 1050,
    purchasePrice: 45300,
    annualMaintenance: 1650,
    annualL1Maintenance: 420,
    fuelPricePerLitre: 1.72,
    annualInsurance: 980,
    annualRegistration: 280,
    annualTyresReserve: 420,
  },
  pickup_4x4: {
    monthlyRental: 1250,
    purchasePrice: 40000,
    annualMaintenance: 2100,
    annualL1Maintenance: 520,
    fuelPricePerLitre: 1.72,
    annualInsurance: 1050,
    annualRegistration: 310,
    annualTyresReserve: 560,
  },
  crew_van: {
    monthlyRental: 1350,
    purchasePrice: 48550,
    annualMaintenance: 2350,
    annualL1Maintenance: 560,
    fuelPricePerLitre: 1.72,
    annualInsurance: 1160,
    annualRegistration: 340,
    annualTyresReserve: 620,
  },
  light_commercial_vehicle: {
    monthlyRental: 750,
    purchasePrice: 22000,
    annualMaintenance: 1100,
    annualL1Maintenance: 280,
    fuelPricePerLitre: 1.72,
    annualInsurance: 760,
    annualRegistration: 220,
    annualTyresReserve: 280,
  },
};

export const FLEET_REGIONS = [
  { id: "north_america", label: "North America" },
  { id: "western_europe", label: "Western Europe" },
  { id: "eastern_europe", label: "Eastern Europe" },
  { id: "asia", label: "Asia" },
  { id: "north_africa", label: "North Africa" },
  { id: "sub_saharan_africa", label: "Sub-Saharan Africa" },
  { id: "middle_east", label: "Middle East" },
];

export const DEFAULT_FLEET_REGION_ID = "western_europe";

const REGION_MULTIPLIERS = {
  north_america: {
    monthlyRental: 1.1,
    purchasePrice: 1.08,
    annualMaintenance: 1.1,
    annualL1Maintenance: 1.1,
    fuelPricePerLitre: 0.78,
    annualInsurance: 1.18,
    annualRegistration: 1.05,
    annualTyresReserve: 1.08,
  },
  western_europe: {
    monthlyRental: 1,
    purchasePrice: 1,
    annualMaintenance: 1,
    annualL1Maintenance: 1,
    fuelPricePerLitre: 1,
    annualInsurance: 1,
    annualRegistration: 1,
    annualTyresReserve: 1,
  },
  eastern_europe: {
    monthlyRental: 0.78,
    purchasePrice: 0.83,
    annualMaintenance: 0.76,
    annualL1Maintenance: 0.76,
    fuelPricePerLitre: 0.86,
    annualInsurance: 0.7,
    annualRegistration: 0.74,
    annualTyresReserve: 0.81,
  },
  asia: {
    monthlyRental: 0.85,
    purchasePrice: 0.9,
    annualMaintenance: 0.84,
    annualL1Maintenance: 0.84,
    fuelPricePerLitre: 0.93,
    annualInsurance: 0.78,
    annualRegistration: 0.8,
    annualTyresReserve: 0.9,
  },
  north_africa: {
    monthlyRental: 0.72,
    purchasePrice: 0.86,
    annualMaintenance: 0.78,
    annualL1Maintenance: 0.78,
    fuelPricePerLitre: 0.79,
    annualInsurance: 0.68,
    annualRegistration: 0.66,
    annualTyresReserve: 0.84,
  },
  sub_saharan_africa: {
    monthlyRental: 0.88,
    purchasePrice: 0.96,
    annualMaintenance: 0.98,
    annualL1Maintenance: 0.98,
    fuelPricePerLitre: 0.95,
    annualInsurance: 0.9,
    annualRegistration: 0.82,
    annualTyresReserve: 1.04,
  },
  middle_east: {
    monthlyRental: 0.95,
    purchasePrice: 0.98,
    annualMaintenance: 0.89,
    annualL1Maintenance: 0.89,
    fuelPricePerLitre: 0.67,
    annualInsurance: 0.82,
    annualRegistration: 0.8,
    annualTyresReserve: 0.92,
  },
};

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

export function getFleetRegion(regionId) {
  return FLEET_REGIONS.find((region) => region.id === regionId) || FLEET_REGIONS[0];
}

export function getFleetRegionalVehicleDefaults(regionId, vehicleTypeId) {
  const base = BASE_VEHICLE_COSTS[vehicleTypeId] || BASE_VEHICLE_COSTS.small_van;
  const multipliers = REGION_MULTIPLIERS[regionId] || REGION_MULTIPLIERS[DEFAULT_FLEET_REGION_ID];
  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [key, roundCurrency(value * (multipliers[key] || 1))])
  );
}
