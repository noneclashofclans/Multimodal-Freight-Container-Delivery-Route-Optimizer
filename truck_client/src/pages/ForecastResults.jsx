import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ports, vesselTypes } from "../data/Ports";

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
  } = query;

  // Find selected vessel class
  const vessel = vesselTypes.find(
    (v) => v.type.toLowerCase() === vesselType.toLowerCase()
  );

  const vesselSpecs = vessel || {
    maxDWT: 0,
    maxLOA: 0,
    maxBeam: 0,
    maxDraft: 0,
  };

  // Check vessel compatibility with every port
  const portResults = ports.map((port) => {
    const restrictions = [];

    if (port.maxDraft !== null && vesselSpecs.maxDraft > port.maxDraft) {
      restrictions.push(`Draft exceeds ${port.maxDraft}m limit`);
    }

    if (port.maxLOA !== null && vesselSpecs.maxLOA > port.maxLOA) {
      restrictions.push(`LOA exceeds ${port.maxLOA}m limit`);
    }

    if (port.maxBeam !== null && vesselSpecs.maxBeam > port.maxBeam) {
      restrictions.push(`Beam exceeds ${port.maxBeam}m limit`);
    }

    if (port.maxDWT !== null && vesselSpecs.maxDWT > port.maxDWT) {
      restrictions.push(`DWT exceeds ${port.maxDWT.toLocaleString()} tons`);
    }

    // Sagar-Sandheads is a special anchorage/STS location
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
      status: restrictions.length === 0 ? "compatible" : "restricted",
      restrictions,
    };
  });

  const compatiblePorts = portResults.filter((port) => port.status === "compatible");
  const restrictedPorts = portResults.filter((port) => port.status === "restricted");
  const specialPorts = portResults.filter((port) => port.status === "special");

  const specMetrics = [
    { icon: "🚢", title: "Deadweight", value: `${vesselSpecs.maxDWT.toLocaleString()} tons` },
    { icon: "📏", title: "Maximum LOA", value: `${vesselSpecs.maxLOA} m` },
    { icon: "↔️", title: "Maximum Beam", value: `${vesselSpecs.maxBeam} m` },
    { icon: "⚓", title: "Maximum Draft", value: `${vesselSpecs.maxDraft} m` },
  ];

  return (
    <main className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      {/* HERO SECTION */}
      <section
        className="py-5"
        style={{ background: "linear-gradient(135deg, #fff8dc 0%, #ffffff 100%)" }}
      >
        <div className="container py-4 py-lg-5">
          <div className="row align-items-center g-4 g-lg-5">
            {/* LEFT HERO TEXT */}
            <div className="col-lg-7 text-center text-lg-start">
              <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 mb-3 fw-semibold">
                FORECAST RESULTS
              </span>

              <h1 className="display-5 fw-bold text-dark lh-sm">
                Freight & Vessel <br />
                <span className="text-warning">Decision Intelligence</span>
              </h1>

              <p className="lead text-secondary mt-3 mb-4 mx-auto mx-lg-0 style-max-w">
                AI-assisted analysis of freight conditions, vessel suitability, and East Coast port infrastructure for your selected charter scenario.
              </p>

              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start gap-2">
                <span className="badge bg-white text-dark border shadow-sm rounded-pill px-3 py-2 fs-6 fw-normal">
                  {origin}
                </span>

                <span className="text-secondary fw-bold px-1">→</span>

                <span className="badge bg-white text-dark border shadow-sm rounded-pill px-3 py-2 fs-6 fw-normal">
                  {destination}
                </span>

                <span className="badge bg-warning text-dark shadow-sm rounded-pill px-3 py-2 fs-6 fw-semibold">
                  {vesselType}
                </span>
              </div>
            </div>

            {/* RIGHT SUMMARY CARD */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="card-body p-4 p-md-5">
                  <small className="text-secondary fw-bold text-uppercase tracking-wide">
                    FORECAST SCENARIO
                  </small>

                  <h4 className="fw-bold mt-1 mb-4 text-dark">
                    {vesselType} Charter Analysis
                  </h4>

                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
                      <span className="text-secondary">Cargo</span>
                      <strong className="text-dark">
                        {Number(cargoQuantity).toLocaleString()} MT
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
                      <span className="text-secondary">Forecast</span>
                      <strong className="text-dark">{forecastPeriod}</strong>
                    </div>

                    <div className="d-flex justify-content-between align-items-center border-bottom pb-3">
                      <span className="text-secondary">Vessel Class</span>
                      <strong className="text-dark">{vesselType}</strong>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-1">
                      <span className="text-secondary">Compatible Ports</span>
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

      {/* VESSEL PROFILE */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5 mx-auto" style={{ maxWidth: "600px" }}>
            <small className="text-warning fw-bold text-uppercase tracking-wider">
              VESSEL PROFILE
            </small>
            <h2 className="fw-bold mt-2 text-dark">Selected vessel capabilities</h2>
            <p className="text-secondary mb-0">
              Infrastructure compatibility is evaluated against the selected vessel class parameters.
            </p>
          </div>

          <div className="row g-4">
            {specMetrics.map(({ icon, title, value }) => (
              <div className="col-6 col-lg-3" key={title}>
                <div className="card border-0 bg-light rounded-4 h-100 shadow-sm text-center">
                  <div className="card-body p-4 d-flex flex-column justify-content-center align-items-center">
                    <div className="fs-1 mb-2">{icon}</div>
                    <small className="text-secondary fw-medium">{title}</small>
                    <h5 className="fw-bold mt-2 mb-0 text-dark">{value}</h5>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORT INFRASTRUCTURE ANALYSIS */}
      <section className="py-5" style={{ backgroundColor: "#fffdf5" }}>
        <div className="container py-4">
          <div className="text-center mb-5 mx-auto" style={{ maxWidth: "650px" }}>
            <small className="text-warning fw-bold text-uppercase tracking-wider">
              PORT INFRASTRUCTURE ANALYSIS
            </small>
            <h2 className="fw-bold mt-2 text-dark">Where can this vessel operate?</h2>
            <p className="text-secondary mb-0">
              Compatibility is based on draft, LOA, beam, and DWT constraints from the port infrastructure dataset.
            </p>
          </div>

          {/* SUMMARY METRICS */}
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="card border-0 rounded-4 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="fs-2 mb-2">✅</div>
                  <small className="text-secondary fw-semibold">Compatible</small>
                  <h2 className="fw-bold text-success my-2">{compatiblePorts.length}</h2>
                  <p className="text-secondary small mb-0 mt-auto">
                    Ports capable of handling the selected vessel class without operational constraints.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 rounded-4 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="fs-2 mb-2">⚠️</div>
                  <small className="text-secondary fw-semibold">Restricted</small>
                  <h2 className="fw-bold text-danger my-2">{restrictedPorts.length}</h2>
                  <p className="text-secondary small mb-0 mt-auto">
                    Ports where one or more vessel physical dimensions exceed maximum limits.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 rounded-4 shadow-sm h-100">
                <div className="card-body p-4 d-flex flex-column">
                  <div className="fs-2 mb-2">⚓</div>
                  <small className="text-secondary fw-semibold">Special Operations</small>
                  <h2 className="fw-bold text-warning my-2">{specialPorts.length}</h2>
                  <p className="text-secondary small mb-0 mt-auto">
                    Deep-water anchorage or ship-to-ship (STS) transfer locations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDED PORTS */}
          {compatiblePorts.length > 0 && (
            <div className="mb-5">
              <div className="mb-4">
                <small className="text-warning fw-bold text-uppercase">RECOMMENDED PORTS</small>
                <h3 className="fw-bold mt-1 text-dark">Infrastructure-compatible destinations</h3>
              </div>

              <div className="row g-4">
                {compatiblePorts.map((port) => (
                  <div className="col-md-6 col-lg-4" key={port.id}>
                    <div className="card border-0 rounded-4 shadow-sm h-100 d-flex flex-column">
                      <div className="card-body p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                          <div>
                            <h5 className="fw-bold mb-1 text-dark">{port.name}</h5>
                            <small className="text-secondary">{port.state}</small>
                          </div>
                          <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2 fw-semibold">
                            Compatible
                          </span>
                        </div>

                        <hr className="my-3 text-muted" />

                        <div className="row g-3 mb-3">
                          <div className="col-6">
                            <small className="text-secondary d-block">Draft</small>
                            <span className="fw-bold text-dark">{port.maxDraft ?? "N/A"} m</span>
                          </div>
                          <div className="col-6">
                            <small className="text-secondary d-block">LOA</small>
                            <span className="fw-bold text-dark">{port.maxLOA ?? "N/A"} m</span>
                          </div>
                          <div className="col-6">
                            <small className="text-secondary d-block">Beam</small>
                            <span className="fw-bold text-dark">{port.maxBeam ?? "N/A"} m</span>
                          </div>
                          <div className="col-6">
                            <small className="text-secondary d-block">Berths</small>
                            <span className="fw-bold text-dark">{port.berths ?? "N/A"}</span>
                          </div>
                        </div>

                        {port.notes && (
                          <p className="text-secondary small mt-auto mb-0 pt-2 border-top">
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

          {/* RESTRICTED PORTS */}
          {restrictedPorts.length > 0 && (
            <div>
              <div className="mb-4">
                <small className="text-warning fw-bold text-uppercase">OPERATIONAL LIMITATIONS</small>
                <h3 className="fw-bold mt-1 text-dark">Ports requiring attention</h3>
              </div>

              <div className="row g-3">
                {restrictedPorts.map((port) => (
                  <div className="col-md-6" key={port.id}>
                    <div className="card border-0 rounded-4 shadow-sm h-100">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                          <div>
                            <h5 className="fw-bold mb-1 text-dark">{port.name}</h5>
                            <small className="text-secondary">{port.state}</small>
                          </div>
                          <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 fw-semibold">
                            Restricted
                          </span>
                        </div>

                        <div className="d-flex flex-column gap-2 mt-3">
                          {port.restrictions.map((restriction, index) => (
                            <div key={index} className="d-flex align-items-start gap-2">
                              <span className="fs-6">⚠️</span>
                              <span className="text-secondary small">{restriction}</span>
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

      {/* SPECIAL OPERATIONS */}
      {specialPorts.length > 0 && (
        <section className="py-5 bg-white border-top">
          <div className="container py-4">
            <div className="row align-items-center g-4 g-lg-5">
              <div className="col-lg-5">
                <small className="text-warning fw-bold text-uppercase">SPECIAL OPERATIONS</small>
                <h2 className="fw-bold display-6 mt-2 text-dark">Alternative handling locations</h2>
                <p className="text-secondary mt-3 mb-0">
                  Some locations operate as deep-water anchorages or ship-to-ship (STS) transfer points rather than conventional berthing facilities.
                </p>
              </div>

              <div className="col-lg-7">
                <div className="d-flex flex-column gap-3">
                  {specialPorts.map((port) => (
                    <div className="card border-0 bg-light rounded-4 shadow-sm" key={port.id}>
                      <div className="card-body p-4">
                        <div className="d-flex align-items-start gap-3">
                          <div className="fs-2 text-warning">⚓</div>
                          <div className="w-100">
                            <h5 className="fw-bold text-dark mb-1">{port.name}</h5>
                            {port.notes && (
                              <p className="text-secondary small mb-3">{port.notes}</p>
                            )}
                            <div className="d-flex flex-wrap gap-2">
                              {port.restrictions.map((item, index) => (
                                <span
                                  key={index}
                                  className="badge bg-white text-dark border shadow-sm rounded-pill px-3 py-2 fw-normal"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RECOMMENDATION */}
      <section className="py-5" style={{ backgroundColor: "#fffdf5" }}>
        <div className="container py-4">
          <div className="text-center mb-4">
            <small className="text-warning fw-bold text-uppercase">DECISION INTELLIGENCE</small>
            <h2 className="fw-bold mt-1 text-dark">Chartering recommendation</h2>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex flex-column flex-md-row align-items-start gap-4">
                    <div className="fs-1 p-3 bg-warning-subtle rounded-4 text-warning">📊</div>
                    <div>
                      <h4 className="fw-bold text-dark">
                        {compatiblePorts.length > 0
                          ? "Vessel-port compatibility is favorable."
                          : "Consider an alternative vessel class."}
                      </h4>

                      <p className="text-secondary mt-3 mb-4">
                        {compatiblePorts.length > 0
                          ? `The selected ${vesselType} vessel can be considered for ${compatiblePorts.length} of the ${ports.length} analyzed locations. Prioritize compatible ports while reviewing freight rates, congestion, and charter availability before fixing the vessel.`
                          : `The selected ${vesselType} vessel exceeds the infrastructure limits of the analyzed ports. A smaller vessel class or alternative cargo handling strategy should be evaluated.`}
                      </p>

                      <div className="d-flex flex-wrap gap-2">
                        {compatiblePorts.slice(0, 4).map((port) => (
                          <span
                            key={port.id}
                            className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-2 fw-semibold"
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

      {/* CTA */}
      <section className="py-5 mt-auto">
        <div className="container">
          <div
            className="rounded-4 p-4 p-md-5 text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #c99400 0%, #f0b900 100%)" }}
          >
            <div className="row align-items-center g-3">
              <div className="col-lg-8 text-center text-lg-start">
                <h2 className="fw-bold mb-2">Need another forecast?</h2>
                <p className="mb-0 opacity-90">
                  Adjust the trade route, vessel class, or cargo requirements and run another chartering scenario.
                </p>
              </div>

              <div className="col-lg-4 text-center text-lg-end">
                <button
                  className="btn btn-light btn-lg px-4 py-2 fw-semibold text-dark shadow-sm rounded-pill"
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