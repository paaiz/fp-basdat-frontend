"use client";

import Link from "next/link";
import { SANDBOX_ROUTES } from "./sandboxConfig";

export default function SandboxShell({ title, description, activeId = "home", children }) {
  return (
    <div className="min-h-screen bg-linear-to-br px-4 py-8 text-slate-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
            Sandbox Universitas Nusantara
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
          ) : null}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SANDBOX_ROUTES.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeId === item.id
                  ? "bg-white text-slate-950 shadow-lg"
                  : "bg-white/10 text-slate-200 hover:bg-white/20"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {children}
      </div>
    </div>
  );
}
