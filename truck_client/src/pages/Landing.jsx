import React from "react";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <main>
        <Navbar></Navbar>
      {/* HERO */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg,#fff8dc,#ffffff)",
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center g-5">

            <div className="col-lg-6">
              <h1 className="display-3 fw-bold">
                Smarter routes.
                <br />
                <span className="text-warning">
                  Faster deliveries.
                </span>
              </h1>

              <p className="lead text-secondary mt-4">
                Optimise container transportation across road, rail,
                sea and air with intelligent multimodal route planning.
              </p>

              <div className="d-flex gap-3 mt-4">
                <button className="btn btn-warning btn-lg px-4">
                  Optimise Route →
                </button>

                <button className="btn btn-outline-dark btn-lg px-4">
                  Learn More
                </button>
              </div>

              <div className="row mt-5">
                <div className="col-4">
                  <h4 className="fw-bold text-warning">25%</h4>
                  <small className="text-secondary">
                    Cost Reduction
                  </small>
                </div>

                <div className="col-4">
                  <h4 className="fw-bold text-warning">35%</h4>
                  <small className="text-secondary">
                    Faster Delivery
                  </small>
                </div>

                <div className="col-4">
                  <h4 className="fw-bold text-warning">4+</h4>
                  <small className="text-secondary">
                    Transport Modes
                  </small>
                </div>
              </div>
            </div>


            {/* ROUTE CARD */}
            <div className="col-lg-6">

              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-4">

                  <div className="d-flex justify-content-between">
                    <div>
                      <small className="text-secondary">
                        OPTIMISED ROUTE
                      </small>

                      <h4 className="fw-bold">
                        Mumbai → Delhi
                      </h4>
                    </div>

                    <span className="badge bg-success-subtle
                      text-success rounded-pill h-25">
                      ● Active
                    </span>
                  </div>

                  <div
                    className="rounded-4 my-4 p-4"
                    style={{
                      height: "230px",
                      backgroundColor: "#f8f8f2",
                      backgroundImage:
                        "linear-gradient(#e5e5dd 1px,transparent 1px)," +
                        "linear-gradient(90deg,#e5e5dd 1px,transparent 1px)",
                      backgroundSize: "35px 35px",
                    }}
                  >

                    <div className="d-flex justify-content-between
                      align-items-center h-100">

                      <div className="text-center">
                        <div className="bg-warning rounded-circle
                          mx-auto mb-2"
                          style={{
                            width: "18px",
                            height: "18px",
                          }}
                        />
                        <small className="fw-bold">Mumbai</small>
                      </div>

                      <div className="flex-grow-1 mx-3">

                        <div className="d-flex justify-content-around
                          fs-5 mb-2">
                          <span>🚢</span>
                          <span>🚆</span>
                          <span>🚛</span>
                        </div>

                        <hr className="border-warning border-3" />
                      </div>

                      <div className="text-center">
                        <div className="bg-warning rounded-circle
                          mx-auto mb-2"
                          style={{
                            width: "18px",
                            height: "18px",
                          }}
                        />
                        <small className="fw-bold">Delhi</small>
                      </div>

                    </div>
                  </div>

                  <div className="row text-center border-top pt-3">
                    <div className="col-4">
                      <small className="text-secondary d-block">
                        Distance
                      </small>
                      <strong>1,420 km</strong>
                    </div>

                    <div className="col-4 border-start border-end">
                      <small className="text-secondary d-block">
                        ETA
                      </small>
                      <strong>28h 40m</strong>
                    </div>

                    <div className="col-4">
                      <small className="text-secondary d-block">
                        CO₂ Saved
                      </small>
                      <strong className="text-success">18.4%</strong>
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
              POWERFUL FEATURES
            </small>

            <h2 className="fw-bold mt-2">
              Everything you need to optimise freight.
            </h2>

            <p className="text-secondary">
              One intelligent platform for your entire delivery journey.
            </p>
          </div>

          <div className="row g-4">

            {[
              ["🚛", "Multimodal Routing",
                "Combine road, rail, sea and air into one efficient route."],

              ["🧠", "AI Optimisation",
                "Compare routes using cost, time and environmental impact."],

              ["📍", "Real-Time Tracking",
                "Monitor your container throughout its journey."],

              ["🌱", "Green Logistics",
                "Reduce fuel consumption and carbon emissions."]
            ].map(([icon, title, text]) => (

              <div className="col-md-6 col-lg-3" key={title}>
                <div className="card border-0 bg-light rounded-4 h-100">
                  <div className="card-body p-4">

                    <div className="fs-1 mb-3">
                      {icon}
                    </div>

                    <h5 className="fw-bold">
                      {title}
                    </h5>

                    <p className="text-secondary small mb-0">
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
        style={{ backgroundColor: "#fff8dc" }}
      >
        <div className="container py-4">

          <div className="text-center mb-5">
            <small className="text-warning fw-bold">
              HOW IT WORKS
            </small>

            <h2 className="fw-bold mt-2">
              Plan. Optimise. Deliver.
            </h2>
          </div>

          <div className="row g-4 text-center">

            {[
              ["01", "Enter Shipment",
                "Provide your origin, destination and container details."],

              ["02", "Optimise Route",
                "Our system evaluates multiple multimodal combinations."],

              ["03", "Track Delivery",
                "Monitor your shipment until it reaches its destination."]
            ].map(([number, title, text]) => (

              <div className="col-md-4" key={number}>

                <div className="p-4">

                  <div
                    className="bg-warning text-white rounded-circle
                      d-flex align-items-center justify-content-center
                      mx-auto mb-3 fw-bold"
                    style={{
                      width: "60px",
                      height: "60px",
                    }}
                  >
                    {number}
                  </div>

                  <h5 className="fw-bold">{title}</h5>

                  <p className="text-secondary small">
                    {text}
                  </p>

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
                  READY TO GET STARTED?
                </small>

                <h2 className="fw-bold mt-2">
                  Find the smartest route
                  for your next shipment.
                </h2>

                <p className="mb-0 opacity-75">
                  Reduce delivery time, cost and environmental impact.
                </p>
              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
                <button className="btn btn-light btn-lg px-4">
                  Start Optimising →
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="bg-dark text-white py-4">
        <div className="container">

          <div className="d-flex justify-content-between
            align-items-center flex-wrap gap-3">

            <small>
              © 2026 Freight Optimiser
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