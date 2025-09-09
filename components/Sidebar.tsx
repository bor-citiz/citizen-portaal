import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
  return (
    <div className="h-full bg-gradient-to-b from-[#DB64B5] via-[#5E79A5] to-[#23BFBF] text-white flex flex-col">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image 
            src="/citiz-logo.png" 
            alt="Citizen Portaal Logo"
            width={28}
            height={28}
            className="rounded"
          />
          <span className="text-lg font-semibold tracking-tight">Citizen Portaal</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          href="/dashboard"
          className="block rounded-md px-3 py-2 hover:bg-white/10 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/projects"
          className="block rounded-md px-3 py-2 hover:bg-white/10 transition-colors"
        >
          Alle Projecten
        </Link>
        <Link
          href="/instellingen"
          className="block rounded-md px-3 py-2 hover:bg-white/10 transition-colors"
        >
          Instellingen
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 text-xs text-white/70 border-t border-white/10">
        © {new Date().getFullYear()} Citizen Portaal
      </div>
    </div>
  );
}