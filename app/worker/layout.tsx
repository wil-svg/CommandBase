"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/worker", label: "Tasks" },
  { href: "/worker/earnings", label: "Earnings" },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/worker/login") {
    return <div className="min-h-screen max-w-lg mx-auto">{children}</div>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/worker/login");
  };

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-12 px-4">
          <h1 className="text-sm font-semibold text-gray-900">CommandBase</h1>
          <div className="flex items-center gap-1">
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const isActive = item.href === "/worker"
                  ? pathname === "/worker"
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-1 text-xs rounded-card transition-colors ${
                      isActive
                        ? "bg-purple-light text-purple-primary font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="ml-1 px-2.5 py-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-card transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
