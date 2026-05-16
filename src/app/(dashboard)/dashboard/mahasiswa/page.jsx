"use client";

import { useEffect, useState } from "react";

export default function Mahasiswa() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      setName(auth?.name || "User");
      setRole(auth?.role || "User Role");
    } catch {
      setName("User");
      setRole("User Role");
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Halo {name}, Selamat Datang di Dashboard {role}
        </h1>
        <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Ini adalah halaman {role}.
        </p>
      </main>
    </div>
  );
}
