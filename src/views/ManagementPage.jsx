import React from "react";
import LegacyRailwayTooling from "../../railway_tooling.jsx";
import { useProjects } from "../projects/ProjectStore.jsx";

export default function ManagementPage() {
  const {
    activeProject,
    setProjectSelection,
    setProjectWorkforce,
    setProjectPriceOverrides,
    setProjectLifecycleOverrides,
    setProjectServiceOverrides,
  } = useProjects();

  if (!activeProject) return null;

  return (
    <LegacyRailwayTooling
      embedded
      subsystem="MANAGEMENT"
      selection={new Set(activeProject.selectedToolUids)}
      onSelectionChange={setProjectSelection}
      workforceState={activeProject.workforce}
      onWorkforceChange={setProjectWorkforce}
      priceOverrides={activeProject.priceOverrides}
      onPriceOverridesChange={setProjectPriceOverrides}
      lifecycleOverrides={activeProject.lifecycleOverrides}
      onLifecycleOverridesChange={setProjectLifecycleOverrides}
      serviceOverrides={activeProject.serviceOverrides}
      onServiceOverridesChange={setProjectServiceOverrides}
    />
  );
}
