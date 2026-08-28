import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import handysizeImg from "../assets/screenshot-2026-08-26_18-06-21.png";
import supramaxImg from "../assets/screenshot-2026-08-26_18-13-33.png";
import panamaxImg from "../assets/screenshot-2026-08-26_18-14-46.png";
import capesizeImg from "../assets/screenshot-2026-08-26_18-21-30.png";

const vesselOptions = [
  { type: "Handysize", image: handysizeImg, desc: "Up to 40,000 DWT" },
  { type: "Supramax", image: supramaxImg, desc: "Up to 60,000 DWT" },
  { type: "Panamax", image: panamaxImg, desc: "Up to 80,000 DWT" },
  { type: "Capesize", image: capesizeImg, desc: "Up to 180,000 DWT" },
];

function ForecastQuery() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    vesselType: "",
    cargoType: "",
    volume: "",
    duration: "short-term",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Map duration to a readable forecast period label for the results page
    const forecastPeriod =
      formData.duration === "short-term" ? "Next 30 Days" : "Next 90 Days";

    navigate("/forecast_results", {
      state: {
        origin: formData.origin,
        destination: formData.destination,
        vesselType: formData.vesselType,
        cargoQuantity: formData.volume,
        cargoType: formData.cargoType,
        forecastPeriod,
      },
    });
  };

  return (
    <div
      style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}
      className="text-white"
    >
      <Navbar />

      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <small
              className="text-uppercase fw-bold tracking-wider"
              style={{ color: "#38bdf8", fontSize: "0.75rem" }}
            >
              FREIGHT INTELLIGENCE
            </small>

            <h1 className="fw-bold mt-2 text-white">New Freight Forecast</h1>

            <p
              className="mx-auto"
              style={{ color: "#8492a6", maxWidth: "650px" }}
            >
              Enter the trade lane, cargo details and contract duration to
              generate an AI-powered freight rate forecast and vessel
              recommendation.
            </p>
          </div>

          <div
            className="card border-0 shadow-lg rounded-4 p-2"
            style={{
              backgroundColor: "#0b1320",
              border: "1px solid #162234",
            }}
          >
            <div className="card-body p-4 p-lg-5 text-white">
              <form onSubmit={handleSubmit}>
                {/* Trade Route */}
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 fs-5"
                    style={{
                      width: "42px",
                      height: "42px",
                      backgroundColor: "#1e88e5",
                    }}
                  >
                    🚢
                  </div>
                  <h4 className="fw-bold mb-0 text-white">Trade Route</h4>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label
                      className="form-label small fw-semibold"
                      style={{ color: "#8492a6" }}
                    >
                      Origin Country
                    </label>
                    <select
                      className="form-select py-2 text-white shadow-none"
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      required
                      style={{
                        backgroundColor: "#070d18",
                        borderColor: "#1b2a3f",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Select Origin</option>
                      <option value="Australia">Australia</option>
                      <option value="United States">United States</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Russia">Russia</option>
                      <option value="Indonesia">Indonesia</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label
                      className="form-label small fw-semibold"
                      style={{ color: "#8492a6" }}
                    >
                      Destination Port
                    </label>
                    <select
                      className="form-select py-2 text-white shadow-none"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      style={{
                        backgroundColor: "#070d18",
                        borderColor: "#1b2a3f",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Select Port</option>
                      <option value="Paradip">Paradip</option>
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Gangavaram">Gangavaram</option>
                      <option value="Gopalpur">Gopalpur</option>
                      <option value="Dhamra">Dhamra</option>
                      <option value="Sagar Sandheads">Sagar Sandheads</option>
                      <option value="Haldia">Haldia</option>
                    </select>
                  </div>
                </div>

                <hr style={{ borderColor: "#162234" }} />

                {/* Vessel */}
                <div className="d-flex align-items-center my-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 fs-5"
                    style={{
                      width: "42px",
                      height: "42px",
                      backgroundColor: "#1e88e5",
                    }}
                  >
                    🛳️
                  </div>
                  <h4 className="fw-bold mb-0 text-white">Vessel Class</h4>
                </div>

                <div className="row g-3 mb-4">
                  {vesselOptions.map((vessel) => (
                    <div className="col-6 col-md-3" key={vessel.type}>
                      <div
                        className="forecast-option vessel-option rounded-4 p-3 h-100 text-center"
                        style={{
                          backgroundColor: "#070d18",
                          border:
                            formData.vesselType === vessel.type
                              ? "2px solid #1e88e5"
                              : "1px solid #1b2a3f",
                          cursor: "pointer",
                          transition: "border-color 0.15s ease",
                        }}
                        onClick={() =>
                          setFormData({ ...formData, vesselType: vessel.type })
                        }
                      >
                        <img
                          src={vessel.image}
                          alt={vessel.type}
                          style={{
                            width: "100%",
                            height: "80px",
                            objectFit: "contain",
                            marginBottom: "0.5rem",
                          }}
                        />
                        <div className="fw-bold text-white">{vessel.type}</div>
                        <small style={{ color: "#64748b" }}>
                          {vessel.desc}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hidden input keeps native "required" validation working
                    even though selection happens via card click, not a <select> */}
                <input
                  type="hidden"
                  name="vesselType"
                  value={formData.vesselType}
                  required
                />

                <hr style={{ borderColor: "#162234" }} />

                {/* Cargo */}
                <div className="d-flex align-items-center my-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 fs-5"
                    style={{
                      width: "42px",
                      height: "42px",
                      backgroundColor: "#1e88e5",
                    }}
                  >
                    📦
                  </div>
                  <h4 className="fw-bold mb-0 text-white">Cargo Information</h4>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label
                      className="form-label small fw-semibold"
                      style={{ color: "#8492a6" }}
                    >
                      Cargo Type
                    </label>
                    <select
                      className="form-select py-2 text-white shadow-none"
                      name="cargoType"
                      value={formData.cargoType}
                      onChange={handleChange}
                      required
                      style={{
                        backgroundColor: "#070d18",
                        borderColor: "#1b2a3f",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Select Cargo</option>
                      <option value="Iron Ore">Iron Ore</option>
                      <option value="Coal">Coal</option>
                      <option value="Bauxite">Bauxite</option>
                      <option value="Limestone">Limestone</option>
                      <option value="Fertilizer">Fertilizer</option>
                      <option value="Steel Products">Steel Products</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label
                      className="form-label small fw-semibold"
                      style={{ color: "#8492a6" }}
                    >
                      Cargo Volume (MT)
                    </label>
                    <input
                      type="number"
                      className="form-control py-2 text-white shadow-none"
                      placeholder="example: 50000"
                      name="volume"
                      value={formData.volume}
                      onChange={handleChange}
                      required
                      style={{
                        backgroundColor: "#070d18",
                        borderColor: "#1b2a3f",
                      }}
                    />
                  </div>
                </div>

                <hr style={{ borderColor: "#162234" }} />

                {/* Contract Duration */}
                <div className="d-flex align-items-center my-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 fs-5"
                    style={{
                      width: "42px",
                      height: "42px",
                      backgroundColor: "#1e88e5",
                    }}
                  >
                    📅
                  </div>
                  <h4 className="fw-bold mb-0 text-white">Contract Duration</h4>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div
                      className="forecast-option duration-option rounded-4 p-3"
                      style={{
                        backgroundColor: "#070d18",
                        border:
                          formData.duration === "short-term"
                            ? "2px solid #1e88e5"
                            : "1px solid #1b2a3f",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setFormData({ ...formData, duration: "short-term" })
                      }
                    >
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          style={{ cursor: "pointer" }}
                          name="duration"
                          value="short-term"
                          checked={formData.duration === "short-term"}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label fw-bold text-white"
                          style={{ cursor: "pointer" }}
                        >
                          Short-Term (1 – 3 Months)
                        </label>
                      </div>
                      <small className="d-block mt-1" style={{ color: "#64748b" }}>
                        Ideal for immediate spot rate analysis and short horizon procurement decisions.
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6 mt-3 mt-md-0">
                    <div
                      className="forecast-option duration-option rounded-4 p-3"
                      style={{
                        backgroundColor: "#070d18",
                        border:
                          formData.duration === "mid-term"
                            ? "2px solid #1e88e5"
                            : "1px solid #1b2a3f",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setFormData({ ...formData, duration: "mid-term" })
                      }
                    >
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          style={{ cursor: "pointer" }}
                          name="duration"
                          value="mid-term"
                          checked={formData.duration === "mid-term"}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label fw-bold text-white"
                          style={{ cursor: "pointer" }}
                        >
                          Mid-Term (4 – 12 Months)
                        </label>
                      </div>
                      <small className="d-block mt-1" style={{ color: "#64748b" }}>
                        Better for strategic period chartering, hedging rate volatility, and seasonal planning.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div
                  className="forecast-summary rounded-4 p-3 mb-4"
                  style={{
                    backgroundColor: "#070d18",
                    border: "1px solid #162234",
                  }}
                >
                  <div className="row text-center">
                    <div className="col-4">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Origin
                      </small>
                      <strong className="text-white">
                        {formData.origin || "—"}
                      </strong>
                    </div>

                    <div className="col-4 border-start border-end border-secondary border-opacity-25">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Destination
                      </small>
                      <strong className="text-white">
                        {formData.destination || "—"}
                      </strong>
                    </div>

                    <div className="col-4">
                      <small className="d-block" style={{ color: "#64748b" }}>
                        Volume
                      </small>
                      <strong className="text-white">
                        {formData.volume || 0} MT
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    className="btn btn-lg fw-bold py-3 text-white rounded-3"
                    style={{ backgroundColor: "#1e88e5" }}
                  >
                    Generate Forecast →
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ForecastQuery;