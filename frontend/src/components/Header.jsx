import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Food Truck Dashboard</h1>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Dashboard</Link>
        <Link to="/heatmap" style={styles.link}>Heatmap</Link>
        <Link to="/route" style={styles.link}>Suggested Route</Link>
      </nav>
    </header>
  );
};

export default Header;
