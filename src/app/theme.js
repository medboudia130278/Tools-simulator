export const palette = {
  surface: "#f7f9fc",
  surfaceLow: "#f2f4f7",
  surfaceLowest: "#ffffff",
  surfaceHigh: "#e6e8eb",
  surfaceHighest: "#dde2e7",
  ink: "#191c1e",
  inkSoft: "#475467",
  inkMuted: "#667085",
  primary: "#1c6090",
  primarySoft: "#dceaf5",
  primaryStrong: "#3c79ab",
  teal: "#1f8a84",
  tealSoft: "#d9efed",
  safety: "#9f4200",
  safetySoft: "#fce8d9",
  shadow: "0 24px 60px rgba(32, 99, 147, 0.12)",
};

export const shellFontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
  * { box-sizing:border-box; }
  html, body, #root { margin:0; min-height:100%; background:${palette.surface}; color:${palette.ink}; }
  body { font-family:'Inter', sans-serif; }
  button, input, select, textarea { font:inherit; }
  a { color:inherit; }
  @media (max-width: 980px) {
    .app-shell { grid-template-columns: 1fr !important; padding: 16px !important; }
    .app-sidebar { padding: 18px !important; }
    .app-topbar { padding: 20px !important; flex-direction: column !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation:none !important; transition:none !important; scroll-behavior:auto !important; }
  }
`;

export const shellStyles = {
  app: {
    minHeight: "100vh",
    background: `
      radial-gradient(circle at top left, rgba(28, 96, 144, 0.10), transparent 24%),
      radial-gradient(circle at top right, rgba(31, 138, 132, 0.08), transparent 20%),
      linear-gradient(180deg, #fbfcfe 0%, ${palette.surface} 22%, ${palette.surfaceLow} 100%)
    `,
    color: palette.ink,
  },
  shell: {
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    minHeight: "100vh",
    gap: "24px",
    padding: "24px",
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "22px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(18px)",
    boxShadow: palette.shadow,
  },
  contentWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: 0,
  },
  topbar: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "20px",
    padding: "26px 28px",
    borderRadius: "20px",
    background: palette.surfaceLowest,
    boxShadow: "0 20px 50px rgba(17, 24, 39, 0.06)",
  },
  panel: {
    background: palette.surfaceLow,
    borderRadius: "24px",
    padding: "18px",
    minHeight: 0,
  },
};
