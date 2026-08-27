import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const handleLandingPageForecast = () => {
  const user = localStorage.getItem("token");

  if (!user) {
    alert("Kindly login to start");
    return;
  }

  navigate("/forecast_query");
};

  const navigate = useNavigate();


  return (
    <main
      style={{ backgroundColor: "#070d18", minHeight: "100vh" }}
      className="text-white"
    >
      <Navbar />

      {/* HERO */}
      <section
        className="py-5"
        style={{ backgroundColor: "#070d18" }}
      >
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold text-white">
                Intelligent Freight Forecasting
                <br />
                <span style={{ color: "#38bdf8" }}>
                  for Smarter Vessel Chartering
                </span>
              </h1>

              <p
                className="lead mt-4"
                style={{ color: "#8492a6", maxWidth: "600px" }}
              >
                A decision-support platform that helps procurement and logistics
                teams forecast freight trends, identify the best chartering
                window, and optimize bulk cargo imports to India’s East Coast
                ports.
              </p>

              <div className="d-flex gap-3 mt-4">
                {handleLandingPageForecast }
                <button
                  className="btn btn-lg px-4 fw-bold text-white rounded-3"
                  style={{ backgroundColor: "#1e88e5" }}
                  onClick={handleLandingPageForecast}
                >
                  Start Forecast →
                </button>

                <button
                  className="btn btn-lg px-4 rounded-3"
                  style={{
                    color: "#8492a6",
                    backgroundColor: "transparent",
                    border: "1px solid #1b2a3f",
                  }}
                >
                  View Demo
                </button>
              </div>

              <div className="row mt-5">
                <div className="col-4">
                  <h4 className="fw-bold" style={{ color: "#38bdf8" }}>7</h4>
                  <small style={{ color: "#64748b" }}>
                    East Coast Ports
                  </small>
                </div>

                <div className="col-4">
                  <h4 className="fw-bold" style={{ color: "#38bdf8" }}>4</h4>
                  <small style={{ color: "#64748b" }}>
                    Bulk Carrier Types
                  </small>
                </div>

                <div className="col-4">
                  <h4 className="fw-bold" style={{ color: "#38bdf8" }}>6</h4>
                  <small style={{ color: "#64748b" }}>
                    Major Trade Routes
                  </small>
                </div>
              </div>
            </div>

            {/* DASHBOARD CARD */}
            <div className="col-lg-6">
              <div
                className="card border-0 shadow-lg rounded-4 p-2"
                style={{
                  backgroundColor: "#0b1320",
                  border: "1px solid #162234",
                }}
              >
                <div className="card-body p-4 text-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small
                        className="text-uppercase fw-bold tracking-wider"
                        style={{ color: "#8492a6", fontSize: "0.7rem" }}
                      >
                        FREIGHT MARKET SNAPSHOT
                      </small>
                      <h4 className="fw-bold mt-1 text-white">
                        Australia → Paradip
                      </h4>
                    </div>

                    <span
                      className="badge rounded-pill px-3 py-2"
                      style={{
                        backgroundColor: "rgba(74, 222, 128, 0.15)",
                        color: "#4ade80",
                      }}
                    >
                      ● Forecast Stable
                    </span>
                  </div>

                  <div
                    className="rounded-4 my-4 p-4"
                    style={{
                      height: "230px",
                      backgroundColor: "#070d18",
                      border: "1px solid #162234",
                    }}
                  >
                    <div className="h-100 d-flex flex-column justify-content-center">
                      <div className="d-flex justify-content-between mb-3">
                        <strong style={{ color: "#8492a6" }}>Loading</strong>
                        <strong style={{ color: "#8492a6" }}>Discharge</strong>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-center">
                          <div
                            className="rounded-circle mx-auto mb-2"
                            style={{
                              width: 18,
                              height: 18,
                              backgroundColor: "#1e88e5",
                            }}
                          />
                          <small className="text-white">Newcastle</small>
                        </div>

                        <div className="flex-grow-1 mx-3">
                          <div className="text-center mb-2 text-white">
                            🚢 Panamax
                          </div>
                          <hr
                            className="border-3 opacity-100"
                            style={{ borderColor: "#1e88e5" }}
                          />
                        </div>

                        <div className="text-center">
                          <div
                            className="rounded-circle mx-auto mb-2"
                            style={{
                              width: 18,
                              height: 18,
                              backgroundColor: "#1e88e5",
                            }}
                          />
                          <small className="text-white">Paradip</small>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <small style={{ color: "#64748b" }}>
                          AI Recommendation
                        </small>
                        <h5 className="fw-bold mt-1" style={{ color: "#4ade80" }}>
                          Lock Charter in 5–7 Days
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div
                    className="row text-center pt-3 border-top"
                    style={{ borderColor: "#162234 !important" }}
                  >
                    <div className="col-4">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Vessel
                      </small>
                      <strong className="text-white">Panamax</strong>
                    </div>

                    <div className="col-4 border-start border-end border-secondary border-opacity-25">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Cargo
                      </small>
                      <strong className="text-white">72,000 MT</strong>
                    </div>

                    <div className="col-4">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Risk
                      </small>
                      <strong style={{ color: "#4ade80" }}>Low</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section
        className="py-5"
        style={{ backgroundColor: "#070d18" }}
        id="features"
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              DECISION SUPPORT FEATURES
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Everything needed for intelligent bulk cargo procurement.
            </h2>

            <p className="mx-auto" style={{ color: "#8492a6", maxWidth: "650px" }}>
              AI-assisted reasoning layered on historical freight market trends
              for proactive chartering decisions.
            </p>
          </div>

          <div className="row g-4">
            {[
              [
                "📈",
                "Freight Trend Forecasting",
                "Monitor historical and projected freight rate movements for Handysize, Supramax, Panamax and Capesize vessels.",
              ],
              [
                "⏱️",
                "Optimal Charter Timing",
                "Identify the most favorable market entry window before locking short or mid-term charter contracts.",
              ],
              [
                "🚢",
                "Vessel Recommendation",
                "Recommend suitable vessel classes based on cargo volume and operational requirements.",
              ],
              [
                "⚓",
                "Port Compatibility",
                "Evaluate draft, LOA, beam and cargo handling constraints across East Coast ports.",
              ],
              [
                "🔄",
                "Idle-Time Reduction",
                "Minimize deadheading between voyages through voyage planning suggestions.",
              ],
              [
                "⚠️",
                "Risk & Congestion Alerts",
                "Receive early warnings for freight volatility, market disruptions and port congestion.",
              ],
            ].map(([icon, title, text]) => (
              <div className="col-md-6 col-lg-4" key={title}>
                <div
                  className="card border-0 rounded-4 h-100 p-2"
                  style={{
                    backgroundColor: "#0b1320",
                    border: "1px solid #162234",
                  }}
                >
                  <div className="card-body p-4">
                    <div className="fs-1 mb-3">{icon}</div>
                    <h5 className="fw-bold text-white">{title}</h5>
                    <p className="small mb-0" style={{ color: "#8492a6" }}>
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
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
              WORKFLOW
            </small>

            <h2 className="fw-bold mt-2 text-white">
              Forecast. Evaluate. Charter.
            </h2>
          </div>

          <div className="row g-4 text-center">
            {[
              [
                "01",
                "Select Trade Route",
                "Choose loading and discharge ports across Australia, Indonesia, Mozambique, Russia, the US and India.",
              ],
              [
                "02",
                "Analyze Freight Market",
                "Review freight trends, vessel availability and AI-generated charter timing recommendations.",
              ],
              [
                "03",
                "Finalize Charter Strategy",
                "Select the optimal vessel and reduce operational risk before procurement decisions.",
              ],
            ].map(([number, title, text]) => (
              <div className="col-md-4" key={number}>
                <div className="p-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold text-white shadow"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#1e88e5",
                    }}
                  >
                    {number}
                  </div>

                  <h5 className="fw-bold text-white">{title}</h5>
                  <p className="small" style={{ color: "#8492a6" }}>
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5" style={{ backgroundColor: "#070d18" }}>
        <div className="container py-4">
          <div
            className="rounded-4 p-5 text-white"
            style={{
              backgroundColor: "#0b1320",
              border: "1px solid #1e88e5",
              backgroundImage:
                "linear-gradient(135deg, rgba(30,136,229,0.1), rgba(11,19,32,1))",
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <small
                  className="text-uppercase fw-bold tracking-wider"
                  style={{ color: "#38bdf8", fontSize: "0.75rem" }}
                >
                  BULK FREIGHT INTELLIGENCE
                </small>

                <h2 className="fw-bold mt-2 text-white">
                  Make proactive chartering decisions backed by freight
                  analytics.
                </h2>

                <p className="mb-0" style={{ color: "#8492a6" }}>
                  Built for logistics managers and procurement teams handling
                  overseas bulk cargo imports into India’s East Coast.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                <button
                  className="btn btn-lg px-4 fw-bold text-white rounded-3"
                  style={{ backgroundColor: "#1e88e5" }}
                  onClick={() => navigate("/forecast_query")}
                >
                  Launch Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="py-4"
        style={{
          backgroundColor: "#050a10",
          borderTop: "1px solid #162234",
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <small style={{ color: "#64748b" }}>
              © 2026 Intelligent Freight Forecasting System
            </small>

            <div className="d-flex gap-4">
              <small
                style={{ color: "#8492a6", cursor: "pointer" }}
                className="hover-opacity"
              >
                Privacy
              </small>
              <small
                style={{ color: "#8492a6", cursor: "pointer" }}
                className="hover-opacity"
              >
                Terms
              </small>
              <small
                style={{ color: "#8492a6", cursor: "pointer" }}
                className="hover-opacity"
              >
                Contact
              </small>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;