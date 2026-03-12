"use client";

import { usePathname, useRouter } from "next/navigation";

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
          <h1 className="text-sm font-semibold text-gray-900">
            CommandBase
          </h1>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-card transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
