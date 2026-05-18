"use client";

import { useEffect, useState } from "react";

export default function useTimedToast(duration = 3500) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), duration);
    return () => clearTimeout(timer);
  }, [toast, duration]);

  const showToast = (variant, title, message) => setToast({ variant, title, message });

  return { toast, setToast, showToast };
}