import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Navbar from "../components/Navbar";
import RouteMap from "../components/RouteMap";
import Minimap from "../components/Minimap";
import { useTheme } from "../../context/ThemeContext";
import { ports, vesselTypes } from "../data/Ports";
// Reuse the same vessel images used on the query page
import handysizeImg from "../assets/screenshot-2026-08-26_18-06-21.png";
import supramaxImg from "../assets/screenshot-2026-08-26_18-13-33.png";
import panamaxImg from "../assets/screenshot-2026-08-26_18-14-46.png";
import capesizeImg from "../assets/screenshot-2026-08-26_18-21-30.png";
const vesselImages = {
  Handysize: handysizeImg,
  Supramax: supramaxImg,
  Panamax: panamaxImg,
  Capesize: capesizeImg,
};
// Approximate representative export-hub coordinates per origin country
// (adjust these to the actual load ports you care about)
const ORIGIN_COORDINATES = {
  Australia: { lat: -20.3115, lng: 118.6069, label: "Port Hedland, Australia" },
  "United States": { lat: 29.7604, lng: -95.3698, label: "Houston, USA" },
  Mozambique: { lat: -23.8654, lng: 35.3833, label: "Maputo, Mozambique" },
  Russia: { lat: 43.1056, lng: 131.8735, label: "Vladivostok, Russia" },
  Indonesia: { lat: -3.3194, lng: 114.5908, label: "Banjarmasin, Indonesia" },
};
// Coordinates for the East Coast India ports, keyed by port.id from Ports.jsx
const PORT_COORDINATES = {
  paradip: { lat: 20.2648, lng: 86.6947 },
  gangavaram: { lat: 17.6167, lng: 83.2333 },
  gopalpur: { lat: 19.2647, lng: 84.9089 },
  dhamra: { lat: 20.7833, lng: 86.9833 },
  haldia: { lat: 22.0333, lng: 88.0833 },
  vizag: { lat: 17.6868, lng: 83.2185 },
  "sagar-sandheads": { lat: 21.65, lng: 88.05 },
};
// Haversine great-circle distance in nautical miles + km
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R_KM = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R_KM * c;
  const nauticalMiles = km * 0.539957;
  return { km, nauticalMiles };
}
// Helper to find a destination port entry by name (matches the "name" or "id" field)
function findPortByDestination(destinationName) {
  if (!destinationName) return null;
  const normalized = destinationName.toLowerCase().trim();
  return (
    ports.find(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        p.id.toLowerCase() === normalized.replace(/\s+/g, "-")
    ) || null
  );
}
// ---------------------------------------------------------------------------
// PORT COMPATIBILITY ENGINE — extracted so it can be run per-vessel-type,
// not just for the vessel the user selected on the query page.
// ---------------------------------------------------------------------------
function evaluatePortsForVessel(spec) {
  return ports.map((port) => {
    const restrictions = [];
    if (port.maxDraft !== null && spec.maxDraft > port.maxDraft) {
      restrictions.push(`Draft (${spec.maxDraft}m) exceeds ${port.maxDraft}m limit`);
    }
    if (port.maxLOA !== null && spec.maxLOA > port.maxLOA) {
      restrictions.push(`LOA (${spec.maxLOA}m) exceeds ${port.maxLOA}m limit`);
    }
    if (port.maxBeam !== null && spec.maxBeam > port.maxBeam) {
      restrictions.push(`Beam (${spec.maxBeam}m) exceeds ${port.maxBeam}m limit`);
    }
    if (port.maxDWT !== null && spec.maxDWT > port.maxDWT) {
      restrictions.push(`DWT exceeds ${port.maxDWT.toLocaleString()} tons limit`);
    }
    if (port.id === "sagar-sandheads") {
      return {
        ...port,
        status: "special",
        restrictions: [
          "Deep-water anchorage operational site",
          "STS (Ship-to-Ship) transfer operation required",
        ],
      };
    }
    return {
      ...port,
      status: restrictions.length === 0 ? "compatible" : "restricted",
      restrictions,
    };
  });
}

