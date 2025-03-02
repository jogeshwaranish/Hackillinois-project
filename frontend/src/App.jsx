import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar.jsx";
import Heatmap from './components/Heatmap.jsx';
import Geolocator from "./components/Geolocator";

// Pages
import Dashboard from "./components/Dashboard.jsx";
import SuggestedRoute from "./components/SuggestedRoute.jsx";


function App() {
  return (
    <>
      <Navbar />
      <Heatmap />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Heatmap" element={<Heatmap />} />
        <Route path="/suggested-route" element={<SuggestedRoute />} />
      </Routes>
      <Geolocator></Geolocator>
    </>  
  )
}

export default App
