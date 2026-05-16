export default function SignInLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 flex items-center justify-center">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="grid min-h-[80vh] md:grid-cols-2">
          <section className="flex flex-col justify-between bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 text-white sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                Login Portal
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">SIAKADEMIK</h1>
              <p className="max-w-md text-sm leading-6 text-white/70 sm:text-base">
                Universitas Nusantara
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="font-semibold">Mahasiswa</p>
                <p className="mt-1 text-sm text-white/80">
                  Akses jadwal, nilai, dan informasi akademik.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="font-semibold">Dosen</p>
                <p className="mt-1 text-sm text-white/80">
                  Akses presensi, kelas, dan pengelolaan penilaian.
                </p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <div className="mb-6 text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-900">Masuk ke akun Anda</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Silakan pilih jenis akun sebelum login.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {children}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
