"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import DashboardNavbar from "@/components/ui/DashboardNavbar";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/sign-in");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <DashboardNavbar />
      {children}
    </div>
  );
}
