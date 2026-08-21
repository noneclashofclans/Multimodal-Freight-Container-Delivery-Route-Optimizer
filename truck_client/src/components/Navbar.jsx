import React from "react";
import { useNavigate } from 'react-router-dom'; 
import company_logo from "../assets/trucks.png";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white">
      <div className="container-fluid px-4 px-lg-5">

        <a className="navbar-brand">
          <img
            src={company_logo}
            alt="Freight Optimiser"
            className="logo"
            onClick={navigate('/')}
            style={{cursor: 'pointer'}}
          />
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="navbarContent"
        >

          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-2">

            <li className="nav-item">
              <a className="nav-link">
                Home
              </a>
            </li>

            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Services
              </a>

              <ul className="dropdown-menu border-0 shadow">

                <li>
                  <a className="dropdown-item" href="#">
                    Route Optimisation
                  </a>
                </li>

                <li>
                  <a className="dropdown-item" href="#">
                    Container Tracking
                  </a>
                </li>

                <li>
                  <a className="dropdown-item" href="#">
                    Freight Analytics
                  </a>
                </li>

              </ul>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="#features">
                Features
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href="/about">
                About
              </a>
            </li>

          </ul>

          {/* Right Side */}
          <div className="navbar-actions">

            <a href="/login" className="login-link">
              Login
            </a>

            <a href="#optimise" className="btn optimise-btn">
              Optimise Route
              <span className="ms-2">→</span>
            </a>

          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;