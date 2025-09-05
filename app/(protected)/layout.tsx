import type { ReactNode } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar (left) */}
      <aside className="w-64 shrink-0">
        <Sidebar />
      </aside>

      {/* Main column (right) */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
