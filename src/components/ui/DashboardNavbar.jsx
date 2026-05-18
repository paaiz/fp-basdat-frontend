"use client";

import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

import Image from "next/image";
import { BiSolidExit } from "react-icons/bi";

import togaIcon from "../../../public/assets/dashboard/toga_icon.svg";

export default function DashboardNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.replace("/sign-in");
  };

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src={togaIcon}
            className="h-11 w-11 shrink-0 p-1 rounded-md bg-blue-500"
            alt="Logo"
          />

          <div>
            <p className="text-sm font-bold leading-5 tracking-wide text-slate-900">SIAKADEMIK</p>
            <p className="text-xs leading-4 text-slate-600">Universitas Nusantara</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md text-[#364153] px-4 py-2 text-sm transition cursor-pointer shadow"
        >
          <BiSolidExit />
          Logout
        </button>
      </div>
    </header>
  );
}
