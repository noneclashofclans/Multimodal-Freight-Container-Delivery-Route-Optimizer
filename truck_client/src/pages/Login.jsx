import React from "react";
import Navbar from '../components/Navbar';

const Login = () => {
  return (
    <div>

        <Navbar />
        <main
        className="d-flex align-items-center justify-content-center"
        style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #fff8dc, #ffffff)"
        }}
        >
        <div className="container">


            <div className="row justify-content-center">
            <div className="col-md-8 col-lg-5">

                <div className="card border-0 shadow-lg rounded-4">
                <div className="card-body p-5">

                    <div className="text-center mb-4">
                    <div className="display-5 mb-3">🚛</div>

                    <h2 className="fw-bold">Welcome Back</h2>

                    <p className="text-secondary mb-0">
                        Sign in to Freight Route Optimizer
                    </p>
                    </div>

                    <form>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                        Email Address
                        </label>

                        <input
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="name@company.com"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                        Password
                        </label>

                        <input
                        type="password"
                        className="form-control form-control-lg"
                        placeholder="Enter your password"
                        />
                    </div>


                    <button className="btn btn-warning w-100 btn-lg fw-semibold">
                        Login
                    </button>

                    </form>

                    <hr className="my-4" />

                    <p className="text-center mb-0 text-secondary">
                    Don't have an account?{" "}
                    <a
                        href="/register"
                        className="text-warning text-decoration-none fw-semibold"
                    >
                        Register
                    </a>
                    </p>

                </div>
                </div>

                <p className="text-center text-muted mt-3 small">
                © 2026 Multimodal Freight Container Delivery Route Optimizer
                </p>

            </div>
            </div>
        </div>
        </main>
    </div>
  );
};

export default Login;