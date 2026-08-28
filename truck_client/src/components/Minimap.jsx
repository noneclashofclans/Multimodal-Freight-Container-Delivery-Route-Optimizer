import React, { useMemo, useState } from "react";

const WIDTH = 340;
const HEIGHT = 220;
const PAD = 10;

function projectEquirectangular(lat, lng, w = WIDTH, h = HEIGHT) {
  const x = PAD + ((lng + 180) / 360) * (w - PAD * 2);
  const y = PAD + ((90 - lat) / 180) * (h - PAD * 2);
  return { x, y };
}

const Minimap = ({ originCoordinates, destinationCoordinates, originLabel, destinationLabel, onOpenLargeMap, theme = "dark" }) => {
  const [hover, setHover] = useState(null);
  const isLight = theme === "light";
  const geo = useMemo(() => {
    const o = originCoordinates;
    const d = destinationCoordinates;
    const oPt = o ? projectEquirectangular(o.lat, o.lng) : null;
    const dPt = d ? projectEquirectangular(d.lat, d.lng) : null;
    return { oPt, dPt };
  }, [originCoordinates, destinationCoordinates]);

  return (
    <div className="minimap-shell" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        .minimap-card { background: ${isLight ? "linear-gradient(180deg,#ffffff,#f7fbff)" : "linear-gradient(180deg,#071423,#04101a)"}; border:1px solid ${isLight ? "#e6eef6" : "#162234"}; border-radius:10px; padding:8px; width:100%; height:100%; box-sizing:border-box; }
        .minimap-legend { display:flex; gap:8px; align-items:center; margin-top:8px; color:${isLight ? "#475569" : "#94a3b8"}; font-size:0.78rem; }
        .minimap-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .minimap-tooltip { position:absolute; pointer-events:none; background:${isLight ? "#ffffff" : "#0b1320"}; color:${isLight ? "#0f172a" : "#e2e8f0"}; padding:6px 8px; border:1px solid ${isLight ? "#e6eef6" : "#162234"}; border-radius:6px; font-size:0.78rem; white-space:nowrap; }
      `}</style>
      <div className="minimap-card">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          width="100%"
          height="140"
          preserveAspectRatio="xMidYMid meet"
          style={{ cursor: onOpenLargeMap ? "pointer" : "default" }}
          onClick={() => onOpenLargeMap && onOpenLargeMap()}
          role={onOpenLargeMap ? "button" : undefined}
          aria-label={onOpenLargeMap ? "Open full route map" : undefined}
        >
          <defs>
            <linearGradient id="mm-ocean" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0d3050" stopOpacity="1" />
              <stop offset="100%" stopColor="#052036" stopOpacity="1" />
            </linearGradient>
          </defs>
            <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="8" fill="url(#mm-ocean)" />

          {/* graticule */}
          {Array.from({ length: 7 }).map((_, i) => {
            const x = PAD + (i / 6) * (WIDTH - PAD * 2);
            return <line key={`gx-${i}`} x1={x} x2={x} y1={PAD} y2={HEIGHT - PAD} stroke={isLight ? "#e6eef6" : "#08243488"} strokeWidth="0.6" />;
          })}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = PAD + (i / 4) * (HEIGHT - PAD * 2);
            return <line key={`gy-${i}`} x1={PAD} x2={WIDTH - PAD} y1={y} y2={y} stroke={isLight ? "#e6eef6" : "#08243488"} strokeWidth="0.6" />;
          })}

          {/* optionally draw a great-circle-ish arc between points */}
          {geo.oPt && geo.dPt && (
            <path
              d={`M ${geo.oPt.x.toFixed(2)} ${geo.oPt.y.toFixed(2)} Q ${(geo.oPt.x + geo.dPt.x) / 2} ${(Math.min(geo.oPt.y, geo.dPt.y) - 20).toFixed(2)} ${geo.dPt.x.toFixed(2)} ${geo.dPt.y.toFixed(2)}`}
              fill="none"
              stroke={isLight ? "#0ea5e9" : "#7dd3fc"}
              strokeWidth="1.6"
              strokeDasharray="4 3"
            />
          )}

          {/* origin marker */}
          {geo.oPt && (
            <g onMouseEnter={() => setHover({ kind: "origin", x: geo.oPt.x, y: geo.oPt.y })} onMouseLeave={() => setHover(null)}>
              <circle cx={geo.oPt.x} cy={geo.oPt.y} r={10} fill={isLight ? "#d1fae5" : "#34d39922"} />
              <circle cx={geo.oPt.x} cy={geo.oPt.y} r={5.5} fill={isLight ? "#ffffff" : "#041018"} stroke="#34d399" strokeWidth={2.2} />
            </g>
          )}

          {/* destination marker */}
          {geo.dPt && (
            <g onMouseEnter={() => setHover({ kind: "dest", x: geo.dPt.x, y: geo.dPt.y })} onMouseLeave={() => setHover(null)}>
              <circle cx={geo.dPt.x} cy={geo.dPt.y} r={10} fill={isLight ? "#fee2e2" : "#fb718122"} />
              <circle cx={geo.dPt.x} cy={geo.dPt.y} r={5.5} fill={isLight ? "#ffffff" : "#041018"} stroke="#fb7181" strokeWidth={2.2} />
            </g>
          )}
        </svg>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <div className="minimap-legend">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="minimap-dot" style={{ background: "#34d399" }} />
              <div style={{ color: isLight ? "#475569" : "#cbd5e1" }}>
                <div style={{ fontSize: 10 }}>Loading</div>
                <div style={{ fontWeight: 700, color: "#e6eef6" }}>{originLabel || "—"}</div>
              </div>
            </div>
          </div>

          <div className="minimap-legend" style={{ justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="minimap-dot" style={{ background: "#fb7181" }} />
              <div style={{ color: isLight ? "#475569" : "#cbd5e1", textAlign: "right" }}>
                <div style={{ fontSize: 10 }}>Discharge</div>
                <div style={{ fontWeight: 700, color: "#e6eef6" }}>{destinationLabel || "—"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* tooltip */}
        {hover && (
          <div className="minimap-tooltip" style={{ left: hover.x + 18, top: hover.y - 8, position: "absolute" }}>
            {hover.kind === "origin" ? originLabel || "Origin" : destinationLabel || "Destination"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Minimap;
