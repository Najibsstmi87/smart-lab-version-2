export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/80 px-4 py-3 text-center text-xs text-slate-500 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
        <span>Smart Lab System © 2026</span>
        <span className="hidden sm:inline">|</span>
        <span>@ScienceLabProduction</span>
      </div>
    </footer>
  );
}
