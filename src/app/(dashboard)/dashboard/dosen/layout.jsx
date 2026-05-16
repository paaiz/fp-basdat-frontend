"use client";

import useRequireRole from "@/hooks/useRequireRole";

export default function DosenDashboardLayout({ children }) {
  useRequireRole("dosen");
  return <>{children}</>;
}
