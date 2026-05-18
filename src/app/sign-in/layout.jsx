import Image from "next/image";

import togaIcon from "../../../public/assets/dashboard/toga_icon.svg";

export default function SignInLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
      <div className="overflow-hidden md:w-[30vw] rounded-lg bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex flex-col items-center justify-center ">
          <section className="w-full flex flex-col bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white sm:p-10">
            <div className="flex flex-col items-center">
              <Image src={togaIcon} alt="Logo" width={50} height={50} />
              <h1 className="mt-4 text-3xl leading-tight sm:text-4xl">SIAKADEMIK</h1>
              <p className="max-w-md text-sm leading-6 text-white/70 sm:text-base">
                Universitas Nusantara
              </p>
            </div>
          </section>

          <section className="p-5 w-full items-center">
            <div className="rounded-2xl bg-white">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
