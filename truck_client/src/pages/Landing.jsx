import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section
        className="py-5"
        style={{
          background: "linear-gradient(135deg,#fff8dc,#ffffff)",
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold">
                Intelligent Freight Forecasting
                <br />
                <span className="text-warning">
                  for Smarter Vessel Chartering
                </span>
              </h1>

              <p className="lead text-secondary mt-4">
                A decision-support platform that helps procurement and logistics
                teams forecast freight trends, identify the best chartering
                window, and optimize bulk cargo imports to India’s East Coast
                ports.
              </p>

              <div className="d-flex gap-3 mt-4">
                <button
                  className="btn btn-warning btn-lg px-4"
                  onClick={() => navigate("/forecast_query")}
                >
                  Open Dashboard →
                </button>

                <button className="btn btn-outline-dark btn-lg px-4">
                  Learn More
                </button>
              </div>

              <div className="row mt-5">
                <div className="col-4">
                  <h4 className="fw-bold text-warning">7</h4>
                  <small className="text-secondary">
                    East Coast Ports
                  </small>
                </div>

                <div className="col-4">
                  <h4 className="fw-bold text-warning">4</h4>
                  <small className="text-secondary">
                    Bulk Carrier Types
                  </small>
                </div>

                <div className="col-4">
                  <h4 className="fw-bold text-warning">6</h4>
                  <small className="text-secondary">
                    Major Trade Routes
                  </small>
                </div>
              </div>
            </div>

            {/* DASHBOARD CARD */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between">
                    <div>
                      <small className="text-secondary">
                        FREIGHT MARKET SNAPSHOT
                      </small>
                      <h4 className="fw-bold">
                        Australia → Paradip
                      </h4>
                    </div>

                    <span className="badge bg-success-subtle text-success rounded-pill h-25">
                      ● Forecast Stable
                    </span>
                  </div>

                  <div
                    className="rounded-4 my-4 p-4"
                    style={{
                      height: "230px",
                      backgroundColor: "#f8f8f2",
                    }}
                  >
                    <div className="h-100 d-flex flex-column justify-content-center">
                      <div className="d-flex justify-content-between mb-3">
                        <strong>Loading</strong>
                        <strong>Discharge</strong>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-center">
                          <div
                            className="bg-warning rounded-circle mx-auto mb-2"
                            style={{ width: 18, height: 18 }}
                          />
                          <small>Newcastle</small>
                        </div>

                        <div className="flex-grow-1 mx-3">
                          <div className="text-center mb-2">🚢 Panamax</div>
                          <hr className="border-warning border-3" />
                        </div>

                        <div className="text-center">
                          <div
                            className="bg-warning rounded-circle mx-auto mb-2"
                            style={{ width: 18, height: 18 }}
                          />
                          <small>Paradip</small>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <small className="text-secondary">
                          AI Recommendation
                        </small>
                        <h5 className="fw-bold text-success mt-1">
                          Lock Charter in 5–7 Days
                        </h5>
                      </div>
                    </div>
                  </div>

                  <div className="row text-center border-top pt-3">
                    <div className="col-4">
                      <small className="text-secondary d-block">
                        Vessel
                      </small>
                      <strong>Panamax</strong>
                    </div>

                    <div className="col-4 border-start border-end">
                      <small className="text-secondary d-block">
                        Cargo
                      </small>
                      <strong>72,000 MT</strong>
                    </div>

                    <div className="col-4">
                      <small className="text-secondary d-block">
                        Risk
                      </small>
                      <strong className="text-success">Low</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-5 bg-white" id="features">
        <div className="container py-4">
          <div className="text-center mb-5">
            <small className="text-warning fw-bold">
              DECISION SUPPORT FEATURES
            </small>

            <h2 className="fw-bold mt-2">
              Everything needed for intelligent bulk cargo procurement.
            </h2>

            <p className="text-secondary">
              AI-assisted reasoning layered on historical freight market trends
              for proactive chartering decisions.
            </p>
          </div>

          <div className="row g-4">
            {[
              [
                "📈",
                "Freight Trend Forecasting",
                "Monitor historical and projected freight rate movements for Handysize, Supramax, Panamax and Capesize vessels."
              ],
              [
                "⏱️",
                "Optimal Charter Timing",
                "Identify the most favorable market entry window before locking short or mid-term charter contracts."
              ],
              [
                "🚢",
                "Vessel Recommendation",
                "Recommend suitable vessel classes based on cargo volume and operational requirements."
              ],
              [
                "⚓",
                "Port Compatibility",
                "Evaluate draft, LOA, beam and cargo handling constraints across East Coast ports."
              ],
              [
                "🔄",
                "Idle-Time Reduction",
                "Minimize deadheading between voyages through voyage planning suggestions."
              ],
              [
                "⚠️",
                "Risk & Congestion Alerts",
                "Receive early warnings for freight volatility, market disruptions and port congestion."
              ],
            ].map(([icon, title, text]) => (
              <div className="col-md-6 col-lg-4" key={title}>
                <div className="card border-0 bg-light rounded-4 h-100">
                  <div className="card-body p-4">
                    <div className="fs-1 mb-3">{icon}</div>
                    <h5 className="fw-bold">{title}</h5>
                    <p className="text-secondary small mb-0">{text}</p>
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
        style={{ backgroundColor: "#fff8dc" }}
      >
        <div className="container py-4">
          <div className="text-center mb-5">
            <small className="text-warning fw-bold">
              WORKFLOW
            </small>

            <h2 className="fw-bold mt-2">
              Forecast. Evaluate. Charter.
            </h2>
          </div>

          <div className="row g-4 text-center">
            {[
              [
                "01",
                "Select Trade Route",
                "Choose loading and discharge ports across Australia, Indonesia, Mozambique, Russia, the US and India."
              ],
              [
                "02",
                "Analyze Freight Market",
                "Review freight trends, vessel availability and AI-generated charter timing recommendations."
              ],
              [
                "03",
                "Finalize Charter Strategy",
                "Select the optimal vessel and reduce operational risk before procurement decisions."
              ],
            ].map(([number, title, text]) => (
              <div className="col-md-4" key={number}>
                <div className="p-4">
                  <div
                    className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold"
                    style={{
                      width: "60px",
                      height: "60px",
                    }}
                  >
                    {number}
                  </div>

                  <h5 className="fw-bold">{title}</h5>
                  <p className="text-secondary small">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 bg-white">
        <div className="container">
          <div
            className="rounded-4 p-5 text-white"
            style={{
              background:
                "linear-gradient(135deg,#c99400,#f0b900)",
            }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <small className="fw-bold">
                  BULK FREIGHT INTELLIGENCE
                </small>

                <h2 className="fw-bold mt-2">
                  Make proactive chartering decisions backed by freight analytics.
                </h2>

                <p className="mb-0 opacity-75">
                  Built for logistics managers and procurement teams handling
                  overseas bulk cargo imports into India’s East Coast.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                <button
                  className="btn btn-light btn-lg px-4"
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
      <footer className="bg-dark text-white py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <small>
              © 2026 Intelligent Freight Forecasting System
            </small>

            <div className="d-flex gap-4">
              <small>Privacy</small>
              <small>Terms</small>
              <small>Contact</small>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;  