"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, hasRole } from "@/lib/auth";

export default function useRequireRole(required) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/sign-in");
      return;
    }
    if (!hasRole(required)) {
      // opsi: redirect ke halaman 403 / sign-in / dashboard umum
      router.replace("/sign-in");
    }
  }, [router, required]);
}
