"use client";

import Link from "next/link";
import { HiOutlineArrowRight, HiOutlineSquares2X2 } from "react-icons/hi2";
import SandboxShell from "../components/SandboxShell";
import { SANDBOX_ROUTES } from "../components/sandboxConfig";

const cards = SANDBOX_ROUTES.filter((item) => item.id !== "home");

export default function SandboxHomePage() {
  return (
    <SandboxShell
      activeId="home"
      title="Modul SIAKAD - Universitas Nusantara"
      description="Selamat datang. Halaman ini adalah tempat untuk membuat entity baru untuk modul SIAKAD."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg transition hover:bg-white/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                  <HiOutlineSquares2X2 className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-white">Modul {item.label}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Modul API dari abrar. /api/{item.label.toLowerCase()}.
                </p>
              </div>
              <HiOutlineArrowRight className="mt-1 h-5 w-5 text-slate-400 transitiongroup-hover:text-white" />
            </div>
          </Link>
        ))}
      </div>
    </SandboxShell>
  );
}
