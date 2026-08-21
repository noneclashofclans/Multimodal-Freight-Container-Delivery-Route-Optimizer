import React from "react";
import Navbar from '../components/Navbar';

const About = () => {
  const features = [
    {
      icon: "🚛",
      title: "Fleet Optimisation",
      text: "Assign freight loads to trucks based on capacity, availability and operating cost."
    },
    {
      icon: "📦",
      title: "Load Consolidation",
      text: "Group compatible shipments and improve truck utilisation while reducing empty running."
    },
    {
      icon: "🗺️",
      title: "Route Optimisation",
      text: "Sequence multiple pickup and delivery stops to minimise distance, time and fuel."
    },
    {
      icon: "🚆",
      title: "Multimodal Planning",
      text: "Compare truck-only routes with rail and truck combinations for long-distance freight."
    },
    {
      icon: "📡",
      title: "Live Tracking",
      text: "Monitor trucks and routes in real time and respond to changes during delivery."
    },
    {
      icon: "🌱",
      title: "Sustainable Logistics",
      text: "Estimate fuel consumption and emissions to make environmentally efficient decisions."
    }
  ];

  return (
    <main>

        <Navbar></Navbar>

      {/* HERO */}
      <section
        className="py-5"
        style={{
          background:
            "linear-gradient(135deg, #fff8dc, #ffffff)"
        }}
      >
        <div className="container py-5">

          <div className="row align-items-center g-5">

            <div className="col-lg-7">

              <span className="badge rounded-pill bg-warning-subtle
                text-warning-emphasis px-3 py-2 mb-3">
                ABOUT THE PROJECT
              </span>

              <h1 className="display-4 fw-bold">
                Smarter freight.
                <br />
                <span className="text-warning">
                  Optimised journeys.
                </span>
              </h1>

              <p className="lead text-secondary mt-4">
                Multimodal Freight Container Delivery Route Optimizer
                is a logistics optimisation platform designed to help
                businesses plan efficient freight transportation.
              </p>

              <p className="text-secondary">
                The system combines fleet management, load assignment,
                route optimisation and multimodal transportation
                decisions to create cost-efficient and practical
                delivery plans.
              </p>

            </div>


            <div className="col-lg-5">

              <div className="card border-0 shadow-lg rounded-4">

                <div className="card-body p-4">

                  <small className="text-secondary fw-semibold">
                    PROJECT FOCUS
                  </small>

                  <h4 className="fw-bold mt-2">
                    End-to-end freight optimisation
                  </h4>

                  <div className="mt-4">

                    <div className="d-flex justify-content-between
                      border-bottom py-3">

                      <span className="text-secondary">
                        Fleet
                      </span>

                      <strong>
                        Multi-truck
                      </strong>

                    </div>

                    <div className="d-flex justify-content-between
                      border-bottom py-3">

                      <span className="text-secondary">
                        Freight
                      </span>

                      <strong>
                        Containerised
                      </strong>

                    </div>

                    <div className="d-flex justify-content-between
                      border-bottom py-3">

                      <span className="text-secondary">
                        Mode
                      </span>

                      <strong>
                        Via Road
                      </strong>

                    </div>

                    <div className="d-flex justify-content-between
                      py-3">

                      <span className="text-secondary">
                        Goal
                      </span>

                      <strong className="text-warning">
                        Minimum Cost
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
                THE PROBLEM
              </small>

              <h2 className="fw-bold display-6 mt-2">
                Freight planning is a
                <br />
                complex optimisation problem.
              </h2>

            </div>

            <div className="col-lg-6">

              <p className="text-secondary">
                A shipment may have multiple pickup and delivery
                points, while trucks have limited weight and volume
                capacities. Different routes can also have very
                different costs, travel times and fuel requirements.
              </p>

              <p className="text-secondary">
                Manually deciding which truck should carry which
                loads and in what order the stops should be visited
                can result in unnecessary distance, poor capacity
                utilisation and higher operating costs.
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
              From freight orders to optimised routes.
            </h2>

            <p className="text-secondary">
              The optimisation engine works through multiple stages.
            </p>

          </div>


          <div className="row g-4">

            {[
              [
                "01",
                "Load Assignment",
                "Freight orders are assigned to suitable trucks while respecting weight and volume capacity."
              ],
              [
                "02",
                "Route Sequencing",
                "Stops are arranged using route optimisation techniques to reduce unnecessary travel."
              ],
              [
                "03",
                "Multimodal Comparison",
                "Long-distance routes can be compared against rail plus road alternatives."
              ],
              [
                "04",
                "Performance Analysis",
                "The final plan is evaluated using distance, cost, ETA, utilisation and emissions."
              ]
            ].map(([number, title, text]) => (

              <div className="col-md-6" key={number}>

                <div className="card border-0 rounded-4 h-100">

                  <div className="card-body p-4">

                    <div className="d-flex gap-3">

                      <div
                        className="bg-warning text-white rounded-circle
                          d-flex align-items-center justify-content-center
                          fw-bold flex-shrink-0"
                        style={{
                          width: "48px",
                          height: "48px"
                        }}
                      >
                        {number}
                      </div>

                      <div>

                        <h5 className="fw-bold">
                          {title}
                        </h5>

                        <p className="text-secondary mb-0">
                          {text}
                        </p>

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
              Built for real freight operations.
            </h2>

          </div>


          <div className="row g-4">

            {features.map((feature) => (

              <div
                className="col-md-6 col-lg-4"
                key={feature.title}
              >

                <div className="card border-0 bg-light rounded-4 h-100">

                  <div className="card-body p-4">

                    <div className="fs-1 mb-3">
                      {feature.icon}
                    </div>

                    <h5 className="fw-bold">
                      {feature.title}
                    </h5>

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


      {/* TECHNOLOGY */}

      <section
        className="py-5"
        style={{ backgroundColor: "#fff8dc" }}
      >

        <div className="container py-5">

          <div className="row align-items-center g-5">

            <div className="col-lg-6">

              <small className="text-warning fw-bold">
                TECHNOLOGY
              </small>

              <h2 className="fw-bold display-6 mt-2">
                A full-stack optimisation platform.
              </h2>

              <p className="text-secondary mt-3">
                The system combines a modern web application with
                optimisation algorithms and real-time logistics data.
              </p>

            </div>

            <div className="col-lg-6">

              <div className="d-flex flex-wrap gap-2">

                {[
                  "React",
                  "Bootstrap CSS",
                  "Node.js",
                  "Express",
                  "MongoDB",
                  "Socket.IO"
                ].map((tech) => (

                  <span
                    key={tech}
                    className="badge bg-white text-dark border
                      rounded-pill px-3 py-2"
                  >
                    {tech}
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
              WHAT WE OPTIMISE
            </small>

            <h2 className="fw-bold mt-2">
              Decisions backed by measurable results.
            </h2>

          </div>

          <div className="row g-4 text-center">

            {[
              ["↓", "Total Distance", "Reduce unnecessary vehicle movement"],
              ["₹", "Transportation Cost", "Find more cost-efficient routes"],
              ["%", "Truck Utilisation", "Improve available capacity usage"],
              ["🌱", "CO₂ Emissions", "Estimate and reduce environmental impact"]
            ].map(([icon, title, text]) => (

              <div className="col-6 col-lg-3" key={title}>

                <div className="p-3">

                  <div className="fs-2 text-warning">
                    {icon}
                  </div>

                  <h5 className="fw-bold mt-2">
                    {title}
                  </h5>

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
                  Ready to optimise your next shipment?
                </h2>

                <p className="mb-0 opacity-75">
                  Build an efficient freight route based on
                  capacity, cost, distance and delivery requirements.
                </p>

              </div>

              <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">

                <button className="btn btn-light btn-lg px-4 fw-semibold">
                  Optimise a Route →
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