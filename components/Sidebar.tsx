import Link from "next/link";
import Image from "next/image";
import { Home, FolderOpen, Settings } from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean
}

export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/projects", label: "Alle Projecten", icon: FolderOpen },
    { href: "/instellingen", label: "Instellingen", icon: Settings },
  ]

  return (
    <div className="h-full bg-gradient-to-b from-[#DB64B5] via-[#5E79A5] to-[#23BFBF] text-white flex flex-col">
      {/* Brand */}
      <div className={`${isCollapsed ? 'px-2' : 'px-4'} py-5 border-b border-white/10`}>
        <Link href="/dashboard" className="flex items-center gap-3" title={isCollapsed ? "Citizen Portaal" : ""}>
          <Image 
            src="/citiz-logo.png" 
            alt="Citizen Portaal Logo"
            width={28}
            height={28}
            className="rounded shrink-0"
          />
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-tight">Citizen Portaal</span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-3'} py-4 space-y-1`}>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-white/10 transition-colors"
            title={isCollapsed ? label : ""}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && (
              <span>{label}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-4 py-3 text-xs text-white/70 border-t border-white/10">
          © {new Date().getFullYear()} Citizen Portaal
        </div>
      )}
    </div>
  );
}