import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

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
    <>
      <Navbar />

      <section
        className="min-vh-100 py-5"
        style={{
          background: "linear-gradient(135deg,#fff8dc,#ffffff)",
        }}
      >
        <div className="container">

          <div className="text-center mb-5">
            <small className="text-warning fw-bold">
              FREIGHT INTELLIGENCE
            </small>

            <h1 className="fw-bold mt-2">
              New Freight Forecast
            </h1>

            <p className="text-secondary mx-auto" style={{maxWidth:"650px"}}>
              Enter the trade lane, cargo details and contract duration to
              generate an AI-powered freight rate forecast and vessel
              recommendation.
            </p>
          </div>

          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-4 p-lg-5">

              <form onSubmit={handleSubmit}>

                {/* Trade Route */}

                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle bg-warning d-flex align-items-center justify-content-center me-3"
                    style={{width:"42px",height:"42px"}}
                  >
                    🚢
                  </div>
                  <h4 className="fw-bold mb-0">Trade Route</h4>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Origin Country
                    </label>
                    <select
                      className="form-select py-2"
                      name="origin"
                      value={formData.origin}
                      onChange={handleChange}
                      required
                      style={{cursor:"pointer"}}
                    >
                      <option value="">Select Origin</option>
                      <option>Australia</option>
                      <option>United States</option>
                      <option>Mozambique</option>
                      <option>Russia</option>
                      <option>Indonesia</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Destination Port
                    </label>
                    <select
                      className="form-select py-2"
                      name="destination"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      style={{cursor:"pointer"}}
                    >
                      <option value="">Select Port</option>
                      <option>Paradip</option>
                      <option>Visakhapatnam</option>
                      <option>Gangavaram</option>
                      <option>Gopalpur</option>
                      <option>Dhamra</option>
                      <option>Sagar Sandheads</option>
                      <option>Haldia</option>
                    </select>
                  </div>
                </div>

                <hr />

                {/* Vessel */}

                <div className="d-flex align-items-center my-4">
                  <div
                    className="rounded-circle bg-warning d-flex align-items-center justify-content-center me-3"
                    style={{width:"42px",height:"42px"}}
                  >
                    🛳️
                  </div>
                  <h4 className="fw-bold mb-0">Vessel Class</h4>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Preferred Vessel Type
                    </label>
                    <select
                      className="form-select py-2"
                      name="vesselType"
                      value={formData.vesselType}
                      onChange={handleChange}
                      required
                      style={{cursor:"pointer"}}
                    >
                      <option value="">Select Vessel Type</option>
                      <option>Handysize</option>
                      <option>Supramax</option>
                      <option>Panamax</option>
                      <option>Capesize</option>
                    </select>
                    <small className="text-secondary">
                      Not sure? Pick your best guess — the results page will
                      flag which ports it's compatible with.
                    </small>
                  </div>
                </div>

                <hr />

                {/* Cargo */}

                <div className="d-flex align-items-center my-4">
                  <div
                    className="rounded-circle bg-warning d-flex align-items-center justify-content-center me-3"
                    style={{width:"42px",height:"42px"}}
                  >
                    📦
                  </div>
                  <h4 className="fw-bold mb-0">Cargo Information</h4>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Cargo Type
                    </label>
                    <select
                      className="form-select py-2"
                      name="cargoType"
                      value={formData.cargoType}
                      onChange={handleChange}
                      required
                      style={{cursor:"pointer"}}
                    >
                      <option value="">Select Cargo</option>
                      <option>Iron Ore</option>
                      <option>Coal</option>
                      <option>Bauxite</option>
                      <option>Limestone</option>
                      <option>Fertilizer</option>
                      <option>Steel Products</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Cargo Volume (MT)
                    </label>
                    <input
                      type="number"
                      className="form-control py-2"
                      placeholder="example: 50000"
                      name="volume"
                      value={formData.volume}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <hr />

                <div className="d-flex align-items-center my-4">
                  <div
                    className="rounded-circle bg-warning d-flex align-items-center justify-content-center me-3"
                    style={{width:"42px",height:"42px"}}
                  >
                    📅
                  </div>
                  <h4 className="fw-bold mb-0">Contract Duration</h4>
                </div>

                <div className="row mb-4">
                  <div className="col-md-6">
                    <div
                      className={`border rounded-4 p-3 ${
                        formData.duration==="short-term"
                          ? "border-warning border-2"
                          : ""
                      }`}
                    >
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          style={{cursor:"pointer"}}
                          name="duration"
                          value="short-term"
                          checked={formData.duration==="short-term"}
                          onChange={handleChange}
                        />
                        <label className="form-check-label fw-bold">
                          Short-Term
                        </label>
                      </div>
                      <small className="text-secondary">
                        Ideal for immediate procurement decisions.
                      </small>
                    </div>
                  </div>

                  <div className="col-md-6 mt-3 mt-md-0">
                    <div
                      className={`border rounded-4 p-3 ${
                        formData.duration==="mid-term"
                          ? "border-warning border-2"
                          : ""
                      }`}
                    >
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          style={{cursor:"pointer"}}
                          name="duration"
                          value="mid-term"
                          checked={formData.duration==="mid-term"}
                          onChange={handleChange}
                        />
                        <label className="form-check-label fw-bold" style={{cursor:"pointer"}}>
                          Mid-Term
                        </label>
                      </div>
                      <small className="text-secondary">
                        Better for strategic charter planning.
                      </small>
                    </div>
                  </div>
                </div>

                {/* Summary */}

                <div
                  className="rounded-4 p-3 mb-4"
                  style={{background:"#f8f8f2"}}
                >
                  <div className="row text-center">
                    <div className="col-4">
                      <small className="text-secondary d-block">Origin</small>
                      <strong>{formData.origin || "—"}</strong>
                    </div>

                    <div className="col-4">
                      <small className="text-secondary d-block">Destination</small>
                      <strong>{formData.destination || "—"}</strong>
                    </div>

                    <div className="col-4">
                      <small className="text-secondary d-block">Volume</small>
                      <strong>{formData.volume || 0} MT</strong>
                    </div>
                  </div>
                </div>

                <div className="d-grid">
                  <button className="btn btn-warning btn-lg fw-bold py-3">
                    Generate Forecast →
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ForecastQuery;