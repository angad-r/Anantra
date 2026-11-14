export function StarfieldBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-space-void print:hidden"
    >
      {/* Orbital horizon & deep nebula ambient glows */}
      <div className="absolute -top-48 left-1/2 h-[580px] w-[1040px] -translate-x-1/2 rounded-full bg-sky-500/12 blur-[140px]" />
      <div className="absolute top-32 left-[-160px] h-[360px] w-[420px] rounded-full bg-cyan-500/7 blur-[120px]" />
      <div className="absolute bottom-[-240px] right-[-140px] h-[480px] w-[660px] rounded-full bg-indigo-500/12 blur-[150px]" />

      {/* Subtle telemetry HUD coordinate grid */}
      <div className="anantra-hud-grid absolute inset-0 opacity-80" />

      {/* Two subtle star layers */}
      <div className="anantra-stars-sm absolute inset-0 opacity-80" />
      <div className="anantra-stars-lg absolute inset-0" />

      {/* Crisp atmospheric horizon arc */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

      {/* Soft depth vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-space-void/15 via-transparent to-space-void/95" />
    </div>
  );
}
