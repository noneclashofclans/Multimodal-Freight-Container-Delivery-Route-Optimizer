import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ports, vesselTypes } from "../data/Ports";
import RateChart from "./RateChart";

const ForecastResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const query = location.state || {};

  const {
    origin = "Australia",
    destination = "India East Coast",
    vesselType = "Capesize",
    cargoQuantity = 100000,
    forecastPeriod = "Next 30 Days",

    // Gemini response
    forecast = null,
    analysis = null,
    rateTrend = [],
  } = query;


  const vessel = vesselTypes.find(
    (v) => v.type.toLowerCase() === vesselType.toLowerCase()
  );

  const vesselSpecs = vessel || {
    type: vesselType,
    maxDWT: 0,
    maxLOA: 0,
    maxBeam: 0,
    maxDraft: 0,
  };

  /*
   * ---------------------------------------------------------
   * PORT COMPATIBILITY
   * ---------------------------------------------------------
   */

  const portResults = ports.map((port) => {
    const restrictions = [];

    if (
      port.maxDraft !== null &&
      vesselSpecs.maxDraft > port.maxDraft
    ) {
      restrictions.push(
        `Draft exceeds ${port.maxDraft}m limit`
      );
    }

    if (
      port.maxLOA !== null &&
      vesselSpecs.maxLOA > port.maxLOA
    ) {
      restrictions.push(
        `LOA exceeds ${port.maxLOA}m limit`
      );
    }

    if (
      port.maxBeam !== null &&
      vesselSpecs.maxBeam > port.maxBeam
    ) {
      restrictions.push(
        `Beam exceeds ${port.maxBeam}m limit`
      );
    }

    if (
      port.maxDWT !== null &&
      vesselSpecs.maxDWT > port.maxDWT
    ) {
      restrictions.push(
        `DWT exceeds ${port.maxDWT.toLocaleString()} tons`
      );
    }

    /*
     * Sagar-Sandheads is not treated as a conventional port.
     */
    if (port.id === "sagar-sandheads") {
      return {
        ...port,
        status: "special",
        restrictions: [
          "Deep-water anchorage",
          "STS transfer rather than fixed-berth operation",
        ],
      };
    }

    return {
      ...port,
      status:
        restrictions.length === 0
          ? "compatible"
          : "restricted",
      restrictions,
    };
  });

  const compatiblePorts = portResults.filter(
    (port) => port.status === "compatible"
  );

  const restrictedPorts = portResults.filter(
    (port) => port.status === "restricted"
  );

  const specialPorts = portResults.filter(
    (port) => port.status === "special"
  );

  /*
   * ---------------------------------------------------------
   * SAFE GEMINI DATA
   * ---------------------------------------------------------
   *
   * The important part:
   *
   * Never do:
   *
   * analysis.compatible
   *
   * unless analysis exists.
   */

  const geminiAnalysis = analysis || forecast || {};

  const predictedRate =
    geminiAnalysis.predictedRate ??
    geminiAnalysis.forecastRate ??
    null;

  const marketTrend =
    geminiAnalysis.marketTrend ??
    geminiAnalysis.trend ??
    "Analysis pending";

  const charterRecommendation =
    geminiAnalysis.charterRecommendation ??
    geminiAnalysis.recommendation ??
    "Review current freight conditions before fixing the vessel.";

  const riskLevel =
    geminiAnalysis.riskLevel ??
    geminiAnalysis.risk ??
    "Moderate";

  const reasoning =
    geminiAnalysis.reasoning ??
    geminiAnalysis.explanation ??
    "Gemini analysis will appear here after the forecast is generated.";

  /*
   * ---------------------------------------------------------
   * VESSEL METRICS
   * ---------------------------------------------------------
   */

  const specMetrics = [
    {
      icon: "🚢",
      title: "Deadweight",
      value: `${vesselSpecs.maxDWT.toLocaleString()} tons`,
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

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <main className="min-vh-100 d-flex flex-column bg-light">

      <Navbar />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg,#fff8dc 0%,#ffffff 100%)",
        }}
      >
        <div className="container py-4 py-lg-5">

          <div className="row align-items-center g-5">

            <div className="col-lg-7">

              <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 mb-3 fw-semibold">
                FORECAST RESULTS
              </span>

              <h1 className="display-5 fw-bold text-dark">
                Freight & Vessel
                <br />

                <span className="text-warning">
                  Decision Intelligence
                </span>
              </h1>

              <p className="lead text-secondary mt-3">

                AI-assisted analysis of freight conditions,
                vessel suitability and East Coast port
                infrastructure for your selected charter scenario.

              </p>

              <div className="d-flex flex-wrap gap-2 mt-4">

                <span className="badge bg-white text-dark border shadow-sm rounded-pill px-3 py-2 fs-6 fw-normal">
                  {origin}
                </span>

                <span className="text-secondary fw-bold">
                  →
                </span>

                <span className="badge bg-white text-dark border shadow-sm rounded-pill px-3 py-2 fs-6 fw-normal">
                  {destination}
                </span>

                <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fs-6 fw-semibold">
                  {vesselType}
                </span>

              </div>

            </div>

            {/* SUMMARY CARD */}

            <div className="col-lg-5">

              <div className="card border-0 shadow-lg rounded-4">

                <div className="card-body p-4 p-md-5">

                  <small className="text-secondary fw-bold">
                    FORECAST SCENARIO
                  </small>

                  <h4 className="fw-bold mt-2 mb-4">
                    {vesselType} Charter Analysis
                  </h4>

                  <div className="d-flex flex-column gap-3">

                    <div className="d-flex justify-content-between border-bottom pb-3">
                      <span className="text-secondary">
                        Cargo
                      </span>

                      <strong>
                        {Number(cargoQuantity).toLocaleString()} MT
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between border-bottom pb-3">
                      <span className="text-secondary">
                        Forecast
                      </span>

                      <strong>
                        {forecastPeriod}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between border-bottom pb-3">
                      <span className="text-secondary">
                        Vessel
                      </span>

                      <strong>
                        {vesselType}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between">

                      <span className="text-secondary">
                        Compatible Ports
                      </span>

                      <strong className="text-warning fs-5">
                        {compatiblePorts.length}
                      </strong>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>



      <section className="py-5 bg-white">

        <div className="container py-4">

          <div className="text-center mb-5">

            <small className="text-warning fw-bold">
              GEMINI MARKET ANALYSIS
            </small>

            <h2 className="fw-bold mt-2">
              Freight market outlook
            </h2>

            <p className="text-secondary">
              AI-assisted interpretation of freight market conditions
              for the selected trade scenario.
            </p>

          </div>


          <div className="row g-4">

            {/* PREDICTED RATE */}

            <div className="col-md-4">

              <div className="card border-0 bg-light rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="fs-2">
                    💰
                  </div>

                  <small className="text-secondary">
                    Forecast Freight Rate
                  </small>

                  <h2 className="fw-bold mt-2">

                    {predictedRate !== null
                      ? `$${predictedRate}/tonne`
                      : "Pending"}

                  </h2>

                </div>

              </div>

            </div>


            {/* MARKET TREND */}

            <div className="col-md-4">

              <div className="card border-0 bg-light rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="fs-2">
                    📈
                  </div>

                  <small className="text-secondary">
                    Market Trend
                  </small>

                  <h4 className="fw-bold mt-2">
                    {marketTrend}
                  </h4>

                </div>

              </div>

            </div>


            <div className="col-md-4">

              <div className="card border-0 bg-light rounded-4 h-100">

                <div className="card-body p-4">

                  <div className="fs-2">
                    ⚠️
                  </div>

                  <small className="text-secondary">
                    Market Risk
                  </small>

                  <h4 className="fw-bold mt-2">
                    {riskLevel}
                  </h4>

                </div>

              </div>

            </div>

          </div>


          <div className="card border-0 shadow-sm rounded-4 mt-4">

            <div className="card-body p-4 p-md-5">

              <small className="text-warning fw-bold">
                AI INTERPRETATION
              </small>

              <h4 className="fw-bold mt-2">
                Gemini's market assessment
              </h4>

              <p className="text-secondary mt-3 mb-0">
                {reasoning}
              </p>

            </div>

          </div>

        </div>

      </section>



      {rateTrend.length > 0 && (

        <section
          className="py-5"
          style={{ backgroundColor: "#fffdf5" }}
        >

          <div className="container py-4">

            <div className="text-center mb-4">

              <small className="text-warning fw-bold">
                FREIGHT RATE TREND
              </small>

              <h2 className="fw-bold mt-2">
                Historical & projected rates
              </h2>

            </div>

            <div className="card border-0 shadow-sm rounded-4">

              <div className="card-body p-4">

                <RateChart data={rateTrend} />

              </div>

            </div>

          </div>

        </section>

      )}


      <section className="py-5 bg-white">

        <div className="container py-4">

          <div className="text-center mb-5">

            <small className="text-warning fw-bold">
              VESSEL PROFILE
            </small>

            <h2 className="fw-bold mt-2">
              Selected vessel capabilities
            </h2>

            <p className="text-secondary">
              Physical vessel parameters used for infrastructure
              compatibility analysis.
            </p>

          </div>


          <div className="row g-4">

            {specMetrics.map((metric) => (

              <div
                className="col-6 col-lg-3"
                key={metric.title}
              >

                <div className="card border-0 bg-light rounded-4 h-100 shadow-sm">

                  <div className="card-body p-4 text-center">

                    <div className="fs-1">
                      {metric.icon}
                    </div>

                    <small className="text-secondary">
                      {metric.title}
                    </small>

                    <h5 className="fw-bold mt-2">
                      {metric.value}
                    </h5>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>



      <section
        className="py-5"
        style={{ backgroundColor: "#fffdf5" }}
      >

        <div className="container py-4">

          <div className="text-center mb-5">

            <small className="text-warning fw-bold">
              PORT INFRASTRUCTURE ANALYSIS
            </small>

            <h2 className="fw-bold mt-2">
              Where can this vessel operate?
            </h2>

            <p className="text-secondary">
              Compatibility is calculated from the port infrastructure
              dataset in <strong>Ports.jsx</strong>.
            </p>

          </div>



          <div className="row g-4 mb-5">

            <div className="col-md-4">

              <div className="card border-0 rounded-4 shadow-sm">

                <div className="card-body p-4">

                  <div className="fs-2">
                    ✅
                  </div>

                  <small className="text-secondary">
                    Compatible
                  </small>

                  <h2 className="fw-bold text-success">
                    {compatiblePorts.length}
                  </h2>

                </div>

              </div>

            </div>


            <div className="col-md-4">

              <div className="card border-0 rounded-4 shadow-sm">

                <div className="card-body p-4">

                  <div className="fs-2">
                    ⚠️
                  </div>

                  <small className="text-secondary">
                    Restricted
                  </small>

                  <h2 className="fw-bold text-danger">
                    {restrictedPorts.length}
                  </h2>

                </div>

              </div>

            </div>


            <div className="col-md-4">

              <div className="card border-0 rounded-4 shadow-sm">

                <div className="card-body p-4">

                  <div className="fs-2">
                    ⚓
                  </div>

                  <small className="text-secondary">
                    Special Operations
                  </small>

                  <h2 className="fw-bold text-warning">
                    {specialPorts.length}
                  </h2>

                </div>

              </div>

            </div>

          </div>



          {compatiblePorts.length > 0 && (

            <div className="mb-5">

              <small className="text-warning fw-bold">
                RECOMMENDED PORTS
              </small>

              <h3 className="fw-bold mt-1 mb-4">
                Infrastructure-compatible destinations
              </h3>

              <div className="row g-4">

                {compatiblePorts.map((port) => (

                  <div
                    className="col-md-6 col-lg-4"
                    key={port.id}
                  >

                    <div className="card border-0 rounded-4 shadow-sm h-100">

                      <div className="card-body p-4">

                        <div className="d-flex justify-content-between">

                          <div>

                            <h5 className="fw-bold mb-1">
                              {port.name}
                            </h5>

                            <small className="text-secondary">
                              {port.state}
                            </small>

                          </div>

                          <span className="badge bg-success-subtle text-success rounded-pill">
                            Compatible
                          </span>

                        </div>

                        <hr />

                        <div className="row g-3">

                          <div className="col-6">
                            <small className="text-secondary">
                              Draft
                            </small>

                            <div className="fw-bold">
                              {port.maxDraft ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small className="text-secondary">
                              LOA
                            </small>

                            <div className="fw-bold">
                              {port.maxLOA ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small className="text-secondary">
                              Beam
                            </small>

                            <div className="fw-bold">
                              {port.maxBeam ?? "N/A"} m
                            </div>
                          </div>

                          <div className="col-6">
                            <small className="text-secondary">
                              Berths
                            </small>

                            <div className="fw-bold">
                              {port.berths ?? "N/A"}
                            </div>
                          </div>

                        </div>

                        {port.notes && (

                          <p className="text-secondary small border-top pt-3 mt-3 mb-0">
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

              <small className="text-warning fw-bold">
                OPERATIONAL LIMITATIONS
              </small>

              <h3 className="fw-bold mt-1 mb-4">
                Ports requiring attention
              </h3>

              <div className="row g-4">

                {restrictedPorts.map((port) => (

                  <div
                    className="col-md-6"
                    key={port.id}
                  >

                    <div className="card border-0 rounded-4 shadow-sm">

                      <div className="card-body p-4">

                        <div className="d-flex justify-content-between">

                          <div>

                            <h5 className="fw-bold">
                              {port.name}
                            </h5>

                            <small className="text-secondary">
                              {port.state}
                            </small>

                          </div>

                          <span className="badge bg-danger-subtle text-danger rounded-pill">
                            Restricted
                          </span>

                        </div>

                        <div className="mt-3">

                          {port.restrictions.map(
                            (restriction, index) => (

                              <div
                                key={index}
                                className="d-flex gap-2 mb-2"
                              >

                                <span>⚠️</span>

                                <span className="text-secondary small">
                                  {restriction}
                                </span>

                              </div>

                            )
                          )}

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



      {specialPorts.length > 0 && (

        <section className="py-5 bg-white">

          <div className="container py-4">

            <div className="row g-5 align-items-center">

              <div className="col-lg-5">

                <small className="text-warning fw-bold">
                  SPECIAL OPERATIONS
                </small>

                <h2 className="fw-bold display-6 mt-2">
                  Alternative handling locations
                </h2>

                <p className="text-secondary mt-3">
                  Deep-water anchorage and ship-to-ship transfer
                  locations require different operational planning
                  from conventional berths.
                </p>

              </div>


              <div className="col-lg-7">

                {specialPorts.map((port) => (

                  <div
                    className="card border-0 bg-light rounded-4 shadow-sm mb-3"
                    key={port.id}
                  >

                    <div className="card-body p-4">

                      <div className="d-flex gap-3">

                        <div className="fs-2">
                          ⚓
                        </div>

                        <div>

                          <h5 className="fw-bold">
                            {port.name}
                          </h5>

                          <p className="text-secondary small">
                            {port.notes}
                          </p>

                          <div className="d-flex flex-wrap gap-2">

                            {port.restrictions.map(
                              (item, index) => (

                                <span
                                  key={index}
                                  className="badge bg-white text-dark border rounded-pill px-3 py-2"
                                >
                                  {item}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </section>

      )}



      <section
        className="py-5"
        style={{ backgroundColor: "#fffdf5" }}
      >

        <div className="container py-4">

          <div className="text-center mb-4">

            <small className="text-warning fw-bold">
              DECISION INTELLIGENCE
            </small>

            <h2 className="fw-bold mt-2">
              Chartering recommendation
            </h2>

          </div>


          <div className="row justify-content-center">

            <div className="col-lg-9">

              <div className="card border-0 shadow-sm rounded-4">

                <div className="card-body p-4 p-md-5">

                  <div className="d-flex gap-4">

                    <div className="fs-1">
                      📊
                    </div>

                    <div>

                      <h4 className="fw-bold">

                        {compatiblePorts.length > 0
                          ? "Vessel-port compatibility is favorable."
                          : "Consider an alternative vessel class."}

                      </h4>

                      <p className="text-secondary mt-3">
                        {charterRecommendation}
                      </p>

                      <p className="text-secondary">

                        {compatiblePorts.length > 0
                          ? `The selected ${vesselType} can operate at ${compatiblePorts.length} of ${ports.length} analyzed locations.`
                          : `The selected ${vesselType} exceeds the infrastructure limits of the analyzed locations.`}

                      </p>

                      <div className="d-flex flex-wrap gap-2">

                        {compatiblePorts
                          .slice(0, 5)
                          .map((port) => (

                            <span
                              key={port.id}
                              className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-2"
                            >
                              {port.name}
                            </span>

                          ))}

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="py-5 mt-auto">

        <div className="container">

          <div
            className="rounded-4 p-4 p-md-5 text-white shadow-lg"
            style={{
              background:
                "linear-gradient(135deg,#c99400,#f0b900)",
            }}
          >

            <div className="row align-items-center">

              <div className="col-lg-8">

                <h2 className="fw-bold">
                  Need another forecast?
                </h2>

                <p className="mb-0 opacity-75">
                  Adjust the route, vessel class or cargo
                  requirements and run another scenario.
                </p>

              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">

                <button
                  className="btn btn-light btn-lg px-4 fw-semibold rounded-pill"
                  onClick={() =>
                    navigate("/forecast_query")
                  }
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