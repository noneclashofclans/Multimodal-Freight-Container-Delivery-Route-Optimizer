import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ports, vesselTypes } from "../data/Ports";
import RateChart from "./RateChart";

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
  "sagar-sandheads": { lat: 21.6500, lng: 88.0500 },
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

const ForecastResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  // PORT INFRASTRUCTURE COMPATIBILITY ENGINE
  const portResults = useMemo(() => {
    return ports.map((port) => {
      const restrictions = [];

      if (port.maxDraft !== null && vesselSpecs.maxDraft > port.maxDraft) {
        restrictions.push(`Draft (${vesselSpecs.maxDraft}m) exceeds ${port.maxDraft}m limit`);
      }

      if (port.maxLOA !== null && vesselSpecs.maxLOA > port.maxLOA) {
        restrictions.push(`LOA (${vesselSpecs.maxLOA}m) exceeds ${port.maxLOA}m limit`);
      }

      if (port.maxBeam !== null && vesselSpecs.maxBeam > port.maxBeam) {
        restrictions.push(`Beam (${vesselSpecs.maxBeam}m) exceeds ${port.maxBeam}m limit`);
      }

      if (port.maxDWT !== null && vesselSpecs.maxDWT > port.maxDWT) {
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
  }, [vesselSpecs]);

  const compatiblePorts = portResults.filter((p) => p.status === "compatible");
  const restrictedPorts = portResults.filter((p) => p.status === "restricted");
  const specialPorts = portResults.filter((p) => p.status === "special");

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
        const res = await fetch("http://localhost:7000/api/forecast", {
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

  const specMetrics = [
    {
      icon: "🚢",
      title: "Deadweight",
      value: `${vesselSpecs.maxDWT.toLocaleString()} DWT`,
    },
    {
      icon: "📏",
      title: "Maximum LOA",
      value: `${vesselSpecs.maxLOA} m`,
    },
    {
      icon: "↔️",
      title: "Maximum Beam",
      value: `${vesselSpecs.maxBeam} m`,
    },
    {
      icon: "⚓",
      title: "Maximum Draft",
      value: `${vesselSpecs.maxDraft} m`,
    },
  ];

  return (
    <main
      className="min-vh-100 d-flex flex-column text-white"
      style={{
        backgroundColor: "#070d18",
        fontFamily: "'Segoe UI', Roboto, sans-serif",
      }}
    >
      <Navbar />

      {/* HERO SECTION */}
      <section className="py-5">
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span
                className="badge rounded-pill px-3 py-2 mb-3 fw-semibold"
                style={{ backgroundColor: "#0b2528", color: "#38bdf8" }}
              >
                AI-GENERATED FORECAST RESULTS
              </span>

              <h1 className="display-4 fw-bold text-white">
                Freight & Vessel
                <br />
                <span style={{ color: "#38bdf8" }}>
                  Decision Intelligence
                </span>
              </h1>

              <p className="lead mt-3" style={{ color: "#8492a6" }}>
                AI-assisted analysis of freight conditions, vessel suitability,
                and East Coast port infrastructure for your charter scenario.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-2 mt-4">
                <span
                  className="badge rounded-pill px-3 py-2 fs-6 fw-normal"
                  style={{
                    backgroundColor: "#0b1320",
                    color: "#e2e8f0",
                    border: "1px solid #162234",
                  }}
                >
                  {origin}
                </span>

                <span className="fw-bold" style={{ color: "#38bdf8" }}>
                  →
                </span>

                <span
                  className="badge rounded-pill px-3 py-2 fs-6 fw-normal"
                  style={{
                    backgroundColor: "#0b1320",
                    color: "#e2e8f0",
                    border: "1px solid #162234",
                  }}
                >
                  {destination}
                </span>

                <span
                  className="badge rounded-pill px-3 py-2 fs-6 fw-semibold"
                  style={{
                    backgroundColor: "#1e88e5",
                    color: "#ffffff",
                  }}
                >
                  {vesselType}
                </span>

                {distanceInfo && (
                  <span
                    className="badge rounded-pill px-3 py-2 fs-6 fw-normal"
                    style={{
                      backgroundColor: "#0b1320",
                      color: "#38bdf8",
                      border: "1px solid #162234",
                    }}
                  >
                    ~{distanceInfo.nauticalMiles.toLocaleString()} nm
                  </span>
                )}
              </div>
            </div>

            {/* SUMMARY CARD */}
            <div className="col-lg-5">
              <div
                className="card border-0 shadow-lg rounded-4 p-2"
                style={{
                  backgroundColor: "#0b1320",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <small
                    className="text-uppercase fw-bold tracking-wider"
                    style={{ color: "#64748b", fontSize: "0.75rem" }}
                  >
                    FORECAST SCENARIO
                  </small>

                  <h4 className="fw-bold mt-2 mb-4 text-white">
                    {vesselType} Charter Analysis
                  </h4>

                  {/* Vessel image */}
                  {vesselImage && (
                    <div
                      className="rounded-3 mb-4 d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: "#070d18",
                        border: "1px solid #162234",
                        padding: "1rem",
                      }}
                    >
                      <img
                        src={vesselImage}
                        alt={vesselType}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  )}

                  <div className="d-flex flex-column gap-3">
                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Cargo</span>
                      <strong className="text-white">
                        {Number(cargoQuantity).toLocaleString()} MT ({cargoType})
                      </strong>
                    </div>

                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Forecast</span>
                      <strong className="text-white">{forecastPeriod}</strong>
                    </div>

                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Vessel</span>
                      <strong className="text-white">{vesselType}</strong>
                    </div>

                    <div
                      className="d-flex justify-content-between pb-3"
                      style={{ borderBottom: "1px solid #162234" }}
                    >
                      <span style={{ color: "#8492a6" }}>Approx. Distance</span>
                      <strong className="text-white">
                        {distanceInfo
                          ? `${distanceInfo.km.toLocaleString()} km / ${distanceInfo.nauticalMiles.toLocaleString()} nm`
                          : "N/A"}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span style={{ color: "#8492a6" }}>
                        Compatible Ports
                      </span>
                      <strong
                        className="fs-4 fw-bold"
                        style={{ color: "#38bdf8" }}
                      >
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

      {/* MARKET ANALYSIS */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              MARKET ANALYSIS ENGINE
            </small>

            <h2 className="fw-bold mt-2 text-white">Freight Market Outlook</h2>

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
                  style={{
                    backgroundColor: "#070d18",
                    border: "1px solid #3f1d1d",
                  }}
                >
                  <div className="card-body p-4 p-md-5">
                    <div className="fs-1 mb-3">⚠️</div>
                    <h5 className="fw-bold text-white mb-2">
                      Forecast Unavailable
                    </h5>
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
              <div className="row g-4">
                <div className="col-md-4">
                  <div
                    className="card border-0 rounded-4 h-100 p-2"
                    style={{
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">💰</div>
                      <small style={{ color: "#8492a6" }}>
                        Forecast Freight Rate
                      </small>
                      <h2 className="fw-bold mt-2 text-white">
                        ${analysis.forecast?.predictedRate ?? "N/A"}/tonne
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="card border-0 rounded-4 h-100 p-2"
                    style={{
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">📈</div>
                      <small style={{ color: "#8492a6" }}>Market Trend</small>
                      <h4 className="fw-bold mt-2 text-white">
                        {analysis.forecast?.marketTrend ?? "N/A"}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className="card border-0 rounded-4 h-100 p-2"
                    style={{
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="fs-2 mb-2">⚠️</div>
                      <small style={{ color: "#8492a6" }}>Market Risk</small>
                      <h4 className="fw-bold mt-2 text-white">
                        {analysis.forecast?.riskLevel ?? "N/A"}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="card border-0 rounded-4 mt-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 p-md-5">
                  <small
                    className="text-uppercase fw-bold tracking-wider"
                    style={{ color: "#38bdf8", fontSize: "0.75rem" }}
                  >
                    ANALYTICAL SUMMARY
                  </small>

                  <h4 className="fw-bold mt-2 text-white">
                    Market Assessment Summary
                  </h4>

                  <p className="mt-3 mb-0" style={{ color: "#8492a6", lineHeight: "1.7" }}>
                    {analysis.forecast?.reasoning}
                  </p>

                  {analysis.forecast?.keyFactors?.length > 0 && (
                    <ul className="mt-3" style={{ color: "#8492a6" }}>
                      {analysis.forecast.keyFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FREIGHT RATE TREND CHART */}
      {analysis?.rateData?.length > 0 && !loadingAnalysis && !analysisError && (
        <section className="py-5">
          <div className="container py-4">
            <div className="text-center mb-4">
              <small
                className="text-uppercase fw-bold tracking-wider"
                style={{ color: "#38bdf8", fontSize: "0.75rem" }}
              >
                FREIGHT RATE TREND
              </small>

              <h2 className="fw-bold mt-2 text-white">
                Historical & Projected Rates
              </h2>
            </div>

            <div
              className="card border-0 rounded-4 p-3"
              style={{
                backgroundColor: "#0b1320",
                border: "1px solid #162234",
              }}
            >
              <div className="card-body p-4">
                <RateChart data={analysis.rateData} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VESSEL PROFILE */}
      <section className="py-5">
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              VESSEL PROFILE
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Selected Vessel Specifications
            </h2>

            <p style={{ color: "#8492a6" }}>
              Parameters evaluated against port draft and berth limits.
            </p>
          </div>

          <div className="row g-4 align-items-stretch">
            {vesselImage && (
              <div className="col-lg-4">
                <div
                  className="card border-0 rounded-4 h-100 p-2 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#0b1320",
                    border: "1px solid #162234",
                  }}
                >
                  <div className="card-body p-4 text-center">
                    <img
                      src={vesselImage}
                      alt={vesselType}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "contain",
                        marginBottom: "0.75rem",
                      }}
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
                      style={{
                        backgroundColor: "#0b1320",
                        border: "1px solid #162234",
                      }}
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

      {/* PORT INFRASTRUCTURE ANALYSIS */}
      <section
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              PORT INFRASTRUCTURE ANALYSIS
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Port Operation Compatibility
            </h2>
          </div>

          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">✅</div>
                  <small style={{ color: "#8492a6" }}>Compatible</small>
                  <h2 className="fw-bold mt-1 text-success">
                    {compatiblePorts.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">⚠️</div>
                  <small style={{ color: "#8492a6" }}>Restricted</small>
                  <h2 className="fw-bold mt-1 text-danger">
                    {restrictedPorts.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4">
                  <div className="fs-2 mb-2">⚓</div>
                  <small style={{ color: "#8492a6" }}>Special Operations</small>
                  <h2 className="fw-bold mt-1 text-warning">
                    {specialPorts.length}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {compatiblePorts.length > 0 && (
            <div className="mb-5">
              <small
                className="text-uppercase fw-bold tracking-wider"
                style={{ color: "#38bdf8", fontSize: "0.75rem" }}
              >
                RECOMMENDED PORTS
              </small>

              <h3 className="fw-bold mt-1 mb-4 text-white">
                Compatible Destinations
              </h3>

              <div className="row g-4">
                {compatiblePorts.map((port) => (
                  <div className="col-md-6 col-lg-4" key={port.id}>
                    <div
                      className="card border-0 rounded-4 h-100 p-2"
                      style={{
                        backgroundColor: "#070d18",
                        border: "1px solid #162234",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="fw-bold mb-1 text-white">
                              {port.name}
                            </h5>
                            <small style={{ color: "#8492a6" }}>
                              {port.state}
                            </small>
                          </div>

                          <span
                            className="badge rounded-pill px-3 py-2 fw-semibold"
                            style={{
                              backgroundColor: "#064e3b",
                              color: "#34d399",
                            }}
                          >
                            Compatible
                          </span>
                        </div>

                        <hr style={{ borderColor: "#162234" }} />

                        <div className="row g-3">
                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Draft</small>
                            <div className="fw-bold text-white">
                              {port.maxDraft ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>LOA</small>
                            <div className="fw-bold text-white">
                              {port.maxLOA ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Beam</small>
                            <div className="fw-bold text-white">
                              {port.maxBeam ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small style={{ color: "#64748b" }}>Berths</small>
                            <div className="fw-bold text-white">
                              {port.berths ?? "N/A"}
                            </div>
                          </div>
                        </div>

                        {port.notes && (
                          <p
                            className="small mt-3 pt-3 mb-0"
                            style={{
                              color: "#8492a6",
                              borderTop: "1px solid #162234",
                            }}
                          >
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
              <small
                className="text-uppercase fw-bold tracking-wider"
                style={{ color: "#38bdf8", fontSize: "0.75rem" }}
              >
                OPERATIONAL LIMITATIONS
              </small>

              <h3 className="fw-bold mt-1 mb-4 text-white">
                Ports Requiring Attention
              </h3>

              <div className="row g-4">
                {restrictedPorts.map((port) => (
                  <div className="col-md-6" key={port.id}>
                    <div
                      className="card border-0 rounded-4 p-2"
                      style={{
                        backgroundColor: "#070d18",
                        border: "1px solid #162234",
                      }}
                    >
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="fw-bold text-white">{port.name}</h5>
                            <small style={{ color: "#8492a6" }}>
                              {port.state}
                            </small>
                          </div>

                          <span
                            className="badge rounded-pill px-3 py-2 fw-semibold"
                            style={{
                              backgroundColor: "#450a0a",
                              color: "#f87171",
                            }}
                          >
                            Restricted
                          </span>
                        </div>

                        <div>
                          {port.restrictions.map((restriction, index) => (
                            <div
                              key={index}
                              className="d-flex align-items-center gap-2 mb-2"
                            >
                              <span>⚠️</span>
                              <span
                                className="small"
                                style={{ color: "#8492a6" }}
                              >
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
        className="py-5"
        style={{
          backgroundColor: "#0b1320",
          borderTop: "1px solid #162234",
          borderBottom: "1px solid #162234",
        }}
      >
        <div className="container py-4">
          <div className="text-center mb-4">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              DECISION INTELLIGENCE
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Chartering Strategy Recommendation
            </h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div
                className="card border-0 rounded-4 p-2"
                style={{
                  backgroundColor: "#070d18",
                  border: "1px solid #162234",
                }}
              >
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
                          <span style={{ color: "#8492a6" }}>
                            Generating recommendation…
                          </span>
                        </div>
                      )}

                      {analysisError && !loadingAnalysis && (
                        <div
                          className="mt-3 p-3 rounded-3 d-flex justify-content-between align-items-center flex-wrap gap-2"
                          style={{
                            backgroundColor: "#0b1320",
                            border: "1px solid #3f1d1d",
                          }}
                        >
                          <span style={{ color: "#f87171" }}>
                            AI recommendation unavailable — {analysisError}
                          </span>
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

                      <p style={{ color: "#8492a6" }}>
                        {compatiblePorts.length > 0
                          ? `The selected ${vesselType} can operate at ${compatiblePorts.length} of ${ports.length} analyzed locations.`
                          : `The selected ${vesselType} exceeds the draft/length limits of the primary ports.`}
                      </p>
                    </div>
                  </div>
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
            className="rounded-4 p-4 p-md-5 text-white shadow-lg"
            style={{
              backgroundColor: "#0b1320",
              border: "1px solid #1e2d42",
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="fw-bold text-white">Need another forecast?</h2>
                <p className="mb-0" style={{ color: "#8492a6" }}>
                  Adjust the route, vessel class, or cargo requirements and run another scenario.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
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
    </main>
  );
};

export default ForecastResults;