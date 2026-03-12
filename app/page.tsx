import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Cochrane Realty</h1>
          <p className="text-sm text-gray-500 mt-1">Task Manager</p>
        </div>
        <div className="space-y-3">
          <Link
            href="/admin/login"
            className="block w-full bg-purple-primary text-white text-center font-medium py-3 rounded-card hover:opacity-90 transition-opacity"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/worker/login"
            className="block w-full bg-white text-gray-900 text-center font-medium py-3 rounded-card border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Worker Login
          </Link>
        </div>
      </div>
    </div>
  );
}
