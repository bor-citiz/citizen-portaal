import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="h-full bg-primary text-primary-foreground flex flex-col">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          {/* Simple hummingbird mark (inline SVG). If you prefer, replace with your own asset. */}
          <svg
            aria-hidden="true"
            viewBox="0 0 64 64"
            className="h-7 w-7"
            fill="currentColor"
          >
            <path d="M9 28c10-2 18-8 22-14 3-5 10-8 15-5 2 1 2 3 0 4-4 3-7 5-8 7 3 2 8 3 12 3 3 0 5 2 4 4-1 2-5 3-12 2-2 0-4 0-6-1l-4 6c-2 3-6 6-11 7l-4 1c-2 0-3-2-2-3l3-4c-2-1-4-3-5-5-1-2 0-2 2-2l4 0z" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">Citizen Portaal</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <Link
          href="/dashboard"
          className="block rounded-md px-3 py-2 hover:bg-white/10 transition"
        >
          Dashboard
        </Link>
        <Link
          href="/instellingen"
          className="block rounded-md px-3 py-2 hover:bg-white/10 transition"
        >
          Instellingen
        </Link>
      </nav>

      {/* Footer (optional placeholder) */}
      <div className="px-4 py-3 text-xs text-white/70 border-t border-white/10">
        © {new Date().getFullYear()} Citizen Portaal
      </div>
    </div>
  );
}
