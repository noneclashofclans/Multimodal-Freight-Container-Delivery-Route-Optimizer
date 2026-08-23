import React from "react";
import Navbar from "../components/Navbar";

const Register = () => {
  return (
    <div>
      <Navbar />

      <main
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #fff8dc, #ffffff)",
        }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="display-5 mb-3">⚓</div>

                    <h2 className="fw-bold">Create Your Account</h2>

                    <p className="text-secondary mb-0">
                      Join the Intelligent Freight Forecasting Platform
                    </p>
                  </div>

                  <form>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Full Name
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Organization
                      </label>

                      <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Shipping, logistics or procurement company"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Business Email
                      </label>

                      <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="procurement@company.com"
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Password
                        </label>

                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="Create password"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Confirm Password
                        </label>

                        <input
                          type="password"
                          className="form-control form-control-lg"
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>

                    <button className="btn btn-warning w-100 btn-lg fw-semibold mt-2">
                      Create Dashboard Account
                    </button>
                  </form>

                  <hr className="my-4" />

                  <p className="text-center mb-0 text-secondary">
                    Already have an account?{" "}
                    <a
                      href="/login"
                      className="text-warning text-decoration-none fw-semibold"
                    >
                      Sign In
                    </a>
                  </p>
                </div>
              </div>

              <p className="text-center text-muted mt-3 small">
                © 2026 Intelligent Freight Forecasting System for Optimized
                Vessel Chartering
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;