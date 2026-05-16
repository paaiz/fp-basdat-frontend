"use client";

import useRequireRole from "@/hooks/useRequireRole";

export default function MahasiswaDashboardLayout({ children }) {
  useRequireRole("mahasiswa");
  return <>{children}</>;
}
