export default function PortalLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" aria-busy="true" aria-live="polite">
      <p className="text-sm text-muted-foreground">Memuat portal warga...</p>
    </div>
  );
}
