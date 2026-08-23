import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📈",
      title: "Freight Rate Forecasting",
      text: "Analyze historical freight trends across major overseas trade routes into India’s East Coast."
    },
    {
      icon: "⏱️",
      title: "Charter Timing Intelligence",
      text: "Identify favorable windows for locking short and mid-term vessel charter contracts."
    },
    {
      icon: "🚢",
      title: "Vessel Selection",
      text: "Recommend Handysize, Supramax, Panamax or Capesize vessels based on cargo and port constraints."
    },
    {
      icon: "⚓",
      title: "Port Infrastructure Analysis",
      text: "Evaluate draft, LOA, beam and cargo handling compatibility for loading and discharge ports."
    },
    {
      icon: "🔄",
      title: "Idle Voyage Optimization",
      text: "Reduce deadheading by suggesting efficient vessel deployment between consecutive voyages."
    },
    {
      icon: "⚠️",
      title: "Market Risk Monitoring",
      text: "Receive early warnings for freight volatility, congestion and operational disruptions."
    }
  ];

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section
        className="py-5"
        style={{
          background: "linear-gradient(135deg,#fff8dc,#ffffff)"
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2 mb-3">
                ABOUT THE PROJECT
              </span>

              <h1 className="display-4 fw-bold">
                Intelligent Freight Forecasting
                <br />
                <span className="text-warning">
                  for Optimized Vessel Chartering
                </span>
              </h1>

              <p className="lead text-secondary mt-4">
                A decision-support platform designed for logistics managers and
                procurement teams handling overseas bulk cargo imports to India’s
                East Coast ports.
              </p>

              <p className="text-secondary">
                The system combines freight market analysis, AI-assisted
                reasoning, vessel recommendation and port infrastructure
                intelligence to support proactive chartering decisions instead of
                reactive daily market engagement.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-4">
                  <small className="text-secondary fw-semibold">
                    PROJECT FOCUS
                  </small>

                  <h4 className="fw-bold mt-2">
                    Bulk Cargo Procurement Intelligence
                  </h4>

                  <div className="mt-4">
                    <div className="d-flex justify-content-between border-bottom py-3">
                      <span className="text-secondary">Cargo</span>
                      <strong>Coal & Bulk Commodities</strong>
                    </div>

                    <div className="d-flex justify-content-between border-bottom py-3">
                      <span className="text-secondary">Vessels</span>
                      <strong>Handysize → Capesize</strong>
                    </div>

                    

                    <div className="d-flex justify-content-between py-3">
                      <span className="text-secondary">Objective</span>
                      <strong className="text-warning">
                        Smarter Charter Decisions
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <small className="text-warning fw-bold">
                THE CHALLENGE
              </small>

              <h2 className="fw-bold display-6 mt-2">
                Vessel chartering is often driven by daily market uncertainty.
              </h2>
            </div>

            <div className="col-lg-6">
              <p className="text-secondary">
                Procurement teams importing coal and other bulk commodities must
                continuously monitor volatile freight markets, changing vessel
                availability, port congestion and fluctuating charter rates across
                international trade routes.
              </p>

              <p className="text-secondary">
                Traditional decision-making is largely reactive, relying on daily
                market observations rather than structured historical analysis,
                making it difficult to consistently secure cost-effective charter
                contracts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-5"
        style={{ backgroundColor: "#fff8dc" }}
      >
        <div className="container py-5">
          <div className="text-center mb-5">
            <small className="text-warning fw-bold">
              OUR APPROACH
            </small>

            <h2 className="fw-bold mt-2">
              From reactive procurement to predictive chartering.
            </h2>

            <p className="text-secondary">
              AI-assisted reasoning layered on historical freight market data.
            </p>
          </div>

          <div className="row g-4">
            {[
              [
                "01",
                "Collect Market Intelligence",
                "Aggregate freight rate trends across Australia, Indonesia, Mozambique, Russia and the United States trade corridors."
              ],
              [
                "02",
                "Forecast Rate Movements",
                "Analyze historical patterns and generate intelligent freight trend insights for upcoming charter decisions."
              ],
              [
                "03",
                "Evaluate Vessel & Port Fit",
                "Match cargo volume with suitable vessel classes while respecting draft, LOA, beam and handling capacity."
              ],
              [
                "04",
                "Recommend Charter Strategy",
                "Provide optimal market entry timing, risk alerts and operational recommendations for procurement teams."
              ]
            ].map(([number, title, text]) => (
              <div className="col-md-6" key={number}>
                <div className="card border-0 rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex gap-3">
                      <div
                        className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{
                          width: "48px",
                          height: "48px"
                        }}
                      >
                        {number}
                      </div>

                      <div>
                        <h5 className="fw-bold">{title}</h5>
                        <p className="text-secondary mb-0">{text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <small className="text-warning fw-bold">
              CORE CAPABILITIES
            </small>

            <h2 className="fw-bold mt-2">
              Built for bulk cargo logistics operations.
            </h2>
          </div>

          <div className="row g-4">
            {features.map((feature) => (
              <div className="col-md-6 col-lg-4" key={feature.title}>
                <div className="card border-0 bg-light rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="fs-1 mb-3">{feature.icon}</div>

                    <h5 className="fw-bold">{feature.title}</h5>

                    <p className="text-secondary small mb-0">
                      {feature.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EAST COAST PORTS */}
      <section
        className="py-5"
        style={{ backgroundColor: "#fff8dc" }}
      >
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <small className="text-warning fw-bold">
                OPERATIONAL COVERAGE
              </small>

              <h2 className="fw-bold display-6 mt-2">
                Supporting procurement across India’s East Coast.
              </h2>

              <p className="text-secondary mt-3">
                The platform focuses on overseas bulk cargo movements into the
                country’s major eastern ports, enabling port-aware vessel
                selection and discharge planning.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="d-flex flex-wrap gap-2">
                {[
                  "Paradip",
                  "Visakhapatnam",
                  "Gangavaram",
                  "Gopalpur",
                  "Dhamra",
                  "Sagar-Sandheads",
                  "Haldia"
                ].map((port) => (
                  <span
                    key={port}
                    className="badge bg-white text-dark border rounded-pill px-3 py-2"
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="text-center mb-5">
            <small className="text-warning fw-bold">
              DECISION INTELLIGENCE
            </small>

            <h2 className="fw-bold mt-2">
              The platform helps optimize strategic procurement decisions.
            </h2>
          </div>

          <div className="row g-4 text-center">
            {[
              ["📈", "Freight Cost", "Track market rate movements"],
              ["🚢", "Vessel Selection", "Match cargo with suitable carriers"],
              ["⚓", "Port Readiness", "Respect infrastructure limitations"],
              ["⚠️", "Operational Risk", "Identify volatility and congestion"]
            ].map(([icon, title, text]) => (
              <div className="col-6 col-lg-3" key={title}>
                <div className="p-3">
                  <div className="fs-2 text-warning">{icon}</div>

                  <h5 className="fw-bold mt-2">{title}</h5>

                  <p className="text-secondary small">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5">
        <div className="container">
          <div
            className="rounded-4 p-5 text-white"
            style={{
              background:
                "linear-gradient(135deg,#c99400,#f0b900)"
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 className="fw-bold">
                  Ready to make data-driven chartering decisions?
                </h2>

                <p className="mb-0 opacity-75">
                  Access freight market intelligence, vessel recommendations and
                  procurement insights from one integrated logistics dashboard.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                <button
                  className="btn btn-light btn-lg px-4 fw-semibold"
                  onClick={() => navigate("/forecast_results")}
                >
                  Open Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;