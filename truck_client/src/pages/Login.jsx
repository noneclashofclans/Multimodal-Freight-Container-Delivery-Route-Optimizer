import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:7000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        return alert(data.message);
      }

      // Save token & user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");
      navigate("/dashboard");
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
            <div className="col-md-8 col-lg-5">
              <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="display-5 mb-3">🚢</div>
                    <h2 className="fw-bold">Welcome Back</h2>
                    <p className="text-secondary">
                      Sign in to the Intelligent Freight Forecasting Dashboard
                    </p>
                  </div>

                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="form-control form-control-lg"
                        placeholder="procurement@company.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control form-control-lg"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <button className="btn btn-warning w-100 btn-lg fw-semibold">
                      Access Dashboard
                    </button>
                  </form>

                  <hr />

                  <p className="text-center text-secondary">
                    New to the platform?{" "}
                    <Link
                      to="/register"
                      className="text-warning fw-semibold text-decoration-none"
                    >
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>

              <p className="text-center text-muted mt-3 small">
                © 2026 Intelligent Freight Forecasting System
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;