import React from "react";
import { Link } from "react-router-dom";
import './Navbar.css';

const Navbar = () => {
  return (
    <div className="header">
      <Link to="/" className="logo-title">
        <img src="/long_logo.png" alt="Logo" style={{ width: "250px" }} />
      </Link>
      <nav className="header-nav">
        <Link to="/" className="header-link">Dashboard</Link>
        <Link to="/map" className="header-link">Heatmap</Link>
        <Link to="/suggested-route" className="header-link">SuggestedRoute</Link>
      </nav>
    </div>
  );
};

export default Navbar;