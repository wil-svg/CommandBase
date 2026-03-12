export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-w-lg mx-auto">
      {children}
    </div>
  );
}
