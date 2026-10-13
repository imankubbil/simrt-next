import { PrintButton } from "@/components/print-button";

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white print:min-h-0">
      <div className="mx-auto max-w-4xl px-4 pt-4 print:hidden">
        <PrintButton />
      </div>
      {children}
    </main>
  );
}
