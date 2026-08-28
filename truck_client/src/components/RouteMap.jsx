import { useMemo } from "react";
const WIDTH = 640;
const HEIGHT = 340;
const PAD = 46;

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function haversineNm(lat1, lng1, lat2, lng2) {
  const R_KM = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R_KM * c * 0.539957;
}

function initialBearing(lat1, lng1, lat2, lng2) {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

function bearingToCompass(deg) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

// Pick a "nice" grid interval (degrees) so 3–6 lines show across a span.
function niceInterval(span) {
  const steps = [1, 2, 5, 10, 15, 20, 30, 45];
  for (const s of steps) {
    if (span / s <= 6) return s;
  }
  return 60;
}

function buildGeometry(originCoordinates, destinationCoordinates) {
  const o = originCoordinates;
  const d = destinationCoordinates;
  if (!o || !d) return null;

  const rawLatSpan = Math.max(Math.abs(o.lat - d.lat), 8);
  const rawLngSpan = Math.max(Math.abs(o.lng - d.lng), 8);
  const latPad = rawLatSpan * 0.4;
  const lngPad = rawLngSpan * 0.4;

  const minLat = Math.min(o.lat, d.lat) - latPad;
  const maxLat = Math.max(o.lat, d.lat) + latPad;
  const minLng = Math.min(o.lng, d.lng) - lngPad;
  const maxLng = Math.max(o.lng, d.lng) + lngPad;

  const plotW = WIDTH - PAD * 2;
  const plotH = HEIGHT - PAD * 2;

  const project = (lat, lng) => ({
    x: PAD + ((lng - minLng) / (maxLng - minLng)) * plotW,
    y: PAD + ((maxLat - lat) / (maxLat - minLat)) * plotH,
  });

  const originPt = project(o.lat, o.lng);
  const destPt = project(d.lat, d.lng);

  // Gentle arc control point (bows the rhumb line, reads as a great-circle hint)
  const midX = (originPt.x + destPt.x) / 2;
  const midY = (originPt.y + destPt.y) / 2;
  const dx = destPt.x - originPt.x;
  const dy = destPt.y - originPt.y;
  const bow = Math.min(48, Math.hypot(dx, dy) * 0.18);
  const nx = -dy;
  const ny = dx;
  const norm = Math.hypot(nx, ny) || 1;
  const ctrlX = midX + (nx / norm) * bow;
  const ctrlY = midY + (ny / norm) * bow;

  const pathD = `M ${originPt.x.toFixed(2)} ${originPt.y.toFixed(2)} Q ${ctrlX.toFixed(2)} ${ctrlY.toFixed(2)} ${destPt.x.toFixed(2)} ${destPt.y.toFixed(2)}`;

  const latInterval = niceInterval(maxLat - minLat);
  const lngInterval = niceInterval(maxLng - minLng);

  const parallels = [];
  for (let lat = Math.ceil(minLat / latInterval) * latInterval; lat <= maxLat; lat += latInterval) {
    parallels.push({ lat, y: project(lat, minLng).y });
  }
  const meridians = [];
  for (let lng = Math.ceil(minLng / lngInterval) * lngInterval; lng <= maxLng; lng += lngInterval) {
    meridians.push({ lng, x: project(minLat, lng).x });
  }

  const distanceNm = Math.round(haversineNm(o.lat, o.lng, d.lat, d.lng));
  const bearing = initialBearing(o.lat, o.lng, d.lat, d.lng);

  return { originPt, destPt, pathD, parallels, meridians, distanceNm, bearing };
}

function formatCoord(value, posLabel, negLabel) {
  const abs = Math.abs(value).toFixed(1);
  return `${abs}° ${value >= 0 ? posLabel : negLabel}`;
}

const RouteMap = ({ origin, destination, originLabel, originCoordinates, destinationCoordinates }) => {
  const geo = useMemo(
    () => buildGeometry(originCoordinates, destinationCoordinates),
    [originCoordinates, destinationCoordinates]
  );

  return (
    <div className="route-map-shell">
      <style>{`
        .route-map-shell {
          background: radial-gradient(120% 140% at 15% 0%, #0d1a2e 0%, #070d18 60%);
          border: 1px solid #162234;
          border-radius: 16px;
          padding: 1rem 1rem 0.85rem;
          color: #e2e8f0;
          font-family: 'Segoe UI', Roboto, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .route-map-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.65rem;
          flex-wrap: wrap;
        }
        .route-map-eyebrow {
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #38bdf8;
        }
        .route-map-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #fff;
          margin-top: 2px;
        }
        .route-map-pills {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .route-map-pill {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.28rem 0.6rem;
          border-radius: 999px;
          background: #0b1320;
          border: 1px solid #162234;
          color: #94a3b8;
          white-space: nowrap;
        }
        .route-map-pill strong { color: #38bdf8; }
        .route-map-svg-wrap { width: 100%; position: relative; }
        .route-map-svg { width: 100%; height: auto; display: block; }
        .route-map-legend {
          display: flex;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 0.5rem;
          padding-top: 0.65rem;
          border-top: 1px solid #162234;
          flex-wrap: wrap;
        }
        .route-map-legend-item { display: flex; align-items: center; gap: 0.45rem; min-width: 0; }
        .route-map-legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .route-map-legend-text { display: flex; flex-direction: column; min-width: 0; }
        .route-map-legend-text small { color: #64748b; font-size: 0.64rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .route-map-legend-text strong { color: #e2e8f0; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
        .route-map-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2.5rem 1rem;
          color: #64748b;
        }
        .route-map-empty .glyph { font-size: 1.6rem; margin-bottom: 0.5rem; opacity: 0.7; }
        @keyframes route-dash-flow { to { stroke-dashoffset: -24; } }
        .route-map-dashed { animation: route-dash-flow 1.4s linear infinite; }
        @keyframes route-pulse {
          0%, 100% { opacity: 0.45; r: 9; }
          50% { opacity: 0.05; r: 15; }
        }
        .route-map-pulse { animation: route-pulse 2.4s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }
      `}</style>

      <div className="route-map-head">
        <div>
          <div className="route-map-eyebrow">Charter Route Plot</div>
          <div className="route-map-title">
            {origin} <span style={{ color: "#475569" }}>→</span> {destination}
          </div>
        </div>
        {geo && (
          <div className="route-map-pills">
            <span className="route-map-pill">
              <strong>{geo.distanceNm.toLocaleString()}</strong> nm
            </span>
            <span className="route-map-pill">
              <strong>{bearingToCompass(geo.bearing)}</strong> {Math.round(geo.bearing)}°
            </span>
          </div>
        )}
      </div>

      {!geo ? (
        <div className="route-map-empty">
          <div className="glyph">⚓</div>
          <div>Route coordinates aren't available for this origin/destination pair yet.</div>
        </div>
      ) : (
        <>
          <div className="route-map-svg-wrap">
            <svg
              className="route-map-svg"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label={`Route from ${origin} to ${destination}`}
            >
              <defs>
                <pattern id="rm-ocean-dots" width="14" height="14" patternUnits="userSpaceOnUse">
                  <circle cx="1.2" cy="1.2" r="1.1" fill="#16223466" />
                </pattern>
                <radialGradient id="rm-vignette" cx="50%" cy="35%" r="75%">
                  <stop offset="0%" stopColor="#0d1a2e" stopOpacity="0" />
                  <stop offset="100%" stopColor="#050a13" stopOpacity="0.55" />
                </radialGradient>
                <marker id="rm-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#38bdf8" />
                </marker>
              </defs>

              <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="12" fill="#070d18" />
              <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="12" fill="url(#rm-ocean-dots)" />

              {/* Parallels / meridians — a lightweight chart grid */}
              {geo.parallels.map((p, i) => (
                <g key={`lat-${i}`}>
                  <line x1={PAD} x2={WIDTH - PAD} y1={p.y} y2={p.y} stroke="#16223488" strokeWidth="1" strokeDasharray="1 4" />
                  <text x={PAD - 8} y={p.y + 3} textAnchor="end" fontSize="9" fill="#475569" fontFamily="ui-monospace, monospace">
                    {formatCoord(p.lat, "N", "S")}
                  </text>
                </g>
              ))}
              {geo.meridians.map((m, i) => (
                <g key={`lng-${i}`}>
                  <line x1={m.x} x2={m.x} y1={PAD} y2={HEIGHT - PAD} stroke="#16223488" strokeWidth="1" strokeDasharray="1 4" />
                  <text x={m.x} y={HEIGHT - PAD + 16} textAnchor="middle" fontSize="9" fill="#475569" fontFamily="ui-monospace, monospace">
                    {formatCoord(m.lng, "E", "W")}
                  </text>
                </g>
              ))}

              {/* Route path */}
              <path id="rm-route-path" d={geo.pathD} fill="none" stroke="#0f2942" strokeWidth="5" strokeLinecap="round" />
              <path
                d={geo.pathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="7 5"
                className="route-map-dashed"
                markerEnd="url(#rm-arrow)"
              />

              {/* Origin marker */}
              <circle cx={geo.originPt.x} cy={geo.originPt.y} r="9" fill="#34d39922" className="route-map-pulse" />
              <circle cx={geo.originPt.x} cy={geo.originPt.y} r="5.5" fill="#070d18" stroke="#34d399" strokeWidth="2.5" />
              <text x={geo.originPt.x} y={geo.originPt.y - 14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#e2e8f0">
                {origin}
              </text>

              {/* Destination marker */}
              <circle cx={geo.destPt.x} cy={geo.destPt.y} r="9" fill="#f8717122" className="route-map-pulse" style={{ animationDelay: "1.2s" }} />
              <circle cx={geo.destPt.x} cy={geo.destPt.y} r="5.5" fill="#070d18" stroke="#f87171" strokeWidth="2.5" />
              <text x={geo.destPt.x} y={geo.destPt.y - 14} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#e2e8f0">
                {destination}
              </text>

              {/* Ship gliding along the route */}
              <g fill="#0b1320" stroke="#38bdf8" strokeWidth="1.4">
                <path d="M -6 3 L 6 3 L 3.5 8 L -3.5 8 Z M 0 -6 L 0 3" strokeLinejoin="round" strokeLinecap="round">
                  <animateMotion dur="5.5s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#rm-route-path" />
                  </animateMotion>
                </path>
              </g>

              <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="12" fill="url(#rm-vignette)" pointerEvents="none" />

              {/* Compass rose */}
              <g transform={`translate(${WIDTH - 40}, 40)`} opacity="0.55">
                <circle r="18" fill="none" stroke="#475569" strokeWidth="1" />
                <line x1="0" y1="-18" x2="0" y2="18" stroke="#475569" strokeWidth="1" />
                <line x1="-18" y1="0" x2="18" y2="0" stroke="#475569" strokeWidth="1" />
                <text y="-22" textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="700">N</text>
              </g>
            </svg>
          </div>

          <div className="route-map-legend">
            <div className="route-map-legend-item">
              <span className="route-map-legend-dot" style={{ backgroundColor: "#34d399" }} />
              <div className="route-map-legend-text">
                <small>Loading port</small>
                <strong>{originLabel || origin}</strong>
              </div>
            </div>
            <div className="route-map-legend-item">
              <span className="route-map-legend-dot" style={{ backgroundColor: "#f87171" }} />
              <div className="route-map-legend-text">
                <small>Discharge port</small>
                <strong>{destination}</strong>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RouteMap;