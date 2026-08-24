import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    organization: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await fetch("http://localhost:7000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          organization: form.organization,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      alert("Server connection failed");
    }
  };

  return (
    <div>
      <Navbar />

      <main
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg,#fff8dc,#ffffff)",
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
                    <p className="text-secondary">
                      Join the Intelligent Freight Forecasting Platform
                    </p>
                  </div>

                  <form onSubmit={handleRegister}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Full Name
                      </label>
                      <input
                        name="fullName"
                        className="form-control form-control-lg"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Organization
                      </label>
                      <input
                        name="organization"
                        className="form-control form-control-lg"
                        value={form.organization}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Business Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control form-control-lg"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          className="form-control form-control-lg"
                          value={form.password}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          className="form-control form-control-lg"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <button className="btn btn-warning w-100 btn-lg fw-semibold mt-2">
                      Create Dashboard Account
                    </button>
                  </form>

                  <hr />

                  <p className="text-center text-secondary">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-warning fw-semibold text-decoration-none"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;