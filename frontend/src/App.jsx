import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar.jsx";
import Geolocator from "./components/Geolocator";

// Pages
import Dashboard from "./components/Dashboard.jsx";
import Heatmap from "./components/Heatmap.jsx";
import SuggestedRoute from "./components/SuggestedRoute.jsx";

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<Heatmap />} />
          <Route path="/route" element={<SuggestedRoute />} />
        </Routes>
        <Geolocator />
      </main>
    </div>  
  )
}

export default App;