const RATE_VALUE_KEYS = [
  "rate",
  "value",
  "price",
  "predictedRate",
  "forecastRate",
  "historicalRate",
  "projectedRate",
  "avgRate",
  "averageRate",
  "freightRate",
  "rateUsd",
  "usdPerTonne",
  "ratePerTonne",
  "amount",
  "rateValue",
  "close",
  "y",
];
const RATE_LABEL_KEYS = ["date", "month", "period", "label", "day", "week", "timestamp", "x"];
function getPointValue(d) {
  if (typeof d === "number") return d;
  if (!d || typeof d !== "object") return 0;
  for (const key of RATE_VALUE_KEYS) {
    const raw = d[key];
    if (raw === undefined || raw === null || raw === "") continue;
    // Strip currency symbols/commas ("$1,234.50" -> "1234.50") before parsing.
    const num = Number(String(raw).replace(/[^0-9.-]+/g, ""));
    if (!Number.isNaN(num)) return num;
  }
  return 0;
}
function getPointLabel(d, i) {
  if (!d || typeof d !== "object") return `Pt ${i + 1}`;
  for (const key of RATE_LABEL_KEYS) {
    if (d[key] !== undefined && d[key] !== null && d[key] !== "") return d[key];
  }
  return `Pt ${i + 1}`;
}
function isForecastPoint(d) {
  if (!d || typeof d !== "object") return false;
  if (typeof d.isForecast === "boolean") return d.isForecast;
  if (typeof d.forecast === "boolean") return d.forecast;
  const typeVal = d.type ?? d.category ?? d.segment ?? d.kind;
  if (typeof typeVal === "string") {
    const t = typeVal.toLowerCase();
    return t.includes("forecast") || t.includes("project") || t.includes("predict");
  }
  return false;
}
// If every point resolved to 0, the backend's field names don't match any of
// the candidates above — warn loudly in the console with the actual keys so
// this is a five-second fix instead of a mystery.
function warnIfAllZero(rawData, points) {
  if (!rawData?.length || !points?.length) return;
  const allZero = points.every((p) => p.value === 0);
  if (allZero) {
    // eslint-disable-next-line no-console
    console.warn(
      "[ForecastResults] Every rateData point resolved to $0 — none of the expected " +
        "field names matched. Actual keys on the first item:",
      Object.keys(rawData[0] || {}),
      "First item:",
      rawData[0]
    );
  }
}
function buildChartGeometry(rawData, opts = {}) {
  if (!rawData || rawData.length === 0) return null;
  const {
    width = 900,
    height = 360,
    paddingLeft = 64,
    paddingRight = 24,
    paddingTop = 30,
    paddingBottom = 46,
  } = opts;
  const points = rawData.map((d, i) => ({
    index: i,
    label: getPointLabel(d, i),
    value: getPointValue(d),
    forecast: isForecastPoint(d),
  }));
  warnIfAllZero(rawData, points);
  const values = points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
  const range = maxVal - minVal || Math.max(1, maxVal * 0.1);
  const yPad = range * 0.18;
  const yMin = Math.max(0, minVal - yPad);
  const yMax = maxVal + yPad;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const xStep = points.length > 1 ? plotWidth / (points.length - 1) : 0;
  const coords = points.map((p, i) => ({
    ...p,
    x: paddingLeft + i * xStep,
    y:
      paddingTop +
      plotHeight -
      ((p.value - yMin) / (yMax - yMin || 1)) * plotHeight,
  }));
  const firstForecastIndex = coords.findIndex((p) => p.forecast);
  const hasForecastSplit = firstForecastIndex > 0;
  const splitIndex = hasForecastSplit ? firstForecastIndex : coords.length - 1;
  const historicalCoords = hasForecastSplit ? coords.slice(0, splitIndex + 1) : coords;
  const forecastCoords = hasForecastSplit ? coords.slice(splitIndex) : [];
  const toPath = (arr) =>
    arr.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
  const toAreaPath = (arr) => {
    if (arr.length === 0) return "";
    const base = paddingTop + plotHeight;
    return (
      `M ${arr[0].x.toFixed(2)} ${base.toFixed(2)} ` +
      arr.map((c) => `L ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ") +
      ` L ${arr[arr.length - 1].x.toFixed(2)} ${base.toFixed(2)} Z`
    );
  };
  const yTickCount = 5;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    const value = yMin + ((yMax - yMin) * i) / yTickCount;
    return { value, y: paddingTop + plotHeight - (i / yTickCount) * plotHeight };
  });
  const xTickEvery = Math.max(1, Math.ceil(coords.length / 8));
  const xTicks = coords.filter((_, i) => i % xTickEvery === 0 || i === coords.length - 1);
  const minPoint = coords.reduce((a, b) => (b.value < a.value ? b : a), coords[0]);
  const maxPoint = coords.reduce((a, b) => (b.value > a.value ? b : a), coords[0]);
  const changePct =
    coords.length > 1 && coords[0].value !== 0
      ? ((coords[coords.length - 1].value - coords[0].value) / coords[0].value) * 100
      : 0;
  const variance = values.reduce((sum, v) => sum + (v - avgVal) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return {
    width,
    height,
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    plotWidth,
    plotHeight,
    coords,
    historicalCoords,
    forecastCoords,
    pathHistorical: toPath(historicalCoords),
    pathForecast: hasForecastSplit ? toPath(forecastCoords) : "",
    areaHistorical: toAreaPath(historicalCoords),
    areaForecast: hasForecastSplit ? toAreaPath(forecastCoords) : "",
    yTicks,
    xTicks,
    minVal,
    maxVal,
    avgVal,
    minPoint,
    maxPoint,
    changePct,
    stdDev,
    splitIndex,
    hasForecastSplit,
  };
}
// Static (non-interactive) SVG markup string — used inside the downloadable
// HTML report, where React event handlers won't run.
function renderStaticChartSVG(g) {
  if (!g) return "";
  const {
    width,
    height,
    pathHistorical,
    pathForecast,
    areaHistorical,
    yTicks,
    xTicks,
    paddingLeft,
    paddingRight,
    paddingTop,
    plotHeight,
    hasForecastSplit,
    coords,
    splitIndex,
  } = g;
  const yTickSvg = yTicks
    .map(
      (t) =>
        `<line x1="${paddingLeft}" x2="${width - paddingRight}" y1="${t.y.toFixed(
          2
        )}" y2="${t.y.toFixed(2)}" stroke="#162234" stroke-width="1" />` +
        `<text x="${paddingLeft - 10}" y="${(t.y + 4).toFixed(
          2
        )}" text-anchor="end" font-size="11" fill="#64748b">$${t.value.toFixed(0)}</text>`
    )
    .join("");
  const xTickSvg = xTicks
    .map(
      (c) =>
        `<text x="${c.x.toFixed(2)}" y="${(height - 15).toFixed(
          2
        )}" text-anchor="middle" font-size="10" fill="#64748b">${c.label}</text>`
    )
    .join("");
  const splitSvg = hasForecastSplit
    ? `<line x1="${coords[splitIndex].x.toFixed(2)}" x2="${coords[splitIndex].x.toFixed(
        2
      )}" y1="${paddingTop}" y2="${(paddingTop + plotHeight).toFixed(
        2
      )}" stroke="#475569" stroke-width="1" stroke-dasharray="4 4" />` +
      `<text x="${(coords[splitIndex].x + 6).toFixed(
        2
      )}" y="${(paddingTop + 14).toFixed(2)}" font-size="10" fill="#94a3b8">Today</text>`
    : "";
  const dotsSvg = coords
    .map(
      (c) =>
        `<circle cx="${c.x.toFixed(2)}" cy="${c.y.toFixed(2)}" r="2.5" fill="${
          c.forecast ? "#a78bfa" : "#38bdf8"
        }" stroke="#070d18" stroke-width="1" />`
    )
    .join("");
  return `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;display:block;">
    <defs>
      <linearGradient id="histFillStatic" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${yTickSvg}
    ${xTickSvg}
    ${splitSvg}
    <path d="${areaHistorical}" fill="url(#histFillStatic)" />
    <path d="${pathHistorical}" fill="none" stroke="#38bdf8" stroke-width="2.5" />
    ${pathForecast ? `<path d="${pathForecast}" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-dasharray="6 4" />` : ""}
    ${dotsSvg}
  </svg>`;
}
// Small stat pill used above the chart and in the market scenario grid
const StatPill = ({ label, value, color }) => (
  <div
    className="stat-pill rounded-3 px-3 py-2"
    style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}
  >
    <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {label}
    </div>
    <div className="fw-bold" style={{ color: color || "#fff" }}>
      {value}
    </div>
  </div>
);
// ---------------------------------------------------------------------------
// ENHANCED RATE CHART — interactive, with historical vs. forecast styling,
// gridlines, a "Today" split marker, hover tooltip, and summary stat pills.
// ---------------------------------------------------------------------------
const EnhancedRateChart = ({ data }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const geometry = useMemo(() => buildChartGeometry(data), [data]);
  if (!geometry) {
    return (
      <p className="text-center mb-0" style={{ color: "#8492a6" }}>
        No rate history data available for this scenario.
      </p>
    );
  }
  const {
    width,
    height,
    coords,
    pathHistorical,
    pathForecast,
    areaHistorical,
    areaForecast,
    yTicks,
    xTicks,
    minPoint,
    maxPoint,
    changePct,
    stdDev,
    avgVal,
    hasForecastSplit,
    splitIndex,
    paddingLeft,
    paddingTop,
    paddingRight,
    plotHeight,
  } = geometry;
  const handleMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const scaleX = width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    let nearest = 0;
    let nearestDist = Infinity;
    coords.forEach((c, i) => {
      const dist = Math.abs(c.x - mouseX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };
  const hovered = hoverIndex !== null ? coords[hoverIndex] : null;
  const allZero = coords.every((c) => c.value === 0);
  return (
    <div>
      {allZero && (
        <div
          className="rounded-3 px-3 py-2 mb-3 small"
          style={{ backgroundColor: "#3f1d1d", border: "1px solid #7f1d1d", color: "#fca5a5" }}
        >
          ⚠️ Every rate resolved to $0 — the rate field name on the backend response doesn't match what
          this chart expects. Check the browser console for the actual field names on the first data point.
        </div>
      )}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <StatPill label="Period Low" value={`$${minPoint.value.toFixed(2)}`} color="#f87171" />
        <StatPill label="Period High" value={`$${maxPoint.value.toFixed(2)}`} color="#34d399" />
        <StatPill label="Average" value={`$${avgVal.toFixed(2)}`} color="#38bdf8" />
        <StatPill label="Volatility (σ)" value={`$${stdDev.toFixed(2)}`} color="#fbbf24" />
        <StatPill
          label="Change over period"
          value={`${changePct >= 0 ? "+" : ""}${changePct.toFixed(1)}%`}
          color={changePct >= 0 ? "#34d399" : "#f87171"}
        />
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", display: "block", cursor: "crosshair" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="histFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((t, i) => (
          <g key={`y-${i}`}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={t.y}
              y2={t.y}
              stroke="#162234"
              strokeWidth="1"
            />
            <text x={paddingLeft - 10} y={t.y + 4} textAnchor="end" fontSize="11" fill="#64748b">
              ${t.value.toFixed(0)}
            </text>
          </g>
        ))}
        {xTicks.map((c, i) => (
          <text key={`x-${i}`} x={c.x} y={height - 15} textAnchor="middle" fontSize="10" fill="#64748b">
            {c.label}
          </text>
        ))}
        {hasForecastSplit && (
          <>
            <line
              x1={coords[splitIndex].x}
              x2={coords[splitIndex].x}
              y1={paddingTop}
              y2={paddingTop + plotHeight}
              stroke="#475569"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text x={coords[splitIndex].x + 6} y={paddingTop + 14} fontSize="10" fill="#94a3b8">
              Today
            </text>
          </>
        )}
        <path d={areaHistorical} fill="url(#histFill)" />
        {pathForecast && <path d={areaForecast} fill="url(#fcFill)" />}
        <path d={pathHistorical} fill="none" stroke="#38bdf8" strokeWidth="2.5" />
        {pathForecast && (
          <path d={pathForecast} fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeDasharray="6 4" />
        )}
        {coords.map((c, i) => (
          <circle
            key={`pt-${i}`}
            cx={c.x}
            cy={c.y}
            r={hoverIndex === i ? 5 : 2.5}
            fill={c.forecast ? "#a78bfa" : "#38bdf8"}
            stroke="#070d18"
            strokeWidth="1"
          />
        ))}
        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={paddingTop}
            y2={paddingTop + plotHeight}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
      </svg>
      {hovered && (
        <div
          className="d-inline-block rounded-3 px-3 py-2 mt-2"
          style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}
        >
          <div style={{ color: "#8492a6", fontSize: "0.75rem" }}>
            {hovered.label} {hovered.forecast ? "(Projected)" : "(Historical)"}
          </div>
          <div className="fw-bold text-white">${hovered.value.toFixed(2)}/tonne</div>
        </div>
      )}
      <div className="d-flex flex-wrap gap-4 mt-3 small" style={{ color: "#8492a6" }}>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 14,
              height: 3,
              backgroundColor: "#38bdf8",
              marginRight: 6,
              verticalAlign: "middle",
            }}
          />
          Historical Rate
        </span>
        {hasForecastSplit && (
          <span>
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 0,
                borderTop: "2px dashed #a78bfa",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />
            Projected Rate
          </span>
        )}
        <span style={{ color: "#64748b" }}>Hover the chart for day-by-day values.</span>
      </div>
    </div>
  );
};
// Simple inline spinner — no external library needed
const Spinner = ({ size = 40 }) => (
  <>
    <div
      style={{
        width: size,
        height: size,
        border: "3px solid #162234",
        borderTopColor: "#38bdf8",
        borderRadius: "50%",
        animation: "forecast-spin 0.8s linear infinite",
        margin: "0 auto",
      }}
    />
    <style>{`
      @keyframes forecast-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </>
);
// ---------------------------------------------------------------------------
// DASHBOARD SIDEBAR STYLES — self-contained, matching this page's dark navy
// theme (#070d18 / #0b1320 / #162234 / #38bdf8) so it drops in without a
// separate stylesheet.
// ---------------------------------------------------------------------------
const DashboardStyles = () => (
  <style>{`
    .dashboard-shell { position: relative; }
    /* Freight Market Snapshot styles */
    .route-snapshot { background-color: #071022; border: 1px solid #162234; padding: 18px; }
    .route-snapshot-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px; }
    .route-snapshot-heading .eyebrow { color:#94a3b8; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.06em; }
    .route-snapshot-heading h3 { margin:0; color:#e6eef6; font-size:1.05rem; font-weight:700; }
    .status-pill { font-weight:700; color:#0f172a; background:#c7f9ef; padding:6px 10px; border-radius:999px; font-size:0.78rem; display:inline-flex; align-items:center; gap:8px; }
    .status-pill.status-error { background:#fee2e2; color:#7f1d1d; }
    .status-pill.status-loading { background:#f1f5f9; color:#334155; }

    .route-snapshot-grid { display:grid; grid-template-columns: 1fr 340px; gap:18px; align-items:start; }
    .route-facts { color:#cbd5e1; display:flex; flex-direction:column; gap:14px; }
    .route-line { display:flex; align-items:center; gap:12px; background:#061222; border:1px solid #0f1724; padding:12px; border-radius:10px; }
    .route-dot { width:12px; height:12px; border-radius:50%; display:inline-block; flex-shrink:0; }
    .sage-dot { background:#34d399; }
    .coral-dot { background:#fb7185; }
    .route-line div { min-width:0; }
    .route-line small { display:block; color:#94a3b8; font-size:0.72rem; }
    .route-line strong { color:#e6eef6; display:block; font-size:0.9rem; }
    .route-vessel { margin-left:auto; color:#38bdf8; font-weight:700; }
    .route-kpis { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
    .route-kpis > div small { color:#94a3b8; display:block; font-size:0.72rem; }
    .route-kpis > div strong { color:#e6eef6; }
    .route-map-panel { border-radius:10px; overflow:hidden; border:1px solid #162234; height:220px; background:#061223; }
    /* Light-mode snapshot overrides */
    .route-snapshot.light { background-color: #ffffff; border: 1px solid #e6eef6; }
    .route-snapshot.light .route-snapshot-heading .eyebrow { color:#64748b; }
    .route-snapshot.light .route-snapshot-heading h3 { color:#0f172a; }
    .route-snapshot.light .route-facts { color:#475569; }
    .route-snapshot.light .route-line { background:#f8fafc; border-color:#e6eef6; }
    .route-snapshot.light .route-line small { color:#64748b; }
    .route-snapshot.light .route-line strong { color:#0f172a; }
    .route-snapshot.light .route-vessel { color:#0f4c81; }
    .route-snapshot.light .route-kpis > div small { color:#64748b; }
    .route-snapshot.light .route-kpis > div strong { color:#0f172a; }
    .route-snapshot.light .route-map-panel { background: #ffffff; border-color:#e6eef6; }
    .route-snapshot.light .status-pill { background:#ecfdf5; color:#064e3b; }
    @media (max-width: 991px) {
      .route-snapshot-grid { grid-template-columns: 1fr; }
      .route-map-panel { height:200px; }
    }
    .dashboard-sidebar {
      width: 264px;
      flex-shrink: 0;
      background-color: #0b1320;
      border-right: 1px solid #162234;
      display: flex;
      flex-direction: column;
      padding: 1.75rem 1.25rem;
      position: sticky;
      top: 0;
      align-self: flex-start;
      height: 100vh;
      overflow-y: auto;
      z-index: 40;
    }
    .dashboard-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
      color: #e2e8f0;
    }
    .dashboard-brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #1e88e5, #38bdf8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #070d18;
      flex-shrink: 0;
    }
    .dashboard-brand strong { display: block; font-size: 0.95rem; color: #fff; line-height: 1.2; }
    .dashboard-brand small { display: block; color: #64748b; font-size: 0.72rem; margin-top: 2px; }
    .dashboard-nav { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1.5rem; }
    .dashboard-nav-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.6rem 0.75rem;
      border-radius: 10px;
      color: #8492a6;
      text-decoration: none;
      font-size: 0.86rem;
      font-weight: 500;
      border: 1px solid transparent;
      transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    }
    .dashboard-nav-link:hover { color: #e2e8f0; background-color: #070d18; }
    .dashboard-nav-link.active {
      color: #38bdf8;
      background-color: rgba(56, 189, 248, 0.08);
      border-color: rgba(56, 189, 248, 0.25);
    }
    .sidebar-note {
      margin-top: auto;
      padding: 1rem;
      border-radius: 12px;
      background-color: #070d18;
      border: 1px solid #162234;
    }
    .sidebar-note strong { display: block; color: #fff; font-size: 0.85rem; margin-bottom: 0.35rem; }
    .sidebar-note p { color: #64748b; font-size: 0.78rem; margin-bottom: 0.75rem; line-height: 1.5; }
    .sidebar-note .btn {
      width: 100%;
      background-color: #1e88e5;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.5rem;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .sidebar-note .btn:disabled { opacity: 0.65; }
    .dashboard-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .dashboard-topbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.5rem;
      background-color: #0b1320;
      border-bottom: 1px solid #162234;
      position: sticky;
      top: 0;
      z-index: 30;
    }
    .sidebar-toggle {
      display: none;
      background: transparent;
      border: 1px solid #162234;
      color: #e2e8f0;
      border-radius: 8px;
      width: 36px;
      height: 36px;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      flex-shrink: 0;
    }
    .dashboard-back {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: transparent;
      border: 1px solid #162234;
      color: #8492a6;
      border-radius: 8px;
      padding: 0.4rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .dashboard-back:hover { color: #e2e8f0; border-color: #38bdf8; }
    .topbar-title { color: #e2e8f0; font-weight: 700; font-size: 0.92rem; white-space: nowrap; }
    .topbar-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #38bdf8;
      font-size: 0.82rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar-backdrop { display: none; }
    @media (max-width: 991px) {
      .dashboard-sidebar {
        position: fixed;
        left: 0;
        top: 0;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        box-shadow: 8px 0 24px rgba(0, 0, 0, 0.4);
      }
      .dashboard-shell.sidebar-open .dashboard-sidebar { transform: translateX(0); }
      .sidebar-toggle { display: inline-flex; }
      .dashboard-shell.sidebar-open .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(3, 7, 18, 0.6);
        z-index: 35;
      }
    }
  `}</style>
);
const ForecastResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const query = location.state || {};
  const {
    origin = "Australia",
    destination = "Paradip",
    vesselType = "Capesize",
    cargoType = "Coal",
    cargoQuantity = 100000,
    forecastPeriod = "Next 30 Days",
  } = query;
  // VESSEL METRICS LOOKUP
  const vesselSpecs = useMemo(() => {
    const found = vesselTypes.find(
      (v) => v.type.toLowerCase() === vesselType.toLowerCase()
    );
    return (
      found || {
        type: vesselType,
        maxDWT: 80000,
        maxLOA: 229,
        maxBeam: 32.2,
        maxDraft: 14.5,
      }
    );
  }, [vesselType]);
  const vesselImage = vesselImages[vesselSpecs.type] || vesselImages[vesselType];
  // PORT INFRASTRUCTURE COMPATIBILITY — for the selected vessel
  const portResults = useMemo(() => evaluatePortsForVessel(vesselSpecs), [vesselSpecs]);
  const compatiblePorts = portResults.filter((p) => p.status === "compatible");
  const restrictedPorts = portResults.filter((p) => p.status === "restricted");
  const specialPorts = portResults.filter((p) => p.status === "special");
  // ROUTE MAP LOOKUP — origin/destination coordinates for the route snapshot map
  const destinationPort = findPortByDestination(destination);
  const originCoordinates = ORIGIN_COORDINATES[origin];
  const destinationCoordinates = destinationPort ? PORT_COORDINATES[destinationPort.id] : null;
  // PORT COMPATIBILITY — for every vessel class, so we can explain each option
  const vesselComparison = useMemo(() => {
    return vesselTypes.map((v) => {
      const results = evaluatePortsForVessel(v);
      const compatible = results.filter((p) => p.status === "compatible");
      const restricted = results.filter((p) => p.status === "restricted");
      const special = results.filter((p) => p.status === "special");
      const standardCount = ports.length - special.length;
      let verdict;
      if (compatible.length === standardCount) {
        verdict = `Fully compatible with every standard East Coast berth evaluated — the most flexible option for this route.`;
      } else if (compatible.length === 0) {
        verdict = `Exceeds draft, beam, or length limits at every standard port — would need lightering, transshipment, or a deep-water anchorage solution.`;
      } else {
        verdict = `Compatible with ${compatible.length} of ${standardCount} standard ports; restricted at ${restricted
          .map((p) => p.name)
          .join(", ")}.`;
      }
      return {
        type: v.type,
        spec: v,
        compatible,
        restricted,
        special,
        standardCount,
        verdict,
        isSelected: v.type.toLowerCase() === vesselType.toLowerCase(),
      };
    });
  }, [vesselType]);
  // DISTANCE CALCULATION (origin country -> destination port)
  const distanceInfo = useMemo(() => {
    const originCoords = ORIGIN_COORDINATES[origin];
    const destinationPort = findPortByDestination(destination);
    const destCoords = destinationPort ? PORT_COORDINATES[destinationPort.id] : null;
    if (!originCoords || !destCoords) return null;
    const { km, nauticalMiles } = haversineDistance(
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng
    );
    return {
      km: Math.round(km),
      nauticalMiles: Math.round(nauticalMiles),
      originLabel: originCoords.label,
    };
  }, [origin, destination]);
  // MARKET / RATE ANALYSIS
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [analysisError, setAnalysisError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const fetchForecast = async () => {
      setLoadingAnalysis(true);
      setAnalysisError(null);
      try {
        const res = await fetch("https://multimodal-freight-container-delivery.onrender.com/api/forecast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin,
            destination,
            vesselType,
            cargoQuantity,
            forecastPeriod,
            compatiblePorts,
            restrictedPorts,
          }),
        });
        if (!res.ok) throw new Error(`Forecast request failed (${res.status})`);
        const data = await res.json();
        if (!cancelled) setAnalysis(data);
      } catch (err) {
        if (!cancelled) {
          setAnalysisError(
            err.message === "Failed to fetch"
              ? "Unable to reach the forecast service. Please check your connection and try again."
              : err.message || "Failed to generate forecast"
          );
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) setLoadingAnalysis(false);
      }
    };
    fetchForecast();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, vesselType, cargoQuantity, forecastPeriod, retryCount]);
  const handleRetry = () => setRetryCount((c) => c + 1);
  // Derived market-scenario metrics (rate volatility, transit time, risk gauge).
  // These are computed client-side from whatever the backend returns, so the
  // panel stays informative even if /api/forecast doesn't supply every field.
  const marketMetrics = useMemo(() => {
    const geom = analysis?.rateData ? buildChartGeometry(analysis.rateData) : null;
    const transitDays = distanceInfo ? distanceInfo.nauticalMiles / (13 * 24) : null; // ~13 knots laden bulk carrier
    const riskScoreMap = { low: 22, moderate: 50, medium: 50, high: 75, severe: 90, extreme: 96 };
    const riskKey = (analysis?.forecast?.riskLevel || "").toLowerCase();
    const riskScore = riskScoreMap[riskKey] ?? 50;
    const riskColor = riskScore < 35 ? "#34d399" : riskScore < 65 ? "#fbbf24" : "#f87171";
    const utilizationPct = ports.length > 0 ? (compatiblePorts.length / ports.length) * 100 : 0;
    return {
      volatility: geom?.stdDev ?? null,
      changePct: geom?.changePct ?? null,
      transitDays,
      riskScore,
      riskColor,
      utilizationPct,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis, distanceInfo, compatiblePorts.length]);
  // Snapshot-panel status pill + risk severity bucket — kept close to the
  // JSX that consumes them since they're purely presentational.
  const snapshotStatus = loadingAnalysis
    ? { label: "Fetching Market Data", cls: "status-loading" }
    : analysisError
    ? { label: "Forecast Unavailable", cls: "status-error" }
    : { label: "Forecast Live", cls: "status-live" };
  const riskLevel = analysis?.forecast?.riskLevel;
  const riskSeverity = (() => {
    const level = (riskLevel || "").toLowerCase();
    if (level === "low") return "risk-low";
    if (level === "moderate" || level === "medium") return "risk-medium";
    if (["high", "severe", "extreme"].includes(level)) return "risk-high";
    return "";
  })();
  const specMetrics = [
    { icon: "🚢", title: "Deadweight", value: `${vesselSpecs.maxDWT.toLocaleString()} DWT` },
    { icon: "📏", title: "Maximum LOA", value: `${vesselSpecs.maxLOA} m` },
    { icon: "↔️", title: "Maximum Beam", value: `${vesselSpecs.maxBeam} m` },
    { icon: "⚓", title: "Maximum Draft", value: `${vesselSpecs.maxDraft} m` },
  ];
  // Detailed chartering recommendation — synthesized client-side from
  // deadweight utilization, market trend, port restrictions, and vessel
  // comparison, so the recommendation stays rich even when the backend's
  // charterRecommendation text is short or unavailable.
  const chartingDetails = useMemo(() => {
    const utilizationPct =
      vesselSpecs.maxDWT > 0 ? (Number(cargoQuantity) / vesselSpecs.maxDWT) * 100 : null;
    let utilizationNote = "Deadweight utilization could not be determined for this scenario.";
    if (utilizationPct !== null) {
      if (utilizationPct > 95) {
        utilizationNote = `This cargo uses ${utilizationPct.toFixed(
          0
        )}% of the vessel's rated deadweight — confirm stowage factor and cargo density before fixing, since there's little spare capacity.`;
      } else if (utilizationPct < 50) {
        utilizationNote = `This cargo uses only ${utilizationPct.toFixed(
          0
        )}% of the vessel's rated deadweight — a smaller class (see comparison below) could carry it at a lower freight cost.`;
      } else {
        utilizationNote = `This cargo uses ${utilizationPct.toFixed(
          0
        )}% of the vessel's rated deadweight, a normal loading range for this class.`;
      }
    }
    const trend = (analysis?.forecast?.marketTrend || "").toLowerCase();
    let timingNote;
    let marketTimingRating;
    if (trend.includes("rising") || trend.includes("up") || trend.includes("bull")) {
      timingNote =
        "Rates appear to be trending upward — fixing sooner rather than later may lock in a more favorable rate before further increases.";
      marketTimingRating = "Act soon";
    } else if (trend.includes("falling") || trend.includes("down") || trend.includes("soft") || trend.includes("bear")) {
      timingNote =
        "Rates appear to be softening — there may be an advantage to a flexible laycan or waiting before fixing.";
      marketTimingRating = "Can wait";
    } else {
      timingNote =
        "The rate trend looks broadly stable — port access and vessel fit matter more than timing for this scenario.";
      marketTimingRating = "Neutral";
    }
    const betterAlt = vesselComparison.find(
      (v) => !v.isSelected && v.compatible.length > compatiblePorts.length
    );
    const standardPortCount = ports.length - specialPorts.length;
    const vesselFitRating =
      compatiblePorts.length === standardPortCount ? "Good" : compatiblePorts.length === 0 ? "Poor" : "Fair";
    const actionItems = [
      `Confirm draft and berth clearance directly with ${
        compatiblePorts.length > 0
          ? compatiblePorts.map((p) => p.name).slice(0, 3).join(", ")
          : "the shortlisted terminal"
      } before nominating.`,
      utilizationNote,
      timingNote,
    ];
    if (restrictedPorts.length > 0) {
      actionItems.push(
        `${restrictedPorts.length} port${restrictedPorts.length === 1 ? "" : "s"} on this route (${restrictedPorts
          .map((p) => p.name)
          .join(", ")}) will need lightering, a smaller parcel size, or an alternate berth for this vessel class.`
      );
    }
    if (betterAlt) {
      actionItems.push(
        `${betterAlt.type} reaches ${betterAlt.compatible.length} of ${betterAlt.standardCount} ports on this lane, versus ${compatiblePorts.length} for ${vesselType} — worth a freight-rate comparison if scheduling allows.`
      );
    }
    if (analysis?.forecast?.riskLevel) {
      actionItems.push(
        `Market risk is assessed as ${analysis.forecast.riskLevel} — build appropriate laycan and demurrage buffers into the charter party.`
      );
    }
    return {
      utilizationPct,
      utilizationNote,
      timingNote,
      betterAlt,
      vesselFitRating,
      marketTimingRating,
      riskRating: analysis?.forecast?.riskLevel || "Unknown",
      actionItems,
    };
  }, [vesselSpecs, cargoQuantity, analysis, vesselComparison, compatiblePorts, restrictedPorts, specialPorts, vesselType]);

  const [generatingReport, setGeneratingReport] = useState(false);
  const [largeMapOpen, setLargeMapOpen] = useState(false);
  const { theme } = useTheme();
  const imageToBase64 = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };
  // Inner content only (no <html>/<head>) — this gets injected into an
  // offscreen div and captured with html2canvas, so a light theme is used
  // for print/PDF legibility regardless of the app's dark UI.
  const buildReportContentHTML = (imageDataUrl, chartSvgMarkup) => {
  const generatedAt = new Date().toLocaleString();
  const marketSection = analysis
    ? `
    <div class="card">
      <h2>Market Analysis</h2>
      <div class="grid">
        <div><div class="metric-label">Market Trend</div><div class="metric-value" style="font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;">${analysis.forecast?.marketTrend ?? "N/A"}</div></div>
        <div><div class="metric-label">Risk Level</div><div class="metric-value" style="font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;">${analysis.forecast?.riskLevel ?? "N/A"}</div></div>
        <div><div class="metric-label">Est. Transit</div><div class="metric-value">${
          marketMetrics.transitDays ? `${marketMetrics.transitDays.toFixed(1)} days` : "N/A"
        }</div></div>
      </div>
      ${analysis.forecast?.reasoning ? `<p style="margin-top:16px;color:#475569;line-height:1.6;">${analysis.forecast.reasoning}</p>` : ""}
      ${
        analysis.forecast?.keyFactors?.length
          ? `<div style="margin-top:14px;"><div class="metric-label" style="margin-bottom:6px;">Key Market Drivers</div><ul style="color:#475569;margin:0 0 0 18px;padding:0;">${analysis.forecast.keyFactors
              .map((f) => `<li style="margin-bottom:3px;">${f}</li>`)
              .join("")}</ul></div>`
          : ""
      }
    </div>`
    : "";
  const chartingSection = `
    <div class="card">
      <h2>Chartering Recommendation</h2>
      <p style="color:#475569;line-height:1.6;">${chartingDetails.utilizationNote}</p>
      <p style="color:#475569;line-height:1.6;">${chartingDetails.timingNote}</p>
      <div class="grid" style="margin-top:14px;">
        <div><div class="metric-label">Vessel Fit</div><div class="metric-value" style="font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;">${chartingDetails.vesselFitRating}</div></div>
        <div><div class="metric-label">Market Timing</div><div class="metric-value" style="font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;">${chartingDetails.marketTimingRating}</div></div>
        <div><div class="metric-label">Risk Level</div><div class="metric-value" style="font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;">${chartingDetails.riskRating}</div></div>
      </div>
      <div style="margin-top:14px;"><div class="metric-label" style="margin-bottom:6px;">Action Items</div><ul style="color:#475569;margin:0 0 0 18px;padding:0;">${chartingDetails.actionItems
        .map((a) => `<li style="margin-bottom:4px;">${a}</li>`)
        .join("")}</ul></div>
    </div>`;
  return `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
    .container { max-width: 820px; margin: 0 auto; background: #ffffff; color: #1e293b; font-family: 'Inter', 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.55; padding: 40px 44px 32px; }
    .container h1, .container h2, .container h3 { font-family: 'Manrope', 'Segoe UI', sans-serif; color: #0f172a; margin: 0; }
    .container h1 { font-weight: 800; font-size: 1.9rem; letter-spacing: -0.02em; }
    .container h2 { font-weight: 700; font-size: 1rem; letter-spacing: -0.01em; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 1.5px solid #e2e8f0; }
    .container .report-header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 22px; }
    .container .report-header .eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin-bottom: 6px; }
    .container .report-header .generated-at { font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: #94a3b8; text-align: right; white-space: nowrap; }
    .container .badge-row { margin-bottom: 20px; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .container .badge { display: inline-flex; align-items: center; padding: 5px 13px; border-radius: 999px; background: #f1f5f9; border: 1px solid #e2e8f0; color: #334155; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.02em; text-transform: uppercase; font-family: 'Inter', sans-serif; }
    .container .badge.route-arrow { background: transparent; border: none; padding: 0 2px; color: #94a3b8; font-weight: 400; text-transform: none; }
    .container .badge.accent { background: #0f4c81; border-color: #0f4c81; color: #fff; }
    .container .badge.subtle { background: #ffffff; }
    .container .card { background: #fbfcfd; border: 1px solid #e7ebf0; border-radius: 12px; padding: 24px 26px; margin-bottom: 16px; page-break-inside: avoid; box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03); }
    .container .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 20px 24px; }
    .container .metric-label { color: #94a3b8; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
    .container .metric-value { font-family: 'IBM Plex Mono', monospace; color: #0f172a; font-weight: 600; font-size: 1.18rem; margin-top: 6px; letter-spacing: -0.01em; }
    .container table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.82rem; }
    .container th { text-align: left; padding: 9px 12px; color: #64748b; font-family: 'Inter', sans-serif; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; font-weight: 600; border-bottom: 1.5px solid #cbd5e1; }
    .container td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #eef2f6; color: #334155; }
    .container tbody tr:nth-child(even) { background: #f8fafc; }
    .container img.vessel { max-width: 220px; display: block; margin: 0 auto 18px; border-radius: 8px; }
    .container .footer { color: #94a3b8; font-size: 0.7rem; margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-style: italic; }
  </style>
  <div class="container">
    <div class="report-header">
      <div>
        <div class="eyebrow">Charter Planning Report</div>
        <h1>Freight &amp; Vessel Decision Intelligence</h1>
      </div>
      <div class="generated-at">Generated<br/>${generatedAt}</div>
    </div>
    <div class="badge-row">
      <span class="badge">${origin}</span>
      <span class="badge route-arrow">&#8594;</span>
      <span class="badge">${destination}</span>
      <span class="badge accent">${vesselType}</span>
      ${distanceInfo ? `<span class="badge subtle">~${distanceInfo.nauticalMiles.toLocaleString()} nm</span>` : ""}
    </div>
    <div class="card">
      ${imageDataUrl ? `<img class="vessel" src="${imageDataUrl}" alt="${vesselType}" />` : ""}
      <h2>${vesselType} Charter Analysis</h2>
      <div class="grid">
        <div><div class="metric-label">Cargo</div><div class="metric-value">${Number(cargoQuantity).toLocaleString()} MT</div></div>
        <div><div class="metric-label">Cargo Type</div><div class="metric-value" style="font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;">${cargoType}</div></div>
        <div><div class="metric-label">Forecast Period</div><div class="metric-value" style="font-family:'Inter',sans-serif;font-weight:600;font-size:1rem;">${forecastPeriod}</div></div>
        <div><div class="metric-label">Approx Distance</div><div class="metric-value">${distanceInfo ? `${distanceInfo.km.toLocaleString()} km` : "N/A"}</div></div>
        <div><div class="metric-label">Compatible Ports</div><div class="metric-value">${compatiblePorts.length} / ${ports.length}</div></div>
      </div>
    </div>
    <div class="card">
      <h2>Vessel Specifications</h2>
      <div class="grid">
        ${specMetrics.map((m) => `<div><div class="metric-label">${m.title}</div><div class="metric-value">${m.value}</div></div>`).join("")}
      </div>
    </div>
    ${marketSection}
    ${chartSvgMarkup ? `<div class="card"><h2>Historical &amp; Projected Rates</h2>${chartSvgMarkup}</div>` : ""}
    ${chartingSection}
    <div class="card">
      <h2>Compatible Ports (${compatiblePorts.length})</h2>
      <table>
        <thead><tr><th>Port</th><th>State</th><th>Draft</th><th>LOA</th><th>Beam</th><th>Berths</th></tr></thead>
        <tbody>
          ${compatiblePorts
            .map(
              (p) =>
                `<tr><td style="font-weight:600;color:#0f172a;">${p.name}</td><td>${p.state ?? ""}</td><td>${p.maxDraft ?? "N/A"} m</td><td>${p.maxLOA ?? "N/A"} m</td><td>${p.maxBeam ?? "N/A"} m</td><td>${p.berths ?? "N/A"}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    ${
      restrictedPorts.length
        ? `<div class="card">
      <h2>Ports Requiring Attention (${restrictedPorts.length})</h2>
      ${restrictedPorts
        .map(
          (p) =>
            `<div style="margin-bottom:14px;"><div style="font-weight:700;color:#0f172a;font-family:'Manrope',sans-serif;">${p.name} <span style="font-weight:500;color:#94a3b8;font-family:'Inter',sans-serif;">— ${p.state ?? ""}</span></div><ul style="color:#475569;margin:6px 0 0 18px;padding:0;">${p.restrictions
              .map((r) => `<li style="margin-bottom:3px;">${r}</li>`)
              .join("")}</ul></div>`
        )
        .join("")}
    </div>`
        : ""
    }
    <div class="card">
      <h2>Vessel Class Comparison</h2>
      <table>
        <thead><tr><th>Vessel</th><th>Compatible Ports</th><th>Assessment</th></tr></thead>
        <tbody>
          ${vesselComparison
            .map(
              (v) =>
                `<tr><td style="font-weight:600;color:#0f172a;">${v.type}${v.isSelected ? ` <span style="color:#0f4c81;font-weight:700;">(Selected)</span>` : ""}</td><td>${v.compatible.length} / ${v.standardCount}</td><td>${v.verdict}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <div class="footer">Generated by the Freight &amp; Vessel Decision Intelligence tool. For planning purposes only — verify against live market data before making chartering decisions.</div>
  </div>`;
};
  const handleDownloadReport = async () => {
    setGeneratingReport(true);
    let holder = null;
    try {
      const imageDataUrl = vesselImage ? await imageToBase64(vesselImage) : null;
      const chartGeom = analysis?.rateData
        ? buildChartGeometry(analysis.rateData, { width: 720, height: 280 })
        : null;
      const chartSvgMarkup = chartGeom ? renderStaticChartSVG(chartGeom) : "";
      const contentHTML = buildReportContentHTML(imageDataUrl, chartSvgMarkup);
      holder = document.createElement("div");
      holder.style.position = "fixed";
      holder.style.top = "0";
      holder.style.left = "-10000px";
      holder.style.width = "800px";
      holder.style.backgroundColor = "#ffffff";
      holder.innerHTML = contentHTML;
      document.body.appendChild(holder);
      // Give images/fonts a beat to settle before capture.
      await new Promise((resolve) => setTimeout(resolve, 60));
      const canvas = await html2canvas(holder, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL("image/png");
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`Freight_Forecast_${origin}_${destination}_${vesselType}`.replace(/\s+/g, "_") + ".pdf");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("PDF report generation failed:", err);
      // eslint-disable-next-line no-alert
      alert("Couldn't generate the PDF report — check the browser console for details.");
    } finally {
      if (holder) document.body.removeChild(holder);
      setGeneratingReport(false);
    }
  };
  return (
    <>
      <DashboardStyles />
      <main
        className={`min-vh-100 d-flex text-white dashboard-shell ${sidebarOpen ? "sidebar-open" : ""}`}
        style={{
          backgroundColor: "var(--bg-primary)",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}
      >
        <aside className="dashboard-sidebar">
          <nav className="dashboard-nav" aria-label="Dashboard navigation">
            <a className="dashboard-nav-link active" href="#overview">⌂ <span>Overview</span></a>
            <a className="dashboard-nav-link" href="#market-analysis">▦ <span>Market Snapshot</span></a>
            <a className="dashboard-nav-link" href="#rate-trend">⌁ <span>Rate Trend</span></a>
            <a className="dashboard-nav-link" href="#vessel-profile">▣ <span>Vessel Profile</span></a>
            <a className="dashboard-nav-link" href="#vessel-comparison">⇄ <span>Vessel Comparison</span></a>
            <a className="dashboard-nav-link" href="#port-analysis">◇ <span>Ports</span></a>
            <a className="dashboard-nav-link" href="#recommendation">! <span>Recommendation</span></a>
          </nav>
          <div className="sidebar-note"><strong>AI Co-Pilot</strong><p>Ask anything about routes, markets or vessels.</p><Link className="btn" to="/ai-chat" state={{ analysis, marketMetrics, origin, destination, vesselType, compatiblePorts }}>{'✦ Ask AI'}</Link></div>
        </aside>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
        <div className="dashboard-content">
          <header className="dashboard-topbar">
            <button
              className="sidebar-toggle"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setSidebarOpen((open) => !open)}
            >
              ☰
            </button>
          </header>
          <Navbar />
      {/* HERO SECTION */}
      <section id="overview" className="py-5">
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <h1 className="display-4 fw-bold text-white">
                Freight & Vessel
                <br />
                <span style={{ color: "#38bdf8" }}>Decision Intelligence</span>
              </h1>
              <p className="lead mt-3" style={{ color: "#8492a6" }}>
                AI-assisted analysis of freight conditions, vessel suitability,
                and East Coast port infrastructure for your charter scenario.
              </p>
              <div className="d-flex flex-wrap align-items-center gap-2 mt-4">
                <span
                  className="forecast-route-badge badge rounded-pill px-3 py-2 fs-6 fw-normal"
                  style={{ backgroundColor: "#0b1320", color: "#e2e8f0", border: "1px solid #162234" }}
                >
                  {origin}
                </span>
                <span className="fw-bold" style={{ color: "#38bdf8" }}>
                  →
                </span>
                <span
                  className="forecast-route-badge badge rounded-pill px-3 py-2 fs-6 fw-normal"
                  style={{ backgroundColor: "#0b1320", color: "#e2e8f0", border: "1px solid #162234" }}
                >
                  {destination}
                </span>
                <span
                  className="badge rounded-pill px-3 py-2 fs-6 fw-semibold"
                  style={{ backgroundColor: "#1e88e5", color: "#ffffff" }}
                >
                  {vesselType}
                </span>
                {distanceInfo && (
                  <span
                    className="forecast-route-badge badge rounded-pill px-3 py-2 fs-6 fw-normal"
                    style={{ backgroundColor: "#0b1320", color: "#38bdf8", border: "1px solid #162234" }}
                  >
                    ~{distanceInfo.nauticalMiles.toLocaleString()} nm
                  </span>
                )}
              </div>
              <button
                className="btn fw-semibold px-4 py-2 rounded-3 text-white mt-4 d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: "#0f766e", border: "1px solid #14b8a6" }}
                onClick={handleDownloadReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "forecast-spin 0.8s linear infinite",
                      }}
                    />
                    Preparing report…
                  </>
                ) : (
                  <>⬇ Download Full Report (PDF)</>
                )}
              </button>
            </div>
            {/* SUMMARY CARD */}
            <div className="col-lg-5">
              <div
                className="card border-0 shadow-lg rounded-4 p-2"
                style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}
              >
                <div className="card-body p-4 p-md-5">
                  <small
                    className="text-uppercase fw-bold tracking-wider"
                    style={{ color: "#64748b", fontSize: "0.75rem" }}
                  >
                    FORECAST SCENARIO
                  </small>
                  <h4 className="fw-bold mt-2 mb-4 text-white">{vesselType} Charter Analysis</h4>
                  {vesselImage && (
                    <div
                      className="results-vessel-image rounded-3 mb-4 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: "#070d18", border: "1px solid #162234", padding: "1rem" }}
                    >
                      <img
                        src={vesselImage}
                        alt={vesselType}
                        style={{ width: "100%", height: "120px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between pb-3" style={{ borderBottom: "1px solid #162234" }}>
                      <span style={{ color: "#8492a6" }}>Cargo</span>
                      <strong className="text-white">
                        {Number(cargoQuantity).toLocaleString()} MT ({cargoType})
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between pb-3" style={{ borderBottom: "1px solid #162234" }}>
                      <span style={{ color: "#8492a6" }}>Forecast</span>
                      <strong className="text-white">{forecastPeriod}</strong>
                    </div>
                    <div className="d-flex justify-content-between pb-3" style={{ borderBottom: "1px solid #162234" }}>
                      <span style={{ color: "#8492a6" }}>Vessel</span>
                      <strong className="text-white">{vesselType}</strong>
                    </div>
                    <div className="d-flex justify-content-between pb-3" style={{ borderBottom: "1px solid #162234" }}>
                      <span style={{ color: "#8492a6" }}>Approx. Distance</span>
                      <strong className="text-white">
                        {distanceInfo
                          ? `${distanceInfo.km.toLocaleString()} km / ${distanceInfo.nauticalMiles.toLocaleString()} nm`
                          : "N/A"}
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: "#8492a6" }}>Compatible Ports</span>
                      <strong className="fs-4 fw-bold" style={{ color: "#38bdf8" }}>
                        {compatiblePorts.length} / {ports.length}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Large map modal (opened by clicking the minimap) */}
      {largeMapOpen && (
        <div
          className="map-modal-backdrop"
          onClick={() => setLargeMapOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(3,7,18,0.72)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            className="map-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "92%", maxWidth: 1100, height: "84%", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(2,6,23,0.7)" }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", padding: 10, background: "#071022", borderBottom: "1px solid #162234" }}>
              <button
                type="button"
                onClick={() => setLargeMapOpen(false)}
                style={{ background: "#0b1320", color: "#e2e8f0", border: "1px solid #162234", padding: "6px 10px", borderRadius: 8 }}
              >
                Close
              </button>
            </div>
            <div style={{ height: "calc(100% - 46px)", background: "#071022" }}>
              <RouteMap
                origin={origin}
                destination={destination}
                originLabel={originCoordinates?.label}
                originCoordinates={originCoordinates}
                destinationCoordinates={destinationCoordinates}
              />
            </div>
          </div>
        </div>
      )}

      <section className="route-snapshot-section py-4">
        <div className="container">
          <div className={`route-snapshot card border-0 rounded-4 p-3 ${theme === "light" ? "light" : ""}`}>
            <div className="route-snapshot-heading">
              <div>
                <small className="eyebrow">FREIGHT MARKET SNAPSHOT</small>
                <h3>
                  {origin} <span style={{ color: "#38bdf8", margin: "0 8px" }}>→</span> {destination}
                </h3>
              </div>
              <span className={`status-pill ${snapshotStatus.cls === "status-error" ? "status-error" : snapshotStatus.cls === "status-loading" ? "status-loading" : ""}`}>
                {snapshotStatus.label}
              </span>
            </div>

            <div className="route-snapshot-grid">
              <div className="route-facts">
                <div className="route-line">
                  <span className="route-dot sage-dot" />
                  <div>
                    <small>Loading Port</small>
                    <strong>{originCoordinates?.label || origin}</strong>
                  </div>
                  <div className="route-vessel">▣ {vesselType}</div>
                  <div className="route-arrow">→</div>
                  <span className="route-dot coral-dot" />
                  <div>
                    <small>Discharge Port</small>
                    <strong>{destination}</strong>
                  </div>
                </div>

                <div className="route-kpis">
                  <div>
                    <small>Vessel Type</small>
                    <strong>{vesselType}</strong>
                  </div>
                  <div>
                    <small>Cargo</small>
                    <strong>{Number(cargoQuantity).toLocaleString()} MT</strong>
                  </div>
                  <div>
                    <small>Laycan Window</small>
                    <strong>{forecastPeriod}</strong>
                  </div>
                  <div>
                    <small>Risk Level</small>
                    <strong>{analysis?.forecast?.riskLevel || "Pending"}</strong>
                  </div>
                </div>
              </div>

              <div className="route-map-panel">
                <Minimap
                  originCoordinates={originCoordinates}
                  destinationCoordinates={destinationCoordinates}
                  originLabel={originCoordinates?.label}
                  destinationLabel={destination}
                  onOpenLargeMap={() => setLargeMapOpen(true)}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARKET SCENARIO */}
      <section
        id="market-analysis"
        className="py-5"
        style={{ backgroundColor: "#0b1320", borderTop: "1px solid #162234", borderBottom: "1px solid #162234" }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
              MARKET ANALYSIS ENGINE
            </small>
            <h2 className="fw-bold mt-2 text-white">Current Market Scenario</h2>
            <p style={{ color: "#8492a6" }}>
              AI-generated freight market assessment and rate projections for the selected trade lane.
            </p>
          </div>
          {loadingAnalysis && (
            <div className="text-center py-5">
              <Spinner size={44} />
              <div className="mt-3" style={{ color: "#8492a6" }}>
                Generating forecast…
              </div>
            </div>
          )}
          {analysisError && !loadingAnalysis && (
            <div className="row justify-content-center">
              <div className="col-md-8 col-lg-6">
                <div
                  className="card border-0 rounded-4 text-center p-2"
                  style={{ backgroundColor: "#070d18", border: "1px solid #3f1d1d" }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div className="fs-1 mb-3">⚠️</div>
                    <h5 className="fw-bold text-white mb-2">Forecast Unavailable</h5>
                    <p className="mb-4" style={{ color: "#8492a6" }}>
                      {analysisError}
                    </p>
                    <button
                      className="btn fw-semibold px-4 py-2 rounded-3 text-white"
                      style={{ backgroundColor: "#1e88e5" }}
                      onClick={handleRetry}
                    >
                      ↻ Retry Forecast
                    </button>
                    <p className="small mt-3 mb-0" style={{ color: "#64748b" }}>
                      Port compatibility and vessel specs below are still available offline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {analysis && !loadingAnalysis && !analysisError && (
            <>
              {/* Core metric cards */}
              <div className="row g-4">
                <div className="col-md-3 col-6">
                  <div className="card border-0 rounded-4 h-100 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">📈</div>
                      <small style={{ color: "#8492a6" }}>Market Trend</small>
                      <h4 className="fw-bold mt-2 text-white">{analysis.forecast?.marketTrend ?? "N/A"}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="card border-0 rounded-4 h-100 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">⚠️</div>
                      <small style={{ color: "#8492a6" }}>Market Risk</small>
                      <h4 className="fw-bold mt-2 text-white">{analysis.forecast?.riskLevel ?? "N/A"}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-6">
                  <div className="card border-0 rounded-4 h-100 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">🕒</div>
                      <small style={{ color: "#8492a6" }}>Est. Transit Time</small>
                      <h4 className="fw-bold mt-2 text-white">
                        {marketMetrics.transitDays ? `${marketMetrics.transitDays.toFixed(1)} days` : "N/A"}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
              {/* Risk gauge + supply/demand snapshot */}
              <div className="row g-4 mt-1">
                <div className="col-lg-6">
                  <div className="card border-0 rounded-4 h-100 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                    <div className="card-body p-4">
                      <small className="text-uppercase fw-bold" style={{ color: "#64748b", fontSize: "0.72rem" }}>
                        RISK GAUGE
                      </small>
                      <div className="d-flex justify-content-between align-items-baseline mt-1">
                        <h5 className="fw-bold text-white mb-0">{analysis.forecast?.riskLevel ?? "Moderate"}</h5>
                        <span style={{ color: marketMetrics.riskColor }} className="fw-bold">
                          {marketMetrics.riskScore}/100
                        </span>
                      </div>
                      <div
                        className="mt-2 rounded-pill overflow-hidden"
                        style={{ height: 10, backgroundColor: "#162234" }}
                      >
                        <div
                          style={{
                            width: `${marketMetrics.riskScore}%`,
                            height: "100%",
                            backgroundColor: marketMetrics.riskColor,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <p className="small mt-3 mb-0" style={{ color: "#8492a6" }}>
                        {marketMetrics.volatility !== null
                          ? `Recent rate volatility of ±$${marketMetrics.volatility.toFixed(2)}/tonne and a ${
                              marketMetrics.changePct >= 0 ? "rise" : "decline"
                            } of ${Math.abs(marketMetrics.changePct).toFixed(1)}% over the shown period factor into this risk read.`
                          : "Risk read is based on the market trend and risk level reported by the forecast engine."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card border-0 rounded-4 h-100 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                    <div className="card-body p-4">
                      <small className="text-uppercase fw-bold" style={{ color: "#64748b", fontSize: "0.72rem" }}>
                        PORT SUPPLY SNAPSHOT
                      </small>
                      <div className="d-flex justify-content-between align-items-baseline mt-1">
                        <h5 className="fw-bold text-white mb-0">Berth availability</h5>
                        <span style={{ color: "#38bdf8" }} className="fw-bold">
                          {marketMetrics.utilizationPct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-2 rounded-pill overflow-hidden" style={{ height: 10, backgroundColor: "#162234" }}>
                        <div
                          style={{
                            width: `${marketMetrics.utilizationPct}%`,
                            height: "100%",
                            backgroundColor: "#38bdf8",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                      <p className="small mt-3 mb-0" style={{ color: "#8492a6" }}>
                        {compatiblePorts.length} of {ports.length} East Coast berths evaluated can currently accept a{" "}
                        {vesselType.toLowerCase()} of this size, giving you {compatiblePorts.length > 1 ? "multiple" : compatiblePorts.length === 1 ? "one" : "no"} routing option
                        {compatiblePorts.length === 1 ? "" : "s"} without lightering.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card border-0 rounded-4 mt-4 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                <div className="card-body p-4 p-md-5">
                  <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
                    ANALYTICAL SUMMARY
                  </small>
                  <h4 className="fw-bold mt-2 text-white">Market Assessment Summary</h4>
                  <p className="mt-3 mb-0" style={{ color: "#8492a6", lineHeight: "1.7" }}>
                    {analysis.forecast?.reasoning}
                  </p>
                  {analysis.forecast?.keyFactors?.length > 0 && (
                    <>
                      <small className="text-uppercase fw-bold d-block mt-4" style={{ color: "#64748b", fontSize: "0.7rem" }}>
                        KEY MARKET DRIVERS
                      </small>
                      <ul className="mt-2" style={{ color: "#8492a6" }}>
                        {analysis.forecast.keyFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {analysis.forecast?.charterRecommendation && (
                    <>
                      <small className="text-uppercase fw-bold d-block mt-4" style={{ color: "#64748b", fontSize: "0.7rem" }}>
                        CHARTERING RECOMMENDATION
                      </small>
                      <p className="mt-2 mb-0" style={{ color: "#8492a6", lineHeight: "1.7" }}>
                        {analysis.forecast.charterRecommendation}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      {/* FREIGHT RATE TREND CHART */}
      {analysis?.rateData?.length > 0 && !loadingAnalysis && !analysisError && (
        <section id="rate-trend" className="py-5">
          <div className="container py-4">
            <div className="text-center mb-4">
              <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
                FREIGHT RATE TREND
              </small>
              <h2 className="fw-bold mt-2 text-white">Historical & Projected Rates</h2>
              <p style={{ color: "#8492a6" }}>
                Solid line marks recorded rates; dashed line marks the AI-projected path. Hover any point for detail.
              </p>
            </div>
            <div className="card border-0 rounded-4 p-3" style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}>
              <div className="card-body p-4">
                <EnhancedRateChart data={analysis.rateData} />
              </div>
            </div>
          </div>
        </section>
      )}
      {/* VESSEL PROFILE */}
      <section id="vessel-profile" className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
              VESSEL PROFILE
            </small>
            <h2 className="fw-bold mt-2 text-white">Selected Vessel Specifications</h2>
            <p style={{ color: "#8492a6" }}>Parameters evaluated against port draft and berth limits.</p>
          </div>
          <div className="row g-4 align-items-stretch">
            {vesselImage && (
              <div className="col-lg-4">
                <div
                  className="card border-0 rounded-4 h-100 p-2 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}
                >
                  <div className="card-body p-4 text-center">
                    <img
                      src={vesselImage}
                      alt={vesselType}
                      style={{ width: "100%", height: "160px", objectFit: "contain", marginBottom: "0.75rem" }}
                    />
                    <h5 className="fw-bold text-white mb-0">{vesselType}</h5>
                  </div>
                </div>
              </div>
            )}
            <div className={vesselImage ? "col-lg-8" : "col-12"}>
              <div className="row g-4 h-100">
                {specMetrics.map((metric) => (
                  <div className="col-6" key={metric.title}>
                    <div
                      className="card border-0 rounded-4 h-100 p-2 text-center"
                      style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}
                    >
                      <div className="card-body p-4">
                        <div className="fs-1 mb-2">{metric.icon}</div>
                        <small style={{ color: "#8492a6" }}>{metric.title}</small>
                        <h5 className="fw-bold mt-2 text-white">{metric.value}</h5>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* VESSEL CLASS COMPARISON — explanations for every option, not just the selected one */}
      <section
        id="vessel-comparison"
        className="py-5"
        style={{ backgroundColor: "#0b1320", borderTop: "1px solid #162234", borderBottom: "1px solid #162234" }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
              VESSEL CLASS COMPARISON
            </small>
            <h2 className="fw-bold mt-2 text-white">How Every Vessel Class Fits This Route</h2>
            <p style={{ color: "#8492a6" }}>
              The same port-compatibility check run against each vessel class, so you can see the trade-offs of choosing differently.
            </p>
          </div>
          <div className="row g-4">
            {vesselComparison.map((v) => {
              const img = vesselImages[v.type];
              return (
                <div className="col-md-6 col-lg-3" key={v.type}>
                  <div
                    className="card border-0 rounded-4 h-100 p-2"
                    style={{
                      backgroundColor: "#070d18",
                      border: v.isSelected ? "2px solid #38bdf8" : "1px solid #162234",
                      boxShadow: v.isSelected ? "0 0 0 3px rgba(56,189,248,0.15)" : "none",
                    }}
                  >
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold text-white mb-0">{v.type}</h5>
                        {v.isSelected && (
                          <span
                            className="badge rounded-pill px-2 py-1 fw-semibold"
                            style={{ backgroundColor: "#1e88e5", color: "#fff", fontSize: "0.65rem" }}
                          >
                            SELECTED
                          </span>
                        )}
                      </div>
                      {img && (
                        <div
                          className="comparison-vessel-image rounded-3 mb-3 d-flex align-items-center justify-content-center"
                          style={{ backgroundColor: "#0b1320", border: "1px solid #162234", padding: "0.75rem" }}
                        >
                          <img src={img} alt={v.type} style={{ width: "100%", height: "70px", objectFit: "contain" }} />
                        </div>
                      )}
                      <div className="small mb-3" style={{ color: "#8492a6" }}>
                        <div className="d-flex justify-content-between">
                          <span>DWT</span>
                          <strong className="text-white">{v.spec.maxDWT.toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>LOA</span>
                          <strong className="text-white">{v.spec.maxLOA} m</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Draft</span>
                          <strong className="text-white">{v.spec.maxDraft} m</strong>
                        </div>
                      </div>
                      <div
                        className="compatibility-label fw-bold mb-2"
                        style={{ color: v.compatible.length === v.standardCount ? "#34d399" : v.compatible.length === 0 ? "#f87171" : "#fbbf24" }}
                      >
                        {v.compatible.length} / {v.standardCount} ports compatible
                      </div>
                      <p className="small mb-0" style={{ color: "#8492a6", lineHeight: 1.6 }}>
                        {v.verdict}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* PORT INFRASTRUCTURE ANALYSIS */}
      <section id="port-analysis" className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
              PORT INFRASTRUCTURE ANALYSIS
            </small>
            <h2 className="fw-bold mt-2 text-white">Port Operation Compatibility</h2>
          </div>
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="recommendation-card card border-0 rounded-4 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">✅</div>
                  <small style={{ color: "#8492a6" }}>Compatible</small>
                  <h2 className="fw-bold mt-1 text-success">{compatiblePorts.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">⚠️</div>
                  <small style={{ color: "#8492a6" }}>Restricted</small>
                  <h2 className="fw-bold mt-1 text-danger">{restrictedPorts.length}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 rounded-4 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">⚓</div>
                  <small style={{ color: "#8492a6" }}>Special Operations</small>
                  <h2 className="fw-bold mt-1 text-warning">{specialPorts.length}</h2>
                </div>
              </div>
            </div>
          </div>
          {compatiblePorts.length > 0 && (
            <div className="mb-5">
              <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
                RECOMMENDED PORTS
              </small>
              <h3 className="fw-bold mt-1 mb-4 text-white">Compatible Destinations</h3>
              <div className="row g-4">
                {compatiblePorts.map((port) => (
                  <div className="col-md-6 col-lg-4" key={port.id}>
                    <div className="card border-0 rounded-4 h-100 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="fw-bold mb-1 text-white">{port.name}</h5>
                            <small style={{ color: "#8492a6" }}>{port.state}</small>
                          </div>
                          <span
                            className="badge rounded-pill px-3 py-2 fw-semibold"
                            style={{ backgroundColor: "#064e3b", color: "#34d399" }}
                          >
                            Compatible
                          </span>
                        </div>
                        <hr style={{ borderColor: "#162234" }} />
                        <div className="row g-3">
                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Draft</small>
                            <div className="fw-bold text-white">{port.maxDraft ?? "N/A"} m</div>
                          </div>
                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>LOA</small>
                            <div className="fw-bold text-white">{port.maxLOA ?? "N/A"} m</div>
                          </div>
                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Beam</small>
                            <div className="fw-bold text-white">{port.maxBeam ?? "N/A"} m</div>
                          </div>
                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Berths</small>
                            <div className="fw-bold text-white">{port.berths ?? "N/A"}</div>
                          </div>
                        </div>
                        {port.notes && (
                          <p className="small mt-3 pt-3 mb-0" style={{ color: "#8492a6", borderTop: "1px solid #162234" }}>
                            {port.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {restrictedPorts.length > 0 && (
            <div>
              <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
                OPERATIONAL LIMITATIONS
              </small>
              <h3 className="fw-bold mt-1 mb-4 text-white">Ports Requiring Attention</h3>
              <div className="row g-4">
                {restrictedPorts.map((port) => (
                  <div className="col-md-6" key={port.id}>
                    <div className="card border-0 rounded-4 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold text-white">{port.name}</h5>
                            <small style={{ color: "#8492a6" }}>{port.state}</small>
                          </div>
                          <span
                            className="badge rounded-pill px-3 py-2 fw-semibold"
                            style={{ backgroundColor: "#450a0a", color: "#f87171" }}
                          >
                            Restricted
                          </span>
                        </div>
                        <div>
                          {port.restrictions.map((restriction, index) => (
                            <div key={index} className="d-flex align-items-center gap-2 mb-2">
                              <span>⚠️</span>
                              <span className="small" style={{ color: "#8492a6" }}>
                                {restriction}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {/* CHARTERING RECOMMENDATION */}
      <section
        id="recommendation"
        className="py-5"
        style={{ backgroundColor: "#0b1320", borderTop: "1px solid #162234", borderBottom: "1px solid #162234" }}
      >
        <div className="container py-4">
          <div className="text-center mb-4">
            <small className="text-uppercase fw-bold tracking-wider" style={{ color: "#38bdf8", fontSize: "0.75rem" }}>
              DECISION INTELLIGENCE
            </small>
            <h2 className="fw-bold mt-2 text-white">Chartering Strategy Recommendation</h2>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="card border-0 rounded-4 p-2" style={{ backgroundColor: "#070d18", border: "1px solid #162234" }}>
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex gap-4 align-items-start flex-column flex-md-row">
                    <div className="fs-1">📊</div>
                    <div className="flex-grow-1">
                      <h4 className="fw-bold text-white">
                        {compatiblePorts.length > 0
                          ? "Vessel-port compatibility is favorable."
                          : "Consider an alternative vessel class."}
                      </h4>
                      {loadingAnalysis && (
                        <div className="mt-3 d-flex align-items-center gap-3">
                          <Spinner size={22} />
                          <span style={{ color: "#8492a6" }}>Generating recommendation…</span>
                        </div>
                      )}
                      {analysisError && !loadingAnalysis && (
                        <div
                          className="mt-3 p-3 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                          style={{ backgroundColor: "#0b1320", border: "1px solid #3f1d1d" }}
                        >
                          <span style={{ color: "#f87171" }}>AI recommendation unavailable — {analysisError}</span>
                          <button
                            className="btn btn-sm fw-semibold px-3 rounded-3 text-white"
                            style={{ backgroundColor: "#1e88e5" }}
                            onClick={handleRetry}
                          >
                            ↻ Retry
                          </button>
                        </div>
                      )}
                      {analysis && !loadingAnalysis && !analysisError && (
                        <p className="mt-3" style={{ color: "#8492a6" }}>
                          {analysis.forecast?.charterRecommendation}
                        </p>
                      )}
                      <p className="mb-0" style={{ color: "#8492a6" }}>
                        {compatiblePorts.length > 0
                          ? `The selected ${vesselType} can operate at ${compatiblePorts.length} of ${ports.length} analyzed locations.`
                          : `The selected ${vesselType} exceeds the draft/length limits of the primary ports.`}
                      </p>
                    </div>
                  </div>
                  {/* Decision factor ratings */}
                  <div className="row g-3 mt-4">
                    <div className="col-md-4">
                      <div className="decision-rating rounded-3 p-3 h-100" style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}>
                        <small className="text-uppercase" style={{ color: "#64748b", fontSize: "0.68rem" }}>
                          Vessel Fit
                        </small>
                        <h5
                          className="fw-bold mb-0 mt-1"
                          style={{
                            color:
                              chartingDetails.vesselFitRating === "Good"
                                ? "#34d399"
                                : chartingDetails.vesselFitRating === "Poor"
                                ? "#f87171"
                                : "#fbbf24",
                          }}
                        >
                          {chartingDetails.vesselFitRating}
                        </h5>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="decision-rating rounded-3 p-3 h-100" style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}>
                        <small className="text-uppercase" style={{ color: "#64748b", fontSize: "0.68rem" }}>
                          Market Timing
                        </small>
                        <h5
                          className="fw-bold mb-0 mt-1"
                          style={{
                            color:
                              chartingDetails.marketTimingRating === "Act soon"
                                ? "#fbbf24"
                                : chartingDetails.marketTimingRating === "Can wait"
                                ? "#34d399"
                                : "#38bdf8",
                          }}
                        >
                          {chartingDetails.marketTimingRating}
                        </h5>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="decision-rating rounded-3 p-3 h-100" style={{ backgroundColor: "#0b1320", border: "1px solid #162234" }}>
                        <small className="text-uppercase" style={{ color: "#64748b", fontSize: "0.68rem" }}>
                          Risk Level
                        </small>
                        <h5 className="fw-bold mb-0 mt-1 text-white">{chartingDetails.riskRating}</h5>
                      </div>
                    </div>
                  </div>
                  {/* Action items */}
                  <div className="mt-4">
                    <small className="text-uppercase fw-bold" style={{ color: "#38bdf8", fontSize: "0.72rem" }}>
                      ACTION ITEMS
                    </small>
                    <ul className="mt-2 mb-0" style={{ color: "#8492a6", lineHeight: 1.7 }}>
                      {chartingDetails.actionItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {chartingDetails.betterAlt && (
                    <p className="small mt-3 mb-0" style={{ color: "#64748b" }}>
                      See the Vessel Class Comparison above for options with broader port access on this route.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FOOTER CTA */}
      <section className="py-5 mt-auto">
        <div className="container">
          <div
            className="results-footer-cta rounded-4 p-4 p-md-5 text-white shadow-lg"
            style={{ backgroundColor: "#0b1320", border: "1px solid #1e2d42" }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="fw-bold text-white">Need another forecast?</h2>
                <p className="mb-0" style={{ color: "#8492a6" }}>
                  Adjust the route, vessel class, or cargo requirements and run another scenario.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0 d-flex flex-column flex-lg-row gap-2 justify-content-lg-end">
                <button
                  className="btn btn-lg px-4 rounded-3 fw-semibold"
                  style={{ backgroundColor: "transparent", border: "1px solid #14b8a6", color: "#5eead4" }}
                  onClick={handleDownloadReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? "Preparing…" : "⬇ Download PDF Report"}
                </button>
                <button
                  className="btn btn-lg px-4 text-white rounded-3 fw-semibold"
                  style={{ backgroundColor: "#1e88e5" }}
                  onClick={() => navigate("/forecast_query")}
                >
                  New Forecast →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
        </div>
      </main>
    </>
  );
};
export default ForecastResults;