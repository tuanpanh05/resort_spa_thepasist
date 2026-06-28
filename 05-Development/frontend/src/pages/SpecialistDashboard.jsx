import React from "react";
import SpaDashboard from "./specialist/SpaDashboard";
import YogaDashboard from "./specialist/YogaDashboard";
import PhysioDashboard from "./specialist/PhysioDashboard";

/**
 * Specialist dashboard dispatcher.
 *
 * All specialist staff (Spa therapist, Yoga instructor, Physiotherapist) authenticate
 * under the THERAPIST role and are differentiated by the `specialty` value returned at
 * login (SPA / YOGA / PHYSIO). This component routes each specialist to the dedicated,
 * fully database-backed dashboard for their discipline.
 */
export default function SpecialistDashboard() {
  const specialty = (
    localStorage.getItem("userSpecialty") ||
    sessionStorage.getItem("userSpecialty") ||
    ""
  ).toUpperCase();

  // Legacy fallback: some older sessions stored a `specialistRole` hint.
  const legacy = (
    localStorage.getItem("specialistRole") ||
    sessionStorage.getItem("specialistRole") ||
    ""
  ).toUpperCase();

  const discipline = specialty || legacy;

  if (discipline === "YOGA") return <YogaDashboard />;
  if (discipline === "PHYSIO" || discipline === "THERAPY") return <PhysioDashboard />;

  // Default: Spa / massage therapist
  return <SpaDashboard />;
}