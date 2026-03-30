import React from "react";
import LegacyRailwayTooling from "../../railway_tooling.jsx";
import { useProjects } from "../projects/ProjectStore.jsx";

export default function InventoryPage({ subsystem, onSubsystemChange, context, onContextChange }) {
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
      subsystem={subsystem}
      onSubsystemChange={onSubsystemChange}
      context={context}
      onContextChange={onContextChange}
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
